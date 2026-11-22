// basic.js — hero tap demo, pricing switch and live card preview for the Basic order page.
// main.js (form logic) and ui.js (dialogs/toasts) are separate files.

/* ═══ PRICING (TND) — keep in sync with /plans/plans.js ═══ */
const CARD = 35;                          // NFC card, delivery included, paid once
const PLAN = { year: 50, two: 80 };       // Basic plan per term
const TERMS = {
  year: { label: '1 year',  months: 12, unit: 'TND / year' },
  two:  { label: '2 years', months: 24, unit: 'TND / 2 years' },
};
const fmt = (n) => String(Math.round(n * 10) / 10).replace(/\.0$/, '');
const $ = (id) => document.getElementById(id);

function initPricing() {
  const buttons = document.querySelectorAll('[data-term]');
  if (!buttons.length) return;
  const render = (id) => {
    const t = TERMS[id];
    if (!t) return;
    buttons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.term === id)));
    $('price-total').textContent = `${fmt(CARD + PLAN[id])} TND`;
    $('price-note').textContent = `Card ${CARD} + ${t.label} ${PLAN[id]}`;
    $('price-sub').textContent = `≈ ${fmt(PLAN[id] / t.months)} TND / month`;
    $('renew-price').textContent = `${fmt(PLAN[id])} ${t.unit}`;
    if ($('order-total')) $('order-total').textContent = `${fmt(CARD + PLAN[id])} TND (card + ${t.label})`;
  };
  buttons.forEach((b) => b.addEventListener('click', () => render(b.dataset.term)));
  render('year');
}

/* ═══ HERO: a TCcard taps a phone and the profile opens (loops, pauses off-screen) ═══ */
function initTapDemo() {
  const stage = $('tap-stage');
  if (!stage) return;
  const set = (k, v) => { stage.dataset[k] = String(v); };

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    set('tap', true); set('banner', false); set('open', true);
    return;
  }

  stage.querySelectorAll('[data-float]').forEach((el, i) => {
    el.animate(
      [{ transform: 'translateY(0)' }, { transform: `translateY(${i ? 8 : -8}px)` }],
      { duration: 3400 + i * 700, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }
    );
  });

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let visible = false, running = false;
  async function loop() {
    if (running) return;
    running = true;
    while (visible) {
      set('tap', false); set('banner', false); set('open', false);
      await wait(1100);  if (!visible) break;
      set('tap', true);
      await wait(1100);  if (!visible) break;
      set('banner', true);
      await wait(800);   if (!visible) break;
      set('open', true);
      await wait(4200);  if (!visible) break;
      set('open', false); set('banner', false);
      await wait(600);   if (!visible) break;
      set('tap', false);
      await wait(900);
    }
    running = false;
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }).observe(stage);
}

/* ═══ CARD STYLE: pick a layout + accent, see the real card render live ═══
   Uses renderer.js (the same file the editor and the public card use). The chosen style is stored in
   #style-value as  <background>|t=<layout>|a=<#hex>  and main.js sends it as the "style" field. */
const ACCENTS = ['#3b82f6', '#6366f1', '#a855f7', '#f43f5e', '#f97316', '#f59e0b', '#10b981', '#06b6d4'];
const DEFAULT_AVATAR = 'https://tccards.tn/Assets/150.png';

async function initStyle() {
  const form = $('data-fill');
  const hidden = $('style-value');
  if (!form || !hidden) return;

  const state = { template: 'classic', accent: ACCENTS[0] };
  const presetEl = () => form.querySelector('.style-preset.selected');
  const base = () => presetEl()?.dataset.style || 'corporateGradient';
  const wraps = () => document.querySelectorAll('[data-card-wrap]');
  const slots = () => document.querySelectorAll('[data-card-preview]');

  let mod = null;
  try {
    mod = await import('./renderer.js');
  } catch (err) {
    // Never block the order: without the renderer we just send the background choice.
    console.warn('renderer.js not found, card style picker hidden', err);
    document.querySelectorAll('[data-style-extras]').forEach((el) => el.classList.add('hidden'));
    slots().forEach((el) => el.closest('.lg\\:hidden, aside')?.classList.add('hidden'));
  }

  const commit = () => {
    hidden.value = mod
      ? mod.serializeStyleParams({ base: base(), template: state.template, accent: state.accent })
      : base();
    const bg = presetEl()?.firstElementChild?.style.background;
    if (bg) wraps().forEach((w) => { w.style.background = bg; });
  };
  if (!mod) {
    form.addEventListener('click', (e) => { if (e.target.closest('.style-preset')) commit(); });
    commit();
    return;
  }

  /* pickers */
  const chip = 'aria-pressed:bg-blue-500/15 aria-pressed:text-blue-200 aria-pressed:ring-2 aria-pressed:ring-blue-400';
  $('template-grid').innerHTML = mod.TEMPLATE_META.map((t) => `
    <button type="button" data-template="${t.id}" aria-pressed="${t.id === state.template}"
      class="flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-xl bg-white/[0.04] px-1 py-3 text-gray-400 transition hover:bg-white/[0.08] hover:text-white ${chip}">
      <span class="text-xl" aria-hidden="true">${t.glyph}</span><span class="text-xs font-medium">${t.label}</span>
    </button>`).join('');

  $('accent-grid').innerHTML = ACCENTS.map((c) => `
    <button type="button" data-accent="${c}" aria-pressed="${c === state.accent}" aria-label="Accent ${c}"
      class="h-9 w-9 rounded-full transition aria-pressed:scale-110 aria-pressed:ring-2 aria-pressed:ring-white aria-pressed:ring-offset-2 aria-pressed:ring-offset-zinc-900" style="background:${c}"></button>`).join('') + `
    <label class="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-sm text-white/70 transition hover:bg-white/20" title="Custom color">
      <i class="fas fa-eye-dropper" aria-hidden="true"></i><span class="sr-only">Custom color</span>
      <input type="color" id="accent-custom" value="${state.accent}" class="absolute inset-0 h-full w-full cursor-pointer opacity-0">
    </label>`;

  const syncPressed = () => {
    document.querySelectorAll('[data-template]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.template === state.template)));
    document.querySelectorAll('[data-accent]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.accent === state.accent)));
  };

  /* preview */
  const val = (sel) => form.querySelector(sel)?.value.trim() || '';
  const render = () => {
    const pic = $('profile-picture')?.src || '';
    const links = [...form.querySelectorAll('input[name="social-links[]"]')].map((i) => i.value.trim()).filter(Boolean);
    const profile = {
      name: val('#user-name') || 'Your Name',
      tagline: val('#user-tagline') || 'Your tagline',
      profilePic: pic === DEFAULT_AVATAR ? '' : pic,
      socialLinks: links.length ? links : ['linkedin.com/in/yourname', 'instagram.com/yourname'],
      email: val('#user-email') || 'you@example.com',
      phone: val('#user-phone'),
      address: val('#user-address'),
    };
    const html = mod.renderCardHtml(profile, { theme: 'dark', accent: state.accent, template: state.template, interactive: false });
    slots().forEach((el) => { el.innerHTML = html; });
  };
  let timer;
  const later = () => { clearTimeout(timer); timer = setTimeout(render, 180); };

  const change = () => { syncPressed(); commit(); render(); };

  form.addEventListener('click', (e) => {
    const t = e.target.closest('[data-template]');
    const a = e.target.closest('[data-accent]');
    if (t) { state.template = t.dataset.template; change(); }
    else if (a) { state.accent = a.dataset.accent; change(); }
    else if (e.target.closest('.style-preset')) { commit(); } // main.js has already moved .selected
    else if (e.target.closest('.remove-link-btn')) later();
  });
  form.addEventListener('input', (e) => {
    if (e.target.id === 'accent-custom') { state.accent = e.target.value; change(); }
    else later();
  });

  // main.js swaps the avatar src when a photo is chosen
  const pic = $('profile-picture');
  if (pic) new MutationObserver(later).observe(pic, { attributes: true, attributeFilter: ['src'] });

  change();
}

function init() { initPricing(); initTapDemo(); initStyle(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
