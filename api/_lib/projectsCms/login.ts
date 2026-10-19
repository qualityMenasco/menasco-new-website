import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../http.js';
import { createSessionToken, buildSessionCookie, timingSafeStringEqual } from '../projectsCmsSession.js';

/**
 * POST /api/projects-cms/login — password check against
 * PROJECTS_CMS_ADMIN_PASSWORD, then issues a signed `projects_cms_session`
 * cookie. Independent system from api/projects-admin-proxy/login.ts (old,
 * dormant RDS-backed admin) — separate password env var, separate secret,
 * separate cookie name.
 */
export async function handleLogin(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'POST');

    const expectedPassword = process.env.PROJECTS_CMS_ADMIN_PASSWORD;
    if (!expectedPassword) {
      throw new HttpError(401, 'Projects CMS is not configured in this environment');
    }

    const body = requireJsonBody(req);
    const password = body.password;
    if (typeof password !== 'string' || password.length === 0 || !timingSafeStringEqual(password, expectedPassword)) {
      throw new HttpError(401, 'Incorrect password');
    }

    const sessionSecret = process.env.PROJECTS_CMS_SESSION_SECRET;
    if (!sessionSecret) {
      throw new HttpError(401, 'Projects CMS session signing is not configured in this environment');
    }

    const token = createSessionToken(sessionSecret);
    res.setHeader('Set-Cookie', buildSessionCookie(token));
    sendJson(res, 200, { ok: true });
  });
}
