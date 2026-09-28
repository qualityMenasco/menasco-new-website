import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireMethod, withErrorHandling } from '../_lib/http.js';
import { forwardToProjectsLambda } from '../_lib/projectsProxyForward.js';

/**
 * GET/POST /api/projects-admin-proxy — the bare proxy root, for
 * list/create (aws/projects-router.ts's own `pattern: '/'` route). Vercel's
 * `[...path]` catch-all in this same directory requires at least one real
 * path segment and is never invoked for a request to the directory's own
 * base path — this file is what makes that base path reachable at all,
 * forwarding with an empty segment list (which projectsProxyForward.ts
 * turns into the Lambda's own `/api/projects/` root path, exactly matching
 * aws/projects-lambda.ts's `path = rawPath.replace(...) || '/'` fallback).
 *
 * Newsroom's equivalent proxy never needed this: every Newsroom admin
 * endpoint has a real path segment (e.g. /articles), so its list/create
 * lives at api/newsroom-admin-proxy/articles, never at the bare root.
 * Projects deliberately put list/create at the Lambda's own root instead
 * (aws/projects-router.ts's `pattern: '/'`), which is what surfaces this
 * Vercel routing gap — discovered during live Phase 4 acceptance testing,
 * fixed here as a targeted addition rather than restructuring the Lambda's
 * own route table to avoid a root-level route.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, ['GET', 'POST']);
    await forwardToProjectsLambda(req, res, []);
  });
}
