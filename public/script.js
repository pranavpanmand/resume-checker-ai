// ─── DOM References ───
const uploadBox = document.getElementById('drop-zone');
const uploadText = document.querySelector('.upload-text');
const resumeTextarea = document.getElementById('resumeText');
const jobDescriptionTextarea = document.getElementById('jobDescription');
const analyzeBtn = document.getElementById('analyzeBtn');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.getElementById('btnLoader');
const resultsDiv = document.getElementById('results');
const atsScoreSpan = document.getElementById('atsScore');
const scoreCirclePath = document.getElementById('scoreCirclePath');
const matchedSkillsUl = document.getElementById('matchedSkills');
const missingSkillsUl = document.getElementById('missingSkills');
const scoreDesc = document.getElementById('scoreDesc');
const analyzeAgainBtn = document.getElementById('analyzeAgainBtn');
const uploadProgress = document.getElementById('uploadProgress');
const inputsGrid = document.getElementById('inputsGrid');

let selectedFile = null;

// ─── Particle Background ───
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.4 + 0.1;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(138, 43, 226, ${this.opacity})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}
initParticles();

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(138, 43, 226, ${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ─── Step Indicator Logic ───
function setActiveStep(stepNum) {
  document.querySelectorAll('.step').forEach((el, idx) => {
    el.classList.remove('active', 'completed');
    if (idx + 1 < stepNum) el.classList.add('completed');
    if (idx + 1 === stepNum) el.classList.add('active');
  });
}

// ─── File Upload ───
uploadBox.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.txt';
  input.onchange = (e) => {
    selectedFile = e.target.files[0];
    uploadText.textContent = `✅ ${selectedFile.name}`;
    uploadBox.classList.add('file-selected');
    setActiveStep(2);
  };
  input.click();
});

uploadBox.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
  uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadBox.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && (file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.pdf') || file.name.endsWith('.txt'))) {
    selectedFile = file;
    uploadText.textContent = `✅ ${selectedFile.name}`;
    uploadBox.classList.add('file-selected');
    setActiveStep(2);
  } else {
    alert("Please upload a PDF or TXT file.");
  }
});

// Track textarea input for step progression
resumeTextarea.addEventListener('input', () => {
  if (resumeTextarea.value.trim().length > 10) setActiveStep(2);
});

jobDescriptionTextarea.addEventListener('input', () => {
  if (jobDescriptionTextarea.value.trim().length > 10) setActiveStep(2);
});

// ─── Score Animation ───
function animateScore(score) {
  scoreCirclePath.setAttribute('stroke-dasharray', `${score}, 100`);
  atsScoreSpan.textContent = score;

  const container = document.querySelector('.score-container');
  container.classList.remove('score-high', 'score-medium', 'score-low');

  if (score >= 80) {
    container.classList.add('score-high');
    scoreDesc.textContent = "Excellent match! Your resume aligns very well with the job description.";
  } else if (score >= 50) {
    container.classList.add('score-medium');
    scoreDesc.textContent = "Good match. Consider adding the missing skills to improve your score.";
  } else {
    container.classList.add('score-low');
    scoreDesc.textContent = "Low match. Your resume needs significant improvements for this role.";
  }

  // Animate the number counting up
  let current = 0;
  const increment = score / 40;
  const counter = setInterval(() => {
    current += increment;
    if (current >= score) {
      current = score;
      clearInterval(counter);
    }
    atsScoreSpan.textContent = Math.round(current);
  }, 25);
}

// ─── Analyze ───
analyzeBtn.addEventListener('click', async () => {
  const resumeText = resumeTextarea.value.trim();
  const jobDescription = jobDescriptionTextarea.value.trim();

  if (!selectedFile && !resumeText) {
    alert('Please upload a resume file or paste resume text.');
    return;
  }

  if (!jobDescription) {
    alert('Please provide a job description.');
    return;
  }

  const formData = new FormData();
  formData.append('jobDescription', jobDescription);

  if (selectedFile) {
    formData.append('resume', selectedFile);
  } else {
    const blob = new Blob([resumeText], { type: 'text/plain' });
    formData.append('resume', blob, 'resume.txt');
  }

  // Loading State
  analyzeBtn.disabled = true;
  btnText.textContent = 'Analyzing...';
  btnLoader.classList.remove('hidden');
  resultsDiv.classList.add('hidden');
  setActiveStep(3);

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      animateScore(data.atsScore || 0);

      matchedSkillsUl.innerHTML = data.matchedSkills.length
        ? data.matchedSkills.map(skill => `<li>${skill}</li>`).join('')
        : '<li>No matching skills found</li>';

      missingSkillsUl.innerHTML = data.missingSkills.length
        ? data.missingSkills.map(skill => `<li>${skill}</li>`).join('')
        : '<li>No missing skills identified</li>';

      // Hide inputs and button to fit everything on one page without scrolling
      inputsGrid.classList.add('hidden');
      analyzeBtn.classList.add('hidden');
      
      resultsDiv.classList.remove('hidden');
    } else {
      alert(data.error || 'Failed to analyze resume.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while analyzing the resume. Please check if the server is running.');
  } finally {
    analyzeBtn.disabled = false;
    btnText.textContent = '✨ Analyze Resume';
    btnLoader.classList.add('hidden');
  }
});

// ─── Analyze Again Button ───
analyzeAgainBtn.addEventListener('click', () => {
  resultsDiv.classList.add('hidden');
  
  // Show inputs back
  inputsGrid.classList.remove('hidden');
  analyzeBtn.classList.remove('hidden');
  
  resumeTextarea.value = '';
  jobDescriptionTextarea.value = '';
  selectedFile = null;
  uploadText.textContent = 'Drag & drop or click';
  uploadBox.classList.remove('file-selected');
  uploadBox.style.borderColor = '';
  setActiveStep(1);
});
