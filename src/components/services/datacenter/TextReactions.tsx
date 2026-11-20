import { useEffect, type RefObject } from 'react';

/**
 * Text reactions for the Data Center technical page (design rules: header of
 * src/pages/DataCenterPage.tsx).
 *
 * There are NO animated lines/paths (the client removed the travel paths on
 * 2026-11-20). Only the effect on the text remains: when a target scrolls
 * into view, it reacts. Effects follow the client's "physical + system"
 * direction (realistic, restrained tones, with a unique wow factor):
 *
 * ELEMENT VOCABULARY — what the client means by each word:
 *   "electricity" / "power" / "lightning"  -> kind 'power' -> ENERGISE
 *        a bright filament edge sweeps through the letters, warm bloom (CSS)
 *   "water" / "cooling" / "rain" / "flood" -> kind 'water' -> LIQUID FILL
 *        blue liquid rises with a moving wave surface and meniscus (CSS)
 *   "data" / "digital" / "binary"          -> kind 'data'  -> DECODE
 *        letters scramble through 0/1 and resolve left to right (JS here)
 *   "heat" / "thermal"                     -> kind 'heat'  -> THERMAL
 *        a thermal-camera gradient passes through with a faint haze (CSS + SVG filter)
 *
 * Usage: wrap the words in <span data-flow-target="power|water|data|heat">
 * (the `T` helper in DataCenterPage). Add `data-flow-hero` for hero title
 * words: they react one after another on page entry (HERO_START_MS, then one
 * every HERO_GAP_MS), ONCE per page load/refresh, and then stay lit. Scrolling
 * never triggers or replays them (client request 2026-11-20). To change which
 * text reacts, or with which element, only move/change these attributes.
 *
 * Timing: a target reacts as its top passes ~80% down the viewport (just as
 * it comes into view) and stays "lit" while on screen; it resets when it
 * leaves, so it reacts again on the next pass. Reduced motion (e.g. iOS
 * "Reduce Motion"): no movement, but each reaction shows as a still colour state.
 * Overlays are ::after copies (data-text / data-decode) so the real text
 * always stays in the DOM for search and screen readers.
 */

/** Element colours (also used for small accents such as the power-list icons). */
export const ELEMENT_COLORS = { power: '#E9B23A', water: '#3B9EE6', data: '#3DBE7A', heat: '#E0765C' } as const;

const GLYPHS = '01';
/** Hero words on page entry: first reaction after HERO_START_MS, then one every HERO_GAP_MS. */
const HERO_START_MS = 300;
const HERO_GAP_MS = 620;
/** Decode duration: slow enough to read as a system resolving, not a flicker. */
const DECODE_MS = 2200;
/** Hero title decode ("Uptime"): much quicker than in-page decodes (client request). */
const HERO_DECODE_MS = 760;
/** Each scrambled character holds for this long before changing. */
const GLYPH_HOLD_MS = 110;

/** Scrambles the overlay text and resolves it left to right. Returns a cancel function. */
function decode(el: HTMLElement, durationMs = DECODE_MS): () => void {
  const text = el.textContent ?? '';
  let raf = 0;
  let lastSwap = -Infinity;
  let glyphs: string[] = [];
  const start = performance.now();
  el.classList.add('dc-decoding');
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const resolved = Math.floor(t * text.length);
    if (now - lastSwap >= GLYPH_HOLD_MS) {
      glyphs = [...text].map(() => GLYPHS[(Math.random() * GLYPHS.length) | 0]);
      lastSwap = now;
    }
    // Exactly one output character per original character; only letters/digits are
    // scrambled (spaces and punctuation stay), so the decode is never longer than the word.
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      out += i < resolved || !/[A-Za-z0-9]/.test(ch) ? ch : glyphs[i];
    }
    el.dataset.decode = out;
    if (t < 1) raf = requestAnimationFrame(step);
    else finish();
  };
  const finish = () => {
    cancelAnimationFrame(raf);
    el.classList.remove('dc-decoding');
    delete el.dataset.decode;
  };
  raf = requestAnimationFrame(step);
  return finish;
}

/** Adds the SVG turbulence filter used by the heat-haze effect (once per page). */
function ensureHazeFilter() {
  if (document.getElementById('dc-heat-haze')) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML =
    '<filter id="dc-heat-haze" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.03" numOctaves="1" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6"/></filter>';
  document.body.appendChild(svg);
}

export function TextReactions({ containerRef }: { containerRef: RefObject<HTMLElement> }) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    // Reduced motion: reactions still show, as still colour states (index.css), without the decode scramble.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ensureHazeFilter();
    const targets = [...root.querySelectorAll<HTMLElement>('[data-flow-target]')];
    targets.forEach((el) => {
      el.style.setProperty('--dc-ink', getComputedStyle(el).color);
      if (el.dataset.flowTarget !== 'data') el.dataset.text = el.textContent ?? '';
    });

    const hero = targets.filter((el) => el.hasAttribute('data-flow-hero'));
    // Hero words: lit once their timed slot in the entry sequence has passed, then
    // stay lit for the rest of the visit (only a page load/refresh plays it again).
    const heroReady = new Set<HTMLElement>();
    const heroTimers = hero.map((el, k) =>
      window.setTimeout(() => {
        heroReady.add(el);
        update();
      }, reduced ? 0 : HERO_START_MS + k * HERO_GAP_MS),
    );
    const cancels = new Map<HTMLElement, () => void>();
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        const k = hero.indexOf(el);
        // Words inside a hidden panel (e.g. the inactive cooling comparison) stay unlit until
        // that panel is shown, so their animation starts when the visitor switches to it.
        const hidden = !!el.closest('[inert], [aria-hidden="true"]');
        const lit = k >= 0 ? heroReady.has(el) : !hidden && r.top < 0.8 * vh && r.bottom > 0.1 * vh;
        const kind = el.dataset.flowTarget!;
        if (lit && el.dataset.lit !== kind) {
          el.dataset.lit = kind;
          if (kind === 'data' && !reduced) cancels.set(el, decode(el, k >= 0 ? HERO_DECODE_MS : DECODE_MS));
        } else if (!lit && el.dataset.lit) {
          delete el.dataset.lit;
          cancels.get(el)?.();
          cancels.delete(el);
        }
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    // Re-check when a panel is shown or hidden (tab/toggle switches don't scroll the page).
    const panels = new MutationObserver(onScroll);
    panels.observe(root, { subtree: true, attributes: true, attributeFilter: ['inert', 'aria-hidden'] });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      panels.disconnect();
      cancelAnimationFrame(frame);
      heroTimers.forEach(clearTimeout);
      cancels.forEach((c) => c());
      targets.forEach((el) => delete el.dataset.lit);
    };
  }, [containerRef]);
  return null;
}
