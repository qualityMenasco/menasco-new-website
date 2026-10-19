import type { VercelRequest } from '@vercel/node';
import { HttpError } from './http.js';
import { PROJECTS_CMS_SESSION_COOKIE_NAME, verifySessionToken } from './projectsCmsSession.js';

/**
 * Session-cookie auth guard for every /api/projects-cms/* endpoint (except
 * login/logout themselves). Independent of api/_lib/projectsAuth.ts and
 * api/_lib/auth.ts — this is a brand-new system with its own secret
 * (PROJECTS_CMS_SESSION_SECRET) and cookie (`projects_cms_session`), never
 * reusing another system's credential lifecycle.
 */
export class ProjectsCmsAuthError extends HttpError {
  constructor(message = 'Unauthorized — please sign in to the Projects CMS') {
    super(401, message);
  }
}

export function requireProjectsCmsAuth(req: VercelRequest): void {
  const secret = process.env.PROJECTS_CMS_SESSION_SECRET;
  if (!secret) {
    throw new ProjectsCmsAuthError('Projects CMS session signing is not configured in this environment');
  }

  const token = req.cookies?.[PROJECTS_CMS_SESSION_COOKIE_NAME];
  if (!verifySessionToken(token, secret)) {
    throw new ProjectsCmsAuthError();
  }
}
