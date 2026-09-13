const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use a broadly supported model to prevent 404 errors on certain API keys
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

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
    } else if (req.body.resume && typeof req.body.resume === 'string') {
        // Fallback if resume is sent as text
        resumeText = req.body.resume;
    }

    if (resumeText.trim().length < 50) {
      return res.status(400).json({ error: "Resume text is too short or could not be parsed." });
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) AI. 
Analyze the provided resume against the job description.

Return ONLY valid minified JSON in the exact format below.
No explanation. No markdown. No code blocks.

Format:
{"atsScore":number,"matchedSkills":string[],"missingSkills":string[]}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean up potential markdown formatting from the response
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (e) {
      console.error("❌ RAW GEMINI RESPONSE:", text);
      return res.status(500).json({ error: "Invalid AI response format." });
    }

    res.json(analysis);
  } catch (err) {
    console.error("GEMINI ERROR:", err);
    res.status(500).json({ error: "Gemini analysis failed. Please try again." });
  }
});

module.exports = router;
