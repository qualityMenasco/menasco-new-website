import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../_lib/http.js';
import { createSessionToken, buildSessionCookie } from '../_lib/projectsAdminProxySession.js';

/**
 * POST /api/projects-admin-proxy/login — mirrors
 * api/newsroom-admin-proxy/login.ts exactly, with its own separate
 * credential set: PROJECTS_ADMIN_PROXY_PASSWORD (the only secret a human
 * ever types), PROJECTS_ADMIN_SESSION_SECRET (signs the cookie this issues),
 * and PROJECTS_ADMIN_API_KEY — the real Lambda credential — which this
 * function never reads at all, so a bug here can never leak it.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'POST');

    const expectedPassword = process.env.PROJECTS_ADMIN_PROXY_PASSWORD;
    if (!expectedPassword) {
      throw new HttpError(401, 'Projects admin proxy is not configured in this environment');
    }

    const body = requireJsonBody(req);
    const password = body.password;
    if (typeof password !== 'string' || password.length === 0 || password !== expectedPassword) {
      throw new HttpError(401, 'Incorrect password');
    }

    const sessionSecret = process.env.PROJECTS_ADMIN_SESSION_SECRET;
    if (!sessionSecret) {
      throw new HttpError(401, 'Projects admin proxy session signing is not configured in this environment');
    }

    const token = createSessionToken(sessionSecret);
    res.setHeader('Set-Cookie', buildSessionCookie(token));
    sendJson(res, 200, { ok: true });
  });
}
