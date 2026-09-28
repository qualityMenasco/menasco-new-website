import type { AdminProject, CreateProjectInput, ProjectImage, ProjectMetric, UpdateProjectInput } from './types';

/**
 * Mirrors src/internal/newsroom/newsroomAdminApi.ts exactly — the browser
 * never holds PROJECTS_ADMIN_API_KEY; every call here goes to
 * /api/projects-admin-proxy/* (a same-origin Vercel serverless function),
 * authenticated by an HttpOnly session cookie. Separate login credential
 * (PROJECTS_ADMIN_PROXY_PASSWORD) from Newsroom's own — never shared.
 */
const LOGGED_IN_FLAG_KEY = 'projects_admin_logged_in';

export function isLoggedInLocally(): boolean {
  try {
    return sessionStorage.getItem(LOGGED_IN_FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

function setLoggedInLocally(value: boolean): void {
  try {
    if (value) sessionStorage.setItem(LOGGED_IN_FLAG_KEY, 'true');
    else sessionStorage.removeItem(LOGGED_IN_FLAG_KEY);
  } catch {
    // sessionStorage unavailable — the gate reappears next reload; not a security issue either way.
  }
}

export class ProjectsApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api/projects-admin-proxy${path}`, {
    method: options.method ?? 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: 'same-origin',
  });

  if (res.status === 401) setLoggedInLocally(false);

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ProjectsApiError(res.status, `Expected a JSON response from the Projects admin API (got HTTP ${res.status} non-JSON body)`);
  }
  if (!res.ok) {
    const message =
      typeof json === 'object' && json !== null && 'error' in json && typeof (json as { error: unknown }).error === 'string'
        ? (json as { error: string }).error
        : `Request failed (HTTP ${res.status})`;
    throw new ProjectsApiError(res.status, message);
  }
  return json as T;
}

export async function login(password: string): Promise<void> {
  const res = await fetch('/api/projects-admin-proxy/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new ProjectsApiError(res.status, typeof json.error === 'string' ? json.error : 'Login failed');
  }
  setLoggedInLocally(true);
}

export async function logout(): Promise<void> {
  await fetch('/api/projects-admin-proxy/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
  setLoggedInLocally(false);
}

export const projectsAdminApi = {
  listProjects: () => request<AdminProject[]>('/'),
  getProject: (id: string) => request<AdminProject>(`/${id}`),
  createProject: (input: CreateProjectInput) => request<AdminProject>('/', { method: 'POST', body: input }),
  updateProject: (id: string, update: UpdateProjectInput) => request<AdminProject>(`/${id}`, { method: 'PATCH', body: update }),
  deleteProject: (id: string) => request<{ deleted: true; id: string }>(`/${id}`, { method: 'DELETE' }),

  createMetric: (projectId: string, input: { metricName: string; metricValue: string; metricUnit?: string | null; displayOrder: number }) =>
    request<ProjectMetric>(`/${projectId}/metrics`, { method: 'POST', body: input }),
  updateMetric: (projectId: string, metricId: string, update: Partial<{ metricName: string; metricValue: string; metricUnit: string | null; displayOrder: number }>) =>
    request<{ updated: true; id: string }>(`/${projectId}/metrics/${metricId}`, { method: 'PATCH', body: update }),
  deleteMetric: (projectId: string, metricId: string) => request<{ deleted: true; id: string }>(`/${projectId}/metrics/${metricId}`, { method: 'DELETE' }),
  reorderMetrics: (projectId: string, orderedMetricIds: string[]) =>
    request<ProjectMetric[]>(`/${projectId}/metrics/reorder`, { method: 'POST', body: { orderedMetricIds } }),

  presignImageUpload: (projectId: string, input: { contentType: string; position: number }) =>
    request<{ uploadUrl: string; s3Key: string; expiresIn: number }>(`/${projectId}/images/uploads`, { method: 'POST', body: input }),
  finalizeImageUpload: (projectId: string, input: { s3Key: string; position: number; altText?: string | null; caption?: string | null }) =>
    request<ProjectImage[]>(`/${projectId}/images/uploads/complete`, { method: 'POST', body: input }),
  updateImageMeta: (projectId: string, imageId: string, update: { altText?: string | null; caption?: string | null }) =>
    request<{ updated: true; id: string }>(`/${projectId}/images/${imageId}`, { method: 'PATCH', body: update }),
  deleteImage: (projectId: string, imageId: string) => request<{ deleted: true; id: string }>(`/${projectId}/images/${imageId}`, { method: 'DELETE' }),
  reorderImages: (projectId: string, orderedImageIds: string[]) =>
    request<ProjectImage[]>(`/${projectId}/images/reorder`, { method: 'POST', body: { orderedImageIds } }),
  setPrimaryImage: (projectId: string, imageId: string) => request<{ primaryImageId: string }>(`/${projectId}/images/${imageId}/primary`, { method: 'POST' }),
  getImagePreviewUrl: (projectId: string, imageId: string) =>
    request<{ url: string; expiresIn: number }>(`/${projectId}/images/${imageId}/preview-url`),
};

export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
  if (!res.ok) throw new ProjectsApiError(res.status, `S3 upload failed (HTTP ${res.status})`);
}
