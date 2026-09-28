-- Newsroom Phase 3: editorial/publishing fields. Migrations 001/002 are
-- already applied to real RDS and are left untouched; this is a pure
-- additive ALTER.
--
-- Fields added are derived directly from the EXISTING public Newsroom
-- content contract (src/data/news.ts's NewsArticle interface, audited
-- before this migration was written), not invented:
--
--   subtitle  — NewsArticle.subtitle (dek/excerpt). Required by the public
--   article page and by JSON-LD's description field.
--
--   category  — NewsArticle.category. Free-form slug in the existing
--   frontend (not an enum/lookup table there either), used for display
--   labels and for the Newsroom index's category filter.
--
--   tags      — NewsArticle.tags ({name, slug}[]). Used by the existing
--   Newsroom index page for ?tag= filtering. Stored as JSON, same
--   reasoning as structured_content: MySQL JSON, not JSONB.
--
--   featured  — NewsArticle.featured. Used by the existing Newsroom index
--   to choose which articles render in the featured-story slot.
--
-- Deliberately NOT added: `author` (no such concept exists anywhere in the
-- current frontend/content model — confirmed by audit), `seo_title` /
-- `seo_description` (the current JSON-LD generator maps title/subtitle
-- directly into headline/description; there is no separate SEO-specific
-- field anywhere in the existing contract to mirror), and no separate
-- editorial "display date" column — `published_at` (already added in
-- migration 001) is reused as the article's public-facing date, since the
-- existing frontend model's `date` field and "when this went live" are the
-- same fact for every article this system will ever publish (Phase 3 is
-- manual-publish-only, no scheduling/backdating).

ALTER TABLE news_articles
  ADD COLUMN subtitle VARCHAR(500) NULL AFTER title,
  ADD COLUMN category VARCHAR(100) NULL AFTER subtitle,
  ADD COLUMN tags JSON NULL AFTER category,
  ADD COLUMN featured BOOLEAN NOT NULL DEFAULT FALSE AFTER tags;
