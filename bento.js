// bento.js — vanilla JS port of <BentoGridShowcase />
// Same 6-slot layout as the React version. framer-motion's staggered spring
// entrance is replaced by the Web Animations API (no library, no CSS file).

const SLOT_LAYOUT = [
  ['integration',  'sm:col-span-2 lg:col-span-1 lg:row-span-3'], // tall card
  ['trackers', 'lg:col-span-1 lg:row-span-1'],
  ['statistic', 'lg:col-span-1 lg:row-span-1'],
  ['focus', 'lg:col-span-1 lg:row-span-1'],
  ['productivity', 'lg:col-span-1 lg:row-span-1'],
  ['shortcuts',    'sm:col-span-2 lg:col-span-2 lg:row-span-1'], // wide bottom card
];

const STAGGER = 100;      // staggerChildren: 0.1
const FIRST_DELAY = 100;  // delayChildren: 0.1
// cubic-bezier with a small overshoot, close to the original spring (stiffness 100, damping 10)
const SPRING_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

function fill(target, content) {
  if (content == null) return;
  if (typeof content === 'string') target.innerHTML = content;
  else target.appendChild(content);
}

function reveal(items) {
  items.forEach((item, i) => {
    const anim = item.animate(
      [
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 700, delay: FIRST_DELAY + i * STAGGER, easing: SPRING_EASING, fill: 'both' }
    );
    anim.finished
      .then(() => { anim.cancel(); item.style.opacity = ''; })
      .catch(() => { item.style.opacity = ''; });
  });
}

/**
 * @param {Object} slots
 * @param {Node|string} slots.integration   tall card (spans 3 rows)
 * @param {Node|string} slots.trackers      top-middle
 * @param {Node|string} slots.statistic     top-right
 * @param {Node|string} slots.focus         middle-middle
 * @param {Node|string} slots.productivity  middle-right
 * @param {Node|string} slots.shortcuts     wide bottom card (spans 2 cols)
 * @param {string} [slots.className]        extra classes for the grid
 * @returns {HTMLElement}
 */
export function BentoGridShowcase({ className = '', ...slots } = {}) {
  const grid = document.createElement('section');
  grid.dataset.slot = 'bento-grid';
  grid.className = [
    // 1 col on phones, 2 on tablets, 3 on desktop
    'grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3',
    // 3 explicit rows on desktop
    'lg:grid-rows-3',
    // cards can grow but keep a minimum height
    'auto-rows-[minmax(180px,auto)]',
    className,
  ].join(' ').trim();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canObserve = 'IntersectionObserver' in window && typeof Element.prototype.animate === 'function';
  const animate = !reduceMotion && canObserve;

  const items = SLOT_LAYOUT.map(([key, span]) => {
    const item = document.createElement('div');
    item.className = `flex flex-col ${span} [&>*]:flex-1`;
    if (animate) item.style.opacity = '0'; // "hidden" variant
    fill(item, slots[key]);
    grid.appendChild(item);
    return item;
  });

  if (animate) {
    // Play the "visible" variant once the grid scrolls into view
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      reveal(items);
    }, { threshold: 0.1 });
    io.observe(grid);
  }

  return grid;
}

/** Replace a container's contents with a bento grid. */
export function mountBento(container, slots) {
  if (!container) return null;
  const grid = BentoGridShowcase(slots);
  container.replaceChildren(grid);
  return grid;
}
