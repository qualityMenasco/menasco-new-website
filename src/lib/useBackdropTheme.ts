import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Theme } from '../types';

/** The desktop header's height (HeaderShell's `h-20`). */
const HEADER_HEIGHT = 80;
/** Relative luminance below which a background counts as dark. */
const DARK_LUMINANCE = 0.4;

function parseColor(value: string): [number, number, number, number] | null {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) return null;
  return [parts[0], parts[1], parts[2], parts[3] ?? 1];
}

function luminance([r, g, b]: [number, number, number, number]): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Theme of whatever is painted directly behind the header bar (its vertical
 * middle): walks the elements at that point (topmost first, skipping the
 * header itself) to the first one with a mostly-opaque background colour or
 * gradient, and calls it dark or light by its luminance. Images, videos and
 * canvases have no background colour, so the walk falls through them to the
 * section they sit in (e.g. a hero's dark overlay or bg-ink section). Sampling
 * behind the bar — not below it — matters for an in-flow header at the top of
 * a page: what's behind it there is the page background, and matching that
 * avoids dark glass over a light strip (which reads as grey).
 */
function sampleTheme(): Theme | null {
  const x = Math.round(window.innerWidth / 2);
  const y = Math.round(HEADER_HEIGHT / 2);
  for (const element of document.elementsFromPoint(x, y)) {
    if (element.closest('header')) continue;
    const style = getComputedStyle(element);
    // Sections painted with a gradient (e.g. About's "Engineering the Skyline"
    // band, from-ink via-charcoal) have no background colour — judge them by
    // the average luminance of the gradient's opaque colour stops.
    if (style.backgroundImage.includes('gradient(')) {
      const stops = (style.backgroundImage.match(/rgba?\([^)]+\)/g) ?? [])
        .map(parseColor)
        .filter((stop): stop is [number, number, number, number] => !!stop && stop[3] >= 0.5);
      if (stops.length) {
        const average = stops.reduce((sum, stop) => sum + luminance(stop), 0) / stops.length;
        return average < DARK_LUMINANCE ? 'dark' : 'light';
      }
    }
    const color = parseColor(style.backgroundColor);
    if (color && color[3] >= 0.5) return luminance(color) < DARK_LUMINANCE ? 'dark' : 'light';
  }
  return null;
}

/**
 * Live light/dark theme of the page content directly behind/below the
 * desktop header — the same behaviour the homepage header has, generalised so
 * every page gets it without a hand-maintained list of section themes.
 * Re-samples on scroll, resize, route change and whenever the page content
 * changes (batched to one sample per animation frame).
 */
export function useBackdropTheme(enabled = true): Theme | null {
  const { pathname } = useLocation();
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setTheme(sampleTheme()));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    // Re-sample whenever the page's content changes — lazy routes, hero
    // images and sections that render in after navigation — rather than on
    // fixed timers, which a slow load can outlast (the header would keep the
    // reading it took before the hero existed until the user scrolled).
    const contentObserver = new MutationObserver(update);
    const root = document.getElementById('root') ?? document.body;
    contentObserver.observe(root, { childList: true, subtree: true });
    const sizeObserver = new ResizeObserver(update);
    sizeObserver.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('load', update);
      contentObserver.disconnect();
      sizeObserver.disconnect();
    };
  }, [enabled, pathname]);

  return theme;
}
