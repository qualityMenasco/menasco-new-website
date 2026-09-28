-- Newsroom Phase 1: storage foundation (news_articles, news_article_images).
-- Target: RDS MySQL 8.4 (menasco_newsroom database).
--
-- structured_content uses MySQL's native JSON column type — the original
-- architecture doc referred to JSONB, which is PostgreSQL-only and does not
-- exist in MySQL. JSON is MySQL's equivalent (binary-stored, validated on
-- write, indexable via generated columns if ever needed) and is what this
-- schema uses instead. structured_content stays NULL in Phase 1; Phase 2
-- defines and populates it from PDF extraction.
--
-- `status` is VARCHAR + an application-enforced allow-list, reinforced here
-- with a CHECK constraint (MySQL 8.0.16+/8.4 enforces these) rather than an
-- ENUM column — easier to extend later (ALTER ... DROP CHECK / ADD CHECK)
-- than an ENUM's fixed type definition, while still failing fast in the DB
-- if application validation is ever bypassed.

CREATE TABLE IF NOT EXISTS news_articles (
  id CHAR(36) NOT NULL,
  slug VARCHAR(255) NULL,
  title VARCHAR(500) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  structured_content JSON NULL,
  source_pdf_s3_key VARCHAR(1024) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  -- MySQL treats each NULL as distinct in a UNIQUE index, so any number of
  -- draft articles with slug = NULL is allowed; once a slug is set it must
  -- be unique.
  UNIQUE KEY uq_news_articles_slug (slug),
  KEY idx_news_articles_status (status),
  CONSTRAINT chk_news_articles_status
    CHECK (status IN ('draft', 'processing', 'ready', 'published', 'failed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news_article_images (
  id CHAR(36) NOT NULL,
  article_id CHAR(36) NOT NULL,
  s3_key VARCHAR(1024) NOT NULL,
  `position` INT NOT NULL,
  alt_text VARCHAR(500) NULL,
  caption VARCHAR(1000) NULL,
  role VARCHAR(50) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_news_article_images_article
    FOREIGN KEY (article_id) REFERENCES news_articles (id) ON DELETE CASCADE,
  -- Canonical ordering is `position`, never S3 filename order; also doubles
  -- as the mechanism that makes a retried finalize-image call idempotent
  -- (ON DUPLICATE KEY UPDATE on this same index instead of inserting a
  -- second row for the same position).
  UNIQUE KEY uq_news_article_images_article_position (article_id, `position`),
  KEY idx_news_article_images_article (article_id),
  CONSTRAINT chk_news_article_images_position CHECK (`position` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
