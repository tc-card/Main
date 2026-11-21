// script.js — mobile menu only.
// (The profile studio, its renderer.js and the old FAQ code are gone; the FAQ now lives in faq.js.)

function initMobileMenu() {
  const button = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  if (!button || !menu) return;

  const HAMBURGER = `<line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line>`;
  const CLOSE = `<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>`;
  const icon = button.querySelector('svg');

  const setOpen = (open) => {
    menu.classList.toggle('hidden', !open);
    button.setAttribute('aria-expanded', String(open));
    icon.innerHTML = open ? CLOSE : HAMBURGER;
  };
  const isOpen = () => button.getAttribute('aria-expanded') === 'true';

  button.addEventListener('click', () => setOpen(!isOpen()));
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) setOpen(false); });
  // tap outside the nav closes the menu
  document.addEventListener('click', (e) => { if (isOpen() && !e.target.closest('nav')) setOpen(false); });
  // growing past the mobile breakpoint resets it
  matchMedia('(min-width: 768px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMobileMenu);
else initMobileMenu();
