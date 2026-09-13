require('dotenv').config();
const express = require('express');
const path = require('path');
const analyzeRoutes = require('./routes/analyze');

const app = express();
const cors = require("cors");





app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  }),
);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/analyze', analyzeRoutes);

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("API KEY LOADED:", !!process.env.GEMINI_API_KEY);
