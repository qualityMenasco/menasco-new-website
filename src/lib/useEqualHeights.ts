import { useEffect, useRef } from 'react';

/**
 * Gives the registered elements the same min-height (the tallest one's) while they sit side by
 * side in one row, so cards in a top-aligned grid line up without stretching to each other's
 * height. Then only the card whose content grows (e.g. an opened "Read more") gets taller.
 * Re-measured when the container's width changes and once fonts have loaded; stacked (one per
 * row) elements are left at their natural height.
 */
export function useEqualHeights<T extends HTMLElement>() {
  const container = useRef<HTMLDivElement | null>(null);
  const items = useRef<(T | null)[]>([]);

  useEffect(() => {
    const box = container.current;
    if (!box) return;
    let lastWidth = -1;
    const measure = (force = false) => {
      const width = box.clientWidth;
      if (!force && width === lastWidth) return;
      lastWidth = width;
      const els = items.current.filter((el): el is T => Boolean(el));
      els.forEach((el) => {
        el.style.minHeight = '';
      });
      const rows = new Set(els.map((el) => Math.round(el.getBoundingClientRect().top)));
      if (els.length < 2 || rows.size > 1) return;
      const tallest = Math.max(...els.map((el) => el.getBoundingClientRect().height));
      els.forEach((el) => {
        el.style.minHeight = `${Math.ceil(tallest)}px`;
      });
    };
    measure(true);
    document.fonts?.ready.then(() => measure(true)).catch(() => {});
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  return { container, items };
}
