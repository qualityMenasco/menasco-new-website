import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError, withErrorHandling } from '../_lib/http.js';
import { handleLogin } from '../_lib/projectsCms/login.js';
import { handleLogout } from '../_lib/projectsCms/logout.js';
import { handleValidate } from '../_lib/projectsCms/validate.js';
import { handlePublish } from '../_lib/projectsCms/publish.js';
import { handleExport } from '../_lib/projectsCms/export.js';

/**
 * ANY /api/projects-cms/<action> — a single catch-all function dispatching
 * to the actual handler by path segment. Consolidated from 5 separate route
 * files (login/logout/validate/publish/export, each its own file under
 * api/projects-cms/) into this one, because the Hobby-plan Vercel project
 * this repo deploys to has a hard 12-Serverless-Function cap per deployment
 * — the 5th CMS function (export.ts) pushed the total over that limit and
 * broke the production deploy. The individual handler bodies now live under
 * api/_lib/projectsCms/ (the `_lib` prefix is Vercel's own convention for
 * "shared code, never its own route" — same reason api/_lib/http.ts etc.
 * never counted as functions either), so this file is the only one actually
 * deployed for all 5 endpoints. Client-side URLs (/api/projects-cms/login
 * etc., in src/internal/projects-cms/projectsCmsApi.ts) are unchanged —
 * Vercel's dynamic routing sends them all here regardless.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    const pathSegments = req.query.path;
    const segments = Array.isArray(pathSegments) ? pathSegments : pathSegments ? [pathSegments] : [];
    const action = segments[0];

    switch (action) {
      case 'login':
        return handleLogin(req, res);
      case 'logout':
        return handleLogout(req, res);
      case 'validate':
        return handleValidate(req, res);
      case 'publish':
        return handlePublish(req, res);
      case 'export':
        return handleExport(req, res);
      default:
        throw new HttpError(404, `Unknown Projects CMS endpoint "/api/projects-cms/${segments.join('/')}"`);
    }
  });
}
