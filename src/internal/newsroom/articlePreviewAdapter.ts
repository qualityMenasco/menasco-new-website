import type { ArticleDetailViewArticle } from '../../components/news/ArticleDetailView';
import type { ArticleDetail } from './types';

/**
 * Converts the admin editor's in-memory `ArticleDetail` (including any
 * edits already reflected in that state — structured content, tags, and
 * image reordering/metadata all update it immediately; title/subtitle/
 * slug/category only update it once their field is blurred, since those
 * use the existing blur-to-save TextField pattern) into the exact shape
 * `ArticleDetailView` (the same component the real public article page
 * renders) expects. This is the only place admin state is reshaped for
 * preview — no new article-rendering logic is introduced.
 *
 * `imageUrls` are short-lived presigned GET URLs resolved via the existing
 * admin-only `getImagePreviewUrl` endpoint (see ArticlePreview.tsx) — never
 * the public image proxy, which only serves published articles. An image
 * whose URL hasn't resolved yet is simply omitted from the gallery rather
 * than rendered broken.
 */
export function buildPreviewArticle(article: ArticleDetail, imageUrls: Record<string, string>): ArticleDetailViewArticle {
  const images = [...article.images]
    .sort((a, b) => a.position - b.position)
    .filter((image) => imageUrls[image.id])
    .map((image) => ({
      id: image.id,
      position: image.position,
      altText: image.altText,
      caption: image.caption,
      role: image.role,
      url: imageUrls[image.id],
    }));

  return {
    title: article.title || 'Untitled article',
    subtitle: article.subtitle,
    category: article.category,
    // A draft has no publishedAt yet — updatedAt is the closest real, meaningful timestamp
    // available, and is clearly not the same as a real publish date once the article ships.
    publishedAt: article.publishedAt ?? article.updatedAt,
    tags: article.tags,
    images,
    structuredContent: article.structuredContent ?? { version: 1, sections: [] },
  };
}

/** Mirrors the requirements api/_lib/articles.ts's publishArticle actually enforces, purely to decide whether to show a "some publishing requirements are incomplete" notice — never used to block preview itself. */
export function getMissingPublishRequirements(article: ArticleDetail): string[] {
  const missing: string[] = [];
  if (!article.title) missing.push('a title');
  if (!article.slug) missing.push('a URL slug');
  if (!article.structuredContent) missing.push('processed structured content');
  if (article.status !== 'ready' && article.status !== 'published') missing.push('successful processing (process, or reprocess, the source PDF)');
  return missing;
}
