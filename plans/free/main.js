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

  // Social Links Management
  function createSocialLink() {
    return `
        <li class="flex items-center bg-white/10 p-2 rounded shadow-md border border-white/30 hover:bg-white/20 relative group">
            <i class="fa fa-link text-xl text-white mr-3"></i>
            <input type="url" name="social-links[]" placeholder="https://exemple.com/mylink" 
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

    // Check if the limit of 5 links has been reached
    if (currentLinks >= 3) {
      Swal.fire({
      icon: "info",
      title: "3 Links Maximum",
      toast: true,
      position: "top-center",
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: 'small-toast'
      }
      });
      return;
    }

    // Add a new link if the limit is not reached
    ul.insertAdjacentHTML("beforeend", createSocialLink());

    // Add listener to the new remove button
    const newLi = ul.lastElementChild;
    const removeButton = newLi.querySelector(".remove-link-btn");
    removeButton.addEventListener("click", function () {
      this.closest("li").remove();

      // Re-enable the "Add Another Link" button if links are below the limit
      if (ul.querySelectorAll("li").length < 5) {
        elements.addLinkBtn.disabled = false;
      }
    });

    // Disable the "Add Another Link" button if the limit is reached
    if (ul.querySelectorAll("li").length >= 5) {
      elements.addLinkBtn.disabled = true;
    }
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
      if (!CONFIG.emailRegex.test(userEmail)) {
        throw new Error('Invalid email format');
      }
      if (!CONFIG.linkRegex.test(userLink)) {
        throw new Error('Invalid url format');
      }


      // Show loading
      Swal.fire({
        title: 'Checking availability...',
        html: 'Please wait while we verify your information',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      // Check duplicates synchronously (more reliable)
      try {
        const checkResponse = await fetch(`${CONFIG.googleScriptUrl}?check_duplicates=true&email=${encodeURIComponent(userEmail)}&link=${encodeURIComponent(userLink)}`);
        
        if (!checkResponse.ok) {
          throw new Error('Failed to verify availability');
        }

        const checkResult = await checkResponse.json();
        
        if (checkResult.emailExists) {
          throw new Error('This email is already registered');
        }
        if (checkResult.linkExists) {
          throw new Error('This link is already taken');
        }
      } catch (error) {
        // Close loading dialog if there's an error
        if (swalInstance.close) {
          swalInstance.close();
        }
        throw error; // Re-throw to be caught by the outer try-catch
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
      
      let profilePictureUrl = '';
      
      if (profilePictureFile) {
        profilePictureUrl = await uploadToCloudinary(profilePictureFile);
        // log that it was uploaded
        console.log('Profile picture uploaded:', profilePictureUrl);
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
        form_type: '',
        profile_picture: profilePictureUrl,
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
            <a href="https://p.tccards.tn/profile/#${userLink}" target="_blank">
            p.tccards.tn/@${userLink}
            </a>`,
        confirmButtonText: 'View My Card',
        showCancelButton: true,
        cancelButtonText: 'Close'
        }).then((res) => {
        if (res.isConfirmed) {
          window.location.href = `https://p.tccards.tn/@${userLink}`;
        } else {
          elements.form.reset();
        }
        });
        console.log('Form submitted successfully:', data);
  
      } catch (error) {
        console.log('Full error object:', error);
        console.log('Error response:', await error.response?.text());
        console.error('Submission error:', error);
        await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'An error occurred during submission',
        confirmButtonText: 'OK',
        background: 'linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))',
        color: '#fff',
        });
    } finally {
      elements.submitBtn.disabled = false;
    }
  });
});
