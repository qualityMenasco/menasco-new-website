import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireProjectsAuth } from '../../_lib/projectsAuth';
import { HttpError, requireIdParam, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../../_lib/http';
import {
  deleteProjectRecord,
  getProjectRecordOrThrow,
  listProjectImages,
  listProjectMetrics,
  serializeProjectRecordForAdmin,
  updateProjectRecord,
  type ProjectRecordUpdate,
} from '../../_lib/projects';
import {
  isValidUuid,
  isValidEpromiseId,
  isValidEpromiseName,
  isValidCommonName,
  isValidSlug,
  isValidProjectClass,
  isValidProjectType,
  isValidCategory,
  isValidLocation,
  isValidCountry,
  isValidConsultant,
  isValidClient,
  isValidCompletionStatus,
  isValidPublicDescription,
  isValidPrivateDescription,
  isValidDurationMonths,
  isValidPeakWorkforce,
  isValidBuiltAreaSqm,
  isValidValueAmount,
  isValidCurrencyCode,
  isValidProjectStatus,
} from '../../_lib/validation';

/**
 * GET/PATCH/DELETE /api/projects/:id — admin-only, uses the internal UUID
 * (admin endpoints may, per the Phase 3 spec — only PUBLIC endpoints are
 * forbidden from accepting/exposing it). PATCH accepts any subset of
 * fields; only provided keys are validated/updated, mirroring
 * updateArticleMetadata's partial-update shape.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireProjectsAuth(req);
    requireMethod(req, ['GET', 'PATCH', 'DELETE']);

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid project id');

    if (req.method === 'GET') {
      const record = await getProjectRecordOrThrow(id);
      const [metrics, images] = await Promise.all([listProjectMetrics(id), listProjectImages(id)]);
      sendJson(res, 200, serializeProjectRecordForAdmin(record, metrics, images));
      return;
    }

    if (req.method === 'DELETE') {
      await deleteProjectRecord(id);
      sendJson(res, 200, { deleted: true, id });
      return;
    }

    // PATCH
    await getProjectRecordOrThrow(id);
    const body = requireJsonBody(req);
    const update: ProjectRecordUpdate = {};

    if ('epromiseId' in body) {
      if (!isValidEpromiseId(body.epromiseId)) throw new HttpError(400, 'epromiseId is invalid');
      update.epromiseId = body.epromiseId;
    }
    if ('epromiseName' in body) {
      if (!isValidEpromiseName(body.epromiseName)) throw new HttpError(400, 'epromiseName is invalid');
      update.epromiseName = body.epromiseName;
    }
    if ('commonName' in body) {
      if (!isValidCommonName(body.commonName)) throw new HttpError(400, 'commonName is invalid');
      update.commonName = body.commonName;
    }
    if ('slug' in body) {
      if (body.slug !== null && !isValidSlug(body.slug)) throw new HttpError(400, 'slug is invalid');
      update.slug = body.slug as string | null;
    }
    if ('projectClass' in body) {
      if (!isValidProjectClass(body.projectClass)) throw new HttpError(400, 'projectClass is invalid');
      update.projectClass = body.projectClass;
    }
    if ('projectType' in body) {
      if (!isValidProjectType(body.projectType)) throw new HttpError(400, 'projectType is invalid');
      update.projectType = body.projectType;
    }
    if ('category' in body) {
      if (!isValidCategory(body.category)) throw new HttpError(400, 'category is invalid');
      update.category = body.category;
    }
    if ('location' in body) {
      if (!isValidLocation(body.location)) throw new HttpError(400, 'location is invalid');
      update.location = body.location;
    }
    if ('country' in body) {
      if (!isValidCountry(body.country)) throw new HttpError(400, 'country is invalid');
      update.country = body.country;
    }
    if ('consultant' in body) {
      if (!isValidConsultant(body.consultant)) throw new HttpError(400, 'consultant is invalid');
      update.consultant = body.consultant;
    }
    if ('client' in body) {
      if (!isValidClient(body.client)) throw new HttpError(400, 'client is invalid');
      update.client = body.client;
    }
    if ('completionDate' in body) {
      if (body.completionDate !== null && typeof body.completionDate !== 'string') throw new HttpError(400, 'completionDate is invalid');
      update.completionDate = body.completionDate as string | null;
    }
    if ('completionStatus' in body) {
      if (!isValidCompletionStatus(body.completionStatus)) throw new HttpError(400, 'completionStatus must be ongoing, completed, or on_hold');
      update.completionStatus = body.completionStatus;
    }
    if ('publicDescription' in body) {
      if (!isValidPublicDescription(body.publicDescription)) throw new HttpError(400, 'publicDescription is invalid');
      update.publicDescription = body.publicDescription;
    }
    if ('privateDescription' in body) {
      if (!isValidPrivateDescription(body.privateDescription)) throw new HttpError(400, 'privateDescription is invalid');
      update.privateDescription = body.privateDescription as string | null;
    }
    if ('durationMonths' in body) {
      if (!isValidDurationMonths(body.durationMonths)) throw new HttpError(400, 'durationMonths must be a positive integer');
      update.durationMonths = body.durationMonths;
    }
    if ('peakWorkforce' in body) {
      if (!isValidPeakWorkforce(body.peakWorkforce)) throw new HttpError(400, 'peakWorkforce must be a positive integer');
      update.peakWorkforce = body.peakWorkforce;
    }
    if ('builtAreaSqm' in body) {
      if (!isValidBuiltAreaSqm(body.builtAreaSqm)) throw new HttpError(400, 'builtAreaSqm must be a positive number');
      update.builtAreaSqm = body.builtAreaSqm;
    }
    if ('valueAmount' in body) {
      if (!isValidValueAmount(body.valueAmount)) throw new HttpError(400, 'valueAmount must be a positive number');
      update.valueAmount = body.valueAmount;
    }
    if ('valueCurrency' in body) {
      if (!isValidCurrencyCode(body.valueCurrency)) throw new HttpError(400, 'valueCurrency must be a 3-letter ISO 4217 code');
      update.valueCurrency = body.valueCurrency;
    }
    if ('floors' in body) {
      if (typeof body.floors !== 'number' || !Number.isInteger(body.floors) || body.floors <= 0) throw new HttpError(400, 'floors must be a positive integer');
      update.floors = body.floors;
    }
    if ('featured' in body) {
      update.featured = Boolean(body.featured);
    }
    if ('status' in body) {
      if (!isValidProjectStatus(body.status)) throw new HttpError(400, 'status must be draft or published');
      update.status = body.status;
    }

    await updateProjectRecord(id, update);
    const updated = await getProjectRecordOrThrow(id);
    const [metrics, images] = await Promise.all([listProjectMetrics(id), listProjectImages(id)]);
    sendJson(res, 200, serializeProjectRecordForAdmin(updated, metrics, images));
  });
}
