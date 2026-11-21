// plans.js — plans page: hero (floating cards + tilt) and the pricing table.
// One module replaces hero.js and the old pricing script. No libraries.

/* ═══════════════ PRICING DATA (TND) — change prices here ═══════════════
   Model: prepaid terms. Customers pay once (card + first term), usually cash on delivery.
   Nothing renews automatically; we remind them and they renew by transfer / cash / link. */
const CARD = 35;                          // NFC card, delivery included, paid once
const BASIC = { year: 50, two: 80 };      // plan price per term
const STANDARD = { year: 60, two: 100 };
const EXTRA_CARD = 25;                    // extra linked card on Standard (up to 5 linked)
const ONLINE_PAYMENT = false;             // set true once a gateway (Konnect, Paymee, Flouci…) is live

const TERMS = [
  { id: 'year', label: '1 year', months: 12, hint: '' },
  { id: 'two',  label: '2 years', months: 24, hint: 'Best value' },
];

const fmt = (n) => String(Math.round(n * 10) / 10).replace(/\.0$/, '');
const perMonth = (price, t) => `≈ ${fmt(price / TERMS.find((x) => x.id === t).months)} TND / month`;
const termLabel = (t) => (t === 'year' ? '1 year' : '2 years');
const unit = (t) => (t === 'year' ? 'TND / year' : 'TND / 2 years');

const PAY_CARD = ONLINE_PAYMENT ? 'Cash on delivery or online' : 'Cash on delivery';

const PLANS = [
  {
    id: 'free', name: 'Free', tagline: 'Try your digital profile', icon: 'fa-gift',
    href: '/plans/free/#start', cta: 'Start free',
    pay: () => ({ main: '0 TND', note: '30 days, no card' }),
    renew: () => '—', payment: 'No payment needed',
  },
  {
    id: 'basic', name: 'Basic', tagline: 'TCcard + editable profile', thumb: 'https://www.tccards.tn/Assets/plans/card-orange.webp',
    href: '/plans/basic/', cta: 'Order Basic', featured: true,
    pay: (t) => ({ main: `${fmt(CARD + BASIC[t])} TND`, note: `Card ${CARD} + ${termLabel(t)} ${BASIC[t]}`, sub: perMonth(BASIC[t], t) }),
    renew: (t) => `${fmt(BASIC[t])} ${unit(t)}`, payment: PAY_CARD,
  },
  {
    id: 'standard', name: 'Standard', tagline: 'Analytics and linked cards', thumb: 'https://www.tccards.tn/Assets/plans/card-orange.webp',
    href: '/plans/standard/', cta: 'Order Standard',
    pay: (t) => ({ main: `${fmt(CARD + STANDARD[t])} TND`, note: `Card ${CARD} + ${termLabel(t)} ${STANDARD[t]}`, sub: perMonth(STANDARD[t], t) }),
    renew: (t) => `${fmt(STANDARD[t])} ${unit(t)}`, payment: PAY_CARD,
  },
  {
    id: 'events', name: 'Events', tagline: 'Conferences and meetups', icon: 'fa-calendar-check',
    href: '/plans/events/', cta: 'Ask for a quote',
    pay: () => ({ main: 'Custom', note: 'Quote, from 10 cards' }),
    renew: () => 'On quote', payment: 'Invoice + bank transfer',
  },
  {
    id: 'enterprise', name: 'Enterprise', tagline: 'Whole-team rollout', icon: 'fa-building',
    href: '/plans/enterprise/', cta: 'Ask for a quote',
    pay: () => ({ main: 'Custom', note: 'Quote, bulk cards' }),
    renew: () => 'On quote', payment: 'Invoice + bank transfer',
  },
];

// true = included, false = not included, string = shown as text
const FEATURES = [
  { label: 'NFC card',           free: 'No card', basic: '1 card included', standard: '1 card included', events: '10 branded cards', enterprise: 'Bulk, branded' },
  { label: 'Delivery',           free: false, basic: 'Included', standard: 'Included', events: 'Included', enterprise: 'Included' },
  { label: 'Extra linked cards', free: false, basic: false, standard: `Up to 5 · ${EXTRA_CARD} TND each`, events: '10 included', enterprise: 'As many as you need' },
  { label: 'Editable profile',   free: true, basic: true, standard: true, events: true, enterprise: true },
  { label: 'QR code',            free: true, basic: true, standard: true, events: true, enterprise: true },
  { label: 'Social links',       free: false, basic: true, standard: true, events: true, enterprise: true },
  { label: 'No watermark',       free: false, basic: true, standard: true, events: true, enterprise: true },
  { label: 'Profile analytics',  free: false, basic: false, standard: true, events: 'Real-time dashboard', enterprise: true },
  { label: 'Event tools',        free: false, basic: false, standard: false, events: 'Attendee tracking, scheduling', enterprise: false },
  { label: 'Team management',    free: false, basic: false, standard: false, events: false, enterprise: 'Team circle + brand identity' },
  { label: 'Support',            free: 'Help center', basic: 'Help center', standard: 'Help center', events: 'Dedicated event support', enterprise: 'Dedicated account manager' },
];

/* ═══════════════ PRICING RENDER ═══════════════ */
let term = 'year';

const check = `<i class="fas fa-check text-blue-300" aria-hidden="true"></i><span class="sr-only">Included</span>`;
const dash  = `<span aria-hidden="true" class="text-gray-600">—</span><span class="sr-only">Not included</span>`;
const cell  = (v) => (v === true ? check : v === false ? dash : `<span class="text-gray-200">${v}</span>`);

const thumb = (p, cls) => p.thumb
  ? `<img src="${p.thumb}" alt="" width="112" height="64" loading="lazy" class="${cls} rounded-lg object-cover">`
  : `<span class="${cls} flex items-center justify-center rounded-lg bg-white/5 text-xl text-gray-300"><i class="fas ${p.icon}" aria-hidden="true"></i></span>`;

const badge = `<span class="mt-3 inline-block rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-medium text-blue-200">Recommended</span>`;

const ctaBtn = (p) => `<a href="${p.href}" class="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors ${
  p.featured ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600'
             : 'bg-white/5 text-white hover:bg-white/10'}">${p.cta}</a>`;

const payBlock = (p) => {
  const x = p.pay(term);
  return `<div class="text-3xl font-bold text-white">${x.main}</div>
          <div class="mt-1 text-xs text-gray-400">${x.note}</div>
          ${x.sub ? `<div class="text-xs text-gray-500">${x.sub}</div>` : ''}`;
};

function renderTable() {
  const hl = (p) => (p.featured ? 'bg-blue-500/[0.07]' : '');
  const head = PLANS.map((p) => `
    <th scope="col" class="w-[17%] p-5 text-left align-top font-normal ${hl(p)}">
      ${thumb(p, 'mb-4 h-16 w-28')}
      <div class="text-lg font-semibold text-white">${p.name}</div>
      <div class="mt-1 text-xs text-gray-400">${p.tagline}</div>
      ${p.featured ? badge : ''}
    </th>`).join('');

  const row = (label, content) => `
    <tr class="border-t border-white/10">
      <th scope="row" class="sticky left-0 z-10 bg-[#0b0b0e] p-5 text-left text-sm font-medium text-gray-300">${label}</th>
      ${content}
    </tr>`;
  const td = (p, inner) => `<td class="p-5 align-top text-sm ${hl(p)}">${inner}</td>`;

  const body =
    row('You pay <span class="block text-xs font-normal text-gray-500">one payment, card + plan</span>', PLANS.map((p) => td(p, payBlock(p))).join('')) +
    row('How you pay', PLANS.map((p) => td(p, `<span class="text-gray-200">${p.payment}</span>`)).join('')) +
    row('Then renew <span class="block text-xs font-normal text-gray-500">never automatic</span>', PLANS.map((p) => td(p, `<span class="text-gray-200">${p.renew(term)}</span>`)).join('')) +
    FEATURES.map((f) => row(f.label, PLANS.map((p) => td(p, cell(f[p.id]))).join(''))).join('') +
    row('', PLANS.map((p) => td(p, ctaBtn(p))).join(''));

  document.getElementById('plans-table').innerHTML = `
    <table class="w-full min-w-[920px] border-collapse">
      <caption class="sr-only">TCcard plans compared. Prices in Tunisian dinars.</caption>
      <thead><tr><td class="sticky left-0 z-10 bg-[#0b0b0e]"></td>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>`;
}

function renderCards() {
  document.getElementById('plans-cards').innerHTML = PLANS.map((p) => {
    const list = FEATURES.map((f) => {
      const v = f[p.id];
      if (v === false) return '';
      return `<li class="flex items-start justify-between gap-4 py-2 text-sm">
        <span class="text-gray-400">${f.label}</span>
        <span class="text-right">${v === true ? check : `<span class="text-gray-200">${v}</span>`}</span></li>`;
    }).join('');
    const line = (k, v) => `<li class="flex items-start justify-between gap-4 py-2 text-sm"><span class="text-gray-400">${k}</span><span class="text-right text-gray-200">${v}</span></li>`;
    return `
    <article class="rounded-3xl p-5 ${p.featured ? 'bg-blue-500/[0.08]' : 'bg-white/[0.04]'}">
      <div class="flex items-center gap-4">
        ${thumb(p, 'h-14 w-24 shrink-0')}
        <div><h3 class="text-xl font-semibold text-white">${p.name}</h3><p class="text-xs text-gray-400">${p.tagline}</p></div>
      </div>
      ${p.featured ? badge : ''}
      <div class="mt-5"><p class="text-xs uppercase tracking-wider text-gray-500">You pay</p>${payBlock(p)}</div>
      <ul class="mt-4 divide-y divide-white/10 border-t border-white/10">
        ${line('How you pay', p.payment)}${line('Then renew', p.renew(term))}${list}
      </ul>
      <div class="mt-5">${ctaBtn(p)}</div>
    </article>`;
  }).join('');
}

function renderTerms() {
  document.getElementById('term-switch').innerHTML = TERMS.map((t) => `
    <button type="button" role="radio" aria-checked="${t.id === term}" tabindex="${t.id === term ? 0 : -1}" data-term="${t.id}"
      class="min-h-[2.75rem] rounded-full px-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:px-5 ${
        t.id === term ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}">
      ${t.label}${t.hint ? `<span class="ml-1.5 text-xs ${t.id === term ? 'text-blue-700' : 'text-blue-300'}">${t.hint}</span>` : ''}
    </button>`).join('');
}

function renderNotes() {
  const el = document.getElementById('plans-notes');
  if (!el) return;
  el.innerHTML = `
    <li>Prices are in Tunisian dinars (TND). The card is paid once; the plan covers your hosted, editable profile for the term you choose.</li>
    <li>Nothing is charged automatically. We remind you 30 and 7 days before your plan ends, with a 30-day grace period to renew by bank transfer or cash${ONLINE_PAYMENT ? ', or online' : ''}.</li>
    <li>Extra linked cards on Standard are ${EXTRA_CARD} TND each, up to 5 linked.</li>`;
}

function setTerm(id) {
  term = id;
  renderTerms(); renderTable(); renderCards();
  document.getElementById('term-status').textContent = `Showing ${termLabel(id)} prices`;
  document.querySelector(`#term-switch [data-term="${id}"]`)?.focus();
}

function initPricing() {
  if (!document.getElementById('plans-table')) return;
  renderTerms(); renderTable(); renderCards(); renderNotes();
  const wrap = document.getElementById('term-switch');
  wrap.addEventListener('click', (e) => {
    const b = e.target.closest('[data-term]');
    if (b && b.dataset.term !== term) setTerm(b.dataset.term);
  });
  wrap.addEventListener('keydown', (e) => {
    const i = TERMS.findIndex((t) => t.id === term);
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setTerm(TERMS[(next + TERMS.length) % TERMS.length].id);
  });
}

/* ═══════════════ HERO: floating cards + tilt (port of <CreditCardHero />) ═══════════════ */
function initHero() {
  const section = document.getElementById('plans-hero-section');
  const card = document.getElementById('plans-hero');
  if (!section || !card) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // gentle idle float, also on touch screens
  card.querySelectorAll('[data-float]').forEach((el, i) => {
    el.animate(
      [{ transform: 'translateY(0)' }, { transform: `translateY(${i ? 8 : -8}px)` }],
      { duration: 3200 + i * 700, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }
    );
  });

  // mouse tilt, ±8deg like the original, centred when the pointer is in the middle
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const clamp = (n) => Math.min(1, Math.max(0, n));

  const tick = () => {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    card.style.transform = `rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg)`;
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.01 ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  section.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = card.getBoundingClientRect();
    tx = (0.5 - clamp((e.clientY - r.top) / r.height)) * 16;   // rotateX
    ty = (clamp((e.clientX - r.left) / r.width) - 0.5) * 16;   // rotateY
    kick();
  });
  section.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
}

function init() { initHero(); initPricing(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
