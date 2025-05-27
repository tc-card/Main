
const items = [
    { id: '1', text: 'Unlimited NFC Cards', icon: 'fa-infinity' },
    { id: '2', text: 'Custom webfolio design', icon: 'fa-paint-brush' },
    { id: '3', text: 'Dedicated account manager', icon: 'fa-user-tie' },
    { id: '4', text: 'Priority support', icon: 'fa-headset' },
    { id: '5', text: 'SLA guarantee', icon: 'fa-shield-alt' },
    { id: '6', text: 'Custom integrations', icon: 'fa-code' },
    { id: '7', text: 'Custom Domain', icon: 'fa-globe' },
    { id: '8', text: 'Custom Forms', icon: 'fa-clipboard-list' },
    { id: '9', text: 'Team management', icon: 'fa-users-cog' }
];

// Keep the same card creation logic but update colors to purple
function createCard(item) {
    const card = document.createElement('div');
    card.className = `
        flex items-center space-x-3 
        rounded-lg border border-gray-800 px-4 py-3
        shadow-md transition-all
        hover:border-purple-500/30 hover:bg-gray-900/20/50
        backdrop-blur
    `;
    card.innerHTML = `
        <i class="fas ${item.icon} text-red-400"></i>
        <p class="text-gray-300">${item.text}</p>
    `;
    return card;
}

const container = document.querySelector('.animate-skew-scroll');
if (container) {
    try {
        container.innerHTML = '';
        // Create infinite loop by tripling items
        const tripleItems = [...items, ...items, ...items];
        tripleItems.forEach(item => {
            container.appendChild(createCard(item));
        });
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="text-red-400">Error loading features</div>';
    }
}
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