import { SmartLink } from '../../lib/SmartLink';
import { Eyebrow } from '../typography/Typography';
import type { ArticleTag } from '../../data/news';

export interface ArticleTopicsProps {
  tags: ArticleTag[];
  heading: string;
  className?: string;
}

/**
 * "Related Topics" — a narrow, understated list of tag links shown beside
 * (desktop) or below (mobile) an article's content. Takes `article.tags`
 * directly and renders it; carries no knowledge of where those tags came
 * from, so swapping the mock data in news.ts for a real API response later
 * is a data-layer change only, not a component change. Each tag links to
 * the shared Newsroom listing's own `?tag=<slug>` filter (see
 * NewsroomPage.tsx) rather than a dedicated route per tag.
 */
export function ArticleTopics({ tags, heading, className }: ArticleTopicsProps) {
  if (tags.length === 0) return null;

  return (
    <nav aria-label={heading} className={className}>
      <Eyebrow>{heading}</Eyebrow>
      <ul className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li key={tag.slug}>
            <SmartLink
              href={`/newsroom?tag=${tag.slug}`}
              className="inline-flex items-center rounded-sm border border-gray-300 bg-warmwhite px-2.5 py-1 text-caption font-sans font-medium text-gray-700 transition-colors duration-base hover:border-brand-600 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-offset-2"
            >
              {tag.name}
            </SmartLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
