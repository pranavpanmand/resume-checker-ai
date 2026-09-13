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

let selectedFile = null;

// Handle file upload via click
uploadBox.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.txt';
  input.onchange = (e) => {
    selectedFile = e.target.files[0];
    uploadText.textContent = `Selected: ${selectedFile.name}`;
    uploadBox.style.borderColor = 'var(--success)';
  };
  input.click();
});

// Handle drag and drop
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
    uploadText.textContent = `Selected: ${selectedFile.name}`;
    uploadBox.style.borderColor = 'var(--success)';
  } else {
    alert("Please upload a PDF or TXT file.");
  }
});

// Set Circular Chart Score
function setScore(score) {
  // SVG dasharray max is 100
  scoreCirclePath.setAttribute('stroke-dasharray', `${score}, 100`);
  atsScoreSpan.textContent = score;

  // Update color based on score
  const container = document.querySelector('.score-container');
  container.className = 'score-container'; // reset
  if (score >= 80) {
    container.classList.add('score-high');
  } else if (score >= 50) {
    container.classList.add('score-medium');
  } else {
    container.classList.add('score-low');
  }
}

// Analyze button click
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
    // Create a blob from the pasted text
    const blob = new Blob([resumeText], { type: 'text/plain' });
    formData.append('resume', blob, 'resume.txt');
  }

  // Show Loading State
  analyzeBtn.disabled = true;
  btnText.textContent = 'Analyzing...';
  btnLoader.classList.remove('hidden');
  resultsDiv.classList.add('hidden');

  try {
    const response = await fetch("http://localhost:3000/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      setScore(data.atsScore || 0);
      
      matchedSkillsUl.innerHTML = data.matchedSkills.length 
        ? data.matchedSkills.map(skill => `<li>${skill}</li>`).join('') 
        : '<li>No matching skills found</li>';
        
      missingSkillsUl.innerHTML = data.missingSkills.length 
        ? data.missingSkills.map(skill => `<li>${skill}</li>`).join('') 
        : '<li>No missing skills identified</li>';
        
      resultsDiv.classList.remove('hidden');
      
      // Scroll to results
      resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      alert(data.error || 'Failed to analyze resume.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while analyzing the resume. Please check if the server is running.');
  } finally {
    // Reset Loading State
    analyzeBtn.disabled = false;
    btnText.textContent = '✨ Analyze Resume';
    btnLoader.classList.add('hidden');
  }
});
