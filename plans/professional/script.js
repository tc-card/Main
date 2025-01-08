
const items = [
    { id: '1', text: '10 NFC Cards', icon: 'fa-credit-card' },
    { id: '2', text: 'Fully customizable portfolio', icon: 'fa-palette' },
    { id: '3', text: 'Priority support', icon: 'fa-headset' },
    { id: '4', text: 'SLA guarantee', icon: 'fa-shield-alt' },
    { id: '5', text: 'Custom branding', icon: 'fa-paint-brush' },
    { id: '6', text: 'Custom Domain', icon: 'fa-globe' },
    { id: '7', text: 'CRM Integration', icon: 'fa-plug' },
    { id: '8', text: 'Advanced Contact Form', icon: 'fa-envelope-open-text' },
    { id: '9', text: 'Remove watermark', icon: 'fa-check-circle' }
];

// Keep the same card creation logic
function createCard(item) {
    const card = document.createElement('div');
    card.className = `
        flex items-center space-x-3 
        rounded-lg border border-gray-800 px-4 py-3
        shadow-md transition-all
        hover:border-blue-500/30 hover:bg-gray-900/50
        backdrop-blur
    `;
    card.innerHTML = `
        <i class="fas ${item.icon} text-blue-400"></i>
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

