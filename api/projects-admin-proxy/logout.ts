import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireMethod, sendJson, withErrorHandling } from '../_lib/http.js';
import { buildExpiredSessionCookie } from '../_lib/projectsAdminProxySession.js';

/** POST /api/projects-admin-proxy/logout — clears the session cookie. No auth required. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'POST');
    res.setHeader('Set-Cookie', buildExpiredSessionCookie());
    sendJson(res, 200, { ok: true });
  });
}
