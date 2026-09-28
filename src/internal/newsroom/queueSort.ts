import type { ArticleSummary } from './types';

export type QueueSortOrder = 'newest' | 'oldest';

/**
 * An unparseable/missing createdAt (should never happen once the API
 * contract holds, but a NaN from `new Date(...).getTime()` compares false
 * against everything and silently breaks sorting rather than erroring) is
 * treated as the oldest possible time, so a bad value sorts predictably to
 * one end instead of leaving affected rows in whatever order they arrived.
 */
function parseCreatedAt(value: string): number {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? -Infinity : time;
}

/**
 * Pure, client-side sort by the article's actual `createdAt` — never
 * `updatedAt`, `publishedAt`, or any scheduled date, and status (draft vs
 * published) plays no part in ordering. `listArticles()` already returns
 * every row in one response (capped at 100, no real pagination exists yet
 * per its own doc comment) — this sorts that complete, already-fetched set
 * rather than only whatever happens to be currently rendered, so the
 * result is correct across the full dataset regardless of scroll position.
 * Never mutates the input array or touches any article's stored data.
 *
 * Ties (equal createdAt) break on `id` ascending, independent of input
 * order and identical in both directions — deterministic regardless of
 * the order the API happened to return rows in.
 */
export function sortArticlesByCreatedAt(articles: ArticleSummary[], order: QueueSortOrder): ArticleSummary[] {
  return [...articles].sort((a, b) => {
    const diff = parseCreatedAt(a.createdAt) - parseCreatedAt(b.createdAt);
    if (diff !== 0) return order === 'newest' ? -diff : diff;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}
