import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireMethod, sendJson, withErrorHandling } from '../_lib/http.js';
import { buildExpiredSessionCookie } from '../_lib/adminProxySession.js';

/** POST /api/newsroom-admin-proxy/logout — clears the session cookie. No auth required to call this (logging out never needs to prove you were logged in). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'POST');
    res.setHeader('Set-Cookie', buildExpiredSessionCookie());
    sendJson(res, 200, { ok: true });
  });
}
