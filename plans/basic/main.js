
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

