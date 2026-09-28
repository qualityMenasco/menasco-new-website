-- Newsroom Phase 6: scheduled publishing. Migrations 001-003 are already
-- applied to real RDS and are left untouched; this is a pure additive ALTER.
--
-- Deliberately NOT added: a `scheduled` status value. "Scheduled" is fully
-- derivable from existing state (status = 'ready' AND scheduled_publish_at
-- IS NOT NULL AND scheduled_publish_at > NOW()) — adding a real status would
-- force every existing status-checking code path to learn a new branch for
-- zero functional gain. Also deliberately NOT added: any EventBridge
-- schedule-id/ARN column or a schedule-version/token column — the chosen
-- mechanism (a single EventBridge Rule polling once a minute, not one
-- per-article schedule) has no per-article AWS resource to track, and RDS
-- state alone is re-evaluated fresh on every worker tick, so there is
-- nothing that can go "stale" for a version counter to guard against.
--
--   scheduled_publish_at   — when set (and in the future, and status is
--   'ready'), the article should automatically transition to 'published' at
--   this UTC instant. Cleared on: manual publish, the scheduled worker
--   firing it, or an editor cancelling it (PATCH null).
--
--   scheduled_unpublish_at — when set (and in the future, and status is
--   'ready' or 'published'), the article should automatically transition
--   back to 'ready' at this UTC instant. Cleared on: manual unpublish, the
--   scheduled worker firing it, or an editor cancelling it (PATCH null).
--
--   first_published_at     — set once, on the first-ever successful
--   transition into 'published', and never modified or cleared again
--   (distinct from `published_at`, which is the CURRENT publication
--   period's start and is cleared on every unpublish). Answers "when was
--   this article originally published" independent of how many times it
--   has since been unpublished/republished/rescheduled.

ALTER TABLE news_articles
  ADD COLUMN scheduled_publish_at TIMESTAMP NULL AFTER published_at,
  ADD COLUMN scheduled_unpublish_at TIMESTAMP NULL AFTER scheduled_publish_at,
  ADD COLUMN first_published_at TIMESTAMP NULL AFTER scheduled_unpublish_at;
