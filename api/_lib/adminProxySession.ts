import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Stateless, signed session tokens for the Newsroom admin proxy (see
 * `api/newsroom-admin-proxy/*`). No database/KV/session store — Vercel
 * functions are stateless across invocations, so the session itself is
 * just a signed, expiring payload the browser carries back on each
 * request via an HttpOnly cookie; the server verifies the signature and
 * expiry fresh on every call instead of looking anything up.
 *
 * Signed with `NEWSROOM_ADMIN_API_KEY` itself (already a server-only
 * secret with nothing else asking to reuse it as an HMAC key) rather than
 * introducing a third secret alongside it and `NEWSROOM_ADMIN_PROXY_PASSWORD`
 * — HMAC is one-way, so using a secret as a signing key never exposes or
 * weakens that secret's other use as the literal Lambda auth header value.
 */

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours — a working session, not a permanent credential.

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(payloadB64: string, secret: string): string {
  return createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

export function createSessionToken(secret: string): string {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const payloadB64 = base64url(payload);
  const signature = sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, signature] = parts;

  const expectedSignature = sign(payloadB64, secret);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export const ADMIN_SESSION_COOKIE_NAME = 'newsroom_admin_session';

/** `Secure` is only added outside local dev — `vercel dev` serves plain HTTP on localhost, and a `Secure` cookie is never set/sent over a non-HTTPS connection by design, which would silently break local testing of this exact flow. Real Vercel deployments (Preview and Production) are always HTTPS, so this is never relaxed anywhere that matters. */
function isProductionLikeEnvironment(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'production';
}

/** HttpOnly (never readable by JS — this is the whole point), SameSite=Strict, scoped to the admin proxy path only. */
export function buildSessionCookie(token: string): string {
  const maxAgeSeconds = Math.floor(SESSION_TTL_MS / 1000);
  const secure = isProductionLikeEnvironment() ? '; Secure' : '';
  return `${ADMIN_SESSION_COOKIE_NAME}=${token}; Path=/api/newsroom-admin-proxy; HttpOnly${secure}; SameSite=Strict; Max-Age=${maxAgeSeconds}`;
}

export function buildExpiredSessionCookie(): string {
  const secure = isProductionLikeEnvironment() ? '; Secure' : '';
  return `${ADMIN_SESSION_COOKIE_NAME}=; Path=/api/newsroom-admin-proxy; HttpOnly${secure}; SameSite=Strict; Max-Age=0`;
}
