import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
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

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
