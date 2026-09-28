import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireProjectsAuth } from '../../../../_lib/projectsAuth';
import { HttpError, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../../../../_lib/http';
import { deleteProjectMetric, getProjectRecordOrThrow, updateProjectMetric, type ProjectMetricUpdate } from '../../../../_lib/projects';
import { isValidDisplayOrder, isValidMetricName, isValidMetricUnit, isValidMetricValue, isValidUuid } from '../../../../_lib/validation';

/** PATCH/DELETE /api/projects/:id/metrics/:metricId */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireProjectsAuth(req);
    requireMethod(req, ['PATCH', 'DELETE']);

    const id = req.query.id;
    const metricId = req.query.metricId;
    if (typeof id !== 'string' || !isValidUuid(id)) throw new HttpError(400, 'Invalid project id');
    if (typeof metricId !== 'string' || !isValidUuid(metricId)) throw new HttpError(400, 'Invalid metric id');
    await getProjectRecordOrThrow(id);

    if (req.method === 'DELETE') {
      await deleteProjectMetric(id, metricId);
      sendJson(res, 200, { deleted: true, id: metricId });
      return;
    }

    const body = requireJsonBody(req);
    const update: ProjectMetricUpdate = {};
    if ('metricName' in body) {
      if (!isValidMetricName(body.metricName)) throw new HttpError(400, 'metricName is invalid');
      update.metricName = body.metricName;
    }
    if ('metricValue' in body) {
      if (!isValidMetricValue(body.metricValue)) throw new HttpError(400, 'metricValue is invalid');
      update.metricValue = body.metricValue;
    }
    if ('metricUnit' in body) {
      if (!isValidMetricUnit(body.metricUnit)) throw new HttpError(400, 'metricUnit is invalid');
      update.metricUnit = body.metricUnit as string | null;
    }
    if ('displayOrder' in body) {
      if (!isValidDisplayOrder(body.displayOrder)) throw new HttpError(400, 'displayOrder must be a non-negative integer');
      update.displayOrder = body.displayOrder;
    }

    await updateProjectMetric(id, metricId, update);
    sendJson(res, 200, { updated: true, id: metricId });
  });
}
