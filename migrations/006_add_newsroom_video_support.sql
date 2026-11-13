-- Newsroom: video support for article media.
--
-- `news_article_images` already models "an ordered piece of media attached
-- to an article" (position, alt_text, caption, role) — a video is simply
-- another kind of media in that same ordered list, not a new concept, so
-- this reuses the existing table rather than introducing
-- `news_article_videos` as a parallel one. `media_type` defaults to
-- 'image' so every existing row (all of which are images today) is valid
-- with no backfill needed.
--
-- Orientation (landscape/portrait) is deliberately NOT stored here — the
-- browser already loads the media element to render it, so the frontend
-- reads `videoWidth`/`videoHeight` (or `naturalWidth`/`naturalHeight` for an
-- image) at render time instead. Storing it would mean either trusting an
-- unverified client-reported value or adding server-side video probing
-- (ffprobe) to the Lambda, which is a real infra change outside this
-- migration's scope.

ALTER TABLE news_article_images
  ADD COLUMN media_type VARCHAR(10) NOT NULL DEFAULT 'image' AFTER s3_key,
  ADD CONSTRAINT chk_news_article_images_media_type CHECK (media_type IN ('image', 'video'));
