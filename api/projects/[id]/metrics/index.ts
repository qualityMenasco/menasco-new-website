import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireProjectsAuth } from '../../../_lib/projectsAuth';
import { HttpError, requireIdParam, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../../../_lib/http';
import { createProjectMetric, getProjectRecordOrThrow } from '../../../_lib/projects';
import { isValidDisplayOrder, isValidMetricName, isValidMetricUnit, isValidMetricValue, isValidUuid } from '../../../_lib/validation';

/** POST /api/projects/:id/metrics — create a metric row. The eventual admin UI's "Key Metric 1/2/3" slots are simply the first three rows ordered by displayOrder; there is no separate fixed-slot API. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireProjectsAuth(req);
    requireMethod(req, 'POST');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid project id');
    await getProjectRecordOrThrow(id);

    const body = requireJsonBody(req);
    if (!isValidMetricName(body.metricName)) throw new HttpError(400, 'metricName is required');
    if (!isValidMetricValue(body.metricValue)) throw new HttpError(400, 'metricValue is required');
    if (body.metricUnit !== undefined && !isValidMetricUnit(body.metricUnit)) throw new HttpError(400, 'metricUnit is invalid');
    if (!isValidDisplayOrder(body.displayOrder)) throw new HttpError(400, 'displayOrder must be a non-negative integer');

    const metric = await createProjectMetric({
      projectId: id,
      metricName: body.metricName,
      metricValue: body.metricValue,
      metricUnit: (body.metricUnit as string | null | undefined) ?? null,
      displayOrder: body.displayOrder,
    });
    sendJson(res, 201, {
      id: metric.id,
      metricName: metric.metric_name,
      metricValue: metric.metric_value,
      metricUnit: metric.metric_unit,
      displayOrder: metric.display_order,
    });
  });
}
