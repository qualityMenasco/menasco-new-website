/**
 * The single switch that decides whether THIS build/deployment is allowed
 * to be indexed — see api/_lib/launchConfig.ts for the request-time
 * (serverless-function) duplicate of this same rule and why it's a
 * duplicate, not a shared import (Node ESM extension constraint, same
 * reason as api/_lib/newsroomSeo.ts).
 *
 * Deliberately NOT inferred from the request hostname (Vercel assigns a
 * fresh *.vercel.app URL per deployment/branch, and the eventual production
 * domain itself serves every preview too during local testing) and
 * deliberately NOT "on by default once VERCEL_ENV=production" either — the
 * site has an explicit "not officially launched yet" requirement, so
 * `VERCEL_ENV=production` alone (which is simply which branch triggered the
 * build) must not be enough to start indexing by itself. Both of the
 * following must be true:
 *
 *   1. VERCEL_ENV === 'production' — Vercel's own authoritative environment
 *      classification, set automatically for the Production deployment
 *      only (never for preview/branch deployments, never for local `vercel
 *      dev`/plain `npm run build`).
 *   2. SEO_LAUNCH_INDEXING === 'true' — a project environment variable that
 *      must be deliberately set (in Vercel's dashboard, scoped to the
 *      Production environment only) at official launch time. Until someone
 *      sets this, the Production deployment itself stays noindex — the same
 *      safe default as every preview — so launch is a conscious, explicit
 *      action, never an accident of which branch happened to build.
 *
 * See the deployment instructions in the SEO audit report for exactly how
 * to flip this at launch.
 */
export function isProductionLaunch(): boolean {
  return process.env.VERCEL_ENV === 'production' && process.env.SEO_LAUNCH_INDEXING === 'true';
}

/**
 * `allowedRobotsTxt` is the real, curated production robots.txt content
 * (public/robots.txt — AI-crawler allowlist, sitemap references, etc.),
 * read and reused verbatim rather than duplicated here, so there is exactly
 * one place that policy is authored. When this build/deployment is not an
 * explicitly launched production one, every user-agent is disallowed
 * instead — the deployment stays reachable for manual/internal testing
 * (nothing here touches HTTP access), it just advertises that no crawler
 * should index or follow anything on it.
 */
export function buildRobotsTxt(allowedRobotsTxt: string, productionLaunch: boolean): string {
  if (productionLaunch) return allowedRobotsTxt;
  return `# This deployment is a staging/preview build of the MENASCO site, not the
# official launched production site — it must not be indexed.
# See scripts/seo/launchConfig.ts for how a deployment becomes "production".

User-agent: *
Disallow: /
`;
}
