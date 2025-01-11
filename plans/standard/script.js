
const items = [
    { id: '1', text: '5 NFC Cards', icon: 'fa-credit-card' },
    { id: '2', text: 'More Customizable webfolio', icon: 'fa-globe' },
    { id: '6', text: 'Unlimited media links', icon: 'fa-link' },
    { id: '3', text: 'Email support', icon: 'fa-envelope' },
    { id: '4', text: 'Custom branding', icon: 'fa-paint-brush' },
    { id: '5', text: 'Remove our watermark', icon: 'fa-check-circle' },
    { id: '6', text: 'Contact Form', icon: 'fa-envelope-open-text' },
    { id: '7', text: 'Secure data sharing', icon: 'fa-lock' },
];

function createCard(item) {
    const card = document.createElement('div');
    card.className = `
        flex items-center space-x-3 
        rounded-lg border border-gray-800 px-4 py-3
        shadow-md transition-all
        hover:border-green-500/30 hover:bg-gray-900/50
        backdrop-blur
    `;
    card.innerHTML = `
        <i class="fas ${item.icon} text-green-400"></i>
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
