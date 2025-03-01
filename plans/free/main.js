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
    const currentLinks = ul.querySelectorAll("li").length;

    // Check if the limit of 5 links has been reached
    if (currentLinks >= 3) {
      Swal.fire({
        icon: "error",
        title: "Link Limit Reached",
        text: "You can only add up to 3 social links.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return; // Exit the function if the limit is reached
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

    // Show loading state
    Swal.fire({
      title: "Creating Your Digital Card",
      html: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // Validate required fields
      const userName = document.getElementById("user-name").value.trim();
      const userEmail = document
        .querySelector('input[name="email"]')
        .value.trim();

      if (!userName || !userEmail) {
        throw new Error("Name and email are required");
      }

      // Upload profile picture to Cloudinary
      const profilePictureFile = elements.imageInput.files[0];
      const profilePictureUrl = profilePictureFile
        ? await uploadToCloudinary(profilePictureFile)
        : "";

      // Prepare form data
      const data = {
        name: userName,
        email: userEmail,
        tagline: document.getElementById("user-tagline").value.trim() || "",
        phone: document.querySelector('input[name="phone"]').value.trim() || "",
        address:
          document.querySelector('input[name="address"]').value.trim() || "",
        social_links: Array.from(document.getElementsByName("social-links[]"))
          .map((input) => input.value.trim())
          .filter(Boolean)
          .join(","),
        style:
          document.querySelector(".style-preset.selected")?.dataset.style ||
          "default",
        profile_picture: profilePictureUrl,
      };

      // Submit form data
      const queryParams = new URLSearchParams(data).toString();
      const url = `${CONFIG.googleScriptUrl}?${queryParams}`;

      const response = await fetch(url, { method: "GET" });
      const result = await response.json();
      console.log(result);

      // Check the response
      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Submission failed");
      }

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Your digital card has been created successfully!",
        confirmButtonText: "View My Card",
        showCancelButton: true,
        cancelButtonText: "Create Another",
      }).then((res) => {
        if (res.isConfirmed) {
          window.location.href = `view-card.html?id=${result.cardId}`;
        } else {
          resetForm();
        }
      });
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong! Please try again.",
        footer: '<a href="#">Need help?</a>',
      });
    } finally {
      elements.submitBtn.disabled = false;
    }
  });

  // Function to reset the form
  function resetForm() {
    elements.form.reset();
    elements.profilePicture.src = CONFIG.defaultProfileImage;
    document
      .querySelectorAll(".style-preset")
      .forEach((btn) => btn.classList.remove("selected"));
    document.body.style.background = stylePresets.minimal.background;
  }
});
