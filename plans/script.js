const cardContents = [
  {
    tier: "Basic",
    price: "79 TND",
    description:
      "Perfect for individuals and small businesses starting with NFC technology.",
    features: [
      // Core Features
      "1 NFC Card",
      "Pre-designed webfolio",
      "5 media links",
      // Support
      "Email support",
      // Sharing Features
      "QR code sharing",
      "Contact Button",
    ],
    colorClasses: "bg-gray-900 ring-green-400 text-green-400",
    link: "basic/",
  },
  {
    tier: "Standard",
    price: "159 TND",
    description: "Essential features to enhance your business presence.",
    features: [
      // Core Features
      "5 NFC Cards",
      "More customizable webfolio",
      "Unlimited media links",
      // Support
      "Email support",
      // Branding
      "Custom branding",
      "Remove our watermark",
      // Enhanced Features
      "Contact Form",
    ],
    colorClasses: "bg-gray-900 ring-yellow-400 text-yellow-400",
    link: "standard/",
  },
  {
    tier: "Professional",
    price: "399 TND",
    description: "Advanced solutions for professionals and growing businesses.",
    features: [
      // Core Features
      "10 NFC Cards",
      "Fully customizable webfolio",
      // Support & SLA
      "Priority support",
      "SLA guarantee",
      // Branding & Domain
      "Custom branding",
      "Custom Domain",
      // Advanced Features
      "Integration with CRM tools",
      "Advanced Contact Form",
      "Remove our watermark",
    ],
    colorClasses: "bg-gray-900 ring-blue-400 text-blue-400",
    link: "professional/",
  },
  {
    tier: "Enterprise",
    price: "Custom Pricing",
    description: "Tailored solutions for enterprises with advanced needs.",
    features: [
      // Core Features
      "Unlimited NFC Cards",
      "Custom webfolio design",
      // Support & Management
      "Dedicated account manager",
      "Priority support",
      "SLA guarantee",
      // Advanced Features
      "Custom integrations",
      "Custom Domain",
      "Custom Forms",
    ],
    colorClasses: "bg-gray-900 ring-red-400 text-red-400",
    link: "enterprise/",
  },
];
const colorMapping = {
  Basic: {
    text: "text-green-400",
    ring: "ring-green-400",
    bg: "bg-gray-800",
  },
  Standard: {
    text: "text-yellow-400",
    ring: "ring-yellow-400",
    bg: "bg-gray-800",
  },
  Professional: {
    text: "text-blue-400",
    ring: "ring-blue-400",
    bg: "bg-gray-800",
  },
  Enterprise: {
    text: "text-red-400",
    ring: "ring-red-400",
    bg: "bg-gray-800",
  },
};

function generatePricingCard(content) {
  const colors = colorMapping[content.tier];
  const popularTag = content.tier === "Standard" ? `
    <span class="absolute -top-3 right-4 rounded-full bg-yellow-500 px-3 py-1.5 text-xs font-bold text-black">
      Most Popular
    </span>
  ` : '';

  return `
    <div class="hover:scale-105 transform transition-all duration-300 relative rounded-3xl bg-gray-900 p-8 ring-1 ${colors.ring}">
    ${popularTag}
    <h3 class="text-base font-semibold ${colors.text}">${content.tier}</h3>
      <p class="mt-4 flex items-baseline gap-x-2">
        <span class="text-5xl font-semibold ${colors.text}">${content.price}</span>
      </p>
      <p class="mt-6 text-base text-gray-300">${content.description}</p>
      <ul class="mt-8 space-y-3 text-sm text-gray-300">
        ${content.features.map((feature) => `
          <li class="flex gap-x-3">
            <svg class="h-6 w-5 ${colors.text}" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
            </svg>
            ${feature}
          </li>
        `).join("")}
      </ul>
      <a href="${content.link}" class="mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold ${colors.text} ring-1 ${colors.ring} hover:${colors.bg} hover:text-gray-100">
        Get Started
      </a>
    </div>
  `;
}

function renderPricingCards() {
  const container = document.getElementById('pricing-container');
  const cardsHTML = cardContents.map(content => generatePricingCard(content)).join('');
  container.innerHTML = cardsHTML;
}

// Initialize
renderPricingCards();

// Populate all lists
populateFeatureList("basic-list", cardContents[0].features, "text-green-400");
populateFeatureList("standard-list", cardContents[1].features, "text-yellow-400");
populateFeatureList("professional-list", cardContents[2].features, "text-blue-400");
populateFeatureList("enterprise-list", cardContents[3].features, "text-red-400");
