import { formatUaeDisplay } from './uaeTime';

export interface PublicationWindowArticle {
  publishedAt: string | null;
  scheduledPublishAt: string | null;
  scheduledUnpublishAt: string | null;
}

/**
 * "Opens" is a pending schedule if one exists, otherwise the article's
 * actual published date if it has (or once had) one, otherwise unset.
 * These two are already mutually exclusive by construction in the backend
 * (publishArticle and the scheduling worker both clear `scheduled_publish_at`
 * in the same statement that sets `published_at` — see api/_lib/articles.ts)
 * so this never has to choose between two conflicting real dates; the
 * ordering here is just which one a query result could ever actually have.
 */
export function deriveOpensDisplay(article: PublicationWindowArticle): string {
  return formatUaeDisplay(article.scheduledPublishAt ?? article.publishedAt) ?? '—';
}

/**
 * "Closes" is only ever a pending scheduled withdrawal — once the
 * scheduling worker (or a manual Unpublish) actually closes the article,
 * it clears `scheduled_unpublish_at` itself (the close already happened,
 * there's nothing left pending), so there is no historical "closed on"
 * date to fall back to here; this intentionally mirrors that backend
 * behavior rather than inventing a second, longer-lived field to track it.
 */
export function deriveClosesDisplay(article: PublicationWindowArticle): string {
  return formatUaeDisplay(article.scheduledUnpublishAt) ?? '—';
}
