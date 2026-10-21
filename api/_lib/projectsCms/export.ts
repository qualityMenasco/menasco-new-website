import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireMethod, sendJson, withErrorHandling } from '../http.js';
import { requireProjectsCmsAuth } from '../projectsCmsAuth.js';
import { getFile } from '../../../src/internal/projects-cms/githubCommit.server.js';

const PROJECTS_JSON_PATH = 'src/data/projects.json';

/**
 * GET /api/projects-cms/export — session-protected. Returns the live
 * src/data/projects.json fetched fresh from GitHub (same source validate.ts
 * and publish.ts read/write), for the admin UI's "Download current
 * dataset" button. This is what makes a safe full-dataset-replacement
 * deletion practical: download, remove the entry you don't want, re-upload
 * with the replacement checkbox — instead of hand-assembling the entire
 * project list from scratch and risking an accidental omission.
 *
 * Strips the `id` field before responding — it's always identical to
 * `slug` (see validateProjectUpload.ts's mergeRow), carries no information
 * of its own, and was confusing to see sitting next to the new
 * `internalId` field. Safe to drop here: a re-uploaded JSON/CSV is never
 * read for `id` (parseProjectJson/parseProjectCsv don't recognize that
 * column at all — mergeRow always derives it fresh from the existing
 * record or the row's slug), so stripping it from the download has no
 * effect on round-tripping a downloaded file back through publish.
 */
export async function handleExport(req: VercelRequest, res: VercelResponse) {
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

    const withoutId = Array.isArray(projects)
      ? projects.map((p) => {
          if (p != null && typeof p === 'object' && !Array.isArray(p)) {
            const { id: _id, ...rest } = p as Record<string, unknown>;
            return rest;
          }
          return p;
        })
      : projects;

    sendJson(res, 200, withoutId);
  });
}
