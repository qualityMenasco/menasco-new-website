import type { AdminProject } from './types';

/**
 * Client-side mirror of the SAME allowlist api/_lib/projects/publicProjects.ts
 * enforces server-side (PublicProject / toPublicProject). This is what
 * "Preview Project" renders — built from the current in-memory ADMIN editor
 * state (which does include every strictly-private field), so this mapper
 * is the one and only place that boundary is drawn on the client. Never a
 * spread, never `{...project}` — explicit field-by-field construction,
 * exactly like the server-side mapper, for the same reason: a future
 * private field added to AdminProject has no effect on preview output
 * unless someone deliberately adds a line here.
 */

export const STRICTLY_PRIVATE_PROJECT_FIELDS = [
  'id',
  'epromiseId',
  'epromise_id',
  'epromiseName',
  'epromise_name',
  'consultant',
  'client',
  'privateDescription',
  'private_description',
  'durationMonths',
  'duration_months',
  'valueAmount',
  'value_amount',
  'valueCurrency',
  'value_currency',
  's3Key',
  's3_key',
  'createdAt',
  'created_at',
  'updatedAt',
  'updated_at',
] as const;

export interface PreviewProjectMetric {
  metricName: string;
  metricValue: string;
  metricUnit: string | null;
  displayOrder: number;
}

export interface PreviewProjectImage {
  imageId: string;
  /** A resolved, short-lived preview URL (admin preview-url endpoint) — never the raw S3 key or bucket. */
  url: string;
  altText: string | null;
  caption: string | null;
  isPrimary: boolean;
  position: number;
}

export interface PreviewProject {
  slug: string | null;
  commonName: string;
  projectClass: string;
  projectType: string;
  category: string;
  location: string;
  country: string;
  completionDate: string | null;
  completionStatus: string;
  publicDescription: string;
  peakWorkforce: number;
  builtAreaSqm: number;
  floors: number;
  featured: boolean;
  metrics: PreviewProjectMetric[];
  images: PreviewProjectImage[];
}

/** `imageUrls` maps imageId -> a resolved preview URL (from projectsAdminApi.getImagePreviewUrl), so this stays a pure, synchronous mapper. */
export function toPreviewProject(project: AdminProject, imageUrls: Record<string, string>): PreviewProject {
  return {
    slug: project.slug,
    commonName: project.commonName,
    projectClass: project.projectClass,
    projectType: project.projectType,
    category: project.category,
    location: project.location,
    country: project.country,
    completionDate: project.completionDate,
    completionStatus: project.completionStatus,
    publicDescription: project.publicDescription,
    peakWorkforce: project.peakWorkforce,
    builtAreaSqm: project.builtAreaSqm,
    floors: project.floors,
    featured: project.featured,
    metrics: [...project.metrics]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((m) => ({ metricName: m.metricName, metricValue: m.metricValue, metricUnit: m.metricUnit, displayOrder: m.displayOrder })),
    images: [...project.images]
      .sort((a, b) => a.position - b.position)
      .map((img) => ({
        imageId: img.id,
        url: imageUrls[img.id] ?? '',
        altText: img.altText,
        caption: img.caption,
        isPrimary: img.isPrimary,
        position: img.position,
      })),
  };
}
