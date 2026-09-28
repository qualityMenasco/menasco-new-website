-- Newsroom Phase 2: minimal additional fields for PDF -> structured_content
-- processing. Migration 001 is already applied to real RDS and is left
-- untouched; this is a pure additive ALTER.
--
-- Only two fields, both justified by the processing lifecycle itself:
--
--   processing_error — set on a `failed` transition so an admin can see WHY
--   without grepping server logs (headObject/extraction/validation errors
--   are all safe, non-secret messages — see api/_lib/newsroom/processArticle.ts).
--   Cleared back to NULL on the next successful `ready` transition, so it
--   never shows a stale error for content that has since processed fine.
--
--   processed_at — timestamp of the last successful (draft/processing ->
--   ready) processing run, distinct from `updated_at` (which also changes
--   on unrelated metadata PATCHes) and from `published_at` (which Phase 2
--   does not set — publishing is out of scope until a later phase).
--
-- `content_version` was considered and deliberately NOT added: the schema
-- version already lives inside `structured_content.version` (see
-- api/_lib/newsroom/structuredContent.ts) — a separate column would just be
-- a second, potentially-inconsistent copy of the same fact.

ALTER TABLE news_articles
  ADD COLUMN processing_error VARCHAR(2000) NULL AFTER source_pdf_s3_key,
  ADD COLUMN processed_at TIMESTAMP NULL AFTER processing_error;
