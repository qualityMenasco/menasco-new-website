import { useEffect, useState } from 'react';

/** Respects the OS-level reduced-motion preference; defaults to `false` on the server. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);

  return reduced;
}

/** Tracks a CSS media query, e.g. `useMediaQuery('(min-width: 1025px)')`. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * The single desktop/mobile breakpoint for the whole app — anything above
 * 1024px renders the desktop implementation, 1024px and below renders
 * mobile. Both the route-level responsive switch (src/app/router.tsx) and
 * the header/footer shell switch (src/app/RootLayout.tsx) read this same
 * constant via `useIsDesktop()` so they always agree with each other and
 * with the actual viewport.
 */
export const DESKTOP_QUERY = '(min-width: 1025px)';

export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY);
}
