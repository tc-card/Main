// faq.js — accessible accordion, rendered from the FAQS list below.
// Edit questions/answers here. No library, no CSS file: the open/close animation
// is a Tailwind grid-rows transition (0fr -> 1fr), which is cheap on phones.

const FAQS = [
  {
    q: 'How much does a TCcard order cost?',
    a: 'Basic is one payment of 85 TND: 35 TND for your NFC card with delivery, plus 50 TND for your first year. Two years is 115 TND. Standard is 95 TND for the card and first year, then 60 TND a year. You can pay cash on delivery.',
  },
  {
    q: 'Can I pay cash on delivery?',
    a: 'Yes. We confirm your order with you before dispatch, and you pay the courier when your TCcard arrives.',
  },
  {
    q: 'What is an NFC card?',
    a: 'An NFC card is a smart, contactless card that shares your contact details or profile when tapped on a smartphone. No app or special setup needed.',
  },
  {
    q: 'How does the NFC card work?',
    a: 'Tap your card on any NFC-compatible smartphone. Your digital profile opens in their browser, with no downloads or setup.',
  },
  {
    q: "What if someone's phone has no NFC?",
    a: 'Your card also carries a QR code. They scan it with the camera and your profile opens in the browser.',
  },
  {
    q: 'Can I update my profile after ordering?',
    a: 'Yes. Edit your profile anytime at <a class="text-blue-300 underline-offset-4 hover:underline" href="https://edit.tccards.tn">edit.tccards.tn</a>. Updating is available on paid plans, and changes show up on the same card.',
  },
  {
    q: 'What happens when my plan ends?',
    a: 'Nothing is charged automatically. We remind you 30 and 7 days before your plan ends, and you have a 30-day grace period to renew: 50 TND a year on Basic, 60 TND on Standard, by bank transfer or cash.',
  },
  {
    q: 'Can I try it before I buy a card?',
    a: 'Yes. The free digital profile has no physical card and gives you 30 days of access.',
  },
  {
    q: 'Do you offer cards for teams?',
    a: 'Yes. The Enterprise plan covers bulk cards, team management and company branding. <a class="text-blue-300 underline-offset-4 hover:underline" href="/plans/enterprise/">Contact us</a> to get started.',
  },
  {
    q: 'Is my information safe?',
    a: 'Yes. Your data is protected with encryption. You control what you share, and you can update it anytime (updating is available on paid plans).',
  },
];

const PLUS = `<svg class="faq-icon h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 motion-reduce:transition-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`;

function itemHtml({ q, a }, i) {
  return `
    <div class="faq-item rounded-2xl border border-white/10 bg-white/[0.04] transition-colors duration-300" data-open="false">
      <h3>
        <button type="button" id="faq-q-${i}" aria-expanded="false" aria-controls="faq-a-${i}"
                class="faq-btn flex min-h-[3.5rem] w-full items-center justify-between gap-4 rounded-2xl p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:p-5">
          <span class="text-base font-semibold text-white sm:text-lg">${q}</span>
          ${PLUS}
        </button>
      </h3>
      <div id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}"
           class="faq-panel grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none">
        <div class="overflow-hidden" inert>
          <p class="px-4 pb-4 text-sm leading-relaxed text-gray-300 sm:px-5 sm:pb-5 sm:text-base">${a}</p>
        </div>
      </div>
    </div>`;
}

function setOpen(item, open) {
  item.dataset.open = String(open);
  item.classList.toggle('bg-white/[0.08]', open);
  item.querySelector('.faq-btn').setAttribute('aria-expanded', String(open));
  item.querySelector('.faq-icon').classList.toggle('rotate-45', open);
  const panel = item.querySelector('.faq-panel');
  panel.classList.toggle('grid-rows-[0fr]', !open);
  panel.classList.toggle('grid-rows-[1fr]', open);
  panel.firstElementChild.inert = !open; // keeps links in closed answers out of the tab order
}

export function mountFaq(list, items = FAQS) {
  if (!list) return;
  list.innerHTML = items.map(itemHtml).join('');

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-btn');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    const willOpen = item.dataset.open !== 'true';
    list.querySelectorAll('.faq-item[data-open="true"]').forEach((other) => {
      if (other !== item) setOpen(other, false); // one answer open at a time
    });
    setOpen(item, willOpen);
  });

  // Arrow keys / Home / End move between questions
  list.addEventListener('keydown', (e) => {
    const btn = e.target.closest('.faq-btn');
    if (!btn) return;
    const buttons = [...list.querySelectorAll('.faq-btn')];
    const i = buttons.indexOf(btn);
    const next = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: buttons.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    buttons[(next + buttons.length) % buttons.length].focus();
  });
}

function init() { mountFaq(document.getElementById('faq-list')); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
