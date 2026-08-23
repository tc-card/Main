const jobs = {
        'junior-frontend-dev':{
        title: "Junior Frontend Developer",
        description: "Join our team as a Frontend Developer! We're looking for candidates with experience in HTML, CSS and JavaScript. You'll work with modern frameworks like React and explore cutting-edge web technologies including NFC integration.",
        location: "Sfax",
        type: "Part-time/Flexible",
        requirements: ["HTML/CSS", "JavaScript", "React basics", "TailwindCss"]
    },
        'junior-backend-dev':{
        title: "Junior Backend Developer", 
        description: "We're seeking a Backend Developer with foundational knowledge in Python and database management. Experience with PHP and data sorting algorithms is a plus. You'll learn enterprise-level database solutions like BigQuery and develop robust backend systems.",
        location: "Sfax",
        type: "Part-time/Flexible",
        requirements: ["Python", "Basic SQL", "PHP"]
    },
        'fullstack-dev':{
        title: "Full Stack Developer",
        description: "Looking for developers with end-to-end application development experience. Ideal candidates have built complete web applications and are eager to learn professional development workflows, testing practices, and deployment strategies.",
        location: "Remote",
        type: "Part-time/Flexible",
        requirements: ["Frontend Development", "Backend Development", "Database Management"]
    },
        'devops-engineer':{
        title: "DevOps Engineer",
        description: "Join our DevOps team to build and maintain our automation infrastructure. You'll work on email campaign automation, monitoring systems, and help optimize our deployment pipelines using modern DevOps tools and practices.",
        location: "Remote",
        type: "Part-time/Flexible",
        requirements: ["CI/CD", "Monitoring Tools", "Automation Scripts"]
    },
        'senior-marketing':{
        title: "Senior Marketing Specialist",
        description: "Seeking an experienced marketing professional to lead our growth initiatives. The ideal candidate has proven success in digital marketing campaigns, strategic planning, and data-driven decision making. Help shape our marketing direction and drive measurable results.",
        location: "Sfax",
        type: "Full Time",
        requirements: ["Digital Marketing", "Campaign Management", "Analytics", "Strategic Planning"]
    }
};
  
function displayJobDetails() {
    try {
      const container = document.getElementById('job-details');
      if (!container) {
        console.error('Job details container not found');
        return;
      }
  
      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('id');
      
      if (!jobId) {
        container.innerHTML = '<p class="text-red-400">No job ID specified</p>';
        return;
      }
  
      const job = jobs[jobId];
      
      if (!job) {
        container.innerHTML = `<p class="text-red-400">Job not found: ${jobId}</p>`;
        return;
      }
  
      container.innerHTML = `
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl font-bold mb-8 text-white fade-in">${job.title}</h1>
          
          <div class="glass-card p-8 rounded-xl mb-10 shadow-lg">
            <div class="flex items-center gap-4 mb-6">
              <div class="bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50">
                <p class="text-blue-400 font-medium"><i class="fas fa-map-marker-alt mr-1"></i> ${job.location}</p>
              </div>
              <div class="bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50">
                <p class="text-green-400 font-medium"><i class="fas fa-clock mr-1"></i> ${job.type}</p>
              </div>
            </div>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold mb-4 text-white">Job Description</h2>
              <p class="text-gray-300 leading-relaxed">${job.description}</p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold mb-4 text-white">Requirements</h2>
              <ul class="grid grid-cols-2 gap-3">
                ${job.requirements.map(req => `
                  <li class="flex items-center gap-2 text-gray-300">
                    <i class="fas fa-check-circle text-blue-500"></i>
                    ${req}
                  </li>
                `).join('')}
              </ul>
            </section>
          </div>
          <div class="glass-card p-8 rounded-xl shadow-lg">
            <h2 class="text-2xl font-semibold mb-6 text-white">Apply Now</h2>
            ${renderForm(job)}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error displaying job details:', error);
      const container = document.getElementById('job-details');
      if (container) {
        container.innerHTML = '<p class="text-red-400">Error loading job details</p>';
      }
    }
  }
  
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', displayJobDetails);
function renderForm(job) {
    return `
    <form class="space-y-6" id="application-form" onsubmit="handleSubmit(event)">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex flex-col">
          <label for="name" class="text-gray-300 font-medium mb-2">Full Name</label>
          <input type="text" id="name" name="name" required 
            class="input-dark rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
        </div>
        
        <div class="flex flex-col">
          <label for="email" class="text-gray-300 font-medium mb-2">Email Address</label>
          <input type="email" id="email" name="email" required
            class="input-dark rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
        </div>
      </div>

      <div class="flex flex-col">
        <label for="resume" class="text-gray-300 font-medium mb-2">Resume/CV</label>
        <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" required
          class="input-dark rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition">
      </div>

      <div class="flex flex-col">
        <label for="cover" class="text-gray-300 font-medium mb-2">Cover Letter</label>
        <textarea id="cover" name="cover" rows="4" required
          class="input-dark rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Tell us why you're the perfect fit for this role..."></textarea>
      </div>

      <button type="submit" title="Notice: This form is not functional and is for demonstration purposes only."
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed">
        Submit Application
      </button>
    </form>
    `;
    async function handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('resume', document.getElementById('resume').files[0]);
        formData.append('cover', document.getElementById('cover').value);
        formData.append('jobTitle', '${job.title}');

        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbzTW1cbCSWlPz_moGUlzqUgbVxpWmngiDJYxnkD_kgyDOpJbCMnaoG7f8cZW-SB3wIR/exec', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Application submitted successfully!');
                document.getElementById('application-form').reset();
            } else {
                throw new Error('Failed to submit application');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit application. Please try again.');
        }
    }
}