/**
 * Frontend mirror of api/_lib/projects.ts's serializeProjectRecordForAdmin
 * output shape — the ADMIN-facing contract (includes every strictly-private
 * field: epromiseId/epromiseName/consultant/client/privateDescription/
 * durationMonths/valueAmount/valueCurrency/id/createdAt/updatedAt). This is
 * intentionally NOT the PublicProject allowlist shape — see
 * publicProjectPreview.ts for the separate, narrow preview-only mapper that
 * mirrors the real backend allowlist for anything shown as a "preview".
 */

export type ProjectStatus = 'draft' | 'published';
export type ProjectCompletionStatus = 'ongoing' | 'completed' | 'on_hold';

export interface ProjectMetric {
  id: string;
  metricName: string;
  metricValue: string;
  metricUnit: string | null;
  displayOrder: number;
}

export interface ProjectImage {
  id: string;
  /** Admin-only field, present in the API response but deliberately never rendered in this UI — see ProjectImageManager.tsx. */
  s3Key: string;
  position: number;
  altText: string | null;
  caption: string | null;
  isPrimary: boolean;
}

/** Same shape for both the queue (list) and the editor (detail) — GET /api/projects returns every row with empty metrics/images arrays (not fetched per-row); GET /api/projects/:id returns the full set. */
export interface AdminProject {
  id: string;
  epromiseId: string;
  epromiseName: string;
  commonName: string;
  slug: string | null;
  projectClass: string;
  projectType: string;
  category: string;
  location: string;
  country: string;
  consultant: string;
  client: string;
  completionDate: string | null;
  completionStatus: ProjectCompletionStatus;
  publicDescription: string;
  privateDescription: string | null;
  durationMonths: number;
  peakWorkforce: number;
  builtAreaSqm: number;
  valueAmount: number;
  valueCurrency: string;
  floors: number;
  featured: boolean;
  status: ProjectStatus;
  metrics: ProjectMetric[];
  images: ProjectImage[];
  createdAt: string;
  updatedAt: string;
}

/** Fields required to create a project (mirrors api/projects/index.ts's POST validation exactly — every NOT NULL project_records column). */
export interface CreateProjectInput {
  epromiseId: string;
  epromiseName: string;
  commonName: string;
  slug?: string | null;
  projectClass: string;
  projectType: string;
  category: string;
  location: string;
  country: string;
  consultant: string;
  client: string;
  completionDate?: string | null;
  completionStatus: ProjectCompletionStatus;
  publicDescription: string;
  privateDescription?: string | null;
  durationMonths: number;
  peakWorkforce: number;
  builtAreaSqm: number;
  valueAmount: number;
  valueCurrency?: string;
  floors: number;
  featured?: boolean;
}

export type UpdateProjectInput = Partial<CreateProjectInput & { status: ProjectStatus }>;
