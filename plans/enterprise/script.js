
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

    // Form submission handler
    async function handleDemoSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        
        try {
            submitButton.disabled = true;
            submitButton.innerHTML = 'Submitting...';

            // Gather form data
            const formData = {
                companyName: form.querySelector('input[type="text"]').value,
                teamSize: form.querySelector('select').value,
                email: form.querySelector('input[type="email"]').value,
                message: form.querySelector('textarea').value
            };

            // Validate form data
            if (!formData.companyName || !formData.email || !formData.message) {
                throw new Error('Please fill in all required fields');
            }

            // Here you would typically send the data to your server
            // For now, we'll just simulate a successful submission
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Show success message
            showNotification('Thank you! Our enterprise team will contact you shortly.', 'success');
            form.reset();

        } catch (error) {
            showNotification(error.message || 'Something went wrong. Please try again.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit Request';
        }
    }

    // Notification helper
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white max-w-md z-50 transform transition-all`;
        
        notification.innerHTML = message;
        document.body.appendChild(notification);

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