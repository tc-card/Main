import { CONFIG, stylePresets } from './config.js';

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all elements
  const elements = {
    profilePicture: document.getElementById('profile-picture'),
    imageInput: document.getElementById('image-input'),
    addLinkBtn: document.getElementById('add-link-btn'),
    dynamicLinks: document.getElementById('dynamic-links'),
    form: document.getElementById('data-fill'),
    bgImage: document.getElementById('bgImage'),
    formType: document.getElementById('form-type'),
    formPreview: document.getElementById('form-preview'),
    submitBtn: document.getElementById('saveContactBtn')
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
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload a valid image file (JPEG, PNG, GIF, WEBP)'
      });
      return;
    }
    if (file.size > CONFIG.maxFileSize) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'File size must be less than 5MB'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      targetElement.src = e.target.result;
    };
    reader.onerror = () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to read image file'
      });
    };
    reader.readAsDataURL(file);
  }

  // Profile picture handlers
  elements.profilePicture.addEventListener('click', () => elements.imageInput.click());
  elements.imageInput.addEventListener('change', (e) => {
    handleImageUpload(e.target.files[0], elements.profilePicture);
  });

  // Background image handler
  elements.bgImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      document.body.style.backgroundImage = `url('${event.target.result}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';

      Swal.fire({
        icon: 'success',
        title: 'Background Updated',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
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

  elements.addLinkBtn.addEventListener('click', () => {
    const ul = elements.dynamicLinks.querySelector('ul');
    ul.insertAdjacentHTML('beforeend', createSocialLink());
    const removeBtn = ul.lastElementChild.querySelector('.remove-link-btn');
    removeBtn.addEventListener('click', function () {
      this.closest('li').remove();
    });
  });

  // Style Management
  document.querySelectorAll('.style-preset').forEach(button => {
    button.addEventListener('click', () => {
      const style = stylePresets[button.dataset.style];
      document.body.style.background = style.background;
      document.body.style.backgroundSize = 'cover';

      document.querySelectorAll('.style-preset').forEach(btn =>
        btn.classList.remove('selected'));
      button.classList.add('selected');

      Swal.fire({
        icon: 'success',
        title: 'Style Updated',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
      });
    });
  });

  // Form Type Management
  const forms = {
    contact: {
      title: 'Contact Request Form',
      fields: [
        { name: 'contact_name', placeholder: 'Your Name', type: 'text' },
        { name: 'contact_email', placeholder: 'Your Email', type: 'email' },
        { name: 'contact_phone', placeholder: 'Your Phone (Optional)', type: 'tel', required: false },
        { name: 'contact_message', placeholder: 'Your Message/Inquiry', type: 'textarea' },
      ]
    },
    resource: {
      title: 'Free Resource/Download Form',
      fields: [
        { name: 'resource_name', placeholder: 'Your Name', type: 'text' },
        { name: 'resource_email', placeholder: 'Your Email', type: 'email' },
        { name: 'resource_company', placeholder: 'Your Company/Profession (Optional)', type: 'text', required: false },
        { name: 'resource_type', placeholder: 'Select Resource', type: 'select', options: ['Industry Guide', 'Template Pack', 'Checklist', 'Whitepaper'] },
      ]
    },
    quote: {
      title: 'Project Quote/Estimate Form',
      fields: [
        { name: 'quote_name', placeholder: 'Your Name', type: 'text' },
        { name: 'quote_email', placeholder: 'Your Email', type: 'email' },
        { name: 'quote_phone', placeholder: 'Your Phone', type: 'tel' },
        { name: 'quote_details', placeholder: 'Project Details', type: 'textarea' },
        { name: 'quote_budget', placeholder: 'Budget Range', type: 'select', options: ['$1,000 - $5,000', '$5,000 - $10,000', '$10,000+'] },
        { name: 'quote_timeline', placeholder: 'Expected Timeline', type: 'date', required: false }
      ]
    },
    newsletter: {
      title: 'Newsletter/Updates Subscription',
      fields: [
        { name: 'newsletter_email', placeholder: 'Your Email', type: 'email' },
        { name: 'newsletter_name', placeholder: 'Your Name (Optional)', type: 'text', required: false },
        { name: 'newsletter_interests', placeholder: 'Your Interests', type: 'select', options: ['Updates', 'News', 'Promotions', 'All'], required: false },
      ]
    }
  };

  function renderForm(type) {
    const form = forms[type];
    let formHtml = `<h3 class='text-xl font-semibold mb-4 text-white'>${form.title}</h3>`;

    form.fields.forEach(field => {
      if (field.type === 'textarea') {
        formHtml += `
          <div class='mb-4'>
            <textarea 
              name='${field.name}' 
              placeholder='${field.placeholder}' 
              class='w-full p-3 bg-transparent text-white border border-white/50 rounded-lg focus:outline-none focus:border-white' 
              ${field.required ? 'required' : ''}>
            </textarea>
          </div>`;
      } else if (field.type === 'select') {
        formHtml += `
          <div class='mb-4'>
            <select 
              name='${field.name}' 
              class='w-full p-3 bg-transparent text-white border border-white/50 rounded-lg focus:outline-none focus:border-white'
              ${field.required ? 'required' : ''}>
              <option value="" disabled selected>${field.placeholder}</option>
              ${field.options.map(option => `<option value="${option}">${option}</option>`).join('')}
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
              ${field.required ? 'required' : ''} />
          </div>`;
      }
    });

    elements.formPreview.innerHTML = formHtml;
  }

  elements.formType.addEventListener('change', () => renderForm(elements.formType.value));
  renderForm('contact'); // Initial render

  // Form Submission
  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    elements.submitBtn.disabled = true;
    async function uploadToCloudinary(file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "preset"); // Ensure the preset is correct
  
      try {
          const response = await fetch("https://api.cloudinary.com/v1_1/dufg7fm4stt/image/upload", {
              method: "POST",
              body: formData
          });
  
          if (!response.ok) {
              throw new Error(`Cloudinary upload failed: ${response.statusText}`);
          }
  
          const data = await response.json();
          if (!data.secure_url) {
              throw new Error('Cloudinary response did not return a secure URL');
          }
  
          return data.secure_url; // Returns the image URL
      } catch (error) {
          console.error("Image upload error:", error);
          return ''; // Return empty string on failure
      }
    }
    try {
        const userName = document.getElementById('user-name').value.trim();
        const userEmail = document.querySelector('input[name="email"]').value.trim();

        if (!userName || !userEmail) {
            throw new Error('Name and email are required');
        }

        // Upload images to Cloudinary
        const profilePictureFile = elements.imageInput.files[0];
        const backgroundImageFile = elements.bgImage.files[0];

        let profilePictureUrl = '';
        let backgroundImageUrl = '';

        if (profilePictureFile) {
            profilePictureUrl = await uploadToCloudinary(profilePictureFile);
        }
        if (backgroundImageFile) {
            backgroundImageUrl = await uploadToCloudinary(backgroundImageFile);
        }
        // Check the URLs
        console.log('Profile Image URL:', profilePictureUrl);
        console.log('Background Image URL:', backgroundImageUrl);

        // Prepare form data
        const data = {
            name: userName,
            email: userEmail,
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

        Swal.fire({
            title: 'Creating Your Digital Card',
            html: 'Please wait...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        // Submit form data
        const queryParams = new URLSearchParams(data).toString();
        const url = `${CONFIG.googleScriptUrl}?${queryParams}`;

        const response = await fetch(url, { method: 'GET' });
        const result = await response.json();

        if (!response.ok || result.status !== 'success') {
            throw new Error(result.message || 'Submission failed');
        }

        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your digital card has been created successfully!',
            confirmButtonText: 'View My Card',
            showCancelButton: true,
            cancelButtonText: 'Create Another'
        }).then((res) => {
            if (res.isConfirmed) {
                window.location.href = `view-card.html?id=${result.cardId}`;
            } else {
                elements.form.reset();
                elements.profilePicture.src = CONFIG.defaultProfileImage;
                document.querySelectorAll('.style-preset').forEach(btn => btn.classList.remove('selected'));
                document.body.style.background = stylePresets.minimal.background;
            }
        });
    } catch (error) {
        console.error('Submission error:', error);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your digital card has been created successfully!',
          confirmButtonText: 'View My Card',
          showCancelButton: true,
          cancelButtonText: 'Create Another',
          footer: '<a href="mailto:support@totalconnect.com">Contact Support</a>'
        }).then((res) => {
            if (res.isConfirmed) {
                window.location.href = `view-card.html?id=${result.cardId}`;
            } else {
                elements.form.reset();
                elements.profilePicture.src = CONFIG.defaultProfileImage;
                document.querySelectorAll('.style-preset').forEach(btn => btn.classList.remove('selected'));
                document.body.style.background = stylePresets.minimal.background;
            }
        });
    } finally {
        elements.submitBtn.disabled = false;
        // clear form
        elements.form.reset();
        elements.profilePicture.src = CONFIG.defaultProfileImage;
    }
  });
});