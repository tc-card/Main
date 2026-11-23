// main.js
import { CONFIG, stylePresets } from "./config.js";
import { toast, dialog, progress } from "./ui.js";

// smooth landing animation on page loading/opening
const fadeInElements = document.querySelectorAll('.fade-in');
const FADE_IN_DURATION = '0.5s';
const FADE_OUT_DURATION = '0.3s';
const TRANSITION_TIMING = 'ease-in-out';
const NAVIGATION_DELAY = 500;

function getUsernameFromUrl() {
  const queryUsername = new URLSearchParams(window.location.search).get('username');
  if (queryUsername) return queryUsername.trim();

  const hashQuery = window.location.hash.split('?')[1];
  return hashQuery ? (new URLSearchParams(hashQuery).get('username') || '').trim() : '';
}

function prefillUsername() {
  const input = document.getElementById('user-link');
  const username = getUsernameFromUrl();
  if (input && username && !input.value) input.value = username;
}

fadeInElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transition = `opacity ${FADE_IN_DURATION} ${TRANSITION_TIMING}`;
});

document.addEventListener('DOMContentLoaded', () => {
  prefillUsername();
    requestAnimationFrame(() => {
        fadeInElements.forEach(element => {
            element.style.opacity = '1';
        });
    });
});

document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || (!href.startsWith('http') && !href.startsWith('/'))) return;
    if (link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();

    fadeInElements.forEach(element => {
        element.style.transition = `opacity ${FADE_OUT_DURATION} ${TRANSITION_TIMING}`;
        element.style.opacity = '0';
    });

    setTimeout(() => {
        window.location.href = href;
    }, NAVIGATION_DELAY);
});

document.addEventListener("DOMContentLoaded", () => {
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
    handleValidationMessage: document.getElementById("handle-validation-message"),
  };

  for (const [key, element] of Object.entries(elements)) {
    if (!element && key !== "stylePresets") {
      console.error(`Element '${key}' not found`);
      return;
    }
  }

  // ─── Helper: parse Apps Script JSON, surface real errors ──
  async function readJson(response) {
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Server returned invalid JSON");
    }
    if (data && data.status === "error") {
      throw new Error(data.message || "Request failed");
    }
    return data || {};
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
      const data = await readJson(response);
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
        counter.textContent = current.toLocaleString() + "+ Active accounts";
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

  // ─── IMAGE HANDLING ──────────────────────────────────────
  const DEFAULT_AVATAR = "https://tccards.tn/Assets/150.png";

  function handleImageUpload(file, targetElement) {
    if (!file) {
      targetElement.src = DEFAULT_AVATAR;
      return;
    }

    const reject = (message) => {
      toast(message, "error");
      elements.imageInput.value = "";
      targetElement.src = DEFAULT_AVATAR;
    };

    if (!CONFIG.allowedTypes.includes(file.type)) {
      return reject("Please upload a JPEG, PNG or GIF image.");
    }
    // JPEG/PNG are resized before upload, so phone photos are fine. GIFs are sent as they are.
    const limit = file.type === "image/gif" ? CONFIG.maxFileSize : CONFIG.maxFileSize * 2;
    if (file.size > limit) {
      return reject(`That photo is too large. Please choose one under ${Math.round(limit / 1048576)}MB.`);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      targetElement.src = e.target.result;
    };
    reader.onerror = () => {
      console.error("Error reading file");
      reject("We couldn't read that image. Please try another one.");
    };
    reader.readAsDataURL(file);
  }

  // Split the two listeners — the old `a || b` idiom silently skipped the
  // change handler whenever addEventListener happened to return truthy.
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
      toast("You can add up to 6 links.", "info");
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

  // ─── DUPLICATE CHECK / HANDLE AVAILABILITY ─────────────
  let handledLinksCache = [];
  let knownLinksPromise = null;
  let handleDebounceTimer = null;

  async function loadKnownLinks() {
    if (knownLinksPromise) return knownLinksPromise;

    knownLinksPromise = (async () => {
      try {
        const response = await fetch(`${CONFIG.googleScriptUrl}?get_all_links=true`);
        const data = await readJson(response);
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

  // Race guard: if the user kept typing while a check was in flight, the
  // result we're about to apply no longer matches what's in the input.
  function isStillCurrent(handle) {
    return elements.userLink.value.trim() === handle;
  }

  async function validateHandleAvailability() {
    const rawHandle = elements.userLink.value.trim();

    if (!rawHandle) {
      setHandleValidationState("", "");
      return { available: true, checked: false };
    }

    if (!CONFIG.linkRegex.test(rawHandle)) {
      setHandleValidationState("invalid", "✗ Handle must be 3-15 characters, start with a letter, and use only letters, numbers, or hyphens.");
      return { available: false, checked: true };
    }

    // UI magic: show the spinner RIGHT NOW, before any network work.
    // The user gets instant feedback the moment they blur or type.
    setHandleValidationState("", '<i class="fas fa-spinner fa-spin"></i> Checking availability...');

    // Fast path: if we already know the local list, we can reject a taken
    // handle without a round trip.
    if (handledLinksCache.length && handledLinksCache.includes(rawHandle)) {
      if (!isStillCurrent(rawHandle)) return { available: true, checked: false };
      setHandleValidationState("invalid", "✗ This handle is already taken");
      return { available: false, checked: true };
    }

    // Slow path (first run only): load the known-links list, keep the spinner up.
    try {
      await loadKnownLinks();
    } catch (_) { /* handled inside loadKnownLinks */ }

    if (!isStillCurrent(rawHandle)) return { available: true, checked: false };

    if (handledLinksCache.includes(rawHandle)) {
      setHandleValidationState("invalid", "✗ This handle is already taken");
      return { available: false, checked: true };
    }

    try {
      const res = await fetch(
        `${CONFIG.googleScriptUrl}?check_duplicates=true&email=${encodeURIComponent("")}&link=${encodeURIComponent(rawHandle)}`
      );
      const data = await res.json();

      if (!isStillCurrent(rawHandle)) return { available: true, checked: false };

      if (data && data.status === "error") {
        // Don't block the user — the server will re-check on submit.
        console.warn("Handle check error:", data.message);
        setHandleValidationState("", "⚠ Could not verify handle right now; will retry on submit.");
        return { available: true, checked: false };
      }

      if (data && data.linkExists) {
        setHandleValidationState("invalid", "✗ This handle is already taken");
        return { available: false, checked: true };
      }

      setHandleValidationState("valid", "✓ This handle is available");
      return { available: true, checked: true };
    } catch (error) {
      console.error("Handle validation failed:", error);
      if (!isStillCurrent(rawHandle)) return { available: true, checked: false };
      setHandleValidationState("", "⚠ Could not verify handle right now; will retry on submit.");
      return { available: true, checked: false };
    }
  }

  // Typing: debounced check, so the user gets feedback as they go.
  elements.userLink.addEventListener("input", () => {
    clearTimeout(handleDebounceTimer);
    const rawHandle = elements.userLink.value.trim();

    if (!rawHandle) {
      setHandleValidationState("", "");
      return;
    }

    if (!CONFIG.linkRegex.test(rawHandle)) {
      setHandleValidationState("invalid", "✗ Handle must be 3-15 characters, start with a letter, and use only letters, numbers, or hyphens.");
      return;
    }

    handleDebounceTimer = setTimeout(() => {
      void validateHandleAvailability();
    }, 700);
  });

  // Leaving the field: fire immediately. Cancel any pending debounce so we
  // don't double-check the same value. The spinner appears before any await,
  // so the user sees "Checking…" the instant they tab/click away.
  elements.userLink.addEventListener("blur", () => {
    clearTimeout(handleDebounceTimer);
    const rawHandle = elements.userLink.value.trim();
    if (!rawHandle) return;
    if (!CONFIG.linkRegex.test(rawHandle)) return; // input handler already showed the hint
    void validateHandleAvailability();
  });

  // No debounce, no orphaned Promise. Called exactly once per submit.
  async function checkDuplicates(email, link) {
    try {
      const res = await fetch(
        `${CONFIG.googleScriptUrl}?check_duplicates=true&email=${encodeURIComponent(email)}&link=${encodeURIComponent(link)}`
      );
      const data = await res.json();
      if (data && data.status === "error") {
        console.warn("Dupe check error:", data.message);
        return { emailExists: false, linkExists: false, error: true };
      }
      return data || { emailExists: false, linkExists: false };
    } catch (error) {
      console.error("Duplicate check failed:", error);
      // Let the server-side check inside submitStandardSignup_ have the final say.
      return { emailExists: false, linkExists: false, error: true };
    }
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

  // Shrinks big JPEG/PNG photos before upload (faster on mobile data). Any failure falls back to the original file.
  async function shrinkImage(file, maxSide = 800) {
    try {
      if (!/^image\/(jpeg|png)$/.test(file.type) || file.size < 600 * 1024 || !window.createImageBitmap) return file;
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bmp.width * scale));
      canvas.height = Math.max(1, Math.round(bmp.height * scale));
      canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
      if (bmp.close) bmp.close();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, file.type, 0.85));
      return blob && blob.size < file.size ? new File([blob], file.name, { type: file.type }) : file;
    } catch (error) {
      console.warn("Image resize skipped:", error);
      return file;
    }
  }

  function friendlyError(error) {
    const message = (error && error.message) || "";
    if (error instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(message)) {
      return "We couldn't reach the server. Check your connection and try again.";
    }
    if (/^Upload failed|No secure URL/i.test(message)) {
      return "We couldn't upload your photo. Try a smaller image, or continue without one.";
    }
    if (/^Server returned/i.test(message)) {
      return "The server had a problem. Please try again in a moment.";
    }
    return message || "Something went wrong. Please try again.";
  }

  // ─── FORM SUBMISSION ────────────────────────────────────
  elements.form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = elements.userEmail.value.trim();
    const link = elements.userLink.value.trim();
    const name = elements.userName.value.trim();

    if (!name || !link || !email) {
      toast("Please fill in all required fields.", "error");
      return false;
    }

    if (!CONFIG.linkRegex.test(link)) {
      toast("Your handle must be 3 to 15 characters and start with a letter.", "error");
      elements.userLink.focus();
      return false;
    }

    if (!CONFIG.emailRegex.test(email)) {
      toast("Please enter a valid email address.", "error");
      elements.userEmail.focus();
      return false;
    }

    elements.submitBtn.disabled = true;
    const submitLabel = elements.submitBtn.innerHTML;
    elements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Creating your profile...';

    const status = progress({
      title: "Getting started...",
      text: "Please wait while we create your profile.",
      step: 1,
      steps: 3,
    });

    try {
      // Upload the avatar exactly once.
      let profilePictureUrl = "";
      if (elements.imageInput.files[0]) {
        status.update({
          title: "Uploading your photo...",
          text: "This can take a few seconds on mobile data.",
          step: 1,
        });
        profilePictureUrl = await uploadToCloudinary(await shrinkImage(elements.imageInput.files[0]));
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
        style: document.getElementById("style-value")?.value ||
          document.querySelector(".style-preset.selected")?.dataset.style ||
          "default",
        profilePic: profilePictureUrl,
      };

      status.update({
        title: "Checking availability...",
        text: "Verifying your handle and email.",
        step: 2,
      });

      const { available: handleAvailable } = await validateHandleAvailability();
      if (!handleAvailable) {
        throw new Error("This handle is already taken");
      }

      const { emailExists, linkExists } = await checkDuplicates(
        formData.email,
        formData.link
      );
      if (emailExists || linkExists) {
        throw new Error(
          emailExists ? "Email already registered" : "Link already taken"
        );
      }

      status.update({
        title: "Creating your profile...",
        text: "Almost done.",
        step: 3,
      });

      const response = await fetch(
        `${CONFIG.googleScriptUrl}?${new URLSearchParams(formData)}`
      );

      // Apps Script always returns HTTP 200, so inspect the JSON body.
      const result = await readJson(response);
      if (result.status !== "success") {
        throw new Error(result.message || "Submission failed");
      }

      status.close();
      await dialog({
        icon: "success",
        title: "Your profile is ready!",
        html: `<p class="mt-2 text-sm text-gray-400">Your page is live at</p>
               <p class="mt-1 break-all text-sm font-semibold text-blue-300">my.tccards.tn/@${formData.link}</p>
               <p class="mt-4 text-sm leading-relaxed text-gray-400">View your profile analytics anytime from the editor. We will contact you to confirm your order and delivery. You pay the courier when your tccards arrive.</p>`,
        confirmText: "View my profile",
      });
      window.location.href = `https://my.tccards.tn/@${formData.link}`;

      elements.form.reset();
      elements.profilePicture.src = DEFAULT_AVATAR;
    } catch (error) {
      status.close();
      const message = friendlyError(error);
      await dialog({
        icon: "error",
        title: "We couldn't finish",
        text: message,
        confirmText: "Try again",
      });
      // take the customer straight to the field that needs fixing
      if (/email/i.test(message)) elements.userEmail.focus();
      else if (/handle|link/i.test(message)) elements.userLink.focus();
    } finally {
      elements.submitBtn.disabled = false;
      elements.submitBtn.innerHTML = submitLabel;
    }
  });
});