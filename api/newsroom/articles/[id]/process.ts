import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireNewsroomAuth } from '../../../_lib/auth';
import { HttpError, requireIdParam, requireMethod, sendJson, withErrorHandling } from '../../../_lib/http';
import { isValidUuid } from '../../../_lib/validation';
import { processArticle } from '../../../_lib/newsroom/processArticle';

/**
 * POST /api/newsroom/articles/:id/process — explicit, manually-triggered
 * PDF -> structured_content processing (Phase 2). Deliberately NOT wired to
 * run automatically on upload finalization: the extraction/normalization
 * pipeline needs to be observed against real source PDFs before it runs
 * unattended, and reprocessing on demand is the whole point while quality
 * is still being validated.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireNewsroomAuth(req);
    requireMethod(req, 'POST');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid article id');

    const result = await processArticle(id);
    sendJson(res, 200, { status: 'ready', structuredContent: result.structuredContent });
  });
}
