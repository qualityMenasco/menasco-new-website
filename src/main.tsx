import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { IS_PRERENDERED_HYDRATION } from './lib/prerenderHydration';
import './styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// The browser's own scroll restoration fights RootLayout's scroll-on-route-
// change effect (the app's deliberate single source of truth for scroll
// position) — on some client-side navigations it re-applies the previous
// page's scroll offset moments after we reset to top, which was landing
// scroll-driven pages (e.g. the Vela cinematic project page) mid-animation
// instead of at frame 1. Ceding restoration to the browser only ever made
// sense before RootLayout owned this; now it's redundant and actively harmful.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Recover from a stale build. After a deploy, a page loaded from the previous
// build still references that build's hashed chunks, which no longer exist —
// loading one fails and the app would crash. Vite fires `vite:preloadError`
// when a lazy chunk can't load; reload once to pick up the current build. The
// timestamp guard stops a reload loop if the failure persists for another
// reason (e.g. the network is down).
window.addEventListener('vite:preloadError', (event) => {
  const key = 'menasco:stale-build-reload';
  const last = Number(sessionStorage.getItem(key) ?? 0);
  if (Date.now() - last < 10_000) return;
  sessionStorage.setItem(key, String(Date.now()));
  event.preventDefault();
  window.location.reload();
});

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Build-time prerendering (scripts/seo/prerender.ts) fills `#root` with
// real markup for a deliberately small set of routes, marked with
// `data-prerendered="true"` (scripts/generate-seo-html.ts). For exactly
// those loads, `hydrateRoot` reuses that markup instead of discarding and
// re-rendering it — the discard was what produced a visible blank/skeleton
// flash while the route's JS chunk was still downloading (see
// scripts/seo/prerender.ts's module comment for the full history). Every
// other route keeps today's plain `createRoot`, completely unaffected.
if (IS_PRERENDERED_HYDRATION) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
