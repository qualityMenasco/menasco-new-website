import { useEffect, useLayoutEffect, useState } from 'react';
import { IS_PRERENDERED_HYDRATION } from './prerenderHydration';

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

/**
 * On a page that arrived with prerendered markup, the prerender always
 * rendered the mobile tree (scripts/seo/prerender.ts — `window` is
 * undefined at build time, so this same hook already resolves `false`
 * there). `hydrateRoot` (src/main.tsx) requires the client's first render to
 * match that server markup exactly, so this hook's FIRST render must also
 * resolve `false` here even on a real desktop browser where
 * `window.matchMedia` would otherwise immediately say `true` — a plain
 * value mismatch converts cleanly to a client re-render, but doing that
 * inside a `lazy()`/Suspense boundary is what caused the original bug
 * (see scripts/seo/prerender.ts's module comment). Once mounted, a
 * `useLayoutEffect` corrects to the real viewport BEFORE the browser
 * paints (not a passive `useEffect`, which would paint the wrong tree
 * first) — same tool RootLayout's own `useScrollOnRouteChange` already
 * uses to avoid a visible jump. Non-prerendered routes are completely
 * unaffected: `IS_PRERENDERED_HYDRATION` is `false` for them, so this hook
 * resolves the real value immediately, exactly as before this change.
 *
 * `settled` additionally reports whether that one-time correction has
 * already happened (always `true` for non-prerendered routes, and
 * immediately after the very first paint for prerendered ones) —
 * RootLayout uses it to know when it's safe to stop rendering BOTH shells
 * (see `useIsDesktopSettled` below and RootLayout's own comment for why a
 * value-mismatch alone wasn't enough to prevent a visible mobile-chrome
 * flash on a real desktop browser).
 */
function useIsDesktopInternal(): { matches: boolean; settled: boolean } {
  const [matches, setMatches] = useState(
    () => !IS_PRERENDERED_HYDRATION && typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches,
  );
  // Unsettled (renders both shells) in two cases that must produce IDENTICAL
  // output for hydration to match: server-side prerendering itself
  // (`typeof window === 'undefined'` — scripts/seo/prerender.ts has no
  // `IS_PRERENDERED_HYDRATION` concept at all, it's always "unsettled" by
  // definition, which is exactly right: the static HTML should ship both
  // shells so any device's CSS picks the right one immediately), and the
  // client's first hydration pass against that same prerendered markup.
  // Everywhere else (a normal client load, prerendered or not, once
  // `window` exists and this isn't the very first hydration pass) starts
  // settled — zero extra cost, single-branch render from the start.
  const [settled, setSettled] = useState(() => typeof window !== 'undefined' && !IS_PRERENDERED_HYDRATION);

  useLayoutEffect(() => {
    if (!IS_PRERENDERED_HYDRATION) return;
    const real = window.matchMedia(DESKTOP_QUERY).matches;
    if (real !== matches) setMatches(real);
    setSettled(true);
    // Intentionally only ever runs this correction once, on mount — ongoing
    // resize tracking below (useMediaQuery's own effect) takes over from here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    setMatches(mql.matches);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, []);

  return { matches, settled };
}

export function useIsDesktop(): boolean {
  return useIsDesktopInternal().matches;
}

/**
 * Like `useIsDesktop`, but also reports `settled` — see
 * `useIsDesktopInternal`'s doc comment. Only `RootLayout` needs this: it's
 * the one place that must render differently (both shells at once, briefly)
 * during the one-paint window before a prerendered desktop load's viewport
 * correction has run.
 */
export function useIsDesktopSettled(): { isDesktop: boolean; settled: boolean } {
  const { matches, settled } = useIsDesktopInternal();
  return { isDesktop: matches, settled };
}
