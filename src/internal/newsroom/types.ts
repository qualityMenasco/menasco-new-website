/**
 * Frontend-only mirror of `api/_lib/newsroom/structuredContent.ts`'s zod
 * schema — plain TS types, not zod, since the server's validation package
 * never needs to ship to the browser. The server (`validateStructuredContent`)
 * remains the single source of truth for what's actually accepted; this
 * only needs to be structurally close enough for the editor's controls to
 * read/write the right shape. A save that violates the real schema comes
 * back as a clean 422 with field-level detail (see NewsroomAdminPage).
 */

export type ArticleStatus = 'draft' | 'processing' | 'ready' | 'published' | 'failed';

export interface ArticleTag {
  name: string;
  slug: string;
}

export type ContentBlock =
  | { type: 'paragraph'; text: string; sourcePages?: number[] }
  | { type: 'heading'; text: string; level?: 2 | 3; sourcePages?: number[] }
  | { type: 'bullet_list'; items: string[]; sourcePages?: number[] }
  | { type: 'numbered_list'; items: string[]; sourcePages?: number[] }
  | { type: 'quote'; text: string; sourcePages?: number[] }
  | { type: 'image'; imageId: string; caption?: string; sourcePages?: number[] };

export type ContentBlockType = ContentBlock['type'];

export interface ArticleSection {
  heading?: string;
  blocks: ContentBlock[];
  sourcePages?: number[];
}

export interface StructuredContent {
  version: 1;
  source: { extractor: string; extractedAt: string; sourcePdfKey: string; pageCount?: number };
  summary?: string;
  sections: ArticleSection[];
}

export interface ArticleImage {
  id: string;
  s3Key: string;
  position: number;
  altText: string | null;
  caption: string | null;
  role: string | null;
}

export interface ArticleSummary {
  id: string;
  slug: string | null;
  title: string | null;
  category: string | null;
  featured: boolean;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  scheduledPublishAt: string | null;
  scheduledUnpublishAt: string | null;
}

export interface ArticleDetail {
  id: string;
  slug: string | null;
  title: string | null;
  subtitle: string | null;
  category: string | null;
  tags: ArticleTag[];
  featured: boolean;
  status: ArticleStatus;
  structuredContent: StructuredContent | null;
  sourcePdf: { s3Key: string } | null;
  processingError: string | null;
  processedAt: string | null;
  images: ArticleImage[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  scheduledPublishAt: string | null;
  scheduledUnpublishAt: string | null;
  firstPublishedAt: string | null;
}
