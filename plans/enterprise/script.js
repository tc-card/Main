
document.addEventListener('DOMContentLoaded', function() {
    // Form handling
    const demoForm = document.querySelector('form');
    if (demoForm) {
        demoForm.addEventListener('submit', handleDemoSubmit);
    }

    // Smooth scroll for demo button
    const demoButton = document.querySelector('a[href="#demo"]');
    if (demoButton) {
        demoButton.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('#demo').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    var validateEmail = function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
    // Form submission handler
    async function handleDemoSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const formFields = {
            companyName: form.querySelector('input[type="text"]').value.trim(),
            email: form.querySelector('input[type="email"]').value.trim(),
            cardQuantity: form.querySelector('select').selectedIndex
        };

        // Validation checks
        const validationRules = [
            {
                condition: !formFields.companyName,
                message: 'Company name is required'
            },
            {
                condition: !formFields.email,
                message: 'Email is required'
            },
            {
                condition: !validateEmail(formFields.email),
                message: 'Please enter a valid email address'
            },
            {
                condition: formFields.cardQuantity === 0,
                message: 'Please select the number of cards you need'
            }
        ];

        // Check all validation rules
        for (const rule of validationRules) {
            if (rule.condition) {
                showNotification(rule.message, 'error');
                return false;
            }
        }
        try {
            submitButton.disabled = true;
            submitButton.innerHTML = 'Submitting...';

            // Gather form data
            const formData = {
                companyName: form.querySelector('input[type="text"]').value,
                email: form.querySelector('input[type="email"]').value,
                cardQuantity: form.querySelector('select').value,
                additionalRequirements: form.querySelector('textarea').value
            };

            // Validate form data
            if (!formData.companyName || !formData.email) {
                throw new Error('Please fill in all required fields');
            }

            // Send data to Google Apps Script
            const response = await fetch('https://script.google.com/macros/s/AKfycbyfHCtFf5QE80fSmAZO3-qzTI8nfx2Bnbg36F1aMK89ciakeiBdbQrve8zC4N8HC_g4/exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                mode: 'no-cors' // Important for GAS
            });

            // Since we're using no-cors, we can't read the response directly
            // Assume success if we get here (errors will be caught in the catch block)
            showNotification('Thank you! Our enterprise team will contact you shortly.', 'success');
            form.reset();

        } catch (error) {
            showNotification(error.message || 'Something went wrong. Please try again.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Contact Enterprise Team';
        }
    }
    // Notification helper
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `p-4 rounded-lg ${
            type === 'success' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
        } max-w-md transform transition-all mb-2`;
        
        notification.textContent = message;
        
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
        } else {
            document.body.appendChild(notification); // fallback if container not found
        }

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }


    // Add hover effects for cards
    const cards = document.querySelectorAll('.glass-effect');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('transform', 'scale-105', 'transition-transform');
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('transform', 'scale-105', 'transition-transform');
        });
    });
});