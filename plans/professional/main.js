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
    domainSelect: document.getElementById("domainSelect"),
    domainLabel: document.getElementById("domainLabel"),
    domainInput: document.getElementById("domainInput"),
    submitBtn: document.getElementById("saveContactBtn"),
    crmSettingsContainer: document.getElementById("crm-settings-container"),
    crmFeatureToggles: document.querySelectorAll(
      'input[name="crm_features[]"]'
    ),
  };

  // Validate elements exist
  for (const [key, element] of Object.entries(elements)) {
    if (!element || (Array.isArray(element) && element.length === 0)) {
      console.error(`Element(s) '${key}' not found`);
      return;
    }
  }

  // CRM Feature Templates
  const crmFeatures = {
    schedule: {
      name: "Work Schedule Display",
      description: "Show your availability and business hours",
      settings: `
                <div id="schedule-settings" class="bg-transparent p-6 rounded-lg border border-gray-700 space-y-4">
                    <h4 class="text-white font-semibold mb-4">Work Schedule Settings</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="text-gray-300 text-sm">Business Days</label>
                            <div class="flex flex-wrap gap-2">
                                <button type="button" name="business_days[]" value="monday" class="px-3 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 transition-colors">Mon</button>
                                <button type="button" name="business_days[]" value="tuesday" class="px-3 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 transition-colors">Tue</button>
                                <button type="button" name="business_days[]" value="wednesday" class="px-3 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 transition-colors">Wed</button>
                                <button type="button" name="business_days[]" value="thursday" class="px-3 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 transition-colors">Thu</button>
                                <button type="button" name="business_days[]" value="friday" class="px-3 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 transition-colors">Fri</button>
                                <button type="button" name="business_days[]" value="saturday" class="px-3 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 transition-colors">Sat</button>
                                <button type="button" name="business_days[]" value="sunday" class="px-3 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 transition-colors">Sun</button>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="text-gray-300 text-sm">Business Hours</label>
                            <div class="flex items-center space-x-2">
                                <input type="time" name="business_hours_start" class="bg-gray-900/20 text-white p-2 rounded border border-gray-700" required>
                                <span class="text-white">to</span>
                                <input type="time" name="business_hours_end" class="bg-gray-900/20 text-white p-2 rounded border border-gray-700" required>
                            </div>
                        </div>
                    </div>
                </div>
            `,
    },
    feedback: {
      name: "Feedback System",
      description: "Collect customer feedback and ratings",
      settings: `
                <div id="feedback-settings" class="bg-transparent p-6 rounded-lg border border-gray-700 space-y-4">
                    <h4 class="text-white font-semibold mb-4">Feedback System Settings</h4>
                    <div class="space-y-4">
                        <div class="flex items-center space-x-3">
                            <input type="checkbox" name="feedback_star_rating" class="h-4 w-4 rounded border-gray-300">
                            <label class="text-gray-300">Enable Star Rating</label>
                        </div>
                        <div class="flex items-center space-x-3">
                            <input type="checkbox" name="feedback_comments" class="h-4 w-4 rounded border-gray-300">
                            <label class="text-gray-300">Allow Comments</label>
                        </div>
                        <div class="flex items-center space-x-3">
                            <input type="checkbox" name="feedback_notifications" class="h-4 w-4 rounded border-gray-300">
                            <label class="text-gray-300">Email Notifications</label>
                        </div>
                    </div>
                </div>
            `,
    },
    messaging: {
      name: "Messaging Form",
      description: "Direct communication channel",
      settings: `
                <div id="messaging-settings" class="bg-transparent p-6 rounded-lg border border-gray-700 space-y-4">
                    <h4 class="text-white font-semibold mb-4">Messaging Form Fields</h4>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <label class="text-gray-300">Required Fields</label>
                            <div class="flex gap-2">
                                <button type="button" name="required_fields[]" value="name" class="px-3 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 transition-colors">Name</button>
                                <button type="button" name="required_fields[]" value="email" class="px-3 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 transition-colors">Email</button>
                                <button type="button" name="required_fields[]" value="phone" class="px-3 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 transition-colors">Phone</button>
                            </div>
                        </div>
                        <textarea name="message_template" placeholder="Custom Message Template" class="w-full bg-gray-900/20 text-white p-3 rounded border border-gray-700"></textarea>
                    </div>
                </div>
            `,
    },
    discounts: {
      name: "Discounts Display",
      description: "Showcase special offers and promotions",
      settings: `
                <div id="discounts-settings" class="bg-transparent p-6 rounded-lg border border-gray-700 space-y-4">
                    <h4 class="text-white font-semibold mb-4">Discounts Display Settings</h4>
                    <div class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="discount_title" placeholder="Discount Title" class="bg-gray-900/20 text-white p-2 rounded border border-gray-700">
                            <input type="text" name="discount_code" placeholder="Discount Code" class="bg-gray-900/20 text-white p-2 rounded border border-gray-700">
                        </div>
                        <div class="flex items-center space-x-4">
                            <div class="flex-1">
                                <label class="block text-gray-300 text-sm mb-1">Valid From</label>
                                <input type="date" name="discount_start_date" class="w-full bg-gray-900/20 text-white p-2 rounded border border-gray-700">
                            </div>
                            <div class="flex-1">
                                <label class="block text-gray-300 text-sm mb-1">Valid Until</label>
                                <input type="date" name="discount_end_date" class="w-full bg-gray-900/20 text-white p-2 rounded border border-gray-700">
                            </div>
                        </div>
                    </div>
                </div>
            `,
    },
    testimonials: {
      name: "Testimonials Section",
      description: "Display customer reviews and testimonials",
      settings: `
                <div id="testimonials-settings" class="bg-transparent p-6 rounded-lg border border-gray-700 space-y-4">
                    <h4 class="text-white font-semibold mb-4">Testimonials Settings</h4>
                    <div class="space-y-4">
                        <div class="flex items-center space-x-3">
                            <input type="checkbox" name="testimonial_show_photos" class="h-4 w-4 rounded border-gray-300">
                            <label class="text-gray-300">Show Profile Pictures</label>
                        </div>
                        <div class="flex items-center space-x-3">
                            <input type="checkbox" name="testimonial_show_ratings" class="h-4 w-4 rounded border-gray-300">
                            <label class="text-gray-300">Display Ratings</label>
                        </div>
                        <select name="testimonial_layout" class="w-full bg-gray-900/20 text-white p-2 rounded border border-gray-700">
                            <option style="background-color: rgba(2, 20, 70, 0.788);" value="grid">Grid Layout</option>
                            <option style="background-color: rgba(2, 20, 70, 0.788);" value="carousel">Carousel Layout</option>
                            <option style="background-color: rgba(2, 20, 70, 0.788);" value="list">List Layout</option>
                        </select>
                    </div>
                </div>
            `,
    },
  };

  // Function to render CRM settings
  // Function to render CRM settings
  function renderCRMSettings() {
    // Clear existing settings
    elements.crmSettingsContainer.innerHTML = "";

    // Loop through all CRM feature toggles
    elements.crmFeatureToggles.forEach((toggle) => {
      if (toggle.checked) {
        const feature = crmFeatures[toggle.value];
        if (feature) {
          // Append new settings
          elements.crmSettingsContainer.insertAdjacentHTML(
            "beforeend",
            feature.settings
          );
        }
      }
    });
  }

  // Event listeners for CRM feature toggles
  elements.crmFeatureToggles.forEach((toggle) => {
    toggle.addEventListener("change", renderCRMSettings);
  });

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

  // Function to upload images to Cloudinary
  async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "preset"); // Ensure the preset is correct

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

      return data.secure_url; // Returns the image URL
    } catch (error) {
      console.error("Image upload error:", error);
      throw error; // Re-throw the error to handle it in the main try-catch block
    }
  }
 
    // Cloudinary Upload Function
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
  
    // Form Submission
    elements.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      elements.submitBtn.disabled = true;
  
      try {
        // Show loading state
        const swalInstance = Swal.fire({
          title: "Creating Your Digital Card",
          html: "Step 1: Validating information...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });
  
        // Get form values
        const userName = document.getElementById("user-name").value.trim();
        const userEmail = document.querySelector('input[name="email"]').value.trim();
        const userLink = document.querySelector('input[name="link"]').value.trim();
  
        // Basic validation
        if (!userName || !userEmail || !userLink) {
          throw new Error('Name, email, and link are required');
        }
  
        // Check link format
        if (!/^[a-z0-9-]+$/i.test(userLink)) {
          throw new Error('Link can only contain letters, numbers and hyphens');
        }
  
        // Update loading message
        await swalInstance.update({
          html: "Step 2: Uploading images..."
        });
  
        // Upload images to Cloudinary
        let profilePictureUrl = CONFIG.defaultProfileImage;
        let backgroundImageUrl = '';
        
        if (elements.imageInput.files[0]) {
          profilePictureUrl = await uploadToCloudinary(elements.imageInput.files[0]);
        }
        
        if (elements.bgImage.files[0]) {
          backgroundImageUrl = await uploadToCloudinary(elements.bgImage.files[0]);
        }
  
        // Update loading message
        await swalInstance.update({
          html: "Step 3: Configuring CRM features..."
        });
  
        // Process CRM features
        const selectedCRMFeatures = Array.from(elements.crmFeatureToggles)
          .filter((toggle) => toggle.checked)
          .map((toggle) => toggle.value);
  
        const crmSettings = {};
        selectedCRMFeatures.forEach((feature) => {
          switch (feature) {
            case "schedule":
              crmSettings.schedule = {
                businessDays: Array.from(
                  document.querySelectorAll('button[name="business_days[]"].bg-blue-600')
                ).map((button) => button.value),
                businessHours: {
                  start: document.querySelector('input[name="business_hours_start"]').value,
                  end: document.querySelector('input[name="business_hours_end"]').value,
                },
              };
              break;
            case "feedback":
              crmSettings.feedback = {
                starRating: document.querySelector('input[name="feedback_star_rating"]').checked,
                comments: document.querySelector('input[name="feedback_comments"]').checked,
                notifications: document.querySelector('input[name="feedback_notifications"]').checked,
              };
              break;
            case "messaging":
              crmSettings.messaging = {
                requiredFields: Array.from(
                  document.querySelectorAll('button[name="required_fields[]"].bg-blue-600')
                ).map((button) => button.value),
                messageTemplate: document.querySelector('textarea[name="message_template"]').value,
              };
              break;
            case "discounts":
              crmSettings.discounts = {
                title: document.querySelector('input[name="discount_title"]').value,
                code: document.querySelector('input[name="discount_code"]').value,
                startDate: document.querySelector('input[name="discount_start_date"]').value,
                endDate: document.querySelector('input[name="discount_end_date"]').value,
              };
              break;
            case "testimonials":
              crmSettings.testimonials = {
                showPhotos: document.querySelector('input[name="testimonial_show_photos"]').checked,
                showRatings: document.querySelector('input[name="testimonial_show_ratings"]').checked,
                layout: document.querySelector('select[name="testimonial_layout"]').value,
              };
              break;
          }
        });
  
        // Prepare final data
        const data = {
          name: userName,
          email: userEmail,
          link: userLink,
          tagline: document.getElementById("user-tagline").value.trim() || "",
          phone: document.querySelector('input[name="phone"]').value.trim() || "",
          address: document.querySelector('input[name="address"]').value.trim() || "",
          social_links: Array.from(document.getElementsByName("social-links[]"))
            .map((input) => input.value.trim())
            .filter(Boolean)
            .join(","),
          style: document.querySelector(".style-preset.selected")?.dataset.style || "default",
          form_type: "professional",
          profile_picture: profilePictureUrl,
          background_image: backgroundImageUrl,
          crm_features: selectedCRMFeatures.join(","),
          crm_settings: JSON.stringify(crmSettings),
          domain: elements.domainInput.value || "",
        };
  
        // Update loading message
        await swalInstance.update({
          html: "Step 4: Finalizing your card..."
        });
  
        // Submit to Google Apps Script
        const url = `${CONFIG.googleScriptUrl}?${new URLSearchParams(data)}`;
        const response = await fetch(url, { method: "GET" });
        
        // Handle response
        let result;
        try {
          result = await response.json();
        } catch (e) {
          // If JSON parsing fails but we got a response, assume success
          if (response.ok) {
            result = { status: "success" };
          } else {
            throw new Error("Failed to process response");
          }
        }
  
        if (!response.ok || result.status === "error") {
          throw new Error(result.message || "Submission failed");
        }
  
        // Success
        await Swal.fire({
          icon: "success",
          title: "Professional Card Created!",
          html: `Your digital business card is ready!<br><br>
                <a href="https://p.tccards.tn/@${userLink}" target="_blank" class="font-bold">
                  p.tccards.tn/@${userLink}
                </a><br><br>
                <small class="text-gray-500">CRM features may take 2-3 minutes to fully activate</small>`,
          confirmButtonText: "View My Card",
          showCancelButton: true,
          cancelButtonText: "Dashboard",
          footer: '<a href="/dashboard" class="text-blue-500 hover:underline">Go to your dashboard</a>'
        }).then((res) => {
          if (res.isConfirmed) {
            window.location.href = `https://p.tccards.tn/@${userLink}`;
          } else if (res.dismiss === Swal.DismissReason.cancel) {
            window.location.href = '/dashboard';
          }
        });
  
      } catch (error) {
        console.error("Submission error:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to create digital card",
          confirmButtonText: "OK"
        });
      } finally {
        elements.submitBtn.disabled = false;
      }
    });
  
    // Function to reset the form
    function resetForm() {
      elements.form.reset();
      elements.profilePicture.src = CONFIG.defaultProfileImage;
      document.querySelectorAll(".style-preset").forEach((btn) => btn.classList.remove("selected"));
      document.body.style.background = stylePresets.minimal.background;
  
      // Reset CRM features
      elements.crmFeatureToggles.forEach((toggle) => {
        toggle.checked = false;
      });
      elements.crmSettingsContainer.innerHTML = "";
      
      // Reset file inputs
      elements.imageInput.value = "";
      elements.bgImage.value = "";
    }
});
