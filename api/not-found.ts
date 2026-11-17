import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * GET * (wired via vercel.json's catch-all rewrite) — the generic 404 for
 * every URL that doesn't match a real static route or a dedicated
 * dynamic route (e.g. /newsroom/:slug, handled separately by
 * api/newsroom-article-page.ts with its own true-404 handling already).
 *
 * Why this exists: vercel.json's catch-all used to be a plain `rewrites`
 * entry pointing straight at the static `/404.html` file. A Vercel
 * `rewrites` destination can only ever be served with HTTP 200 — there is
 * no way to attach a different status code to it — so every genuinely
 * unknown/mistyped/unregistered path (a deleted project slug, a typo'd
 * URL, anything not in scripts/seo/routes.ts) was returning 200 OK with a
 * noindex body instead of a real 404. Search engines and other automated
 * tools that check HTTP status (not just page content) would have treated
 * that as a real, live page. Pointing the SAME rewrite at this function
 * instead keeps everything else about vercel.json unchanged (still just
 * `rewrites`, no migration to the larger, mutually-exclusive legacy
 * `routes` config) while letting a real serverless function set
 * `res.status(404)`.
 *
 * Shares the exact same built JS/CSS asset manifest
 * api/newsroom-article-page.ts uses (api/_generated/newsroomArticlePageAssets.json,
 * written by scripts/generate-seo-html.ts's postbuild step) so the SPA
 * still boots behind this shell exactly as it does behind the static
 * dist/404.html today — same title, same noindex policy, same bundle.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetManifest = JSON.parse(readFileSync(join(__dirname, '_generated/newsroomArticlePageAssets.json'), 'utf8')) as { assetTags: string };
const assetTags: string = assetManifest.assetTags;

export function buildGenericNotFoundHtml(): string {
  return `<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Not Found | MENASCO</title>
    <meta name="description" content="The page you're looking for doesn't exist." />
    <meta name="robots" content="noindex, nofollow" />
    ${assetTags}
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).setHeader('Content-Type', 'text/plain').send('Method not allowed');
    return;
  }

  res
    .status(404)
    .setHeader('Content-Type', 'text/html; charset=utf-8')
    .setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
    .setHeader('X-Robots-Tag', 'noindex, nofollow')
    .send(buildGenericNotFoundHtml());
}
