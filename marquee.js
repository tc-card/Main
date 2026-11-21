// marquee.js — vanilla JS port of the React <Marquee /> component.
// Motion is driven by the Web Animations API, so it needs no CSS file,
// no Tailwind config and no keyframes.

const DEFAULT_GAP = '1rem';

function toPx(value, ctxEl) {
  // Resolve any CSS length (rem, em, px…) to px so it can be used inside calc().
  const probe = document.createElement('div');
  probe.style.cssText = `position:absolute;visibility:hidden;width:${value}`;
  ctxEl.appendChild(probe);
  const px = probe.getBoundingClientRect().width;
  probe.remove();
  return px;
}

/**
 * @param {Object} opts
 * @param {Node[]|Node|string} opts.children  Content to repeat (nodes or an HTML string)
 * @param {boolean} [opts.reverse=false]
 * @param {boolean} [opts.pauseOnHover=false]
 * @param {boolean} [opts.vertical=false]
 * @param {number}  [opts.repeat=4]
 * @param {number}  [opts.duration=40]   seconds for one loop (the --duration var)
 * @param {string}  [opts.gap='1rem']    (the --gap var)
 * @param {string}  [opts.className='']
 * @param {string}  [opts.ariaLabel]
 * @param {'off'|'polite'|'assertive'} [opts.ariaLive='off']
 * @param {string}  [opts.ariaRole='marquee']
 * @returns {{ el: HTMLElement, play(): void, pause(): void, destroy(): void }}
 */
export function createMarquee({
  children,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 4,
  duration = 40,
  gap = DEFAULT_GAP,
  className = '',
  ariaLabel,
  ariaLive = 'off',
  ariaRole = 'marquee',
} = {}) {
  const root = document.createElement('div');
  root.dataset.slot = 'marquee';
  root.className = `group flex overflow-hidden p-2 ${vertical ? 'flex-col' : 'flex-row'} ${className}`.trim();
  root.style.gap = gap;
  root.setAttribute('role', ariaRole);
  root.setAttribute('aria-live', ariaLive);
  if (ariaLabel) root.setAttribute('aria-label', ariaLabel);
  root.tabIndex = 0;

  // Normalise children into a template we can clone `repeat` times
  const source = document.createElement('div');
  if (typeof children === 'string') source.innerHTML = children;
  else [].concat(children || []).forEach((n) => source.appendChild(n));

  const tracks = [];
  for (let i = 0; i < repeat; i++) {
    const track = document.createElement('div');
    track.className = `flex shrink-0 justify-around ${vertical ? 'flex-col' : 'flex-row'}`;
    track.style.gap = gap;
    track.style.willChange = 'transform';
    if (i > 0) track.setAttribute('aria-hidden', 'true');
    source.childNodes.forEach((n) => track.appendChild(n.cloneNode(true)));
    root.appendChild(track);
    tracks.push(track);
  }

  let animations = [];
  let paused = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function start() {
    animations.forEach((a) => a.cancel());
    animations = [];
    if (reduceMotion.matches) return;

    const gapPx = toPx(gap, root);
    const axis = vertical ? 'translateY' : 'translateX';
    const keyframes = [
      { transform: `${axis}(0)` },
      { transform: `${axis}(calc(-100% - ${gapPx}px))` },
    ];
    animations = tracks.map((track) =>
      track.animate(keyframes, {
        duration: duration * 1000,
        iterations: Infinity,
        easing: 'linear',
        direction: reverse ? 'reverse' : 'normal',
      })
    );
    if (paused) animations.forEach((a) => a.pause());
  }

  const play = () => { paused = false; animations.forEach((a) => a.play()); };
  const pause = () => { paused = true; animations.forEach((a) => a.pause()); };

  if (pauseOnHover) {
    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', play);
    root.addEventListener('focus', pause);
    root.addEventListener('blur', play);
  }

  // Start once attached (the gap needs layout), and restart on motion-preference change
  requestAnimationFrame(start);
  reduceMotion.addEventListener?.('change', start);

  return {
    el: root,
    play,
    pause,
    destroy() {
      animations.forEach((a) => a.cancel());
      reduceMotion.removeEventListener?.('change', start);
      root.remove();
    },
  };
}
