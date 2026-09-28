import { z } from 'zod';

/**
 * `news_articles.structured_content` schema — versioned so a future shape
 * change can coexist with rows written under an older version rather than
 * requiring a lockstep migration of every stored row.
 *
 * Shape is derived from the EXISTING static Newsroom content model
 * (`src/data/news.ts` / `NewsDetailPage.tsx`), not invented: that model is
 * intro paragraphs -> named sections (heading + paragraphs) -> closing
 * paragraphs, plus an optional pull quote and secondary image slotted in by
 * position. Here that becomes one ordered `sections[]` list of blocks — the
 * intro is the first section with no heading, the closing is the last
 * section with no heading, and pull quotes/images become blocks in whatever
 * section they actually belong to instead of being hardcoded to a fixed
 * array index the way the static mock data does it today.
 *
 * Only block types the current frontend renders or PDF prose plausibly
 * needs are included (paragraph, heading, bullet_list, numbered_list,
 * quote, image). `table` was deliberately left out of v1 — nothing in the
 * current Newsroom UI renders one and no real source PDF has been observed
 * to need one; add it as an additive change (new block variant, same
 * version) if a real document turns out to require it.
 */

export const STRUCTURED_CONTENT_VERSION = 1 as const;

const sourcePagesSchema = z.array(z.number().int().positive()).max(50).optional();

const paragraphBlockSchema = z.object({
  type: z.literal('paragraph'),
  text: z.string().min(1).max(5000),
  sourcePages: sourcePagesSchema,
});

const headingBlockSchema = z.object({
  type: z.literal('heading'),
  text: z.string().min(1).max(300),
  level: z.union([z.literal(2), z.literal(3)]).default(3),
  sourcePages: sourcePagesSchema,
});

const bulletListBlockSchema = z.object({
  type: z.literal('bullet_list'),
  items: z.array(z.string().min(1).max(1000)).min(1).max(50),
  sourcePages: sourcePagesSchema,
});

const numberedListBlockSchema = z.object({
  type: z.literal('numbered_list'),
  items: z.array(z.string().min(1).max(1000)).min(1).max(50),
  sourcePages: sourcePagesSchema,
});

const quoteBlockSchema = z.object({
  type: z.literal('quote'),
  text: z.string().min(1).max(2000),
  sourcePages: sourcePagesSchema,
});

/**
 * References an existing `news_article_images` row by id — never a raw S3
 * key or presigned URL (which expires) and never embedded image bytes.
 */
const imageBlockSchema = z.object({
  type: z.literal('image'),
  imageId: z.string().uuid(),
  caption: z.string().max(1000).optional(),
  sourcePages: sourcePagesSchema,
});

export const contentBlockSchema = z.discriminatedUnion('type', [
  paragraphBlockSchema,
  headingBlockSchema,
  bulletListBlockSchema,
  numberedListBlockSchema,
  quoteBlockSchema,
  imageBlockSchema,
]);

export const articleSectionSchema = z.object({
  /** Absent for the leading intro section and the trailing closing section — matches today's `body[]`/`closing[]` (no heading) vs `sections[]` (heading required) split. */
  heading: z.string().min(1).max(300).optional(),
  blocks: z.array(contentBlockSchema).min(1).max(200),
  sourcePages: sourcePagesSchema,
});

export const structuredContentSchema = z.object({
  version: z.literal(STRUCTURED_CONTENT_VERSION),
  source: z.object({
    extractor: z.string().min(1).max(200),
    extractedAt: z.string().datetime(),
    /** The `source_pdf_s3_key` this content was extracted from, captured at extraction time — an audit trail if the source key ever changes later. */
    sourcePdfKey: z.string().min(1).max(1024),
    pageCount: z.number().int().positive().optional(),
  }),
  /** Short dek/subtitle-equivalent — optional; today's static model has a `subtitle` field but nothing guarantees a PDF states one explicitly. */
  summary: z.string().max(2000).optional(),
  sections: z.array(articleSectionSchema).min(1).max(100),
});

export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type ArticleSection = z.infer<typeof articleSectionSchema>;
export type StructuredContent = z.infer<typeof structuredContentSchema>;

/** Throws a ZodError on anything that doesn't conform — callers must not write unvalidated data to RDS. */
export function validateStructuredContent(data: unknown): StructuredContent {
  return structuredContentSchema.parse(data);
}
