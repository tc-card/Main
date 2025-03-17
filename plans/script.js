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
      "30-Day Expiry",
      "TC Watermark",
      "Simple Designs",
      "Ads on webfolio",
      "Fixed Background Only"
    ],
    colorClasses: "bg-gray-900 ring-purple-400 text-purple-400",
    link: "/free/",
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
      "Contact Form",
      "Contact Button"
    ],
    limitations: [
      "TC Watermark",
      "Limited Templates",
      "Basic Customization"
    ],
    colorClasses: "bg-gray-900 ring-green-400 text-green-400",
    link: "/basic/",
  }
];

const advancedPlans = [
  {
    tier: "Standard",
    price: "100 TND",
    description: "Essential features to enhance your business presence.",
    features: [
      "5 NFC Cards",
      "More customizable webfolio",
      "Unlimited media links",
      "Email support",
      "Custom branding",
      "Remove our watermark",
      "Smart Form"
    ],
    colorClasses: "bg-gray-900 ring-yellow-400 text-yellow-400",
    link: "/standard/",
  },
  {
    tier: "Custom",
    price: "379+ TND",
    description: "Tailored solutions for professionals and growing businesses.",
    features: [
      "10+ NFC Cards",
      "Fully customizable webfolio",
      "Priority support",
      "SLA guarantee",
      "Custom branding",
      "Custom Domain",
      "Integration with CRM tools",
      "Advanced Contact Form",
      "Remove our watermark"
    ],
    colorClasses: "bg-gray-900 ring-blue-400 text-blue-400",
    link: "/professional/",
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
    link: "/enterprise/",
  }
];

// Update the color mapping
const colorMapping = {
  Free: {
    text: "text-purple-400",
    ring: "ring-purple-400",
    bg: "bg-green-800",
  },
  Basic: {
    text: "text-green-400",
    ring: "ring-green-400",
    bg: "bg-red-400",
  },
  Standard: {
    text: "text-yellow-400",
    ring: "ring-yellow-400",
    bg: "bg-red-400",
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
  const isDiscounted = content.tier === "Basic" || content.tier === "Standard";
  
  const specialStyles = isFree ? 'border-dashed' : '';
  let tagElement = '';
  
  if (isFree) {
    tagElement = `
      <span class="absolute -top-3 left-4 rounded-full ${colors.bg} px-3 py-1.5 text-xs font-bold text-yellow-400">
         Start Free
      </span>
    `;
  } else if (isDiscounted) {
    tagElement = `
      <span class="absolute -top-3 right-4 rounded-full ${colors.bg} px-3 py-1.5 text-xs font-bold text-gray-100 ring-1 ${colors.ring}">
          60% OFF
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
          <a href="${content.link}" 
             class="mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold ${colors.text} ring-1 ${colors.ring} hover:${colors.bg} hover:text-gray-100 transition-all duration-300">
              ${isFree ? 'Start Free' : 'Get Started'}
          </a>
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