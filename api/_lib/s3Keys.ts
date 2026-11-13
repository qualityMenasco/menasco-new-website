import { randomUUID } from 'node:crypto';

/**
 * The server is the ONLY thing that ever constructs an S3 key — the client
 * supplies a `type` (and, for images, an intended content type), never a
 * path. This is what makes `isKeyWithinArticlePrefix` a meaningful check
 * later at finalize time: a client can never smuggle in a key that escapes
 * its own article's prefix, because it never gets to choose the key at all.
 */

export const IMAGE_EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const VIDEO_EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
};

export function articlePrefix(articleId: string): string {
  return `newsroom/articles/${articleId}/`;
}

export function buildPdfKey(articleId: string): string {
  return `${articlePrefix(articleId)}source/article.pdf`;
}

/**
 * Image object names are server-generated (random UUID + validated
 * extension) — never derived from the client's original filename, which is
 * untrusted input. The original filename may still be stored as metadata
 * (alt text default, display purposes) but never used for path generation.
 */
export function buildImageKey(articleId: string, contentType: string): string {
  const extension = IMAGE_EXTENSION_BY_CONTENT_TYPE[contentType];
  if (!extension) throw new Error(`Unsupported image content type: ${contentType}`);
  return `${articlePrefix(articleId)}images/${randomUUID()}.${extension}`;
}

/** Same server-generated-key reasoning as buildImageKey — videos just live under their own `videos/` prefix for clarity in S3, even though they're tracked in the same `news_article_images` table (see migration 006). */
export function buildVideoKey(articleId: string, contentType: string): string {
  const extension = VIDEO_EXTENSION_BY_CONTENT_TYPE[contentType];
  if (!extension) throw new Error(`Unsupported video content type: ${contentType}`);
  return `${articlePrefix(articleId)}videos/${randomUUID()}.${extension}`;
}

/** Defends the finalize endpoint against a key that doesn't belong to this article (or a path-traversal attempt) even though the server is the only key-generator — belt and suspenders, since finalize trusts the key the client echoes back. */
export function isKeyWithinArticlePrefix(key: string, articleId: string): boolean {
  if (key.includes('..')) return false;
  return key.startsWith(articlePrefix(articleId));
}
