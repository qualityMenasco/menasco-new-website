import type { VercelRequest } from '@vercel/node';
import { AuthError } from './auth';

/**
 * Mirrors api/_lib/auth.ts's requireNewsroomAuth exactly, with its own
 * separate credential — PROJECTS_ADMIN_API_KEY / x-projects-admin-key,
 * never NEWSROOM_ADMIN_API_KEY. Reusing the Newsroom key would couple the
 * two backends' credential lifecycles (rotating one would force rotating
 * both) for no actual benefit, since they're already fully separate
 * Lambdas/DB users/IAM policies.
 */
function isProductionEnvironment(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
}

export function requireProjectsAuth(req: VercelRequest): void {
  const devBypass = process.env.PROJECTS_DEV_AUTH_BYPASS === 'true';
  if (devBypass && !isProductionEnvironment()) return;

  const expectedKey = process.env.PROJECTS_ADMIN_API_KEY;
  if (!expectedKey) {
    throw new AuthError('Projects admin API is not authenticated in this environment');
  }

  const provided = req.headers['x-projects-admin-key'];
  const providedKey = Array.isArray(provided) ? provided[0] : provided;
  if (!providedKey || providedKey !== expectedKey) {
    throw new AuthError();
  }
}
