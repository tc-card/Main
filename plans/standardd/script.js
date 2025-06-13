// Constants
const FEATURES = [
    { id: '1', text: '5 NFC Cards', icon: 'fa-credit-card' },
    { id: '2', text: 'Customizable Card', icon: 'paint-brush' },
    { id: '3', text: 'Unlimited media links', icon: 'fa-link' },
    { id: '4', text: 'Email support', icon: 'fa-envelope' },
    { id: '6', text: 'Remove our watermark', icon: 'fa-check-circle' },
    { id: '8', text: 'Analytics Dashboard', icon: 'fa-chart-line' }
];

// Create feature card using document fragment for better performance
const createFeatureCard = (feature) => {
    const template = document.createElement('template');
    template.innerHTML = `
        <div class="flex items-center space-x-3 rounded-lg border border-gray-800 px-4 py-3
                    shadow-md transition-all hover:border-yellow-500/30 hover:bg-gray-900/50
                    backdrop-blur">
            <i class="fas ${feature.icon} text-yellow-400"></i>
            <p class="text-gray-300">${feature.text}</p>
        </div>
    `.trim();
    return template.content.firstElementChild;
};

// Initialize features with error handling and performance optimizations
const initializeFeatures = () => {
    const container = document.querySelector('.animate-skew-scroll');
    if (!container) {
        console.error('Features container not found');
        return;
    }

    try {
        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Create infinite loop by tripling items
        [...FEATURES, ...FEATURES, ...FEATURES].forEach(feature => {
            fragment.appendChild(createFeatureCard(feature));
        });

        // Clear container and append all cards at once
        container.innerHTML = '';
        container.appendChild(fragment);

    } catch (error) {
        console.error('Error initializing features:', error);
        container.innerHTML = `
            <div class="text-red-400 p-4 text-center">
                Error loading features. Please refresh the page.
            </div>
        `;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeFeatures);

// Add resize observer for responsive adjustments
const addResizeObserver = () => {
    const container = document.querySelector('.animate-skew-scroll');
    if (!container) return;

    const observer = new ResizeObserver(entries => {
        entries.forEach(entry => {
            if (entry.contentRect.width < 640) { // Mobile breakpoint
                container.style.gridTemplateColumns = '1fr';
            } else {
                container.style.gridTemplateColumns = '1fr 1fr';
            }
        });
    });

    observer.observe(container);
};

// Initialize resize observer
document.addEventListener('DOMContentLoaded', addResizeObserver);