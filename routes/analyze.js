const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Models to try in order of preference (fallback chain)
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-pro-latest",
];

// Helper: attempt a single model call with timeout
async function tryModel(modelName, prompt) {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Helper: sleep for ms
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Core function: try all models with retries
async function generateWithFallback(prompt) {
  for (const modelName of MODEL_CANDIDATES) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🔄 Trying model: ${modelName} (attempt ${attempt})`);
        const text = await tryModel(modelName, prompt);
        console.log(`✅ Success with model: ${modelName}`);
        return text;
      } catch (err) {
        const status = err.status || 0;
        console.error(`❌ ${modelName} attempt ${attempt} failed: ${status} ${err.statusText || err.message}`);

        // 503 = temporary overload, worth retrying same model after a short wait
        if (status === 503 && attempt < 2) {
          console.log("   ⏳ Waiting 2s before retry...");
          await sleep(2000);
          continue;
        }
        // 404 = model not available for this key, skip to next model immediately
        if (status === 404) break;
        // 429 = rate limit, wait longer then try next model
        if (status === 429) {
          await sleep(3000);
          break;
        }
        // Any other error on last attempt, try next model
        break;
      }
    }
  }
  throw new Error("All Gemini models failed. Please try again later.");
}

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key missing. Please check your .env file." });
    }

    const jobDescription = req.body.jobDescription;
    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required." });
    }

    let resumeText = "";
    if (req.file) {
      if (req.file.mimetype === "application/pdf") {
        const data = await pdfParse(req.file.buffer);
        resumeText = data.text;
      } else {
        resumeText = req.file.buffer.toString("utf-8");
      }
    } else if (req.body.resume && typeof req.body.resume === "string") {
      resumeText = req.body.resume;
    }

    if (resumeText.trim().length < 50) {
      return res.status(400).json({ error: "Resume text is too short or could not be parsed." });
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) AI. 
First, evaluate if the provided Resume and Job Description are valid and not just random text. 
If either of them is invalid, nonsensical, or clearly not a real resume/job description, return EXACTLY this JSON: {"error": "Invalid Resume or Job Description provided. Please provide real text."}

If they are valid, analyze the provided resume against the job description.
Return ONLY valid minified JSON in the exact format below.
No explanation. No markdown. No code blocks.

Format:
{"atsScore":number,"matchedSkills":string[],"missingSkills":string[]}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    const rawText = await generateWithFallback(prompt);

    // Clean up potential markdown formatting from the response
    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch (e) {
      console.error("❌ RAW GEMINI RESPONSE:", cleaned);
      return res.status(500).json({ error: "Invalid AI response format." });
    }

    if (analysis.error) {
      return res.status(400).json({ error: analysis.error });
    }

    res.json(analysis);
  } catch (err) {
    console.error("GEMINI ERROR:", err.message || err);
    res.status(500).json({ error: err.message || "Gemini analysis failed. Please try again." });
  }
});

module.exports = router;
