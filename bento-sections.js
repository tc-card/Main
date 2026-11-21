// bento-sections.js — fills the "Features" and "How it works" sections with bento grids
import { mountBento } from './bento.js';

// ── shared building blocks ───────────────────────────────────────────────
const TONES = {
  blue:   { icon: 'bg-blue-500/15 text-blue-300',     hover: 'hover:border-blue-400/40' },
  purple: { icon: 'bg-purple-500/15 text-purple-300', hover: 'hover:border-purple-400/40' },
  teal:   { icon: 'bg-teal-400/15 text-teal-200',     hover: 'hover:border-teal-300/40' },
  amber:  { icon: 'bg-amber-400/15 text-amber-200',   hover: 'hover:border-amber-300/40' },
};

const card = (tone, inner, extra = '') => `
  <article class="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 text-left backdrop-blur-sm transition-colors duration-300 ${TONES[tone].hover} ${extra}">
    ${inner}
  </article>`;

const badge = (tone, content) =>
  `<span class="mb-4 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${TONES[tone].icon}">${content}</span>`;

const title = (text) => `<h3 class="text-xl font-semibold text-white">${text}</h3>`;
const body = (text) => `<p class="mt-2 text-sm leading-relaxed text-gray-400">${text}</p>`;

const chip = (icon, text) =>
  `<span class="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300"><i class="${icon} text-blue-300"></i>${text}</span>`;

// ── FEATURES ─────────────────────────────────────────────────────────────
const features = {
  // tall: tap or scan
  integration: card('blue', `
    ${badge('blue', '<i class="fas fa-wifi"></i>')}
    ${title('Tap or scan')}
    ${body('Share by NFC tap or printed QR code. People can open your profile in their browser without installing an app.')}
    <div class="relative my-8 flex min-h-[10rem] flex-1 items-center justify-center">
      <span class="absolute h-44 w-44 animate-ping rounded-full bg-blue-500/10 motion-reduce:animate-none" style="animation-duration:3s"></span>
      <span class="absolute h-32 w-32 rounded-full bg-blue-500/15"></span>
      <span class="relative flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/25 text-3xl text-blue-200"><i class="fas fa-wifi rotate-90"></i></span>
    </div>
    <div class="flex flex-wrap gap-2">${chip('fas fa-hand-pointer', 'NFC tap')}${chip('fas fa-qrcode', 'QR code')}</div>
  `),

  // top-middle: always updated
  trackers: card('purple', `
    ${badge('purple', '<i class="fas fa-edit"></i>')}
    ${title('Always updated')}
    ${body('Change your info anytime. It updates instantly for everyone who opens your profile.')}
  `),

  // top-right: analytics
  statistic: card('teal', `
    <div class="flex items-start justify-between">
      ${badge('teal', '<i class="fas fa-chart-line"></i>')}
      <div class="flex h-12 items-end gap-1.5" aria-hidden="true">
        <span class="w-2 rounded-sm bg-teal-300/30 h-3"></span>
        <span class="w-2 rounded-sm bg-teal-300/40 h-5"></span>
        <span class="w-2 rounded-sm bg-teal-300/50 h-4"></span>
        <span class="w-2 rounded-sm bg-teal-300/70 h-8"></span>
        <span class="w-2 rounded-sm bg-teal-300 h-12"></span>
      </div>
    </div>
    ${title('See who looks')}
    ${body('Profile analytics are included on the Standard plan.')}
  `),

  // middle-middle: no app
  focus: card('blue', `
    ${badge('blue', '<i class="fas fa-globe"></i>')}
    ${title('No app needed')}
    ${body('Your profile opens right in the browser.')}
    <div class="mt-auto pt-4"><span class="block truncate rounded-full bg-white/5 px-4 py-2 text-xs text-gray-400">card.tccards.tn/@you</span></div>
  `),

  // middle-right: no reprints
  productivity: card('amber', `
    ${badge('amber', '<i class="fas fa-leaf"></i>')}
    ${title('One card, no reprints')}
    ${body('Update your profile when things change. The same TCcard keeps sharing the latest details.')}
  `),

  // wide bottom: instant sharing
  shortcuts: card('purple', `
    <div class="flex h-full flex-col gap-6 md:flex-row md:items-center">
      <div class="md:w-1/2">
        ${badge('purple', '<i class="fas fa-bolt"></i>')}
        ${title('Instant sharing')}
        ${body('One tap shares your complete professional profile with anyone, anywhere.')}
      </div>
      <div class="flex flex-wrap gap-2 md:w-1/2 md:justify-end">
        ${chip('fas fa-address-book', 'Contact details')}
        ${chip('fas fa-briefcase', 'Work')}
        ${chip('fas fa-link', 'Links')}
        ${chip('fas fa-share-nodes', 'Socials')}
      </div>
    </div>
  `),
};

// ── HOW IT WORKS ─────────────────────────────────────────────────────────
const how = {
  // tall: step 1
  integration: card('blue', `
    ${badge('blue', '1')}
    ${title('Craft your digital identity')}
    ${body('Build a professional profile with media, social links and design options that reflect your personal brand.')}
    <div class="mt-8 flex flex-1 items-center justify-center" aria-hidden="true">
      <div class="w-full max-w-[14rem] rounded-2xl bg-white/5 p-5 text-center">
        <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-lg font-bold text-white">Y</span>
        <span class="mx-auto mt-3 block h-3 w-24 rounded-full bg-white/20"></span>
        <span class="mx-auto mt-2 block h-2 w-32 rounded-full bg-white/10"></span>
        <div class="mt-4 space-y-2">
          <span class="block h-7 rounded-lg bg-white/10"></span>
          <span class="block h-7 rounded-lg bg-white/10"></span>
          <span class="block h-7 rounded-lg bg-blue-500/30"></span>
        </div>
      </div>
    </div>
  `),

  // step 2
  trackers: card('purple', `
    ${badge('purple', '2')}
    ${title('Receive your smart card')}
    ${body('A sleek, durable NFC card with your unique @username and QR code.')}
  `),

  // step 3
  statistic: card('teal', `
    ${badge('teal', '3')}
    ${title('Tap and connect')}
    ${body('Share your whole profile with a single tap.')}
  `),

  focus: card('blue', `
    ${badge('blue', '<i class="fas fa-microchip"></i>')}
    ${title('Ready out of the box')}
    ${body('Every card arrives pre-programmed with your profile and NFC.')}
  `),

  productivity: card('amber', `
    ${badge('amber', '<i class="fas fa-mobile-screen"></i>')}
    ${title('Works on any phone')}
    ${body('Recipients open your profile instantly. No special app required.')}
  `),

  // wide bottom: call to action
  shortcuts: card('blue', `
    <div class="flex h-full flex-col justify-between gap-6 md:flex-row md:items-center">
      <div>
        ${title('Ready to transform your networking?')}
        ${body('Get your NFC card and start sharing in a tap.')}
      </div>
      <a href="/plans" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-700/30">
        Get your NFC card today
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </a>
    </div>
  `, 'bg-blue-500/[0.07]'),
};

// ── mount ────────────────────────────────────────────────────────────────
function init() {
  mountBento(document.getElementById('features-bento'), features);
  mountBento(document.getElementById('how-bento'), how);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
