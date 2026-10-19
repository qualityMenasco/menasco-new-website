import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Stateless, signed session tokens for the NEW GitHub-backed Projects CMS
 * (/dev/projects-cms). This is an independent module from
 * api/_lib/projectsAdminProxySession.ts — same HMAC-signing *technique*,
 * deliberately separate code, secret (PROJECTS_CMS_SESSION_SECRET) and
 * cookie name (`projects_cms_session`, never `projects_admin_session`) so a
 * session for one system can never be replayed against the other.
 */

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours — a working session, not a permanent credential.

export const PROJECTS_CMS_SESSION_COOKIE_NAME = 'projects_cms_session';

/** Constant-time string comparison — use for the admin password check so response timing can't leak how many leading characters matched. */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still run a comparison of equal-length buffers so a length mismatch doesn't short-circuit faster than a real check.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

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

function isProductionLikeEnvironment(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'production';
}

/** HttpOnly, SameSite=Strict, scoped to the Projects CMS API path only. */
export function buildSessionCookie(token: string): string {
  const maxAgeSeconds = Math.floor(SESSION_TTL_MS / 1000);
  const secure = isProductionLikeEnvironment() ? '; Secure' : '';
  return `${PROJECTS_CMS_SESSION_COOKIE_NAME}=${token}; Path=/api/projects-cms; HttpOnly${secure}; SameSite=Strict; Max-Age=${maxAgeSeconds}`;
}

export function buildExpiredSessionCookie(): string {
  const secure = isProductionLikeEnvironment() ? '; Secure' : '';
  return `${PROJECTS_CMS_SESSION_COOKIE_NAME}=; Path=/api/projects-cms; HttpOnly${secure}; SameSite=Strict; Max-Age=0`;
}
