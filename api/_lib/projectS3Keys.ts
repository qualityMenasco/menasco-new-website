import { randomUUID } from 'node:crypto';
import { IMAGE_EXTENSION_BY_CONTENT_TYPE } from './s3Keys';

/**
 * Mirrors api/_lib/s3Keys.ts's articlePrefix/buildImageKey/isKeyWithinArticlePrefix
 * exactly, scoped to the isolated `projects/images/` prefix instead of
 * `newsroom/articles/` — same bucket (menasco-newsroom-prod), disjoint
 * prefix, so the Projects and Newsroom Lambdas' IAM policies can each be
 * scoped to their own tree with zero overlap. The server is the only thing
 * that ever constructs a key here — never Epromise ID, Epromise Name,
 * client, or value (all private/business-sensitive), only the project's
 * own internal UUID and a fresh random image UUID.
 */

export function projectImagePrefix(projectId: string): string {
  return `projects/images/${projectId}/`;
}

export function buildProjectImageKey(projectId: string, contentType: string): string {
  const extension = IMAGE_EXTENSION_BY_CONTENT_TYPE[contentType];
  if (!extension) throw new Error(`Unsupported image content type: ${contentType}`);
  return `${projectImagePrefix(projectId)}${randomUUID()}.${extension}`;
}

/** Defends the finalize endpoint against a key that doesn't belong to this project (or a path-traversal attempt) even though the server is the only key-generator — belt and suspenders, mirroring isKeyWithinArticlePrefix. */
export function isKeyWithinProjectPrefix(key: string, projectId: string): boolean {
  if (key.includes('..')) return false;
  return key.startsWith(projectImagePrefix(projectId));
}
