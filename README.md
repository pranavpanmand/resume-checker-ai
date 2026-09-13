<div align="center">
  <h1>✨ Resume Checker AI</h1>
  <p><strong>Instant, AI-powered feedback on your resume with ATS optimization and industry-standard recommendations.</strong></p>
  
  [![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-blueviolet?style=for-the-badge)](https://deepmind.google/technologies/gemini/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
</div>

<br />

## 🌟 Overview

Resume Checker AI is a modern web application that leverages the power of **Google's Gemini AI** to act as an intelligent Applicant Tracking System (ATS). It analyzes your resume against a specific job description to provide you with actionable insights, an ATS score, matched skills, and missing keywords.

### 🎨 Premium UI/UX
The application features a sleek, premium dark-mode aesthetic utilizing:
- **Glassmorphism** for a modern, depth-focused interface.
- **Vibrant gradients and ambient glows** that create an immersive experience.
- **Micro-animations** for interactive elements like drag-and-drop file uploads and loading states.
- **Dynamic Circular Score Chart** that visually represents your ATS compatibility.

## 🚀 Features

- **📄 Resume Parsing:** Supports both PDF file uploads and raw text pasting.
- **🎯 Job Description Matching:** Tailors feedback specifically to the role you are applying for.
- **🧠 AI-Powered Analysis:** Uses `gemini-1.5-flash` for fast, accurate, and structured insights.
- **📊 ATS Scoring:** Gives a definitive score (0-100) indicating how well your resume matches the job.
- **✅ Skills Breakdown:** Highlights exactly which skills matched and which critical keywords you might be missing.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Custom Properties, Flexbox/Grid, Animations), Vanilla JavaScript (ES6+).
- **Backend:** Node.js, Express.js.
- **File Parsing:** `multer` (for handling multipart/form-data), `pdf-parse` (for extracting text from PDFs).
- **AI Integration:** `@google/generative-ai` (Gemini SDK).

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Steps

1. **Clone the repository** (if applicable):
   ```bash
   git clone <your-repo-url>
   cd Resumechecker-AI-main/ResumeAI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Ensure you have a `.env` file in the root directory (`ResumeAI/`) with your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The server will start (typically on `http://localhost:3000`).

5. **Open the app**:
   Navigate to `http://localhost:3000` in your web browser.

## 💡 Usage

1. **Upload Resume:** Click the upload area to select a PDF/TXT file, drag-and-drop a file, OR paste your resume text directly into the text area.
2. **Add Job Description:** Paste the job description you are targeting into the designated text area.
3. **Analyze:** Click the **✨ Analyze Resume** button.
4. **Review Results:** Wait for the AI to process (indicated by a loading spinner) and review your ATS Score, Matched Skills, and Missing Skills!
