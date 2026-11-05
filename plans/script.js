/**
 * ============================================================
 *  tccards Plans – Pricing Cards & Navigation
 *  Single source of truth – no external script dependencies.
 * ============================================================
 */

(function () {
  'use strict';

  // ─── Data ──────────────────────────────────────────────
  const starterPlans = [
    {
      tier: "Free",
      price: "0 TND",
      description: "Perfect for individuals starting their digital journey.",
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
      link: "/plans/free/",
      badge: { label: "Start Free", position: "left" }
    },
    {
      tier: "Basic",
      price: "31.5 TND",
      originalPrice: "35 TND",
      description: "Perfect for individuals and small businesses starting with NFC technology.",
      features: [
        "1 NFC Card",
        "Pre-designed webfolio",
        "6 media links",
        "Email support",
        "QR code emailing",
        "Editing dashboard",
        "Contact Button"
      ],
      limitations: [
        "Customizable Card",
        "No Analytics Dashboard"
      ],
      link: "/plans/basic/",
      badge: { label: "Most Popular", position: "right" },
      featured: true
    }
  ];

  // const advancedPlans = [
  //   {
  //     tier: "Standard",
  //     price: "80 TND",
  //     description: "Essential features to enhance your business presence.",
  //     features: [
  //       "5 NFC Cards",
  //       "Customizable Card",
  //       "Unlimited media links",
  //       "Email support",
  //       "Custom branding",
  //       "Remove our watermark",
  //       "Analytics Dashboard"
  //     ],
  //     link: "/plans/standard/",
  //     badge: { label: "Coming Soon", position: "right" },
  //     disabled: true
  //   },
  //   {
  //     tier: "Enterprise",
  //     price: "Custom Pricing",
  //     description: "Tailored solutions for enterprises with advanced needs.",
  //     features: [
  //       "Unlimited NFC Cards",
  //       "Custom webfolio design",
  //       "Dedicated account manager",
  //       "Priority support",
  //       "SLA guarantee",
  //       "Custom integrations",
  //       "Custom Domain",
  //       "Custom Forms"
  //     ],
  //     link: "/plans/enterprise/",
  //     badge: { label: "Coming Soon", position: "right" },
  //     disabled: true
  //   }
  // ];

  // ─── Color mapping ─────────────────────────────────────
  // ring: card border | text: price/heading accent | bg: hover fill for CTA
  const colorMapping = {
    Free: { text: "text-purple-400", ring: "ring-purple-400/60", bg: "bg-purple-400", ttext: "hover:text-black" },
    Basic: { text: "text-green-400", ring: "ring-green-400", bg: "bg-green-400", ttext: "hover:text-black" },
    Standard: { text: "text-yellow-400", ring: "ring-yellow-400/50", bg: "bg-yellow-400", ttext: "hover:text-black" },
    Enterprise: { text: "text-red-400", ring: "ring-red-400/50", bg: "bg-red-400", ttext: "hover:text-black" }
  };

  const CHECK_ICON = `
    <svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/>
    </svg>`;

  const CROSS_ICON = `
    <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
    </svg>`;

  function getPlanLink(link) {
    const username = new URLSearchParams(window.location.search).get('username');
    if (!username) return link;

    const url = new URL(link, window.location.href);
    url.searchParams.set('username', username);
    return `${url.pathname}${url.search}${url.hash}`;
  }

  // ─── Card generator ────────────────────────────────────
  // Every plan — free, paid, or coming-soon — renders through this one
  // function, so the markup for a "card" only ever lives in one place.
  function generatePricingCard(plan) {
    const colors = colorMapping[plan.tier] || colorMapping.Basic;
    const titleId = `${plan.tier.toLowerCase()}-plan-title`;
    const descId = `${plan.tier.toLowerCase()}-plan-desc`;

    let tagElement = '';
    if (plan.badge) {
      const side = plan.badge.position === "right" ? "right-4" : "left-4";
      tagElement = `
        <span class="absolute -top-3 ${side} rounded-full bg-gray-900 px-3 py-1.5 text-xs font-bold ${colors.text} ring-1 ${colors.ring} z-10">
          ${plan.badge.label}
        </span>
      `;
    }

    let priceHtml = `<span class="text-4xl sm:text-5xl font-semibold ${colors.text}">${plan.price}</span>`;
    if (plan.originalPrice) {
      priceHtml += `<span class="price-original text-gray-400">${plan.originalPrice}</span>`;
    }

    const limitationsHtml = plan.limitations ? `
      <div class="mt-6 pt-4 border-t border-gray-700/70">
        <p class="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Not included</p>
        <ul class="space-y-2 text-sm text-gray-500">
          ${plan.limitations.map(limit => `
            <li class="flex items-center gap-2">
              ${CROSS_ICON}
              <span>${limit}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    ` : '';

    let buttonHtml;
    if (plan.disabled) {
      buttonHtml = `
        <button type="button" class="mt-8 w-full rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-gray-400 bg-gray-800/40 ring-1 ring-gray-700 opacity-80 cursor-not-allowed" disabled aria-disabled="true" title="Coming soon">
          Coming Soon
        </button>
      `;
    } else if (plan.tier === "Free") {
      buttonHtml = `
        <a href="${getPlanLink(plan.link)}" class="mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold ${colors.text} ring-1 ${colors.ring} hover:${colors.bg} hover:text-black transition-all duration-300">
          Start Free
        </a>
      `;
    } else {
      buttonHtml = `
        <a href="${getPlanLink(plan.link)}" class="mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold ${colors.text} ring-1 ${colors.ring} hover:${colors.bg} ${colors.ttext} transition-all duration-300">
          Get ${plan.tier} Plan
        </a>
      `;
    }

    return `
      <article class="hover:scale-[1.03] transform transition-all duration-300 relative pricing-card ${plan.tier.toLowerCase()} rounded-3xl p-6 ring-1 ${colors.ring} ${plan.tier === 'Free' ? 'border-dashed' : ''} ${plan.featured ? 'featured-card' : ''}"
        role="region" aria-labelledby="${titleId}" aria-describedby="${descId}">
        ${tagElement}
        <h3 id="${titleId}" class="text-base font-semibold ${colors.text} pt-1">${plan.tier}</h3>
        <p id="${descId}" class="mt-4 flex items-baseline gap-x-2">${priceHtml}</p>
        <p class="mt-4 text-base text-gray-300">${plan.description}</p>
        <ul class="mt-8 space-y-3 text-sm text-gray-300">
          ${plan.features.map(feature => `
            <li class="flex gap-x-3 items-start">
              <span class="${colors.text} mt-0.5">${CHECK_ICON}</span>
              <span>${feature}</span>
            </li>
          `).join('')}
        </ul>
        ${limitationsHtml}
        ${buttonHtml}
      </article>
    `;
  }

  // ─── Render function ──────────────────────────────────
  function renderPricingCards() {
    const starterContainer = document.getElementById('starter-plans');
    const advancedContainer = document.getElementById('advanced-plans');
    if (!starterContainer || !advancedContainer) return;

    starterContainer.innerHTML = starterPlans.map(generatePricingCard).join('');
    advancedContainer.innerHTML = advancedPlans.map(generatePricingCard).join('');
  }

  // ─── Navigation helpers ──────────────────────────────
  function setupNavigation() {
    const nav = document.getElementById('mainNav');
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!nav) return;

    // Scroll background
    const updateNavScrolled = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', updateNavScrolled, { passive: true });
    updateNavScrolled();

    if (menuButton && mobileMenu) {
      // Toggle menu
      menuButton.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!isOpen));
        mobileMenu.classList.toggle('hidden');

        const icon = menuButton.querySelector('svg');
        if (!isOpen) {
          icon.innerHTML = `<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>`;
        } else {
          icon.innerHTML = `<line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line>`;
        }
      });

      // Close on scroll, escape, or link click
      const closeMenu = () => {
        if (!mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
          menuButton.setAttribute('aria-expanded', 'false');
          const icon = menuButton.querySelector('svg');
          icon.innerHTML = `<line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line>`;
        }
      };

      window.addEventListener('scroll', closeMenu, { passive: true });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
      mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    }
  }

  // ─── Init ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    renderPricingCards();
    setupNavigation();
  });

})();


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