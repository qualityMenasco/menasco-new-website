import { useEffect, useState } from 'react';
import { buildNewsroomApiUrl } from './newsroomApiConfig';

/**
 * Runtime client for the Phase 4 public Newsroom API
 * (`/api/newsroom/public/*`) — unauthenticated, read-only, published-only
 * by construction of the backend query (see
 * `api/_lib/newsroom/publicArticles.ts`). The browser never talks to RDS or
 * S3 directly; every field here is exactly what the public endpoints
 * return, nothing more.
 */

export interface PublicImage {
  id: string;
  position: number;
  altText: string | null;
  caption: string | null;
  role: string | null;
  url: string;
}

export interface PublicArticleTag {
  name: string;
  slug: string;
}

export interface PublicArticleSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  publishedAt: string;
  featured: boolean;
  tags: PublicArticleTag[];
  primaryImage: PublicImage | null;
}

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level?: 2 | 3 }
  | { type: 'bullet_list'; items: string[] }
  | { type: 'numbered_list'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'image'; imageId: string; caption?: string };

export interface ArticleSection {
  heading?: string;
  blocks: ContentBlock[];
}

export interface StructuredContent {
  version: 1;
  sections: ArticleSection[];
}

export interface PublicArticleDetail extends PublicArticleSummary {
  structuredContent: StructuredContent;
  images: PublicImage[];
}

/**
 * Never surfaces the response body to the caller on a non-2xx — the backend
 * already keeps error bodies safe (`{"error": "..."}`, no stack traces/SQL/
 * infra details, see api/_lib/http.ts's withErrorHandling), but this layer
 * doesn't rely on that alone: only the HTTP status crosses into the thrown
 * Error, never the parsed/raw body content.
 */
async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T | null> {
  const res = await fetch(buildNewsroomApiUrl(path), { signal });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Newsroom request failed (HTTP ${res.status})`);
  const json: unknown = await res.json().catch(() => {
    throw new Error('Newsroom request returned an invalid response');
  });
  return json as T;
}

export function fetchPublicArticles(signal?: AbortSignal): Promise<PublicArticleSummary[]> {
  return fetchJson<PublicArticleSummary[]>('/api/newsroom/public/articles', signal).then((data) => (Array.isArray(data) ? data : []));
}

export function fetchPublicArticleBySlug(slug: string, signal?: AbortSignal): Promise<PublicArticleDetail | null> {
  return fetchJson<PublicArticleDetail>(`/api/newsroom/public/articles/${encodeURIComponent(slug)}`, signal);
}

export type FetchState<T> = { status: 'loading' } | { status: 'error'; error: string } | { status: 'success'; data: T };

/** One fetch per mount, no polling/refetch-on-focus — public Newsroom data changes only on an explicit publish action, so there is nothing to keep re-fetching for. */
export function useNewsroomArticles(): FetchState<PublicArticleSummary[]> {
  const [state, setState] = useState<FetchState<PublicArticleSummary[]>>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    fetchPublicArticles(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return;
        setState({ status: 'error', error: (err as Error).message });
      });
    return () => controller.abort();
  }, []);

  return state;
}

export function useNewsroomArticle(slug: string | undefined): FetchState<PublicArticleDetail | null> {
  const [state, setState] = useState<FetchState<PublicArticleDetail | null>>({ status: 'loading' });

  useEffect(() => {
    if (!slug) {
      setState({ status: 'success', data: null });
      return;
    }
    const controller = new AbortController();
    setState({ status: 'loading' });
    fetchPublicArticleBySlug(slug, controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return;
        setState({ status: 'error', error: (err as Error).message });
      });
    return () => controller.abort();
  }, [slug]);

  return state;
}
