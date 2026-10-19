import type { ParsedProjectRow } from './projectCsvJsonParser';
import type { ProjectDiff, ValidationError } from './validateProjectUpload';

/**
 * Thin same-origin fetch client for /api/projects-cms/* — the browser side
 * of the new GitHub-backed Projects CMS. Session auth is a cookie set by
 * /api/projects-cms/login (HttpOnly, so this module never reads/holds it
 * directly); `isLoggedInLocally`/`markLoggedInLocally` are just a client-side
 * UX convenience (skip flashing the login form on reload) and carry no
 * security weight — every real request is re-checked server-side by
 * requireProjectsCmsAuth.
 */

export class ProjectsCmsApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const LOCAL_LOGIN_FLAG = 'projects_cms_logged_in_locally';

export function isLoggedInLocally(): boolean {
  try {
    return window.localStorage.getItem(LOCAL_LOGIN_FLAG) === 'true';
  } catch {
    return false;
  }
}

function markLoggedInLocally(value: boolean) {
  try {
    if (value) window.localStorage.setItem(LOCAL_LOGIN_FLAG, 'true');
    else window.localStorage.removeItem(LOCAL_LOGIN_FLAG);
  } catch {
    // ignore — localStorage can throw in some environments; it's a UX convenience only.
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ProjectsCmsApiError((json as { error?: string }).error ?? `Request failed (${response.status})`, response.status);
  }
  return json as T;
}

export async function login(password: string): Promise<void> {
  await postJson('/api/projects-cms/login', { password });
  markLoggedInLocally(true);
}

export async function logout(): Promise<void> {
  try {
    await postJson('/api/projects-cms/logout', {});
  } finally {
    markLoggedInLocally(false);
  }
}

export interface ValidationResultDto {
  valid: boolean;
  errors: ValidationError[];
  diff: ProjectDiff;
}

export interface ValidateOrPublishPayload {
  content: string;
  format: 'csv' | 'json';
  fullReplacement: boolean;
  allowProtectedOverride: boolean;
}

export async function validateUpload(payload: ValidateOrPublishPayload): Promise<ValidationResultDto> {
  try {
    return await postJson<ValidationResultDto>('/api/projects-cms/validate', payload);
  } catch (err) {
    if (err instanceof ProjectsCmsApiError && err.status === 401) markLoggedInLocally(false);
    throw err;
  }
}

export interface PublishResultDto {
  ok: boolean;
  projectsCommitSha: string;
  arCommitSha?: string;
  arCommitError?: string;
  message: string;
}

export async function publishUpload(payload: ValidateOrPublishPayload): Promise<PublishResultDto> {
  try {
    return await postJson<PublishResultDto>('/api/projects-cms/publish', { ...payload, confirmed: true });
  } catch (err) {
    if (err instanceof ProjectsCmsApiError && err.status === 401) markLoggedInLocally(false);
    throw err;
  }
}

/** Fetches the live project dataset straight from GitHub — feeds the "Download current dataset" button, which is what makes a safe full-replacement deletion practical (edit the downloaded file, re-upload, rather than hand-assembling the whole list). */
export async function exportCurrentDataset(): Promise<unknown> {
  const response = await fetch('/api/projects-cms/export', { method: 'GET', credentials: 'same-origin' });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) markLoggedInLocally(false);
    throw new ProjectsCmsApiError((json as { error?: string }).error ?? `Request failed (${response.status})`, response.status);
  }
  return json;
}

export type { ParsedProjectRow };
