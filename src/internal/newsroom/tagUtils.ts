import type { ArticleTag } from './types';

/**
 * Frontend-only mirror of api/_lib/validation.ts's `normalizeSlug` — kept in
 * sync deliberately (same trim/lowercase/NFKD/hyphen-collapse rules) so a
 * topic accepted here always passes the backend's `isValidTags` (which
 * requires `slug` to match SLUG_RE) without a round trip.
 */
export function slugifyTopic(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Backend caps at 20 (MAX_TAGS in api/_lib/validation.ts); this is a tighter, conservative editorial guardrail so the chip list stays scannable. */
export const MAX_TOPICS = 15;

/** Matches MAX_TAG_NAME_LENGTH in api/_lib/validation.ts. */
export const MAX_TOPIC_LENGTH = 100;

export interface AddTopicResult {
  tags: ArticleTag[];
  error: string | null;
}

/** Pure: trims, validates, and case-insensitively dedupes (via slug) before appending. Never truncates or silently drops input — returns an `error` instead. */
export function addTopic(existing: ArticleTag[], rawInput: string): AddTopicResult {
  const name = rawInput.trim();
  if (!name) return { tags: existing, error: null };
  if (name.length > MAX_TOPIC_LENGTH) {
    return { tags: existing, error: `Topics must be ${MAX_TOPIC_LENGTH} characters or fewer.` };
  }
  const slug = slugifyTopic(name);
  if (!slug) {
    return { tags: existing, error: 'Topic must contain at least one letter or number.' };
  }
  if (existing.some((tag) => tag.slug === slug)) {
    return { tags: existing, error: `"${name}" has already been added.` };
  }
  if (existing.length >= MAX_TOPICS) {
    return { tags: existing, error: `You can add up to ${MAX_TOPICS} topics.` };
  }
  return { tags: [...existing, { name, slug }], error: null };
}

export function removeTopic(existing: ArticleTag[], index: number): ArticleTag[] {
  return existing.filter((_, i) => i !== index);
}
