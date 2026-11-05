// Initialize jobs array and render on page load
document.addEventListener("DOMContentLoaded", () => {
  renderJobs();
});

document.querySelectorAll('.faq-button').forEach(button => {
  button.addEventListener('click', () => {
    const answer = button.nextElementSibling;
    const arrow = button.querySelector('svg');
    
    // Toggle answer visibility
    answer.classList.toggle('hidden');
    
    // Rotate arrow
    arrow.style.transform = answer.classList.contains('hidden') 
      ? 'rotate(0deg)' 
      : 'rotate(180deg)';
    
    // Close other answers
    document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
      if (otherAnswer !== answer && !otherAnswer.classList.contains('hidden')) {
        otherAnswer.classList.add('hidden');
        otherAnswer.previousElementSibling.querySelector('svg').style.transform = 'rotate(0deg)';
      }
    });
  });
});

const jobs = [
  // {
  //   id: "junior-frontend-dev",
  //   title: "Junior Frontend Developer",
  //   description: "Join our team as a Frontend Developer! We're looking for candidates with experience in HTML, CSS and JavaScript. You'll work with modern frameworks like React and explore cutting-edge web technologies including NFC integration.",
  //   location: "Sfax",
  //   type: "Part-time/Flexible",
  //   requirements: ["HTML/CSS", "JavaScript", "React basics"],
  // },
  // {
  //   id: "junior-backend-dev",
  //   title: "Junior Backend Developer",
  //   description: "We're seeking a Backend Developer with foundational knowledge in Python and database management. Experience with PHP and data sorting algorithms is a plus.",
  //   location: "Sfax",
  //   type: "Part-time/Flexible",
  //   requirements: ["Python", "Basic SQL", "PHP"],
  // },
  // {
  //   id: "fullstack-dev",
  //   title: "Full Stack Developer",
  //   description: "Looking for developers with end-to-end application development experience.",
  //   location: "Remote",
  //   type: "Part-time/Flexible",
  //   requirements: ["Frontend Development", "Backend Development", "Database Management"],
  // },
  // {
  //   id: "devops-engineer",
  //   title: "DevOps Engineer",
  //   description: "Join our DevOps team to build and maintain our automation infrastructure.",
  //   location: "Remote",
  //   type: "Part-time/Flexible",
  //   requirements: ["CI/CD", "Monitoring Tools", "Automation Scripts"],
  // },
  {
    id: "senior-marketing",
    title: "Senior Marketing Specialist",
    description: "Seeking an experienced marketing professional to lead our growth initiatives.",
    location: "Sfax",
    type: "Part-time",
    requirements: ["Digital Marketing", "Campaign Management", "Analytics", "Strategic Planning"],
  },
];

// Improved renderJobs function with glass cards
function renderJobs() {
  try {
    const container = document.getElementById("jobs-container");
    if (!container) throw new Error("Jobs container not found");

    container.innerHTML = jobs
      .map(
        (job) => `
            <div class="glass-card p-6 rounded-xl fade-in relative hover:shadow-xl transition-all duration-300">
                <a href="/careers/apply/?id=${job.id}" target="_blank">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold text-white">${job.title}</h3>
                    <span class="text-gray-400 text-sm">
                        <i class="fas fa-clock mr-1"></i>${job.type}
                    </span>
                </div>
                <div class="flex items-center mb-4">
                    <i class="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                    <p class="text-gray-300">${job.location}</p>
                </div>
                <div class="flex flex-wrap gap-2 mb-6">
                    ${job.requirements
                      .map(
                        (req) => `
                        <span class="bg-gray-800/50 px-3 py-1 rounded-full text-sm text-gray-300 border border-gray-700/50">
                            ${req}
                        </span>
                    `
                      )
                      .join("")}
                </div>
                
                    <span class="text-blue-400 font-medium text-sm flex items-center gap-2 hover:text-blue-300">
                        Apply Now <i class="fas fa-arrow-right"></i>
                    </span>
                </a>
            </div>
        `
      )
      .join("");
  } catch (error) {
    console.error("Error rendering jobs:", error);
  }
}