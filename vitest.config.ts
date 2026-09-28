import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/** Minimal Vitest setup — jsdom environment + React plugin only, no extra tooling beyond what's needed to render components and assert on real DOM output. */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
  },
});
