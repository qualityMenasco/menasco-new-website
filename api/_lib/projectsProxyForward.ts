import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError } from './http.js';
import { PROJECTS_ADMIN_SESSION_COOKIE_NAME, verifySessionToken } from './projectsAdminProxySession.js';

/**
 * Shared body for api/projects-admin-proxy/[...path].ts AND
 * api/projects-admin-proxy/index.ts. Split out because Vercel's `[...path]`
 * catch-all route requires at least one real path segment — it never even
 * invokes that handler for a request to the bare proxy root — so the
 * Lambda's own root-level `GET/POST /api/projects` (list/create) needs a
 * SEPARATE index.ts file to be reachable at all. `segments` is `[]` for
 * that root case, exactly as `aws/projects-router.ts`'s own `pattern: '/'`
 * route already expects.
 */
export async function forwardToProjectsLambda(req: VercelRequest, res: VercelResponse, segments: string[]): Promise<void> {
  const sessionSecret = process.env.PROJECTS_ADMIN_SESSION_SECRET;
  if (!sessionSecret) {
    throw new HttpError(401, 'Projects admin proxy session signing is not configured in this environment');
  }
  const sessionToken = req.cookies[PROJECTS_ADMIN_SESSION_COOKIE_NAME];
  if (!verifySessionToken(sessionToken, sessionSecret)) {
    throw new HttpError(401, 'Not authenticated');
  }

  const lambdaAdminKey = process.env.PROJECTS_ADMIN_API_KEY;
  if (!lambdaAdminKey) {
    throw new HttpError(401, 'Projects admin API credential is not configured in this environment');
  }

  const targetBaseUrl = process.env.PROJECTS_PUBLIC_API_BASE_URL;
  if (!targetBaseUrl) {
    throw new HttpError(401, 'Projects admin proxy target is not configured in this environment');
  }

  if (segments.some((seg) => seg === '.' || seg === '..' || seg === '')) {
    throw new HttpError(400, 'Invalid path segment');
  }
  const targetPath = `/api/projects/${segments.map(encodeURIComponent).join('/')}`;

  const queryString = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue;
    if (Array.isArray(value)) value.forEach((v) => queryString.append(key, v));
    else if (value !== undefined) queryString.append(key, value);
  }
  const qs = queryString.toString();
  const targetUrl = `${targetBaseUrl.replace(/\/+$/, '')}${targetPath}${qs ? `?${qs}` : ''}`;

  const upstreamRes = await fetch(targetUrl, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'x-projects-admin-key': lambdaAdminKey,
    },
    body: req.method === 'GET' ? undefined : JSON.stringify(req.body ?? {}),
  });

  const contentType = upstreamRes.headers.get('Content-Type') ?? 'application/json';
  const text = await upstreamRes.text();
  res.status(upstreamRes.status);
  res.setHeader('Content-Type', contentType);
  res.send(text);
}
