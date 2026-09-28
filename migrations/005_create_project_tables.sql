-- Projects Phase 1: storage foundation (project_records, project_metrics,
-- project_images) — additive only. Migrations 001-004 (Newsroom) are
-- already applied to real RDS and are left completely untouched; this file
-- creates three new tables in the same `menasco_newsroom` schema and
-- touches nothing else. Per the architecture investigation: the schema is
-- deliberately NOT renamed (an internal name with no functional or
-- user-facing meaning — renaming it would cost a coordinated cutover for
-- zero benefit), and Newsroom and Projects stay logically isolated purely
-- through separate tables, separate future DB grants, and a separate
-- future Lambda (menasco-projects-api) — never through a schema split.
--
-- `id` columns are CHAR(36) UUIDs (app-generated), matching news_articles'
-- own convention. `created_at`/`updated_at` follow the same
-- DEFAULT CURRENT_TIMESTAMP / ON UPDATE CURRENT_TIMESTAMP pattern used
-- throughout migration 001.

-- ---------------------------------------------------------------------------
-- project_records
-- ---------------------------------------------------------------------------
--
-- `status` is the ONLY visibility gate: a project is never publicly
-- reachable just because a row exists. VARCHAR + CHECK (not ENUM), same
-- reasoning as news_articles.status — easier to extend later than an
-- ENUM's fixed type definition. Only two application-facing values exist
-- today (draft/published); no third "scheduled" or "archived" state is
-- introduced here, mirroring how Newsroom's own scheduling state is fully
-- derivable rather than stored as a separate status.
--
-- `epromise_id` is indexed but deliberately NOT declared UNIQUE: this repo
-- has no existing Epromise source data anywhere (grepped `src/data/`,
-- `src/lib/`, and every other project-related file — none reference an
-- "Epromise" concept at all), so uniqueness cannot be verified against real
-- data. Inventing a UNIQUE constraint on unverified business-identifier
-- assumptions risks a hard failure the moment real data is imported. Add
-- `UNIQUE KEY` in a later migration once this is confirmed with whoever
-- owns the Epromise system.
--
-- `completion_status` is VARCHAR + CHECK against the approved Phase 2
-- taxonomy (ongoing/completed/on_hold) — same pattern as `status`.
--
-- Key Metric 1/2/3, Image URL, and Image Alt Text are deliberately absent
-- from this table — they live in project_metrics (ordered rows) and
-- project_images (one row per image) respectively, so a project's set of
-- metrics/images is never capped at a fixed number of columns and is never
-- duplicated across two representations of the same fact.
--
-- `private_description` is a real column here, but is an application-layer
-- contract, not a DB-enforced one: no public-facing query may ever SELECT
-- it. The upcoming Projects public API must build its own explicit,
-- narrow column list for public responses (the same discipline
-- api/_lib/newsroom/publicArticles.ts already uses) rather than ever
-- forwarding a full `SELECT *` row to a public endpoint.
--
-- `slug` is the locked public identifier: public detail lookups must
-- resolve by slug, never by `id` (internal UUID) or `epromise_id`/
-- `epromise_name` (both permanently private, see api/_lib/validation.ts's
-- STRICTLY_PRIVATE_PROJECT_FIELDS) — mirrors news_articles.slug exactly,
-- including staying NULLable (a draft may not have a slug chosen yet) with
-- a UNIQUE index (MySQL's UNIQUE index allows unlimited NULLs, so any
-- number of slug-less drafts coexist fine; only a real, chosen slug must
-- be unique). The Phase 2 publish action must enforce "a project cannot
-- become published without a non-null slug" the same way
-- publishArticle() already enforces it for news_articles.
CREATE TABLE IF NOT EXISTS project_records (
  id                   CHAR(36)      NOT NULL,
  epromise_id          VARCHAR(100)  NOT NULL,
  epromise_name        VARCHAR(500)  NOT NULL,
  common_name          VARCHAR(500)  NOT NULL,
  slug                 VARCHAR(255)  NULL,
  project_class        VARCHAR(100)  NOT NULL,
  project_type         VARCHAR(100)  NOT NULL,
  category             VARCHAR(100)  NOT NULL,
  location             VARCHAR(255)  NOT NULL,
  country              VARCHAR(100)  NOT NULL,
  consultant           VARCHAR(500)  NOT NULL,
  client               VARCHAR(500)  NOT NULL,
  completion_date      DATE          NULL,
  completion_status    VARCHAR(50)   NOT NULL,
  public_description   TEXT          NOT NULL,
  private_description  TEXT          NULL,
  duration_months      SMALLINT UNSIGNED NOT NULL,
  peak_workforce       INT UNSIGNED  NOT NULL,
  built_area_sqm       DECIMAL(12,2) UNSIGNED NOT NULL,
  value_amount         DECIMAL(14,2) UNSIGNED NOT NULL,
  value_currency       CHAR(3)       NOT NULL DEFAULT 'AED',
  floors               SMALLINT UNSIGNED NOT NULL,
  featured             BOOLEAN       NOT NULL DEFAULT FALSE,
  status               VARCHAR(20)   NOT NULL DEFAULT 'draft',
  created_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_project_records_slug (slug),
  KEY idx_project_records_epromise_id (epromise_id),
  KEY idx_project_records_category (category),
  KEY idx_project_records_country (country),
  KEY idx_project_records_completion_status (completion_status),
  KEY idx_project_records_status (status),
  KEY idx_project_records_featured (featured),
  CONSTRAINT chk_project_records_status CHECK (status IN ('draft', 'published')),
  CONSTRAINT chk_project_records_completion_status CHECK (completion_status IN ('ongoing', 'completed', 'on_hold')),
  CONSTRAINT chk_project_records_duration CHECK (duration_months > 0),
  CONSTRAINT chk_project_records_workforce CHECK (peak_workforce > 0),
  CONSTRAINT chk_project_records_area CHECK (built_area_sqm > 0),
  CONSTRAINT chk_project_records_value CHECK (value_amount > 0),
  CONSTRAINT chk_project_records_floors CHECK (floors > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- project_metrics
-- ---------------------------------------------------------------------------
--
-- One row per metric, never a fixed set of "Key Metric 1/2/3" columns on
-- project_records: the eventual admin interface's Key Metric 1/2/3 slots
-- are simply the first three rows for a project ordered by
-- `display_order`, so the underlying table supports any number of metrics
-- without a schema change. No project name/common name/Epromise ID column
-- here — always obtained through the `project_id` join, never duplicated,
-- matching how news_article_images never stores its article's title.
--
-- `metric_value` is VARCHAR, not a numeric type: metrics must support both
-- numeric highlights ("85,000") and purely textual ones ("LEED Gold"), and
-- deciding that split is a Phase 2+ product question, not a Phase 1 schema
-- one. Any comma/unit formatting is a display-layer concern — this column
-- stores the raw value as entered.
CREATE TABLE IF NOT EXISTS project_metrics (
  id             CHAR(36)      NOT NULL,
  project_id     CHAR(36)      NOT NULL,
  metric_name    VARCHAR(100)  NOT NULL,
  metric_value   VARCHAR(100)  NOT NULL,
  metric_unit    VARCHAR(50)   NULL,
  display_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_project_metrics_project (project_id),
  UNIQUE KEY uq_project_metrics_project_order (project_id, display_order),
  CONSTRAINT fk_project_metrics_project FOREIGN KEY (project_id) REFERENCES project_records (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- project_images
-- ---------------------------------------------------------------------------
--
-- One row per image (never an array/list column) — mirrors
-- news_article_images exactly: `s3_key` is a private object key, never a
-- stored public URL (the object itself lives in S3, under the future
-- menasco-newsroom-prod/projects/images/<project-id>/ prefix — not created
-- by this migration); `position` is the canonical ordering field, same
-- name and semantics as news_article_images.position (not "display_order",
-- for direct naming consistency with the existing images table).
--
-- `is_primary` is a plain boolean, NOT paired with a generated
-- `primary_project_id` column as originally drafted. That approach was
-- actually attempted against production during this migration's rollout
-- and rejected by MySQL with `ER_CANNOT_ADD_FOREIGN` (1215): InnoDB
-- refuses a foreign key with CASCADE/SET NULL/SET DEFAULT on a column
-- that is also a "base column" of a STORED generated column, and
-- `project_id` is both the FK column here (needed for `ON DELETE CASCADE`
-- — cleaning up an image when its project is deleted, mirroring
-- news_article_images exactly) AND would have been the generated column's
-- base column. `ON DELETE CASCADE` on `project_id` is the one non-negotiable
-- half of that conflict; the generated-column uniqueness trick is the
-- disposable half, so it comes out. "At most one primary image per
-- project" is instead an application-layer invariant to be enforced by
-- Phase 3's actual write path (e.g. a transaction that unsets any
-- existing primary before setting a new one) — the same kind of
-- non-DB-enforced contract this schema already relies on for
-- `private_description` never crossing the public boundary.
CREATE TABLE IF NOT EXISTS project_images (
  id                   CHAR(36)      NOT NULL,
  project_id           CHAR(36)      NOT NULL,
  s3_key               VARCHAR(1024) NOT NULL,
  `position`           INT           NOT NULL,
  alt_text             VARCHAR(500)  NULL,
  caption              VARCHAR(1000) NULL,
  is_primary           BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_project_images_project (project_id),
  UNIQUE KEY uq_project_images_project_position (project_id, `position`),
  CONSTRAINT fk_project_images_project FOREIGN KEY (project_id) REFERENCES project_records (id) ON DELETE CASCADE,
  CONSTRAINT chk_project_images_position CHECK (`position` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
