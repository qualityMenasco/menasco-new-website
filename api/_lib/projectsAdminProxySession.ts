import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Stateless, signed session tokens for the Projects admin proxy — mirrors
 * api/_lib/adminProxySession.ts exactly, with its own separate secret
 * (PROJECTS_ADMIN_SESSION_SECRET) and cookie name, so a Newsroom session
 * cookie can never be replayed against the Projects proxy or vice versa.
 * Signed with PROJECTS_ADMIN_API_KEY itself (same reasoning as Newsroom's
 * module: HMAC is one-way, so reusing it as a signing key never exposes or
 * weakens its other use as the literal Lambda auth header value) — never
 * NEWSROOM_ADMIN_API_KEY.
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

export const PROJECTS_ADMIN_SESSION_COOKIE_NAME = 'projects_admin_session';

function isProductionLikeEnvironment(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'production';
}

/** HttpOnly, SameSite=Strict, scoped to the Projects admin proxy path only. */
export function buildSessionCookie(token: string): string {
  const maxAgeSeconds = Math.floor(SESSION_TTL_MS / 1000);
  const secure = isProductionLikeEnvironment() ? '; Secure' : '';
  return `${PROJECTS_ADMIN_SESSION_COOKIE_NAME}=${token}; Path=/api/projects-admin-proxy; HttpOnly${secure}; SameSite=Strict; Max-Age=${maxAgeSeconds}`;
}

export function buildExpiredSessionCookie(): string {
  const secure = isProductionLikeEnvironment() ? '; Secure' : '';
  return `${PROJECTS_ADMIN_SESSION_COOKIE_NAME}=; Path=/api/projects-admin-proxy; HttpOnly${secure}; SameSite=Strict; Max-Age=0`;
}
