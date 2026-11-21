// testimonials.js — vanilla JS port of the 3D testimonials demo
import { createMarquee } from './marquee.js';

export const TESTIMONIALS = [
  { name: 'Ava Green',   username: '@ava',  body: 'Cascade AI made my workflow 10x faster!', country: '🇦🇺 Australia', img: 'https://cdn.21st.dev/assets/mirror/55/55cf6231499bcdc496f15ff1d28d4170ac9b99e9279495caa44fca70886d8b2e.jpg' },
  { name: 'Ana Miller',  username: '@ana',  body: 'Vertical marquee is a game changer!',     country: '🇩🇪 Germany',   img: 'https://cdn.21st.dev/assets/mirror/f0/f07b84f12ef125cbb837a7bd64da401992f5f62bd55fee10d01cd3dcc8abae80.jpg' },
  { name: 'Mateo Rossi', username: '@mat',  body: 'Animations are buttery smooth!',          country: '🇮🇹 Italy',     img: 'https://cdn.21st.dev/assets/mirror/7c/7c0d2aa99715b15c218385f5679347782843c02f939d8eee6f9cb1cad6ba6ed0.jpg' },
  { name: 'Maya Patel',  username: '@maya', body: 'Setup was a breeze!',                     country: '🇮🇳 India',     img: 'https://cdn.21st.dev/assets/mirror/f8/f8f2ddc445b6b2318430260bdebb665c9415865827230565aa42f57c9c794baf.jpg' },
  { name: 'Noah Smith',  username: '@noah', body: 'Best marquee component!',                 country: '🇺🇸 USA',       img: 'https://cdn.21st.dev/assets/mirror/ae/ae1d49872fdd6f8d9aa933f6ca8bce8cb1ba7e87dfb9d2926661184cb7bfe26d.jpg' },
  { name: 'Lucas Stone', username: '@luc',  body: 'Very customizable and smooth.',           country: '🇫🇷 France',    img: 'https://cdn.21st.dev/assets/mirror/9a/9aac54d62e727561f6958213b8a3649230a3bba61ba5ddf63c69d3c6e4aecb0a.jpg' },
  { name: 'Haruto Sato', username: '@haru', body: 'Impressive performance on mobile!',       country: '🇯🇵 Japan',     img: 'https://cdn.21st.dev/assets/mirror/e5/e55f3cdab57eb4084f7006cfe9f7f047e638e1b257a53498aaed14b83087152a.jpg' },
  { name: 'Emma Lee',    username: '@emma', body: 'Love the pause on hover feature!',        country: '🇨🇦 Canada',    img: 'https://cdn.21st.dev/assets/mirror/03/03410c155320ba33ecb8d798807c6c9610f33b2b2acdd4ed961a68185806df79.jpg' },
  { name: 'Carlos Ray',  username: '@carl', body: 'Great for testimonials and logos.',       country: '🇪🇸 Spain',     img: 'https://cdn.21st.dev/assets/mirror/b5/b58616f0d669595c9a42d60a0b9803364c9859f1c3db93a5e3dc408b603e03e8.jpg' },
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text; // textContent = no HTML injection
  return node;
}

export function TestimonialCard({ img, name, username, body, country }) {
  const card = el('figure', 'w-52 shrink-0 rounded-xl bg-gradient-to-b from-white/10 to-white/[0.03] p-4');

  const row = el('div', 'flex items-center gap-2.5');

  // Avatar with initial fallback (AvatarFallback behaviour)
  const avatar = el('span', 'relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-medium text-white', name[0]);
  const image = el('img', 'absolute inset-0 h-full w-full object-cover');
  image.src = img;
  image.alt = name;
  image.loading = 'lazy';
  image.addEventListener('error', () => image.remove());
  avatar.appendChild(image);

  const meta = el('div', 'flex min-w-0 flex-col');
  const caption = el('figcaption', 'flex items-center gap-1 text-sm font-medium text-white', name + ' ');
  caption.appendChild(el('span', 'text-xs font-normal text-zinc-400', country));
  meta.append(caption, el('p', 'text-xs font-medium text-zinc-500', username));

  row.append(avatar, meta);
  card.append(row, el('blockquote', 'mt-3 text-sm text-zinc-300', body));
  return card;
}

export function mountTestimonials3D(container, items = TESTIMONIALS) {
  if (!container) return;
  container.innerHTML = '';

  // Tilted 3D plane
  const plane = el('div', 'flex flex-row items-center gap-4');
  plane.style.transform =
    'translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)';

  // 3 columns on phones, 4 elsewhere (down, up, down, up)
  const columns = matchMedia('(max-width: 639px)').matches ? [false, true, false] : [false, true, false, true];
  const marquees = [];
  columns.forEach((reverse) => {
    const marquee = createMarquee({
      vertical: true,
      pauseOnHover: true,
      reverse,
      repeat: 2,
      duration: 40,
      children: items.map(TestimonialCard),
    });
    marquees.push(marquee);
    plane.appendChild(marquee.el);
  });

  container.append(plane);

  // Only animate while the block is on screen
  new IntersectionObserver(([entry]) => {
    marquees.forEach((m) => (entry.isIntersecting ? m.play() : m.pause()));
  }).observe(container);
}

document.addEventListener('DOMContentLoaded', () => {
  mountTestimonials3D(document.getElementById('testimonials-3d'));
});