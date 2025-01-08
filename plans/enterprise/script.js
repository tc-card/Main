
const items = [
    { id: '1', text: 'Unlimited NFC Cards', icon: 'fa-infinity' },
    { id: '2', text: 'Custom portfolio design', icon: 'fa-paint-brush' },
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
        <i class="fas ${item.icon} text-purple-400"></i>
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
