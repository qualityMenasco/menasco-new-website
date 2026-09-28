import type { ArticleDetail, ArticleSummary, StructuredContent, ArticleTag } from './types';

/**
 * The browser never holds `NEWSROOM_ADMIN_API_KEY` — every call here goes
 * to `/api/newsroom-admin-proxy/*` (a same-origin Vercel serverless
 * function, see `api/newsroom-admin-proxy/`), authenticated by an
 * HttpOnly session cookie the browser can't read or exfiltrate even if
 * compromised by XSS. That proxy is the only place the real permanent key
 * is attached, server-side, before forwarding to the real Lambda admin
 * API. `login()` sends a SEPARATE, rotatable password
 * (`NEWSROOM_ADMIN_PROXY_PASSWORD`) — not the Lambda's own key — to
 * establish that cookie.
 *
 * `sessionStorage` here holds only a non-secret UI convenience flag ("did
 * this tab already log in") so the gate doesn't reappear on every reload —
 * the actual security boundary is the server-verified cookie, not
 * anything client-readable; a forged/missing flag just means the gate
 * shows again, it can never grant access on its own.
 */
const LOGGED_IN_FLAG_KEY = 'newsroom_admin_logged_in';

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
    // sessionStorage unavailable (private browsing, etc.) — the gate will just show again on next reload; not a security issue either way.
  }
}

export class NewsroomApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api/newsroom-admin-proxy${path}`, {
    method: options.method ?? 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    // 'same-origin' is fetch's own default, but explicit here since this cookie's presence is the entire auth mechanism — never leave it implicit.
    credentials: 'same-origin',
  });

  if (res.status === 401) setLoggedInLocally(false);

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new NewsroomApiError(res.status, `Expected a JSON response from the Newsroom admin API (got HTTP ${res.status} non-JSON body)`);
  }
  if (!res.ok) {
    const message = typeof json === 'object' && json !== null && 'error' in json && typeof (json as { error: unknown }).error === 'string' ? (json as { error: string }).error : `Request failed (HTTP ${res.status})`;
    throw new NewsroomApiError(res.status, message);
  }
  return json as T;
}

export async function login(password: string): Promise<void> {
  const res = await fetch('/api/newsroom-admin-proxy/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new NewsroomApiError(res.status, typeof json.error === 'string' ? json.error : 'Login failed');
  }
  setLoggedInLocally(true);
}

export async function logout(): Promise<void> {
  await fetch('/api/newsroom-admin-proxy/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
  setLoggedInLocally(false);
}

export const newsroomAdminApi = {
  listArticles: () => request<ArticleSummary[]>('/articles'),
  getArticle: (id: string) => request<ArticleDetail>(`/articles/${id}`),
  createDraft: () => request<{ id: string; status: string }>('/articles', { method: 'POST' }),
  /** Permanently deletes the article and everything it owns (images, source PDF, structured content) — distinct from unpublishArticle, which keeps the article and its assets intact. */
  deleteArticle: (id: string) => request<{ deleted: true; id: string }>(`/articles/${id}`, { method: 'DELETE' }),

  updateArticle: (
    id: string,
    update: Partial<{
      title: string | null;
      slug: string | null;
      subtitle: string | null;
      category: string | null;
      tags: ArticleTag[] | null;
      featured: boolean;
      structuredContent: StructuredContent;
      /** Full ISO-8601 datetime with an explicit Z/offset, or null to cancel. Never a bare date or timezone-less string — see api/_lib/validation.ts's isValidScheduledAt. */
      scheduledPublishAt: string | null;
      scheduledUnpublishAt: string | null;
    }>,
  ) => request<ArticleDetail>(`/articles/${id}`, { method: 'PATCH', body: update }),

  processArticle: (id: string) => request<{ status: string; structuredContent: StructuredContent }>(`/articles/${id}/process`, { method: 'POST' }),

  publishArticle: (id: string) => request<ArticleDetail>(`/articles/${id}/publish`, { method: 'POST' }),
  unpublishArticle: (id: string) => request<ArticleDetail>(`/articles/${id}/unpublish`, { method: 'POST' }),

  getSourceUrl: (id: string) => request<{ url: string; expiresIn: number }>(`/articles/${id}/source-url`),

  getImagePreviewUrl: (articleId: string, imageId: string) =>
    request<{ url: string; expiresIn: number }>(`/articles/${articleId}/images/${imageId}/preview-url`),

  updateImageMeta: (articleId: string, imageId: string, update: { altText?: string | null; caption?: string | null }) =>
    request<{ id: string }>(`/articles/${articleId}/images/${imageId}`, { method: 'PATCH', body: update }),

  reorderImages: (articleId: string, orderedImageIds: string[]) =>
    request<{ id: string; position: number }[]>(`/articles/${articleId}/images/reorder`, {
      method: 'POST',
      body: { orderedImageIds },
    }),

  presignUpload: (
    articleId: string,
    input: { type: 'pdf'; filename: string; contentType: 'application/pdf' } | { type: 'image'; filename: string; contentType: string; position: number },
  ) => request<{ uploadUrl: string; s3Key: string; expiresIn: number }>(`/articles/${articleId}/uploads`, { method: 'POST', body: input }),

  finalizeUpload: (articleId: string, input: { type: 'pdf'; s3Key: string } | { type: 'image'; s3Key: string; position: number }) =>
    request<unknown>(`/articles/${articleId}/uploads/complete`, { method: 'POST', body: input }),
};

export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
  if (!res.ok) throw new NewsroomApiError(res.status, `S3 upload failed (HTTP ${res.status})`);
}
