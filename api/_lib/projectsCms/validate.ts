import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../http.js';
import { requireProjectsCmsAuth } from '../projectsCmsAuth.js';
import { parseProjectUpload, ProjectUploadParseError } from '../../../src/internal/projects-cms/projectCsvJsonParser.js';
import { validateProjectUpload } from '../../../src/internal/projects-cms/validateProjectUpload.js';
import { getFile, fileExists } from '../../../src/internal/projects-cms/githubCommit.server.js';
import type { ProjectRecord } from '../../../src/data/projects.js';

const PROJECTS_JSON_PATH = 'src/data/projects.json';

/**
 * POST /api/projects-cms/validate — session-protected. Parses + validates an
 * uploaded CSV/JSON payload against the LIVE dataset fetched fresh from
 * GitHub on every call (same source publish.ts re-reads right before
 * writing) rather than a copy statically bundled into this function —
 * `import ... from '../../src/data/projects.js'` previously pulled in a
 * static JSON import that depended on Vercel's build correctly tracing and
 * packaging src/data/projects.json into this function's deployment bundle;
 * that didn't reliably happen (confirmed via a direct `vercel build` +
 * execute repro) and crashed the function at module-load time before any
 * application code ran. Fetching from GitHub avoids the whole bundling
 * question and is also simply more correct: validation always reflects the
 * true current dataset, never a possibly-stale build-time snapshot. Never
 * writes anything.
 */
export async function handleValidate(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'POST');
    requireProjectsCmsAuth(req);

    const body = requireJsonBody(req);
    const { content, format, fullReplacement, allowProtectedOverride } = body as {
      content?: unknown;
      format?: unknown;
      fullReplacement?: unknown;
      allowProtectedOverride?: unknown;
    };

    if (typeof content !== 'string' || content.length === 0) {
      throw new HttpError(400, 'Missing required field "content" (raw file text)');
    }
    if (format !== 'csv' && format !== 'json') {
      throw new HttpError(400, 'Field "format" must be "csv" or "json"');
    }

    let rows;
    try {
      rows = parseProjectUpload(content, format);
    } catch (err) {
      if (err instanceof ProjectUploadParseError) {
        throw new HttpError(400, err.message);
      }
      throw err;
    }

    const freshFile = await getFile(PROJECTS_JSON_PATH);
    let currentProjects: ProjectRecord[];
    try {
      currentProjects = JSON.parse(freshFile.content) as ProjectRecord[];
    } catch {
      throw new HttpError(500, 'Could not parse the current src/data/projects.json fetched from GitHub');
    }

    const result = await validateProjectUpload(rows, currentProjects, {
      fullReplacement: fullReplacement === true,
      allowProtectedOverride: allowProtectedOverride === true,
      checkLocalImagePathExists: fileExists,
    });

    sendJson(res, 200, result);
  });
}
