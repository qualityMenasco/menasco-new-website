import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireMethod, sendJson, withErrorHandling } from '../http.js';
import { buildExpiredSessionCookie } from '../projectsCmsSession.js';

/** POST /api/projects-cms/logout — clears the session cookie. No auth required. */
export async function handleLogout(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'POST');
    res.setHeader('Set-Cookie', buildExpiredSessionCookie());
    sendJson(res, 200, { ok: true });
  });
}
