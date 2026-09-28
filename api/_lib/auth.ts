import type { VercelRequest } from '@vercel/node';
import { HttpError } from './http';

/**
 * Fail-closed auth guard for every Newsroom admin endpoint — no real auth
 * system exists in this repo yet (Phase 1 scope is storage/API, not
 * identity), so this is the single choke point every handler calls before
 * touching the database or S3. Swapping in real auth later means changing
 * this one function, not every endpoint.
 *
 * Two mechanisms, both must be explicitly configured to grant access —
 * there is no default "open" state:
 *
 * 1. NEWSROOM_ADMIN_API_KEY — a shared secret checked against the
 *    `x-newsroom-admin-key` request header. This is the actual Phase-1
 *    "real auth mechanism" the production deployment must configure; with
 *    it unset, every request is rejected, in every environment.
 * 2. NEWSROOM_DEV_AUTH_BYPASS=true — a local-only convenience shortcut,
 *    honored ONLY when NODE_ENV/VERCEL_ENV is not "production". Production
 *    can never accidentally become unauthenticated via this flag: the
 *    environment check is unconditional, not just "recommended".
 */
export class AuthError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

function isProductionEnvironment(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
}

export function requireNewsroomAuth(req: VercelRequest): void {
  const devBypass = process.env.NEWSROOM_DEV_AUTH_BYPASS === 'true';
  if (devBypass && !isProductionEnvironment()) return;

  const expectedKey = process.env.NEWSROOM_ADMIN_API_KEY;
  if (!expectedKey) {
    // No real auth configured. In production this must never silently pass
    // — fail closed. (Locally, use NEWSROOM_DEV_AUTH_BYPASS instead of
    // leaving this unset if you don't want to set up a key.)
    throw new AuthError('Newsroom admin API is not authenticated in this environment');
  }

  const provided = req.headers['x-newsroom-admin-key'];
  const providedKey = Array.isArray(provided) ? provided[0] : provided;
  if (!providedKey || providedKey !== expectedKey) {
    throw new AuthError();
  }
}
