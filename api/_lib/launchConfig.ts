/**
 * Request-time duplicate of scripts/seo/launchConfig.ts's exact same rule —
 * see that file for the full rationale. Duplicated rather than imported for
 * the same documented reason as api/_lib/newsroomSeo.ts: Vercel's Node
 * function runtime needs real Node ESM resolution (explicit `.js`
 * extensions on every relative import, including transitive ones), which
 * the Vite/tsx-style `scripts/` tree doesn't satisfy. If this rule ever
 * changes, update both files together.
 */
export function isProductionLaunch(): boolean {
  return process.env.VERCEL_ENV === 'production' && process.env.SEO_LAUNCH_INDEXING === 'true';
}
