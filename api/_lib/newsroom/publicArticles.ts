import type { RowDataPacket } from 'mysql2';
import { getPool } from '../db';
import type { ArticleRow, ImageRow } from '../articles';

/**
 * Every query here filters `status = 'published'` in SQL, never in
 * application code after the fact — this is the actual security boundary
 * (see Phase 4 spec's "Critical rule"), not a formatting convenience. A
 * `ready`/`draft`/`processing`/`failed` article is indistinguishable from a
 * nonexistent one to every function in this file: both return nothing.
 */

const PUBLIC_IMAGE_PROXY_PREFIX = '/api/newsroom/public/images';

export function publicImageUrl(imageId: string): string {
  return `${PUBLIC_IMAGE_PROXY_PREFIX}/${imageId}`;
}

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

export interface PublicArticleDetail extends PublicArticleSummary {
  structuredContent: unknown;
  images: PublicImage[];
}

function serializeImage(image: ImageRow): PublicImage {
  return {
    id: image.id,
    position: image.position,
    altText: image.alt_text,
    caption: image.caption,
    role: image.role,
    url: publicImageUrl(image.id),
  };
}

/**
 * `structured_content.source` (`extractor`, `extractedAt`, `sourcePdfKey`,
 * `pageCount`) is Phase 2 processing provenance for admin/debugging use —
 * `sourcePdfKey` in particular is the private S3 key of the source PDF
 * (`newsroom/articles/<id>/source/article.pdf`), exactly the kind of
 * "private source-file detail" the public contract must never expose. Only
 * `version` and `sections` (the actual renderable content) cross the public
 * boundary; `summary` passes through too since it's public-safe prose, not
 * internal metadata.
 */
export function sanitizeStructuredContentForPublic(structuredContent: unknown): unknown {
  if (typeof structuredContent !== 'object' || structuredContent === null) return structuredContent;
  const { version, sections, summary } = structuredContent as { version?: unknown; sections?: unknown; summary?: unknown };
  return { version, sections, ...(summary !== undefined ? { summary } : {}) };
}

function serializeSummary(article: ArticleRow, images: ImageRow[]): PublicArticleSummary {
  return {
    id: article.id,
    slug: article.slug as string, // published articles always have a slug — publishArticle() enforces this before allowing the status transition
    title: article.title as string,
    subtitle: article.subtitle,
    category: article.category,
    publishedAt: (article.published_at as Date).toISOString(),
    featured: Boolean(article.featured),
    tags: article.tags ?? [],
    primaryImage: images.length > 0 ? serializeImage(images[0]) : null,
  };
}

/** Lean list for the public Newsroom index — no `structuredContent`, no admin/internal fields. */
export async function listPublishedArticles(): Promise<PublicArticleSummary[]> {
  const [rows] = await getPool().query<ArticleRow[]>(
    `SELECT * FROM news_articles WHERE status = 'published' ORDER BY published_at DESC LIMIT 100`,
  );
  const summaries: PublicArticleSummary[] = [];
  for (const row of rows) {
    const [images] = await getPool().query<ImageRow[]>(
      `SELECT * FROM news_article_images WHERE article_id = :articleId ORDER BY \`position\` ASC LIMIT 1`,
      { articleId: row.id },
    );
    summaries.push(serializeSummary(row, images));
  }
  return summaries;
}

/**
 * Returns null for a nonexistent slug AND for an existing-but-unpublished
 * one — identical outward behavior for both, by construction of the SQL
 * filter, not by an extra "don't leak status" check layered on top.
 */
export async function getPublishedArticleBySlug(slug: string): Promise<PublicArticleDetail | null> {
  const [rows] = await getPool().query<ArticleRow[]>(
    `SELECT * FROM news_articles WHERE slug = :slug AND status = 'published' LIMIT 1`,
    { slug },
  );
  const article = rows[0];
  if (!article) return null;

  const [imageRows] = await getPool().query<ImageRow[]>(
    `SELECT * FROM news_article_images WHERE article_id = :articleId ORDER BY \`position\` ASC`,
    { articleId: article.id },
  );
  const images = imageRows.map(serializeImage);

  return {
    ...serializeSummary(article, imageRows),
    structuredContent: sanitizeStructuredContentForPublic(article.structured_content),
    images,
  };
}

/**
 * Resolves an image belonging to a PUBLISHED article only — the join
 * condition (`a.status = 'published'`), not a separate check afterward, is
 * what keeps the public image proxy from ever serving a draft/ready
 * article's image. Returns the real `s3_key` server-side only; this is
 * never sent to the client.
 */
export async function getPublicImageS3Key(imageId: string): Promise<string | null> {
  const [rows] = await getPool().query<(RowDataPacket & { s3_key: string })[]>(
    `SELECT img.s3_key AS s3_key
     FROM news_article_images img
     JOIN news_articles a ON a.id = img.article_id
     WHERE img.id = :imageId AND a.status = 'published'
     LIMIT 1`,
    { imageId },
  );
  return rows[0]?.s3_key ?? null;
}
