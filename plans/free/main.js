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
    if (!file) return;

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
    reader.readAsDataURL(file);
  }

  elements.profilePicture.addEventListener("click", () => elements.imageInput.click());
  elements.imageInput.addEventListener("change", (e) => {
    handleImageUpload(e.target.files[0], elements.profilePicture);
  });

  // ===== SOCIAL LINKS MANAGEMENT =====
  function createSocialLink() {
    return `
      <li class="flex items-center bg-white/10 p-2 rounded shadow-md border border-white/30 hover:bg-white/20 relative group">
          <i class="fa fa-link text-xl text-white mr-3"></i>
          <input type="url" name="social-links[]" placeholder="https://example.com/mylink" 
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
    if (!file) return "";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "preset");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dufg7fm4stt/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.secure_url || "";
    } catch (error) {
      console.error("Upload failed:", error);
      return "";
    }
  }

  elements.form.addEventListener("submit", async (e) => {
    e.preventDefault();
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
      // Collect form data
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
        profile_picture: "",
      };

      // Update Swal for duplicate check
      swalInstance.update({
        title: "Checking availability...",
        text: "Verifying your information...",
      });

      const { emailExists, linkExists } = await checkDuplicatesDebounced(formData.email, formData.link);
      if (emailExists || linkExists) {
        throw new Error(emailExists ? "Email already registered" : "Link already taken");
      }

      // Update Swal for upload
      swalInstance.update({
        title: "Uploading...",
        text: "Crafting your webfolio...",
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
        html: `Your webfolio is ready!<br><br>
              <a href="https://p.tccards.tn/profile/@${formData.link}" target="_blank">
                p.tccards.tn/@${formData.link}
              </a>`,
        confirmButtonText: "View My Webfolio",
        background: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
      });

      // Reset form and image preview
      elements.form.reset();
      elements.profilePicture.src = "/default-avatar.png"; // Reset to default image

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        background: "linear-gradient(145deg, rgb(23, 7, 2), rgb(37, 42, 15), rgb(23, 2, 4))",
      });
    } finally {
      elements.submitBtn.disabled = false;
    }
  });
});