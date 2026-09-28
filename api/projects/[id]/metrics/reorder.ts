import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireProjectsAuth } from '../../../_lib/projectsAuth';
import { HttpError, requireIdParam, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../../../_lib/http';
import { getProjectRecordOrThrow, listProjectMetrics, reorderProjectMetrics } from '../../../_lib/projects';
import { isValidUuid } from '../../../_lib/validation';

/** POST /api/projects/:id/metrics/reorder — body: { orderedMetricIds: string[] }. Must list exactly the project's current metric ids, each once. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireProjectsAuth(req);
    requireMethod(req, 'POST');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid project id');
    await getProjectRecordOrThrow(id);

    const body = requireJsonBody(req);
    const orderedMetricIds = body.orderedMetricIds;
    if (!Array.isArray(orderedMetricIds) || orderedMetricIds.some((v) => typeof v !== 'string')) {
      throw new HttpError(400, 'orderedMetricIds must be an array of metric ids');
    }

    await reorderProjectMetrics(id, orderedMetricIds as string[]);
    const metrics = await listProjectMetrics(id);
    sendJson(
      res,
      200,
      metrics.map((m) => ({ id: m.id, metricName: m.metric_name, metricValue: m.metric_value, metricUnit: m.metric_unit, displayOrder: m.display_order })),
    );
  });
}
