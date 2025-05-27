// Initialize jobs array and render on page load
document.addEventListener("DOMContentLoaded", () => {
  renderJobs();
  initializeDarkMode();
});

const jobs = [
  {
    id: "junior-frontend-dev",
    title: "Junior Frontend Developer",
    description:
      "Join our team as a Frontend Developer! We're looking for candidates with experience in HTML, CSS and JavaScript. You'll work with modern frameworks like React and explore cutting-edge web technologies including NFC integration.",
    location: "Sfax",
    type: "Part-time/Flexible",
    requirements: ["HTML/CSS", "JavaScript", "React basics"],
  },
  {
    id: "junior-backend-dev",
    title: "Junior Backend Developer",
    description:
      "We're seeking a Backend Developer with foundational knowledge in Python and database management. Experience with PHP and data sorting algorithms is a plus. You'll learn enterprise-level database solutions like BigQuery and develop robust backend systems.",
    location: "Sfax",
    type: "Part-time/Flexible",
    requirements: ["Python", "Basic SQL", "PHP"],
  },
  {
    id: "fullstack-dev",
    title: "Full Stack Developer",
    description:
      "Looking for developers with end-to-end application development experience. Ideal candidates have built complete web applications and are eager to learn professional development workflows, testing practices, and deployment strategies.",
    location: "Remote",
    type: "Part-time/Flexible",
    requirements: [
      "Frontend Development",
      "Backend Development",
      "Database Management",
    ],
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    description:
      "Join our DevOps team to build and maintain our automation infrastructure. You'll work on email campaign automation, monitoring systems, and help optimize our deployment pipelines using modern DevOps tools and practices.",
    location: "Remote",
    type: "Part-time/Flexible",
    requirements: ["CI/CD", "Monitoring Tools", "Automation Scripts"],
  },
  {
    id: "senior-marketing",
    title: "Senior Marketing Specialist",
    description:
      "Seeking an experienced marketing professional to lead our growth initiatives. The ideal candidate has proven success in digital marketing campaigns, strategic planning, and data-driven decision making. Help shape our marketing direction and drive measurable results.",
    location: "Sfax",
    type: "Full Time",
    requirements: [
      "Digital Marketing",
      "Campaign Management",
      "Analytics",
      "Strategic Planning",
    ],
  },
  // ... other job objects ...
];

// Improved renderJobs function with error handling
function renderJobs() {
  try {
    const container = document.getElementById("jobs-container");
    if (!container) throw new Error("Jobs container not found");

    container.innerHTML = jobs
      .map(
        (job) => `
            <div class="bg-gray-800/50 p-6 rounded-xl fade-in relative hover:shadow-lg hover:bg-gray-700/50 transition-all duration-300">
                <a href="/careers/apply/?id=${job.id}" target="_blank">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold">${job.title}</h3>
                    <span class="text-gray-400">
                        <i class="fas fa-clock mr-1"></i>${job.type}
                    </span>
                </div>
                <div class="flex items-center mb-4">
                    <i class="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                    <p class="text-gray-400">${job.location}</p>
                </div>
                <div class="flex flex-wrap gap-2 mb-6">
                    ${job.requirements
                      .map(
                        (req) => `
                        <span class="bg-gray-700/50 px-3 py-1 rounded-full text-sm text-gray-300">
                            ${req}
                        </span>
                    `
                      )
                      .join("")}
                </div>
                
                    <i class="fas fa-arrow-right ml-2 hover:text-blue-600 hover:scale-150"></i>
                </a>
            </div>
        `
      )
      .join("");
  } catch (error) {
    console.error("Error rendering jobs:", error);
  }
}
