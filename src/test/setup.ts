import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom doesn't implement matchMedia — usePrefersReducedMotion/useMediaQuery (pulled in by
// SmartLink/LocaleLink and other components) call it unconditionally on mount, so any test
// rendering those needs this polyfill rather than throwing on every render.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
}

// `globals: false` in vitest.config.ts means React Testing Library's usual
// automatic per-test cleanup isn't wired up implicitly — without this, DOM
// output from one test would still be present when the next test's
// `render()` runs, corrupting queries like `getByRole`.
afterEach(() => {
  cleanup();
});
