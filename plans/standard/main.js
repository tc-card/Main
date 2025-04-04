import { CONFIG, stylePresets } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all elements
  const elements = {
    profilePicture: document.getElementById("profile-picture"),
    imageInput: document.getElementById("image-input"),
    addLinkBtn: document.getElementById("add-link-btn"),
    dynamicLinks: document.getElementById("dynamic-links"),
    form: document.getElementById("data-fill"),
    bgImage: document.getElementById("bgImage"),
    formType: document.getElementById("form-type"),
    formPreview: document.getElementById("form-preview"),
    submitBtn: document.getElementById("saveContactBtn"),
  };

  // Validate elements exist
  for (const [key, element] of Object.entries(elements)) {
    if (!element) {
      console.error(`Element '${key}' not found`);
      return;
    }
  }

  // Image Handling
  function handleImageUpload(file, targetElement) {
    if (!file) return;

    if (!CONFIG.allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Please upload a valid image file (JPEG, PNG, GIF, WEBP)",
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
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to read image file",
      });
    };
    reader.readAsDataURL(file);
  }

  // Profile picture handlers
  elements.profilePicture.addEventListener("click", () =>
    elements.imageInput.click()
  );
  elements.imageInput.addEventListener("change", (e) => {
    handleImageUpload(e.target.files[0], elements.profilePicture);
  });

  // Background image handler
  elements.bgImage.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      document.body.style.backgroundImage = `url('${event.target.result}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";

      Swal.fire({
        icon: "success",
        title: "Background Updated",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });
    };
    reader.readAsDataURL(file);
  });

  // Social Links Management
  function createSocialLink() {
    return `
      <li class="flex items-center bg-white/10 p-2 rounded shadow-md border border-white/30 hover:bg-white/20 relative group">
        <i class="fa fa-link text-xl text-white mr-3"></i>
        <input type="url" name="social-links[]" placeholder="https://your-link.com" 
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
    ul.insertAdjacentHTML("beforeend", createSocialLink());
    const removeBtn = ul.lastElementChild.querySelector(".remove-link-btn");
    removeBtn.addEventListener("click", function () {
      this.closest("li").remove();
    });
  });

  // Style Management
  document.querySelectorAll(".style-preset").forEach((button) => {
    button.addEventListener("click", () => {
      const style = stylePresets[button.dataset.style];
      document.body.style.background = style.background;
      document.body.style.backgroundSize = "cover";

      document
        .querySelectorAll(".style-preset")
        .forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");

      Swal.fire({
        icon: "success",
        title: "Style Updated",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });
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

  // Form Submission

  elements.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    elements.submitBtn.disabled = true;
  
    try {
      // Get form values
      const userName = document.getElementById("user-name").value.trim();
      const userEmail = document.querySelector('input[name="email"]').value.trim();
      const userLink = document.querySelector('input[name="link"]').value.trim();
  
      // Basic validation
      if (!userName || !userEmail || !userLink) {
        throw new Error('Name, email, and link are required');
      }
  
      // Show loading
      Swal.fire({
        title: 'Checking availability...',
        html: 'Please wait while we verify your information',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      // Check for duplicates using Google Apps Script
      async function checkDuplicates(email, link) {
        try {
          const echoUrl = `${CONFIG.googleScriptUrl}?check_duplicates=true&email=${encodeURIComponent(email)}&link=${encodeURIComponent(link)}`;
          
          const nocacheUrl = `${echoUrl}&_=${Date.now()}`;
    
          const response = await fetch(nocacheUrl, {
            method: 'GET',
            credentials: 'omit',
            redirect: 'follow'
          });
      
          // Handle the redirect manually if needed
          const finalUrl = response.url.includes('googleusercontent.com') ? 
            response.url : 
            `https://script.googleusercontent.com${new URL(response.url).pathname}`;
      
          const finalResponse = await fetch(finalUrl, {
            method: 'GET',
            credentials: 'omit'
          });
      
          if (!finalResponse.ok) {
            throw new Error('Network response was not ok');
          }
      
          return await finalResponse.json();
        } catch (error) {
          console.error("Duplicate check failed:", error);
          throw new Error("Unable to verify email/link availability. Please try again.");
        }
      }
      
      // Check for duplicates
      const duplicateCheck = await checkDuplicates(userEmail, userLink);

      if (duplicateCheck.linkExists || duplicateCheck.emailExists) {
        throw new Error(
          (duplicateCheck.emailExists ? "This email is already registered. " : "") +
          (duplicateCheck.linkExists ? "This link is already taken." : "")
        );
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
              throw new Error(`Cloudinary upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.secure_url) {
              throw new Error("Cloudinary response did not return a secure URL");
            }

            return data.secure_url;
          } catch (error) {
            console.error("Image upload error:", error);
            return "";
        }
      }

      // Upload images
      const profilePictureFile = elements.imageInput.files[0];
      const backgroundImageFile = elements.bgImage.files[0];
  
      let profilePictureUrl = '';
      let backgroundImageUrl = '';
  
      if (profilePictureFile) {
        profilePictureUrl = await uploadToCloudinary(profilePictureFile);
        // log that it was uploaded
        console.log('Profile picture uploaded:', profilePictureUrl);
      }
      if (backgroundImageFile) {
        backgroundImageUrl = await uploadToCloudinary(backgroundImageFile);
        // log that it was uploaded
        console.log('Background image uploaded:', backgroundImageUrl);
      }
      
      // Prepare submission data
      const data = {
        name: userName,
        email: userEmail,
        link: userLink,
        tagline: document.getElementById('user-tagline').value.trim() || '',
        phone: document.querySelector('input[name="phone"]').value.trim() || '',
        address: document.querySelector('input[name="address"]').value.trim() || '',
        social_links: Array.from(document.getElementsByName('social-links[]'))
          .map(input => input.value.trim())
          .filter(Boolean)
          .join(','),
        style: document.querySelector('.style-preset.selected')?.dataset.style || 'default',
        form_type: elements.formType.value || '',
        profile_picture: profilePictureUrl,
        background_image: backgroundImageUrl
      };
  
      // Submit form
      Swal.fire({
        title: 'Submitting...',
        html: 'Please wait while we create your digital card',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
        });
      
        let result = { status: 'success' }; // Default to success
        try {
        const url = `${CONFIG.googleScriptUrl}?${new URLSearchParams(data)}`;
        const response = await fetch(url, { method: 'GET' });
        
        // Only try to parse JSON if we got a response
        if (response) {
          const jsonResult = await response.json();
          if (jsonResult.status === 'error') {
          throw new Error(jsonResult.message || 'Submission failed');
          }
        }
        } catch (fetchError) {
        // Ignore TypeError: Failed to fetch and continue as success
        if (!(fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch'))) {
          throw fetchError;
        }
        }
  
        // If we got here, treat as success
        await Swal.fire({
        icon: 'success',
        title: 'Success!',
        html: `Your digital card has been created!<br><br>
            <a href="https://tccards.tn/profile/${userLink}" target="_blank">
            tccards.tn/profile/${userLink}
            </a>`,
        confirmButtonText: 'View My Card',
        showCancelButton: true,
        cancelButtonText: 'Close'
        }).then((res) => {
        if (res.isConfirmed) {
          window.location.href = `https://tccards.tn/profile/${userLink}`;
        } else {
          elements.form.reset();
        }
        });
  
      } catch (error) {
        console.error('Submission error:', error);
        await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'An error occurred during submission',
        confirmButtonText: 'OK'
        });
    } finally {
      elements.submitBtn.disabled = false;
    }
  });
});