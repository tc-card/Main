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
    userName: document.getElementById("user-name"),
    userEmail: document.querySelector('input[name="email"]'),
    userLink: document.querySelector('input[name="link"]'),
    userTagline: document.getElementById("user-tagline"),
    userPhone: document.querySelector('input[name="phone"]'),
    userAddress: document.querySelector('input[name="address"]'),
  };

  // Validate elements exist
  for (const [key, element] of Object.entries(elements)) {
    if (!element && key !== "stylePresets") { // stylePresets is optional
      console.error(`Element '${key}' not found`);
      return;
    }
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
        toast: true,
        position: "top-center",
      });
      return;
    }
    if (file.size > CONFIG.maxFileSize) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "File size must be less than 5MB",
        toast: true,
        position: "top-center",
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

    if (currentLinks >= 3) {
      Swal.fire({
        icon: "info",
        title: "3 Links Maximum",
        background: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
        color: "#fff",
        toast: true,
        position: "top-center",
        showConfirmButton: false,
        timer: 2000,
        customClass: { popup: 'small-toast' }
      });
      return;
    }

    ul.insertAdjacentHTML("beforeend", createSocialLink());
    ul.lastElementChild.querySelector(".remove-link-btn").addEventListener("click", function() {
      this.closest("li").remove();
    });
  });

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
    
    // form validation
    const email = elements.userEmail.value.trim();
    const link = elements.userLink.value.trim();
    const name = elements.userName.value.trim();

    if (!name|| !link || !email) {
      Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "Please fill in all required fields.",
        toast: true,
        position: "top-center",
      });
      return false;
    }

    if (!CONFIG.linkRegex.test(link)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Link",
        text: "Link must be alphanumeric and between 3-20 characters.",
        toast: true,
        position: "top-center",
      });
      return false;
    }

    if (!CONFIG.emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
      });
      return false;
    }

    elements.submitBtn.disabled = true;
    
    const swalInstance = Swal.fire({
      title: "Submitting...",
      text: "Please wait while we create your webfolio.",
      background: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
      color: "#fff",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
  
    try {
      // First handle image upload if there's a file
      let profilePictureUrl = '';
      if (elements.imageInput.files[0]) {
        swalInstance.update({
          title: "Uploading image...",
          text: "Processing your profile picture...",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => Swal.showLoading(),
        });
        profilePictureUrl = await uploadToCloudinary(elements.imageInput.files[0]);
      }

      // Then collect form data with the uploaded image URL
      const formData = {
        name: elements.userName.value.trim(),
        email: elements.userEmail.value.trim(),
        link: elements.userLink.value.trim(),
        tagline: elements.userTagline.value.trim() || "",
        phone: elements.userPhone.value.trim() || "",
        address: elements.userAddress.value.trim() || "",
        social_links: Array.from(document.querySelectorAll('input[name="social-links[]"]'))
                      .map(input => input.value.trim())
                      .filter(Boolean)
                      .join(","),
        style: document.querySelector(".style-preset.selected")?.dataset.style || "default",
        profilePic: profilePictureUrl, // Use the URL from Cloudinary
      };

      // Update Swal for duplicate check
      swalInstance.update({
        title: "Checking availability...",
        text: "Verifying your information...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const { emailExists, linkExists } = await checkDuplicatesDebounced(formData.email, formData.link);
      if (emailExists || linkExists) {
        throw new Error(emailExists ? "Email already registered" : "Link already taken");
      }

      // Update Swal for upload
      swalInstance.update({
        title: "Uploading...",
        text: "Crafting your webfolio...",
        didOpen: () => Swal.showLoading(),
      });

      if (elements.imageInput.files[0]) {
        formData.profile_picture = await uploadToCloudinary(elements.imageInput.files[0]);
      }

      // Submit to GAS
      const response = await fetch(`${CONFIG.googleScriptUrl}?${new URLSearchParams(formData)}`);
      if (!response.ok) throw new Error("Submission failed. Please try again.");

      // Success
      await Swal.fire({
        icon: "success",
        title: "Success!",
        color: "#fff",
        html: `Your webfolio is ready!<br><br>
              <a href="https://p.tccards.tn/profile/@${formData.link}" target="_blank">
                @${formData.link}
              </a>`,
        background: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
        confirmButtonText: "View My Webfolio"
        }).then(() => {
          window.location.href = `https://card.tccards.tn/profile/@${formData.link}`;
        });

      // Reset form and image preview
      elements.form.reset();
      elements.profilePicture.src = "https://tccards.tn/Assets/default.png"; // Reset to default image

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        background: "linear-gradient(145deg, rgb(23, 7, 2), rgb(37, 42, 15), rgb(23, 2, 4))",
      });
    } finally {
      elements.submitBtn.disabled = false;
      elements.profilePicture.src = "https://tccards.tn/Assets/150.png"; // Reset to default image
    }
  });
});