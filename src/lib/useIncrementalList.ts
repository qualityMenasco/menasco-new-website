import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  /** Items rendered on first paint (and again whenever `resetKey` changes). */
  initial?: number;
  /** Items added per batch. */
  step?: number;
  /** How far before the end of the list the next batch starts rendering. */
  rootMargin?: string;
}

/**
 * Renders a long list in batches so a page with 100+ cards only builds (and
 * downloads images for) the first few on load. Attach `sentinelRef` to an
 * element after the list: when it comes within `rootMargin` of the viewport the
 * next batch renders, and keeps rendering while the sentinel stays in range.
 * `showMore` backs a visible button for keyboard users and browsers without
 * IntersectionObserver. Changing `resetKey` (e.g. a new filter) starts over.
 */
export function useIncrementalList(total: number, resetKey: unknown, { initial = 12, step = 12, rootMargin = '400px 0px' }: Options = {}) {
  const [count, setCount] = useState(initial);
  const [lastKey, setLastKey] = useState(resetKey);
  // Reset during render when the key changes (React's "adjust state on prop change" pattern).
  if (lastKey !== resetKey) {
    setLastKey(resetKey);
    setCount(initial);
  }
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const showMore = useCallback(() => setCount((current) => Math.min(total, current + step)), [total, step]);
  const shown = Math.min(count, total);
  const done = shown >= total;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || done || typeof IntersectionObserver === 'undefined') return;
    // Re-created after every batch: if the sentinel is still in range, the new
    // observer reports it immediately and the next batch follows.
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && showMore(), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [done, shown, showMore, rootMargin]);

  return { shown, done, showMore, sentinelRef };
}
