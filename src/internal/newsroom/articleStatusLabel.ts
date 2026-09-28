import type { ArticleStatus } from './types';

/**
 * Collapses the backend's five-value lifecycle (draft/processing/ready/
 * published/failed — see api/_lib/articles.ts's ArticleStatus, unchanged
 * by this mapping) into the two-concept model editors actually need:
 *
 *   Draft     = not publicly visible (draft, processing once it finishes,
 *               ready, and failed all collapse here)
 *   Published = publicly visible
 *
 * `processing` gets its own transient label while it's actively
 * happening, since that's a real, time-bound state worth surfacing — once
 * it finishes (success -> ready, or error -> failed) the article is just
 * Draft again. `ready` is never removed or renamed at the data layer; it
 * remains exactly what publishArticle/the scheduling worker require
 * (see api/_lib/articles.ts) — this function only decides what an editor
 * reads in the UI, never what's stored or checked server-side.
 */
export function adminStatusLabel(status: ArticleStatus): string {
  if (status === 'published') return 'Published';
  if (status === 'processing') return 'Processing…';
  return 'Draft';
}

/** Badge color for adminStatusLabel's three possible UI states — kept alongside the label so every badge in the admin stays visually consistent. */
export function adminStatusBadgeClassName(status: ArticleStatus): string {
  if (status === 'published') return 'bg-brand-100 text-brand-700';
  if (status === 'processing') return 'bg-amber-50 text-amber-700';
  return 'bg-gray-100 text-gray-700';
}
