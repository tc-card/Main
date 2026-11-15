import { renderCardHtml, TEMPLATE_META } from './renderer.js';

const DOM = {
  name: document.getElementById('demo-name'),
  role: document.getElementById('demo-role'),
  tagline: document.getElementById('demo-tagline'),
  templateGrid: document.getElementById('templateGrid'),
  accentColor: document.getElementById('accentColor'),
  cardBlur: document.getElementById('cardBlur'),
  cardBlurOut: document.getElementById('cardBlurOut'),
  cardOpacity: document.getElementById('cardOpacity'),
  cardOpacityOut: document.getElementById('cardOpacityOut'),
  preview: document.getElementById('livePreviewContainer')
};

const state = {
  template: 'classic',
  accent: '#3b82f6',
  cardBlur: 20,
  cardOpacity: 85
};

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff&size=128`;
}

function renderPreview() {
  if (!DOM.preview) return;

  const name = DOM.name.value.trim() || 'Your Name';
  const role = DOM.role.value.trim();
  const tagline = DOM.tagline.value.trim();
  
  // Combine role and tagline for the subtitle
  const combinedTagline = [role, tagline].filter(Boolean).join(' · ');

  // ADDED: email and phone to mock data so the contact button appears
  const profile = {
    name: name,
    tagline: combinedTagline,
    profilePic: getAvatarUrl(name),
    socialLinks: ['https://tccards.tn', 'https://linkedin.com'],
    email: 'hello@example.com',
    phone: '+216 12 345 678'
  };

  const options = {
    theme: 'dark',
    accent: state.accent,
    template: state.template,
    interactive: false, // Prevents missing function errors
    cardBlur: state.cardBlur,
    cardOpacity: state.cardOpacity
  };

  DOM.preview.innerHTML = renderCardHtml(profile, options);
}

function initStudio() {
  if (!DOM.preview) return;

  // Render Layout Tiles using CSS classes defined in style.css
  DOM.templateGrid.innerHTML = TEMPLATE_META.map(t => `
    <button type="button" data-template="${t.id}" class="tc-template-btn ${state.template === t.id ? 'is-active' : ''}">
      <span class="text-xl">${t.glyph}</span>
      <span class="text-[10px] font-medium">${t.label}</span>
    </button>
  `).join('');

  // Bind Events
  DOM.templateGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-template]');
    if (!btn) return;
    
    state.template = btn.dataset.template;
    
    // Toggle active state using CSS class
    DOM.templateGrid.querySelectorAll('button').forEach(b => {
      b.classList.toggle('is-active', b.dataset.template === state.template);
    });
    
    renderPreview();
  });

  DOM.accentColor.addEventListener('input', (e) => {
    state.accent = e.target.value;
    renderPreview();
  });

  DOM.cardBlur.addEventListener('input', (e) => {
    state.cardBlur = parseInt(e.target.value, 10);
    DOM.cardBlurOut.textContent = `${state.cardBlur}px`;
    renderPreview();
  });

  DOM.cardOpacity.addEventListener('input', (e) => {
    state.cardOpacity = parseInt(e.target.value, 10);
    DOM.cardOpacityOut.textContent = `${state.cardOpacity}%`;
    renderPreview();
  });

  [DOM.name, DOM.role, DOM.tagline].forEach(input => {
    input.addEventListener('input', renderPreview);
  });

  // Initial render
  renderPreview();
}

function initFAQ() {
  document.querySelectorAll('.faq-button').forEach((button) => {
    button.addEventListener('click', () => {
      const answer = button.nextElementSibling;
      const arrow = button.querySelector('svg');

      answer.classList.toggle('hidden');
      arrow.style.transform = answer.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';

      document.querySelectorAll('.faq-answer').forEach((otherAnswer) => {
        if (otherAnswer !== answer && !otherAnswer.classList.contains('hidden')) {
          otherAnswer.classList.add('hidden');
          otherAnswer.previousElementSibling.querySelector('svg').style.transform = 'rotate(0deg)';
        }
      });
    });
  });
}

function initMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  const HAMBURGER = `<line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line>`;
  const CLOSE = `<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>`;

  const closeMenu = () => {
    if (!mobileMenu || !mobileMenuButton) return;
    mobileMenu.classList.add('hidden');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    mobileMenuButton.querySelector('svg').innerHTML = HAMBURGER;
  };

  mobileMenuButton?.addEventListener('click', () => {
    const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
    mobileMenuButton.setAttribute('aria-expanded', String(!isExpanded));
    mobileMenu.classList.toggle('hidden');
    mobileMenuButton.querySelector('svg').innerHTML = isExpanded ? HAMBURGER : CLOSE;
  });

  document.querySelectorAll('#mobile-menu a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
      closeMenu();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
  initFAQ();
  initMobileMenu();
});