//🏗️under construction🚧
// const mobileMenu = document.getElementById('mobile-menu');
// const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
// const mobileMenuClose = document.getElementById('mobile-menu-close');

// mobileMenuToggle.addEventListener('click', () => {
//     mobileMenu.classList.remove('hidden');
// });

// mobileMenuClose.addEventListener('click', () => {
//     mobileMenu.classList.add('hidden');
// });
 $(document).ready(function () {
          // Initialize the carousel
          $('.carousel').slick({
              dots: true,
              infinite: true,
              speed: 500,
              slidesToShow: 3, // Show 3 images by default (for large screens)
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 2200,
              pauseOnHover: true,
              arrows: true,
              responsive: [
                  {
                      breakpoint: 768, // Adjust for screens smaller than 768px
                      settings: {
                          slidesToShow: 1, // Show 1 image per slide on smaller screens
                          slidesToScroll: 1,
                          autoplaySpeed: 2200,
                          pauseOnHover: true,
                      }
                  }
              ]
          });
      });

document.querySelector('#learn-more').addEventListener('click', WhyNFC);
function WhyNFC() {
  Swal.fire({
    icon: "info",
    title: "What is NFC?",
    html: `<div style='text-align:left'>
                NFC is a wireless communication technology that enables data exchange between two devices in proximity to each other.
            <br><hr><br>
                It is based on radio frequency identification (RFID) technology and allows different devices to send and receive data over short distances by creating a magnetic field that induces an electric current in a nearby NFC-enabled device.<br><hr><br>
                NFC technology is widely used in various industries and applications, such as contactless payments, public transportation, access control systems, and smart home automation.
            <br><hr><br>
                NFC-enabled devices include smartphones, tablets, contactless payment cards, and other devices with built-in NFC chips.
            <br><hr><br>
                There are many advantages, including its ease of use, speed, and convenience. Since it requires proximity between devices, it is considered to be a secure form of communication.
            <br><hr><br>
                NFC is also very versatile and can be used in a wide range of applications, making it a popular choice for developers and businesses.
           </div>
        `,
    confirmButtonText: "Got It! \\_/",
    background:"#1f1f1f",
    color:"#1dfb"
  });
}
const cardContents = [
  {
    tier: "Basic",
    price: "79 TND",
    description: "Perfect for individuals and small businesses starting with NFC technology.",
    features: [
      // Core Features
      "1 NFC Card",
      "Pre-designed web portfolio",
      // Support
      "Email support",
      // Sharing Features
      "QR code sharing",
      "Contact Button"
    ],
    colorClasses: "bg-gray-900 ring-green-400 text-green-400",
    link: "#",
  },
  {
    tier: "Standard", 
    price: "159 TND",
    description: "Essential features to enhance your business presence.",
    features: [
      // Core Features
      "5 NFC Cards",
      "Customizable web portfolio",
      // Support
      "Email support",
      // Branding
      "Custom branding",
      "Remove our watermark",
      // Enhanced Features
      "Contact Form"
    ],
    colorClasses: "bg-gray-900 ring-yellow-400 text-yellow-400",
    link: "#",
  },
  {
    tier: "Professional",
    price: "399 TND", 
    description: "Advanced solutions for professionals and growing businesses.",
    features: [
      // Core Features
      "10 NFC Cards",
      "Fully customizable web portfolio",
      // Support & SLA
      "Priority support",
      "SLA guarantee",
      // Branding & Domain
      "Custom branding",
      "Custom Domain",
      // Advanced Features
      "Integration with CRM tools",
      "Advanced Contact Form",
      "Remove our watermark"
    ],
    colorClasses: "bg-gray-900 ring-blue-400 text-blue-400",
    link: "#",
  },
  {
    tier: "Enterprise",
    price: "Custom Pricing",
    description: "Tailored solutions for enterprises with advanced needs.",
    features: [
      // Core Features
      "Unlimited NFC Cards",
      "Custom web portfolio design",
      // Support & Management
      "Dedicated account manager",
      "Priority support",
      "SLA guarantee",
      // Advanced Features
      "Custom integrations",
      "Custom Domain",
      "Custom Forms"
    ],
    colorClasses: "bg-gray-900 ring-purple-400 text-purple-400",
    link: "#",
  }
];
const colorMapping = {
  Basic: {
    text: "text-green-400",
    ring: "ring-green-400",
    bg: "bg-gray-800"
  },
  Standard: {
    text: "text-yellow-400",
    ring: "ring-yellow-400", 
    bg: "bg-gray-800"
  },
  Professional: {
    text: "text-blue-400",
    ring: "ring-blue-400",
    bg: "bg-gray-800"
  },
  Enterprise: {
    text: "text-purple-400", 
    ring: "ring-purple-400",
    bg: "bg-gray-800"
  }
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
populateFeatureList("enterprise-list", cardContents[3].features, "text-purple-400");