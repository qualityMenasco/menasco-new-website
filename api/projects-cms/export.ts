import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireMethod, sendJson, withErrorHandling } from '../_lib/http.js';
import { requireProjectsCmsAuth } from '../_lib/projectsCmsAuth.js';
import { getFile } from '../../src/internal/projects-cms/githubCommit.server.js';

const PROJECTS_JSON_PATH = 'src/data/projects.json';

/**
 * GET /api/projects-cms/export — session-protected. Returns the live
 * src/data/projects.json fetched fresh from GitHub (same source validate.ts
 * and publish.ts read/write), as-is, for the admin UI's "Download current
 * dataset" button. This is what makes a safe full-dataset-replacement
 * deletion practical: download, remove the entry you don't want, re-upload
 * with the replacement checkbox — instead of hand-assembling the entire
 * project list from scratch and risking an accidental omission.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'GET');
    requireProjectsCmsAuth(req);

    const file = await getFile(PROJECTS_JSON_PATH);
    let projects: unknown;
    try {
      projects = JSON.parse(file.content);
    } catch {
      throw new Error('Could not parse the current src/data/projects.json fetched from GitHub');
    }

    sendJson(res, 200, projects);
  });
}
