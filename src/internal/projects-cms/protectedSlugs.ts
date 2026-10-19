/**
 * The only two slugs the owner confirmed are protected — hardcoded per the
 * CMS brief, never derived or user-settable. Split into its own
 * zero-dependency module (no `node:fs`/`node:path`) so the CLIENT-side admin
 * UI (ProjectsCmsPage.tsx) can import this plain value without pulling
 * validateProjectUpload.ts's Node-only `existsSync` image-path check into
 * the Vite browser bundle — that exact mistake broke the production build
 * (Rollup: "existsSync" is not exported by "__vite-browser-external").
 */
export const PROTECTED_SLUGS: ReadonlySet<string> = new Set(['vela-by-omniyat', 'qiddiya']);
