
import { CONFIG, stylePresets } from './config.js';

document.getElementById('profile-picture').addEventListener('click', function() {
    document.getElementById('image-input').click();
});

document.addEventListener("DOMContentLoaded", () => {
    const elements = {
        profilePicture: document.getElementById('profile-picture'),
        imageInput: document.getElementById('image-input'),
        addLinkBtn: document.getElementById('add-link-btn'),
        dynamicLinks: document.getElementById('dynamic-links'),
        form: document.getElementById('data-fill'),
        bgColor: document.getElementById('bgColor'),
        bgImage: document.getElementById('bgImage')
    };

    // Image Handling 
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
    // Event Listeners
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
            
            // UI feedback
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
            name: document.getElementById('user-name').value,
            tagline: document.getElementById('user-tagline').value,
            socialLinks: Array.from(document.getElementsByName('social-links[]'))
                .map(input => input.value)
                .filter(link => link),
            email: document.querySelector('input[name="email"]').value,
            phone: document.querySelector('input[name="phone"]').value,
            address: document.querySelector('input[name="address"]').value,
            imageUrl: elements.profilePicture.src,
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
                    showConfirmButton: true,
                    confirmButtonText: 'View My Card',
                    showCancelButton: true,
                    cancelButtonText: 'Create Another'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Redirect to view card
                        window.location.href = '/view-card.html';
                    } else {
                        elements.form.reset();
                    }
                });
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again.',
                footer: '<a href="#">Need help?</a>'
            });
        } finally {
            submitBtn.disabled = false;
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const bgImageInput = document.getElementById('bgImage');
    
    if (!bgImageInput) {
        console.error('Background image input not found');
        return;
    }

    bgImageInput.addEventListener('change', (e) => {
        console.log('File input change detected');
        const file = e.target.files[0];
        
        if (!file) {
            console.log('No file selected');
            return;
        }

        console.log('File selected:', file.name);

        const reader = new FileReader();
        
        reader.onload = (event) => {
            console.log('File read successfully');
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

        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to read image file'
            });
        };

        reader.readAsDataURL(file);
    });
});

document.getElementById('profile-picture').addEventListener('click', function() {
    document.getElementById('image-input').click();
});
document.addEventListener("DOMContentLoaded", () => {
    const formType = document.getElementById('form-type');
    const formPreview = document.getElementById('form-preview');
    const mainForm = document.getElementById('data-fill');

    const forms = {
        contact: {
            title: 'Contact Request Form',
            fields: [
                { name: 'contact_name', placeholder: 'Your Name', type: 'text', required: true },
                { name: 'contact_email', placeholder: 'Your Email', type: 'email', required: true },
                { name: 'contact_phone', placeholder: 'Your Phone (Optional)', type: 'tel', required: false },
                { name: 'contact_message', placeholder: 'Your Message/Inquiry', type: 'textarea', required: true },
            ],
        },
        resource: {
            title: 'Free Resource/Download Form',
            fields: [
                { name: 'resource_name', placeholder: 'Your Name', type: 'text', required: true },
                { name: 'resource_email', placeholder: 'Your Email', type: 'email', required: true },
                { name: 'resource_company', placeholder: 'Your Company/Profession (Optional)', type: 'text', required: false },
                { name: 'resource_type', placeholder: 'Select Resource', type: 'select', options: ['Industry Guide', 'Template Pack', 'Checklist', 'Whitepaper'], required: true },
            ],
        },
        quote: {
            title: 'Project Quote/Estimate Form',
            fields: [
                { name: 'quote_name', placeholder: 'Your Name', type: 'text', required: true },
                { name: 'quote_email', placeholder: 'Your Email', type: 'email', required: true },
                { name: 'quote_phone', placeholder: 'Your Phone', type: 'tel', required: true },
                { name: 'quote_details', placeholder: 'Project Details', type: 'textarea', required: true },
                { name: 'quote_budget', placeholder: 'Budget Range', type: 'select', options: ['$1,000 - $5,000', '$5,000 - $10,000', '$10,000+'], required: true },
                { name: 'quote_timeline', placeholder: 'Expected Timeline', type: 'date', required: false },
            ],
        },
        newsletter: {
            title: 'Newsletter/Updates Subscription',
            fields: [
                { name: 'newsletter_email', placeholder: 'Your Email', type: 'email', required: true },
                { name: 'newsletter_name', placeholder: 'Your Name (Optional)', type: 'text', required: false },
                { name: 'newsletter_interests', placeholder: 'Your Interests', type: 'select', options: ['Updates', 'News', 'Promotions', 'All'], required: false },
            ],
        },
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

        formPreview.innerHTML = formHtml;
    }

    formType.addEventListener('change', () => renderForm(formType.value));
    // Initial render
    renderForm('contact');
});