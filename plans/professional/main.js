import { CONFIG, stylePresets } from './config.js';

document.getElementById('profile-picture').addEventListener('click', function() {
    document.getElementById('image-input').click();
});
document.addEventListener('DOMContentLoaded', () => {
    // Domain select and label update logic
    const domainSelect = document.getElementById('domainSelect');
    const domainLabel = document.getElementById('domainLabel');

    const updateDomainLabel = () => {
        const labelText = domainSelect.value === 'have' 
            ? 'Enter your existing domain name:'
            : 'Enter your desired domain name:';
        domainLabel.textContent = labelText;
    };

    domainSelect.addEventListener('change', updateDomainLabel);
    updateDomainLabel();

    // Toggle settings visibility based on checkboxes
    const features = ['schedule', 'feedback', 'messaging', 'discounts', 'testimonials'];

    features.forEach(feature => {
        const checkbox = document.getElementById(`${feature}-toggle`);
        const settings = document.getElementById(`${feature}-settings`);
        
        if (checkbox && settings) {
            checkbox.addEventListener('change', () => {
                settings.classList.toggle('hidden', !checkbox.checked);
            });
        }
    });

    // Toggle business days selection
    document.querySelectorAll('button[name="business_days[]"]').forEach(button => {
        button.addEventListener('click', function () {
            this.classList.toggle('bg-blue-600');
            this.classList.toggle('bg-gray-700');
        });
    });

    // Image Handling
    const elements = {
        profilePicture: document.getElementById('profile-picture'),
        imageInput: document.getElementById('image-input'),
        addLinkBtn: document.getElementById('add-link-btn'),
        dynamicLinks: document.getElementById('dynamic-links'),
        form: document.getElementById('data-fill'),
        bgColor: document.getElementById('bgColor'),
        bgImage: document.getElementById('bgImage'),
        crmInput: document.getElementById('crm-input'),
        domainInput: document.getElementById('domain-input'),
        userNameInput: document.getElementById('user-name'),
        userTaglineInput: document.getElementById('user-tagline'),
        emailInput: document.querySelector('input[name="email"]'),
        phoneInput: document.querySelector('input[name="phone"]'),
        addressInput: document.querySelector('input[name="address"]')
    };

    function handleImageUpload(file, targetElement) {
        if (!CONFIG.allowedTypes.includes(file.type)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid File Type',
                text: 'Please upload a valid image file (JPEG, PNG, GIF)'
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
        reader.readAsDataURL(file);
    }

    elements.imageInput.addEventListener('change', (event) => {
        handleImageUpload(event.target.files[0], elements.profilePicture);
    });

    
    const dynamicLinks = document.getElementById('dynamic-links');
    const addLinkBtn = document.getElementById('add-link-btn');

    // Function to create the HTML for a new social link
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

    // Function to add remove button functionality
    function addRemoveButtonListener(button) {
        button.addEventListener('click', function() {
            this.closest('li').remove();
        });
    }

    // Add button click handler
    addLinkBtn.addEventListener('click', () => {
        const ul = dynamicLinks.querySelector('ul');
        ul.insertAdjacentHTML('beforeend', createSocialLink());
        
        // Add listener to the new remove button
        const newLi = ul.lastElementChild;
        const removeButton = newLi.querySelector('.remove-link-btn');
        addRemoveButtonListener(removeButton);
    });

    // Add listeners to any existing remove buttons
    document.querySelectorAll('.remove-link-btn').forEach(button => {
        addRemoveButtonListener(button);
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

    elements.bgColor.addEventListener('input', (e) => {
        document.body.style.background = e.target.value;
    });

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

    // Form Submission
    elements.form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        let timerInterval;
        Swal.fire({
            title: 'Submitting...',
            html: 'Processing your information',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        });

        const formData = {
            crmFeatures: features.filter(feature => {
                const checkbox = document.getElementById(`${feature}-toggle`);
                return checkbox.checked;
            }),
            businessDays: Array.from(document.querySelectorAll('button[name="business_days[]"].bg-blue-600'))
                .map(button => button.value),
            workSchedule: {
                start: elements.form.querySelector('input[name="business_hours_start"]').value,
                end: elements.form.querySelector('input[name="business_hours_end"]').value
            },
            feedbackSettings: {
                starRating: elements.form.querySelector('input[name="feedback_star_rating"]').checked,
                comments: elements.form.querySelector('input[name="feedback_comments"]').checked,
                notifications: elements.form.querySelector('input[name="feedback_notifications"]').checked
            },
            messagingSettings: {
                requiredFields: Array.from(document.querySelectorAll('button[name="required_fields[]"].bg-blue-600'))
                    .map(button => button.value),
                messageTemplate: elements.form.querySelector('textarea[name="message_template"]').value
            },
            discountSettings: {
                title: elements.form.querySelector('input[name="discount_title"]').value,
                code: elements.form.querySelector('input[name="discount_code"]').value,
                startDate: elements.form.querySelector('input[name="discount_start_date"]').value,
                endDate: elements.form.querySelector('input[name="discount_end_date"]').value
            },
            testimonialSettings: {
                showPhotos: elements.form.querySelector('input[name="testimonial_show_photos"]').checked,
                showRatings: elements.form.querySelector('input[name="testimonial_show_ratings"]').checked,
                layout: elements.form.querySelector('select[name="testimonial_layout"]').value
            },
            name: elements.userNameInput.value,
            tagline: elements.userTaglineInput.value,
            companyLinks: Array.from(document.getElementsByName('social-links[]'))
                .map(input => input.value)
                .filter(link => link),
            email: elements.emailInput.value,
            phone: elements.phoneInput.value,
            address: elements.addressInput.value,
            crm: elements.crmInput ? elements.crmInput.value : '',
            domain: elements.domainInput ? elements.domainInput.value : '',
            imageUrl: elements.profilePicture.src, // Image URL from uploaded profile picture
            style: {
                background: document.body.style.background,
                accent: getComputedStyle(document.documentElement)
                    .getPropertyValue('--accent-color')
            }
        };

        try {
            const response = await fetch(CONFIG.googleScriptUrl, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Your digital card has been created successfully!',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                throw new Error('Failed to submit form');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.message,
                showConfirmButton: false,
                timer: 1500
            });
        } finally {
            submitBtn.disabled = false;
        }
    });
});
