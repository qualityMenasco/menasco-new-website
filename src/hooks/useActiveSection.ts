import { useEffect, useState } from 'react';

const MAX_SETUP_ATTEMPTS = 60; // ~1s at 60fps — generous for a lazy-loaded route chunk to render

/**
 * Scrollspy via IntersectionObserver — watches a set of section ids and
 * reports whichever one currently sits in a thin band just above viewport
 * centre. Pass `enabled: false` to tear down observation entirely (e.g. when
 * not on the page that owns these sections).
 *
 * The target elements often don't exist yet on the first render (the header
 * that calls this mounts before a lazy-loaded route's sections do), so setup
 * retries across a few animation frames rather than giving up immediately.
 */
export function useActiveSection(
  sectionIds: string[],
  enabled: boolean,
  rootMargin: string = '-35% 0px -55% 0px',
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || sectionIds.length === 0) {
      setActiveId(null);
      return;
    }

    let observer: IntersectionObserver | null = null;
    let frameId: number | null = null;
    let attempts = 0;

    const trySetup = () => {
      const elements = sectionIds
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element !== null);

      if (elements.length === 0) {
        attempts += 1;
        if (attempts < MAX_SETUP_ATTEMPTS) frameId = requestAnimationFrame(trySetup);
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveId(entry.target.id);
          });
        },
        { rootMargin, threshold: 0 },
      );
      elements.forEach((element) => observer?.observe(element));
    };

    trySetup();

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      observer?.disconnect();
    };
  }, [enabled, sectionIds.join('|'), rootMargin]);

  return activeId;
}
