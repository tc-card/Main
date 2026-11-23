// ui.js — replaces SweetAlert. Toasts + one native <dialog> (focus trap, Esc and backdrop for free).
// Styled with Tailwind classes only, so no CSS file is needed.

const TONES = {
  success: { icon: 'fa-circle-check',          cls: 'text-emerald-400 bg-emerald-400/15' },
  error:   { icon: 'fa-circle-xmark',          cls: 'text-red-400 bg-red-400/15' },
  info:    { icon: 'fa-circle-info',           cls: 'text-blue-400 bg-blue-400/15' },
  warning: { icon: 'fa-triangle-exclamation',  cls: 'text-amber-400 bg-amber-400/15' },
  loading: { icon: 'fa-spinner fa-spin',       cls: 'text-blue-400 bg-blue-400/15' },
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ───────── toast ───────── */
let box;
export function toast(message, type = 'info', ms = 3500) {
  if (!box) {
    box = document.createElement('div');
    box.className = 'pointer-events-none fixed inset-x-0 top-20 z-[10000] flex flex-col items-center gap-2 px-4';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    document.body.appendChild(box);
  }
  const tone = TONES[type] || TONES.info;
  const el = document.createElement('div');
  el.className = 'pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl bg-zinc-900/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur';
  el.innerHTML = `<i class="fas ${tone.icon} mt-0.5 ${tone.cls.split(' ')[0]}" aria-hidden="true"></i><span>${esc(message)}</span>`;
  box.appendChild(el);
  el.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 200, fill: 'both' });
  setTimeout(() => {
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).finished
      .then(() => el.remove()).catch(() => el.remove());
  }, ms);
}

/* ───────── dialog host ───────── */
let dlg;
function host() {
  if (dlg) return dlg;
  dlg = document.createElement('dialog');
  dlg.className = 'w-[calc(100%-2rem)] max-w-md rounded-3xl bg-zinc-950 p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm';
  dlg.setAttribute('aria-live', 'polite');
  dlg.tabIndex = -1;
  document.body.appendChild(dlg);
  return dlg;
}

function markup({ icon = 'info', title = '', text = '', html = '', confirmText = '', cancelText = '', step = 0, steps = 0 }) {
  const tone = TONES[icon] || TONES.info;
  const dots = steps
    ? `<div class="mt-5" aria-hidden="true"><div class="flex justify-center gap-2">${Array.from({ length: steps }, (_, i) =>
        `<span class="h-1.5 w-8 rounded-full ${i < step ? 'bg-blue-400' : 'bg-white/15'}"></span>`).join('')}</div>
        <p class="mt-2 text-xs text-gray-500">Step ${step} of ${steps}</p></div>`
    : '';
  const buttons = (confirmText || cancelText)
    ? `<div class="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
        ${confirmText ? `<button type="button" data-ui="confirm" class="inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-blue-600">${esc(confirmText)}</button>` : ''}
        ${cancelText ? `<button type="button" data-ui="cancel" class="inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-xl bg-white/5 px-5 text-sm font-semibold text-gray-300 transition hover:bg-white/10">${esc(cancelText)}</button>` : ''}
      </div>`
    : '';
  return `<div class="p-6 text-center sm:p-8">
    <span class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${tone.cls}"><i class="fas ${tone.icon}" aria-hidden="true"></i></span>
    <h2 class="text-xl font-semibold">${esc(title)}</h2>
    ${text ? `<p class="mt-2 text-sm leading-relaxed text-gray-400">${esc(text)}</p>` : ''}
    ${html}
    ${dots}
    ${buttons}
  </div>`;
}

/** Message dialog. Resolves { confirmed } when closed. `html` must be trusted markup. */
export function dialog(cfg = {}) {
  return new Promise((resolve) => {
    const d = host();
    d.innerHTML = markup(cfg);

    const finish = (confirmed) => {
      d.removeEventListener('click', onClick);
      d.removeEventListener('cancel', onCancel);
      d.removeEventListener('close', onClose);
      if (d.open) d.close();
      resolve({ confirmed });
    };
    const onClick = (e) => {
      const b = e.target.closest('[data-ui]');
      if (b) finish(b.dataset.ui === 'confirm');
      else if (e.target === d && cfg.dismissible !== false) finish(false); // backdrop
    };
    const onCancel = (e) => { if (cfg.dismissible === false) e.preventDefault(); }; // Esc
    const onClose = () => { if (!d.open) finish(false); }; // ignore stale close events after a re-open

    d.addEventListener('click', onClick);
    d.addEventListener('cancel', onCancel);
    d.addEventListener('close', onClose);
    if (!d.open) d.showModal();
    (d.querySelector('[data-ui="confirm"]') || d).focus();
  });
}

/** Non-dismissible progress dialog: { update({title,text,step}), close() } */
export function progress({ title = '', text = '', step = 1, steps = 3 } = {}) {
  const d = host();
  const state = { title, text, step, steps };
  const draw = () => { d.innerHTML = markup({ icon: 'loading', ...state }); };
  const block = (e) => e.preventDefault();
  d.addEventListener('cancel', block);
  draw();
  if (!d.open) d.showModal();
  d.focus();
  return {
    update(patch) { Object.assign(state, patch); draw(); },
    close() { d.removeEventListener('cancel', block); if (d.open) d.close(); },
  };
}
