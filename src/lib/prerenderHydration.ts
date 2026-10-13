/**
 * Whether the current page load arrived with build-time-prerendered React
 * markup already in `#root` (see scripts/seo/prerender.ts /
 * scripts/generate-seo-html.ts, which set `data-prerendered="true"` only on
 * the routes it actually prerendered successfully). Computed once, at
 * module-evaluation time — before any component renders — so both
 * `src/main.tsx` (hydrateRoot vs. createRoot) and `useIsDesktop`
 * (src/lib/hooks.ts, forced-mobile-first correction) read the exact same
 * answer for this page load. Never re-evaluated: a hard reload re-imports
 * this module fresh; a client-side route change never touches it again.
 */
export const IS_PRERENDERED_HYDRATION =
  typeof document !== 'undefined' && document.getElementById('root')?.dataset.prerendered === 'true';
