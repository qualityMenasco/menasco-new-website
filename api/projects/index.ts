import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireProjectsAuth } from '../_lib/projectsAuth';
import { HttpError, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../_lib/http';
import { createProjectRecord, listProjectRecords, serializeProjectRecordForAdmin } from '../_lib/projects';
import {
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
} from '../_lib/validation';

/**
 * GET  /api/projects — the internal admin queue (rows arrive most-recently-
 *      updated first, capped at 100, same convention as
 *      GET /api/newsroom/articles). Admin-only: uses the full internal
 *      serializer (serializeProjectRecordForAdmin), never the public
 *      allowlist — this endpoint is never reachable without
 *      requireProjectsAuth passing.
 * POST /api/projects — create a project record. Unlike Newsroom's "create
 *      an empty draft, fill in later" flow, project_records has almost no
 *      nullable columns (see migration 005), so creation requires the full
 *      set of required fields up front — every one validated server-side
 *      here before anything reaches the database.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireProjectsAuth(req);
    requireMethod(req, ['GET', 'POST']);

    if (req.method === 'GET') {
      const records = await listProjectRecords();
      sendJson(
        res,
        200,
        records.map((r) => serializeProjectRecordForAdmin(r, [], [])),
      );
      return;
    }

    const body = requireJsonBody(req);
    if (!isValidEpromiseId(body.epromiseId)) throw new HttpError(400, 'epromiseId is required');
    if (!isValidEpromiseName(body.epromiseName)) throw new HttpError(400, 'epromiseName is required');
    if (!isValidCommonName(body.commonName)) throw new HttpError(400, 'commonName is required');
    if (body.slug !== undefined && body.slug !== null && !isValidSlug(body.slug)) throw new HttpError(400, 'slug is invalid');
    if (!isValidProjectClass(body.projectClass)) throw new HttpError(400, 'projectClass is required');
    if (!isValidProjectType(body.projectType)) throw new HttpError(400, 'projectType is required');
    if (!isValidCategory(body.category)) throw new HttpError(400, 'category is required');
    if (!isValidLocation(body.location)) throw new HttpError(400, 'location is required');
    if (!isValidCountry(body.country)) throw new HttpError(400, 'country is required');
    if (!isValidConsultant(body.consultant)) throw new HttpError(400, 'consultant is required');
    if (!isValidClient(body.client)) throw new HttpError(400, 'client is required');
    if (!isValidCompletionStatus(body.completionStatus)) throw new HttpError(400, 'completionStatus must be ongoing, completed, or on_hold');
    if (!isValidPublicDescription(body.publicDescription)) throw new HttpError(400, 'publicDescription is required');
    if (body.privateDescription !== undefined && !isValidPrivateDescription(body.privateDescription)) {
      throw new HttpError(400, 'privateDescription is invalid');
    }
    if (!isValidDurationMonths(body.durationMonths)) throw new HttpError(400, 'durationMonths must be a positive integer');
    if (!isValidPeakWorkforce(body.peakWorkforce)) throw new HttpError(400, 'peakWorkforce must be a positive integer');
    if (!isValidBuiltAreaSqm(body.builtAreaSqm)) throw new HttpError(400, 'builtAreaSqm must be a positive number');
    if (!isValidValueAmount(body.valueAmount)) throw new HttpError(400, 'valueAmount must be a positive number');
    if (body.valueCurrency !== undefined && !isValidCurrencyCode(body.valueCurrency)) throw new HttpError(400, 'valueCurrency must be a 3-letter ISO 4217 code');
    if (typeof body.floors !== 'number' || !Number.isInteger(body.floors) || body.floors <= 0) throw new HttpError(400, 'floors must be a positive integer');
    if (body.completionDate !== undefined && body.completionDate !== null && typeof body.completionDate !== 'string') {
      throw new HttpError(400, 'completionDate must be a date string');
    }

    const created = await createProjectRecord({
      epromiseId: body.epromiseId,
      epromiseName: body.epromiseName,
      commonName: body.commonName,
      slug: (body.slug as string | null | undefined) ?? null,
      projectClass: body.projectClass,
      projectType: body.projectType,
      category: body.category,
      location: body.location,
      country: body.country,
      consultant: body.consultant,
      client: body.client,
      completionDate: (body.completionDate as string | null | undefined) ?? null,
      completionStatus: body.completionStatus,
      publicDescription: body.publicDescription,
      privateDescription: (body.privateDescription as string | null | undefined) ?? null,
      durationMonths: body.durationMonths,
      peakWorkforce: body.peakWorkforce,
      builtAreaSqm: body.builtAreaSqm,
      valueAmount: body.valueAmount,
      valueCurrency: (body.valueCurrency as string | undefined) ?? 'AED',
      floors: body.floors,
      featured: Boolean(body.featured),
    });
    sendJson(res, 201, serializeProjectRecordForAdmin(created, [], []));
  });
}
