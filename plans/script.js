const starterPlans = [
  {
    tier: "Free",
    price: "0 TND",
    description: "Perfect for individuals starting their digital journey.",
    // badge: "Free",
    features: [
      "Pre-designed webfolio",
      "3 media links",
      "Mobile-friendly design",
      "Share via Custom Link",
      "Contact Button"
    ],
    limitations: [
      "No NFC Card",
      "30-Day Expiry",
      "TC Watermark",
      "Simple Designs",
      "Fixed Background Only"
    ],
    colorClasses: "bg-gray-900 ring-purple-400 text-purple-400",
    link: "/plans/free/",
    trial: true
  },
  {
    tier: "Basic",
    price: "49 TND",
    description: "Perfect for individuals and small businesses starting with NFC technology.",
    features: [
      "1 NFC Card",
      "Pre-designed webfolio",
      "6 media links",
      "Email support",
      "QR code sharing",
      "Editing dashboard",
      "Contact Button"
    ],
    limitations: [
      "Customizable Card",
      "No Analytics Dashboard",
    ],
    colorClasses: "bg-gray-900 ring-green-400 text-green-400",
    link: "/plans/basic/",
  }
];

const advancedPlans = [
  {
    tier: "Standard",
    price: "80 TND",
    description: "Essential features to enhance your business presence.",
    features: [
      "5 NFC Cards",
      "Customizable Card",
      "Unlimited media links",
      "Email support",
      "Custom branding",
      "Remove our watermark",
      "Analytics Dashboard"
    ],
    colorClasses: "bg-gray-900 ring-yellow-400 text-yellow-400",
    link: "/plans/standard/",
  },
  {
    tier: "Enterprise",
    price: "Custom Pricing",
    description: "Tailored solutions for enterprises with advanced needs.",
    features: [
      "Unlimited NFC Cards",
      "Custom webfolio design",
      "Dedicated account manager",
      "Priority support",
      "SLA guarantee",
      "Custom integrations",
      "Custom Domain",
      "Custom Forms"
    ],
    colorClasses: "bg-gray-900 ring-red-400 text-red-400",
    link: "/plans/enterprise/",
  }
];

// Update the color mapping
const colorMapping = {
  Free: {
    text: "text-purple-400",
    ring: "ring-purple-400",
    bg: "bg-blue-800",
  },
  Basic: {
    text: "text-green-400",
    ring: "ring-green-400",
    bg: "bg-green-400",
    ttext: "hover:text-black"
  },
  Standard: {
    text: "text-yellow-400",
    ring: "ring-yellow-400",
    bg: "bg-yellow-400",
    ttext: "hover:text-black"
  },
  Custom: {
    text: "text-blue-400",
    ring: "ring-blue-400",
    bg: "bg-gray-800",
  },
  Enterprise: {
    text: "text-red-400",
    ring: "ring-red-400",
    bg: "bg-gray-800",
  }
};

function generatePricingCard(content) {
  const colors = colorMapping[content.tier];
  const isFree = content.tier === "Free";
  const isStandard = content.tier === "Standard";
  const isEnterprise = content.tier === "Enterprise";
  const isDiscounted = content.tier === "Basic" || content.tier === "Standard";
  
  const specialStyles = isFree ? 'border-dashed' : '';
  let tagElement = '';
  
  if (isFree) {
    tagElement = `
      <span class="absolute -top-3 left-4 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-bold text-blue-400 ring-2">
         Start Free
      </span>
    `;
  } else if (isDiscounted) {
    tagElement = `
      <span class="absolute -top-3 right-4 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-bold text-gray-100 ring-1 ${colors.ring}">
          24% OFF
      </span>
    `;
  }


  const limitationsSection = content.limitations ? `
      <div class="mt-6 pt-4 border-t border-gray-700">
          <p class="text-sm text-gray-400 mb-2">Limitations:</p>
          <ul class="space-y-2 text-sm text-gray-500">
              ${content.limitations.map(limit => `
                  <li class="flex items-center">
                      <svg class="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
                      </svg>
                      ${limit}
                  </li>
              `).join('')}
          </ul>
      </div>
  ` : '';

  let buttonHtml = '';
  if (isFree) {
    buttonHtml = `<a href="${content.link}" class="mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold ${colors.text} ring-1 ${colors.ring} hover:${colors.bg} hover:text-gray-100 transition-all duration-300">
      Start Free
    </a>`;
  } else if (isStandard) {
    buttonHtml = `<a disabled class="mt-8 cursor-not-allowed opacity-60 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-gray-500 ring-1 ring-gray-500 cursor-pointer ${colors.text} hover:${colors.bg} ${colors.ttext} transition-all duration-300">
      Coming Soon!
    </a>`;
  } else {
    buttonHtml = `<a href="${content.link}" class="mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-gray-500 ring-1 ring-gray-500 cursor-pointer ${colors.text} hover:${colors.bg} ${colors.ttext} transition-all duration-300">
      Get ${content.tier} Plan
    </a>`;
  }

  return `
    <div style="min-width:300px" class="hover:scale-105 transform transition-all duration-300 relative pricing-card ${content.tier.toLowerCase()} rounded-3xl p-4 ring-1 ${colors.ring} ${specialStyles}">
        ${tagElement}
          <h3 class="text-base font-semibold ${colors.text}">${content.tier}</h3>
          <p class="mt-4 flex items-baseline gap-x-2">
              <span class="text-5xl font-semibold ${colors.text}">${content.price}</span>
          </p>
          <p class="mt-6 text-base text-gray-300">${content.description}</p>
          <ul class="mt-8 space-y-3 text-sm text-gray-300">
              ${content.features.map(feature => `
                  <li class="flex gap-x-3">
                      <svg class="h-6 w-5 flex-shrink-0 ${colors.text}" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                      </svg>
                      ${feature}
                  </li>
              `).join('')}
          </ul>
          ${limitationsSection}
        ${buttonHtml}
      </div>
  `;
}

function renderPricingCards() {
  const starterContainer = document.getElementById('starter-plans');
  const advancedContainer = document.getElementById('advanced-plans');

  if (!starterContainer || !advancedContainer) {
      console.error('Container elements not found');
      return;
  }

  // Render starter plans
  starterContainer.innerHTML = starterPlans
      .map(plan => generatePricingCard(plan))
      .join('');

  // Render advanced plans
  advancedContainer.innerHTML = advancedPlans
      .map(plan => generatePricingCard(plan))
      .join('');
};
renderPricingCards();
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing pricing cards...');
  
});


// smooth landing animation on page loading/opening
const fadeInElements = document.querySelectorAll('.fade-in');
const FADE_IN_DURATION = '0.5s';
const FADE_OUT_DURATION = '0.3s';
const TRANSITION_TIMING = 'ease-in-out';
const NAVIGATION_DELAY = 500;

// Initial setup - hide elements before animation
fadeInElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transition = `opacity ${FADE_IN_DURATION} ${TRANSITION_TIMING}`;
});

// Fade in elements when DOM is ready 
document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
        fadeInElements.forEach(element => {
            element.style.opacity = '1';
        });
    });
});

// Handle link transitions
document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;

    // Check if link is external or internal route
    const href = link.getAttribute('href');
    if (!href.startsWith('http') && !href.startsWith('/')) return;

    e.preventDefault();

    // Fade out smoothly
    fadeInElements.forEach(element => {
        element.style.transition = `opacity ${FADE_OUT_DURATION} ${TRANSITION_TIMING}`;
        element.style.opacity = '0';
    });

    // Navigate after fade completes
    setTimeout(() => {
        window.location.href = href;
    }, NAVIGATION_DELAY);
});
