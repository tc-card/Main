// main.js
import { CONFIG, stylePresets } from "./config.js";

// smooth landing animation on page loading/opening
const fadeInElements = document.querySelectorAll('.fade-in');
const FADE_IN_DURATION = '0.5s';
const FADE_OUT_DURATION = '0.3s';
const TRANSITION_TIMING = 'ease-in-out';
const NAVIGATION_DELAY = 500;

// Initial setup - hide elements before animation
fadeInElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transition = `opacity ${FADE_IN_DURATION} ${TRANSITION_TIMING}`;
});

// Fade in elements when DOM is ready 
document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
        fadeInElements.forEach(element => {
            element.style.opacity = '1';
        });
    });
});

// Handle link transitions
document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;

    // Check if link is external or internal route
    const href = link.getAttribute('href');
    if (!href.startsWith('http') && !href.startsWith('/')) return;

    e.preventDefault();

    // Fade out smoothly
    fadeInElements.forEach(element => {
        element.style.transition = `opacity ${FADE_OUT_DURATION} ${TRANSITION_TIMING}`;
        element.style.opacity = '0';
    });

    // Navigate after fade completes
    setTimeout(() => {
        window.location.href = href;
    }, NAVIGATION_DELAY);
});
document.addEventListener("DOMContentLoaded", () => {
  // ─── Element references ────────────────────────────────────
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
    referralCode: document.getElementById("referral-code"),
    handleValidationMessage: document.getElementById("handle-validation-message"),
  };

  // ─── Validate elements ────────────────────────────────────
  for (const [key, element] of Object.entries(elements)) {
    if (!element && key !== "stylePresets") {
      console.error(`Element '${key}' not found`);
      return;
    }
  }

  // ─── LIVE COUNTER ────────────────────────────────────────
  async function loadLiveCounter() {
    const counter = document.getElementById("activeCounter");
    const counterMeta = document.getElementById("counterMeta");

    if (!counter) return;

    counter.textContent = "Loading...";
    if (counterMeta) counterMeta.textContent = "Syncing live data...";

    try {
      const response = await fetch(`${CONFIG.googleScriptUrl}?get_stats=true`);
      if (!response.ok) throw new Error("Request failed");

      const data = await response.json();
      const totalCount = Number(data.totalCount || 0);
      const monthlyGrowth = Number(data.monthlyGrowth || 0);

      const target = Number.isFinite(totalCount) ? totalCount : 0;
      const step = Math.max(1, Math.ceil(target / 55));
      let current = 0;
      const ticker = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(ticker);
        }
        // Update the counter display with text
        counter.textContent = current.toLocaleString()+"+ Active accounts";
      }, 25);

      if (counterMeta) {
        counterMeta.textContent = monthlyGrowth > 0
          ? `+${monthlyGrowth.toLocaleString()} this month`
          : "Be the first to join this month!";
      }
    } catch (error) {
      console.error("Live counter failed:", error);
      counter.textContent = "—";
      if (counterMeta) counterMeta.textContent = "Live count unavailable";
    }
  }

  void loadLiveCounter();

  // ─── REFERRAL CODE VALIDATION ────────────────────────────
  if (elements.referralCode) {
    let debounceTimer;

    elements.referralCode.addEventListener("input", async () => {
      clearTimeout(debounceTimer);
      const code = elements.referralCode.value.trim().toUpperCase();

      elements.referralCode.classList.remove("valid", "invalid");
      document.getElementById("ticket").textContent = "";
      document.getElementById("ticket").innerHTML = '<i class="fas fa-spinner fa-spin"></i>  Validating...';
      document.getElementById("ticket").style.color = "#FBBF24";

      if (code.length >=5) { // Minimum length for a valid code
        debounceTimer = setTimeout(async () => {
          try {
            const response = await fetch(
              `${CONFIG.googleScriptUrl}?check_referral=true&code=${encodeURIComponent(code)}`
            );
            const result = await response.json();
              if (result.codeExists) {
                elements.referralCode.classList.add("valid");
                const details = result.codeDetails;
                let msg = "";
                if (details.type === "discount") {
                  msg = `✓ Valid discount: ${details.value}`;
                } else if (details.type === "event") {
                  msg = `✓ Valid event code: ${details.value}`;
                } else {
                  msg = `✓ Valid code: ${details.label || details.value}`;
                }
                document.getElementById("ticket").textContent = msg;
                document.getElementById("ticket").style.color = "#34d399"; // green
              } else {
                elements.referralCode.classList.add("invalid");
                document.getElementById("ticket").textContent = "✗ Invalid or expired code";
                document.getElementById("ticket").style.color = "#EF4444";
              }
          } catch (error) {
            console.error("Validation error:", error);
            document.getElementById("ticket").textContent = "Error validating code";
            document.getElementById("ticket").style.color = "#F59E0B";
          }
        }, 500);
      }
    });

    // Force uppercase
    elements.referralCode.addEventListener("keyup", () => {
      elements.referralCode.value = elements.referralCode.value.toUpperCase();
    });
  }

  // ─── IMAGE HANDLING ──────────────────────────────────────
  function handleImageUpload(file, targetElement) {
    if (!file) {
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
      targetElement.src = "https://tccards.tn/Assets/150.png";
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
    const file = e.target.files?.[0];
    handleImageUpload(file, elements.profilePicture);
  });

  // ─── SOCIAL LINKS MANAGEMENT ────────────────────────────
  function createSocialLink() {
    return `
      <li class="social-link-item group">
        <i class="fa fa-link text-purple-400 text-sm"></i>
        <input type="url" name="social-links[]" placeholder="https://domain.com/path"
          class="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm" />
        <button type="button" class="remove-link-btn text-red-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </li>`;
  }

  elements.addLinkBtn.addEventListener("click", () => {
    const ul = elements.dynamicLinks.querySelector("ul");
    const currentLinks = ul.querySelectorAll("li").length;

    if (currentLinks >= 6) {
      Swal.fire({
        icon: "info",
        title: "6 Links Maximum",
        toast: true,
        position: "top-center",
        showConfirmButton: false,
        timer: 2000,
        customClass: { popup: "small-toast" },
      });
      return;
    }

    ul.insertAdjacentHTML("beforeend", createSocialLink());
    ul.lastElementChild
      .querySelector(".remove-link-btn")
      .addEventListener("click", function() {
        this.closest("li").remove();
      });
  });

  // ─── STYLE PRESETS ──────────────────────────────────────
  document.querySelectorAll(".style-preset").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelectorAll(".style-preset")
        .forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");

      const style = stylePresets[button.dataset.style];
      if (style) document.body.style.background = style.background;
    });
  });

  // ─── DUPLICATE CHECK ────────────────────────────────────
  let debounceTimer;
  let handledLinksCache = [];
  let knownLinksPromise = null;
  let handleDebounceTimer = null;

  async function loadKnownLinks() {
    if (knownLinksPromise) return knownLinksPromise;

    knownLinksPromise = (async () => {
      try {
        const response = await fetch(`${CONFIG.googleScriptUrl}?get_all_links=true`);
        if (!response.ok) throw new Error("Could not load handles");
        const data = await response.json();
        handledLinksCache = Array.isArray(data.links) ? data.links : [];
      } catch (error) {
        console.error("Known links load failed:", error);
        handledLinksCache = [];
      }
    })();

    return knownLinksPromise;
  }

  function setHandleValidationState(status, message) {
    const target = elements.handleValidationMessage;
    if (!target) return;

    target.className = "validation-message";
    if (status === "valid") target.classList.add("valid");
    if (status === "invalid") target.classList.add("invalid");
    target.innerHTML = message;
  }

  async function validateHandleAvailability({ force = false } = {}) {
    const rawHandle = elements.userLink.value.trim();

    if (!rawHandle) {
      setHandleValidationState("", "");
      return { available: true, checked: false };
    }

    if (!CONFIG.linkRegex.test(rawHandle)) {
      setHandleValidationState("invalid", "✗ Handle must be 3-20 chars, letters, numbers, or hyphens.");
      return { available: false, checked: true };
    }

    if (!force) {
      await loadKnownLinks();
      if (handledLinksCache.includes(rawHandle)) {
        setHandleValidationState("invalid", "✗ This handle is already taken");
        return { available: false, checked: true };
      }
    }

    setHandleValidationState("", '<i class="fas fa-spinner fa-spin"></i> Checking availability...');

    try {
      const res = await fetch(
        `${CONFIG.googleScriptUrl}?check_duplicates=true&email=${encodeURIComponent("")}&link=${encodeURIComponent(rawHandle)}`
      );
      const result = await res.json();

      if (result.linkExists) {
        setHandleValidationState("invalid", "✗ This handle is already taken");
        return { available: false, checked: true };
      }

      setHandleValidationState("valid", "✓ This handle is available");
      return { available: true, checked: true };
    } catch (error) {
      console.error("Handle validation failed:", error);
      setHandleValidationState("invalid", "⚠ Could not verify handle right now");
      return { available: false, checked: true };
    }
  }

  elements.userLink.addEventListener("input", () => {
    clearTimeout(handleDebounceTimer);
    const rawHandle = elements.userLink.value.trim();

    if (!rawHandle) {
      setHandleValidationState("", "");
      return;
    }

    if (!CONFIG.linkRegex.test(rawHandle)) {
      setHandleValidationState("invalid", "✗ Handle must be 3-20 chars, letters, numbers, or hyphens.");
      return;
    }

    handleDebounceTimer = setTimeout(() => {
      void validateHandleAvailability();
    }, 2500);
  });

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
          resolve({ emailExists: true, linkExists: true });
        }
      }, 500);
    });
  }

  // ─── CLOUDINARY UPLOAD ──────────────────────────────────
  async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "preset");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dufg7fm4stt/image/upload", {
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

  // ─── FORM SUBMISSION ────────────────────────────────────
  elements.form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = elements.userEmail.value.trim();
    const link = elements.userLink.value.trim();
    const name = elements.userName.value.trim();

    if (!name || !link || !email) {
      Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "Please fill in all required fields.",
      });
      return false;
    }

    if (!CONFIG.linkRegex.test(link)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Link",
        text: "Link must be alphanumeric and between 3-20 characters.",
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
      let profilePictureUrl = "";
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

      const formData = {
        name: elements.userName.value.trim(),
        email: elements.userEmail.value.trim(),
        link: elements.userLink.value.trim(),
        tagline: elements.userTagline.value.trim() || "",
        phone: elements.userPhone.value.trim() || "",
        address: elements.userAddress.value.trim() || "",
        social_links: Array.from(
            document.querySelectorAll('input[name="social-links[]"]')
          )
          .map((input) => input.value.trim())
          .filter(Boolean)
          .join(","),
        style: document.querySelector(".style-preset.selected")?.dataset.style ||
          "default",
        profilePic: profilePictureUrl,
        referralCode: elements.referralCode.value.trim() || "",
      };

      swalInstance.update({
        title: "Checking availability...",
        text: "Verifying your information...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const { available: handleAvailable } = await validateHandleAvailability({ force: true });
      if (!handleAvailable) {
        throw new Error("This handle is already taken");
      }

      const { emailExists, linkExists } = await checkDuplicatesDebounced(
        formData.email,
        formData.link
      );
      if (emailExists || linkExists) {
        throw new Error(
          emailExists ? "Email already registered" : "Link already taken"
        );
      }

      swalInstance.update({
        title: "Uploading...",
        text: "Crafting your webfolio...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      if (elements.imageInput.files[0]) {
        formData.profile_picture = await uploadToCloudinary(
          elements.imageInput.files[0]
        );
      }

      const response = await fetch(
        `${CONFIG.googleScriptUrl}?${new URLSearchParams(formData)}`
      );
      if (!response.ok) throw new Error("Submission failed. Please try again.");

      await Swal.fire({
        icon: "success",
        title: "Success!",
        color: "#fff",
        html: `Your webfolio is ready!<br><br>
              <a href="https://card.tccards.tn/profile/@${formData.link}" target="_blank">
                card.tccards.tn/@${formData.link}
              </a>`,
        background: "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
        confirmButtonText: "View My Webfolio",
      }).then(() => {
        window.location.href = `https://card.tccards.tn/profile/@${formData.link}`;
      });

      elements.form.reset();
      elements.profilePicture.src = "https://tccards.tn/Assets/150.png";
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        background: "linear-gradient(145deg, rgb(23, 7, 2), rgb(37, 42, 15), rgb(23, 2, 4))",
      });
    } finally {
      elements.submitBtn.disabled = false;
      elements.profilePicture.src = "https://tccards.tn/Assets/150.png";
    }
  });
});