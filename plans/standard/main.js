import { CONFIG, stylePresets } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all elements
  const elements = {
    profilePicture: document.getElementById("profile-picture"),
    imageInput: document.getElementById("image-input"),
    addLinkBtn: document.getElementById("add-link-btn"),
    dynamicLinks: document.getElementById("dynamic-links"),
    form: document.getElementById("data-fill"),
    submitBtn: document.getElementById("saveContactBtn"),
    formType: document.getElementById("form-type"),
    formPreview: document.getElementById("form-preview"),
    userName: document.getElementById("user-name"),
    userEmail: document.querySelector('input[name="email"]'),
    userLink: document.querySelector('input[name="link"]'),
    userTagline: document.getElementById("user-tagline"),
    userPhone: document.querySelector('input[name="phone"]'),
    userAddress: document.querySelector('input[name="address"]'),
    emailToggleLabel: document.querySelector('.flex.items-center label'),
    formEmail: document.getElementById('form-email')
  };

  // Validate elements exist
  for (const [key, element] of Object.entries(elements)) {
    if (!element && key !== "stylePresets") { // stylePresets is optional
      console.error(`Element '${key}' not found`);
      return;
    }
  }
  
  // ===== EMAIL TOGGLE =====
  const emailCheckbox = document.getElementById('email');
  
  if (!emailCheckbox) {
    console.warn('Email checkbox element not found');
    return;
  }

  if (emailCheckbox) {
    emailCheckbox.addEventListener('change', function() {
      if (!elements.userEmail.value && this.checked) {
        Swal.fire({
          icon: 'warning',
          text: 'Please fill in your email first',
          toast: true,
          position: "top-center",
          background: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
          color: "#fff"
        });
        this.checked = false;
        return;
      }


      const label = this.closest('label');
      if (this.checked) {
        label.classList.add('bg-blue-600');
        label.classList.remove('bg-gray-700');
      } else {
        label.classList.remove('bg-blue-600');
        label.classList.add('bg-gray-700');
      }

      elements.formEmail.value = this.checked ? elements.userEmail.value : '';
      elements.formEmail.disabled = this.checked;
    });

    elements.userEmail.addEventListener('input', function() {
      if (emailCheckbox.checked) {
        elements.formEmail.value = this.value;
      }
    });
  }

  // ===== IMAGE HANDLING =====
  function handleImageUpload(file, targetElement) {
    if (!file) {
      // Reset to default image if no file is selected
      targetElement.src = "https://tccards.tn/Assets/150.png";
      return;
    }

    if (!CONFIG.allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Please upload a valid image file (JPEG, PNG, GIF)",
      });
      return;
    }
    if (file.size > CONFIG.maxFileSize) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "File size must be less than 5MB",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      targetElement.src = e.target.result;
    };
    reader.onerror = () => {
      console.error("Error reading file");
      targetElement.src = "https://tccards.tn/Assets/150.png"; // Reset to default image on error
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to read the image file",
      });
    };
    reader.readAsDataURL(file);
  }

  elements.profilePicture.addEventListener("click", () => elements.imageInput.click());
  elements.imageInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0]; // Safe access using optional chaining
    handleImageUpload(file, elements.profilePicture);
  });

  // In your form submission, update the image handling part:
  if (elements.imageInput.files && elements.imageInput.files[0]) {
    swalInstance.update({
      title: "Uploading image...",
      text: "Processing your profile picture...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });
  }

  // ===== SOCIAL LINKS MANAGEMENT =====
  function createSocialLink() {
    return `
      <li class="flex items-center bg-white/10 p-2 rounded shadow-md border border-white/30 hover:bg-white/20 relative group">
          <i class="fa fa-link text-xl text-white mr-3"></i>
          <input type="url" name="social-links[]" placeholder="https://domain.com/path" 
              class="w-full bg-transparent text-white p-2 rounded focus:outline-none" />
          <button type="button" class="remove-link-btn absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          </button>
      </li>`;
  }

  elements.addLinkBtn.addEventListener("click", () => {
    const ul = elements.dynamicLinks.querySelector("ul");
    const currentLinks = ul.querySelectorAll("li").length;

    if (currentLinks === 6) {
      Swal.fire({
        icon: "info",
        title: "Getting social, aren't we?",
        text: "You've got quite a collection of links!",
        background: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
        color: "#fff",
        toast: true,
        position: "top-center",
        showConfirmButton: false,
        timer: 10000,
        customClass: { popup: 'small-toast' }
      });
    } else if (currentLinks === 10) {
      Swal.fire({
        icon: "warning",
        title: "Social Media Superstar!",
        text: "You must be really popular with all these links!",
        background: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
        color: "#fff",
        toast: true,
        position: "top-center",
        showConfirmButton: false,
        timer: 3000,
        customClass: { popup: 'small-toast' }
      });
    }

    ul.insertAdjacentHTML("beforeend", createSocialLink());
    ul.lastElementChild.querySelector(".remove-link-btn").addEventListener("click", function() {
      this.closest("li").remove();
    });
  });

    // Form Type Management
  const forms = {
    contact: {
      title: "Contact Request Form",
      fields: [
        { name: "contact_name", placeholder: "Your Name", type: "text" },
        { name: "contact_email", placeholder: "Your Email", type: "email" },
        {
          name: "contact_phone",
          placeholder: "Your Phone (Optional)",
          type: "tel",
          required: false,
        },
        {
          name: "contact_message",
          placeholder: "Your Message/Inquiry",
          type: "textarea",
        },
      ],
    },
    resource: {
      title: "Free Resource/Download Form",
      fields: [
        { name: "resource_name", placeholder: "Your Name", type: "text" },
        { name: "resource_email", placeholder: "Your Email", type: "email" },
        {
          name: "resource_company",
          placeholder: "Your Company/Profession (Optional)",
          type: "text",
          required: false,
        },
        {
          name: "resource_type",
          placeholder: "Select Resource",
          type: "select",
          options: [
            "Industry Guide",
            "Template Pack",
            "Checklist",
            "Whitepaper",
          ],
        },
      ],
    },
    quote: {
      title: "Project Quote/Estimate Form",
      fields: [
        { name: "quote_name", placeholder: "Your Name", type: "text" },
        { name: "quote_email", placeholder: "Your Email", type: "email" },
        { name: "quote_phone", placeholder: "Your Phone", type: "tel" },
        {
          name: "quote_details",
          placeholder: "Project Details",
          type: "textarea",
        },
        {
          name: "quote_budget",
          placeholder: "Budget Range",
          type: "select",
          options: ["$1,000 - $5,000", "$5,000 - $10,000", "$10,000+"],
        },
        {
          name: "quote_timeline",
          placeholder: "Expected Timeline",
          type: "date",
          required: false,
        },
      ],
    },
    newsletter: {
      title: "Newsletter/Updates Subscription",
      fields: [
        { name: "newsletter_email", placeholder: "Your Email", type: "email" },
        {
          name: "newsletter_name",
          placeholder: "Your Name (Optional)",
          type: "text",
          required: false,
        },
        {
          name: "newsletter_interests",
          placeholder: "Your Interests",
          type: "select",
          options: ["Updates", "News", "Promotions", "All"],
          required: false,
        },
      ],
    },
  };

  function renderForm(type) {
    const form = forms[type];
    let formHtml = `<h3 class='text-xl font-semibold mb-4 text-white'>${form.title}</h3>`;

    form.fields.forEach((field) => {
      if (field.type === "textarea") {
        formHtml += `
          <div class='mb-4'>
            <textarea 
              name='${field.name}' 
              placeholder='${field.placeholder}' 
              class='w-full p-3 bg-transparent text-white border border-white/50 rounded-lg focus:outline-none focus:border-white' 
              ${field.required ? "required" : ""}>
            </textarea>
          </div>`;
      } else if (field.type === "select") {
        formHtml += `
          <div class='mb-4'>
            <select 
              name='${field.name}' 
              class='w-full p-3 bg-transparent text-white border border-white/50 rounded-lg focus:outline-none focus:border-white'
              ${field.required ? "required" : ""}>
              <option value="" disabled selected>${field.placeholder}</option>
              ${field.options
                .map((option) => `<option value="${option}">${option}</option>`)
                .join("")}
            </select>
          </div>`;
      } else {
        formHtml += `
          <div class='mb-4'>
            <input 
              type='${field.type}' 
              name='${field.name}' 
              placeholder='${field.placeholder}' 
              class='w-full p-3 bg-transparent text-white border border-white/50 rounded-lg focus:outline-none focus:border-white' 
              ${field.required ? "required" : ""} />
          </div>`;
      }
    });

    elements.formPreview.innerHTML = formHtml;
  }

  elements.formType.addEventListener("change", () =>
    renderForm(elements.formType.value)
  );
  renderForm("contact"); // Initial render
  
  // ===== STYLE PRESETS ===== (Single implementation)
  document.querySelectorAll(".style-preset").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".style-preset").forEach(btn => btn.classList.remove("selected"));
      button.classList.add("selected");
      
      // Optional: Apply style preview
      const style = stylePresets[button.dataset.style];
      if (style) document.body.style.background = style.background;
    });
  });

  // ===== FORM SUBMISSION =====
  let debounceTimer;
  async function checkDuplicatesDebounced(email, link) {
    clearTimeout(debounceTimer);
    return new Promise((resolve) => {
      debounceTimer = setTimeout(async () => {
        try {
          const res = await fetch(
            `${CONFIG.googleScriptUrl}?check_duplicates=true&email=${encodeURIComponent(email)}&link=${encodeURIComponent(link)}`
          );
          resolve(await res.json());
        } catch (error) {
          console.error("Duplicate check failed:", error);
          resolve({ emailExists: false, linkExists: false });
        }
      }, 500);
    });
  }

  async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "preset");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dufg7fm4stt/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.secure_url) {
        throw new Error("No secure URL returned");
      }
      return data.secure_url;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  }

// ===== FORM SUBMISSION HANDLER =====
elements.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Form submission started"); // Debug log
  
  // Clear previous errors
  const errorContainer = document.getElementById('form-errors');
  errorContainer.classList.add('hidden');
  errorContainer.innerHTML = '';
  
  // Validate form
  const errors = [];
  const email = elements.userEmail.value.trim();
  const link = elements.userLink.value.trim();
  const name = elements.userName.value.trim();
  const formEmail = elements.formEmail.value.trim();

  if (!name) errors.push("Name is required");
  if (!link) errors.push("Profile link is required");
  if (!email) errors.push("Email is required");
  if (!formEmail) errors.push("Form email is required");
  
  if (!CONFIG.linkRegex.test(link)) {
      errors.push("Profile link must be 3-15 characters (letters, numbers, hyphens)");
  }
  
  if (!CONFIG.emailRegex.test(email)) {
      errors.push("Please enter a valid email address");
  }
  
  if (!CONFIG.emailRegex.test(formEmail)) {
      errors.push("Please enter a valid form email address");
  }

  // Show errors if any
  if (errors.length > 0) {
      errorContainer.innerHTML = errors.map(err => `<p>• ${err}</p>`).join('');
      errorContainer.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
  }

  // Show loading state
  elements.submitBtn.disabled = true;
  document.getElementById('submit-text').classList.add('hidden');
  document.getElementById('submit-spinner').classList.remove('hidden');

  try {
      console.log("Starting form processing"); // Debug log
      
      // Handle image upload if exists
      let profilePictureUrl = "https://tccards.tn/Assets/150.png";
      if (elements.imageInput.files[0]) {
          console.log("Uploading profile image"); // Debug log
          profilePictureUrl = await uploadToCloudinary(elements.imageInput.files[0]);
      }

      // Prepare form data
      const formData = {
          name,
          email,
          link,
          formEmail,
          tagline: elements.userTagline.value.trim() || "",
          phone: elements.userPhone.value.trim() || "",
          address: elements.userAddress.value.trim() || "",
          social_links: Array.from(document.querySelectorAll('input[name="social-links[]"]'))
                          .map(input => input.value.trim())
                          .filter(Boolean)
                          .join(","),
          style: document.querySelector(".style-preset.selected")?.dataset.style || "default",
          profilePic: profilePictureUrl
      };

      console.log("Form data prepared:", formData); // Debug log

      // Submit to backend
      const response = await fetch(`${CONFIG.googleScriptUrl}?${new URLSearchParams(formData)}`);
      
      if (!response.ok) {
          throw new Error(await response.text() || "Submission failed");
      }

      console.log("Submission successful"); // Debug log
      
      // Show success message
      await Swal.fire({
          icon: "success",
          title: "Success!",
          html: `Your digital card has been created!<br><br>
                <a href="https://card.tccards.tn/profile/@${link}" 
                   target="_blank"
                   class="text-blue-300 underline">
                   card.tccards.tn/@${link}
                </a>`,
          background: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
          confirmButtonText: "View My Card",
          confirmButtonColor: "#3b82f6"
      });

      // Redirect to the new profile
      window.location.href = `https://card.tccards.tn/profile/@${link}`;

  } catch (error) {
      console.error("Submission error:", error); // Debug log
      
      // Show error message
      Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to create your digital card. Please try again.",
          background: "linear-gradient(145deg, rgb(23, 7, 2), rgb(37, 42, 15), rgb(23, 2, 4))",
          confirmButtonColor: "#3b82f6"
      });
      
  } finally {
      // Reset loading state
      elements.submitBtn.disabled = false;
      document.getElementById('submit-text').classList.remove('hidden');
      document.getElementById('submit-spinner').classList.add('hidden');
  }
});

// Add real-time validation
function validateForm() {
  const isValid = elements.userName.value.trim() && 
                 elements.userLink.value.trim() && 
                 elements.userEmail.value.trim() && 
                 elements.formEmail.value.trim() &&
                 CONFIG.linkRegex.test(elements.userLink.value.trim()) &&
                 CONFIG.emailRegex.test(elements.userEmail.value.trim()) &&
                 CONFIG.emailRegex.test(elements.formEmail.value.trim());
  
  elements.submitBtn.disabled = !isValid;
}

// Add event listeners for real-time validation
[elements.userName, elements.userLink, elements.userEmail, elements.formEmail].forEach(el => {
  el.addEventListener('input', validateForm);
});

// Initial validation
validateForm();
});