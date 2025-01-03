
import { CONFIG, stylePresets } from './config.js';

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

    // Event Listeners
    elements.profilePicture.addEventListener('click', () => elements.imageInput.click());
    elements.imageInput.addEventListener('change', (event) => {
        handleImageUpload(event.target.files[0], elements.profilePicture);
    });

    elements.addLinkBtn.addEventListener('click', () => {
        const ul = elements.dynamicLinks.querySelector('ul');
        ul.insertAdjacentHTML('beforeend', createSocialLink());
        
        const removeButton = ul.querySelector('li:last-child .remove-link-btn');
        removeButton.addEventListener('click', function() {
            Swal.fire({
                title: 'Remove Link?',
                text: 'Are you sure you want to remove this link?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, remove it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    removeButton.parentElement.remove();
                }
            });
        });
    });

    // Style Management
    document.querySelectorAll('.style-preset').forEach(button => {
        button.addEventListener('click', () => {
            const style = stylePresets[button.dataset.style];
            document.body.style.background = style.background;
            document.body.style.backgroundSize = 'cover';
            
            // Check if bright style and update text/border colors
            if (button.dataset.style.includes('bright')) {
                document.body.style.color = '#000000';
                document.querySelectorAll('.border, .border-2').forEach(el => {
                    el.style.borderColor = '#000000';
                });
                document.querySelectorAll('input, textarea').forEach(input => {
                    input.style.color = '#000000';
                    input.style.setProperty('::placeholder', '#000000', 'important');
                });
            } else {
                document.body.style.color = '#ffffff';
                document.querySelectorAll('.border, .border-2').forEach(el => {
                    el.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                });
                document.querySelectorAll('input, textarea').forEach(input => {
                    input.style.color = '#ffffff';
                    input.style.setProperty('::placeholder', '#ffffff', 'important');
                });
            }
            
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