import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../_lib/http.js';
import { createSessionToken, buildSessionCookie } from '../_lib/adminProxySession.js';

/**
 * POST /api/newsroom-admin-proxy/login — the ONLY place the admin proxy
 * password is ever checked. On success, issues an HttpOnly session cookie
 * and nothing else — the response body never contains the real
 * `NEWSROOM_ADMIN_API_KEY`, which this function doesn't even need to read.
 *
 * Three distinct secrets, three distinct jobs, never conflated:
 * `NEWSROOM_ADMIN_PROXY_PASSWORD` is the only credential a human admin
 * ever types into the browser (checked here, and only here);
 * `NEWSROOM_ADMIN_SESSION_SECRET` signs/verifies the session cookie this
 * function issues; `NEWSROOM_ADMIN_API_KEY` — the real Lambda credential —
 * is never read by this function at all, so a bug here can never leak it.
 * Each can be rotated independently (e.g. a leaked session secret doesn't
 * require rotating the Lambda's own key, and vice versa).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'POST');

    const expectedPassword = process.env.NEWSROOM_ADMIN_PROXY_PASSWORD;
    if (!expectedPassword) {
      // Fail closed — same philosophy as api/_lib/auth.ts: no configured credential means no access, in every environment, never a silent bypass.
      throw new HttpError(401, 'Newsroom admin proxy is not configured in this environment');
    }

    const body = requireJsonBody(req);
    const password = body.password;
    if (typeof password !== 'string' || password.length === 0 || password !== expectedPassword) {
      throw new HttpError(401, 'Incorrect password');
    }

    const sessionSecret = process.env.NEWSROOM_ADMIN_SESSION_SECRET;
    if (!sessionSecret) {
      throw new HttpError(401, 'Newsroom admin proxy session signing is not configured in this environment');
    }

    const token = createSessionToken(sessionSecret);
    res.setHeader('Set-Cookie', buildSessionCookie(token));
    sendJson(res, 200, { ok: true });
  });
}
