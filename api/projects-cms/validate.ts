import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../_lib/http.js';
import { requireProjectsCmsAuth } from '../_lib/projectsCmsAuth.js';
import { parseProjectUpload, ProjectUploadParseError } from '../../src/internal/projects-cms/projectCsvJsonParser.js';
import { validateProjectUpload } from '../../src/internal/projects-cms/validateProjectUpload.js';
import { projects as currentProjects } from '../../src/data/projects.js';

/**
 * POST /api/projects-cms/validate — session-protected. Parses + validates
 * an uploaded CSV/JSON payload against the dataset BUNDLED with this
 * deployment (fine for validation/preview purposes — publish.ts re-fetches
 * the live file from GitHub before actually writing, which is the place a
 * stale-read race would actually matter). Never writes anything.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    const result = validateProjectUpload(rows, currentProjects, {
      fullReplacement: fullReplacement === true,
      allowProtectedOverride: allowProtectedOverride === true,
    });

    sendJson(res, 200, result);
  });
}
