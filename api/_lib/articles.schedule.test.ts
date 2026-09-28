import { describe, it, expect } from 'vitest';
import { validateScheduleUpdate, type ArticleRow } from './articles';
import { HttpError } from './http';

/**
 * validateScheduleUpdate is a pure function (no DB I/O) — the entire
 * SCHEDULING VALIDATION surface from the Phase 6 spec is directly testable
 * here without mocking anything.
 */
// `Omit<..., 'constructor'>`: RowDataPacket (ArticleRow's base interface)
// declares a real `constructor: { name: 'RowDataPacket' }` property — a
// plain object literal's inherited `Object.prototype.constructor` doesn't
// structurally match that narrow branded type, which TS's fresh-object-
// literal checking flags even under Partial<>. Excluded here since these
// tests never touch it; the final `as ArticleRow` cast below still
// produces a fully-typed row for the real function signatures.
function makeArticle(overrides: Partial<Omit<ArticleRow, 'constructor'>> = {}): ArticleRow {
  return {
    id: 'a1',
    slug: 'a',
    title: 'A',
    subtitle: null,
    category: null,
    tags: null,
    featured: 0,
    status: 'ready',
    structured_content: { version: 1, sections: [] },
    source_pdf_s3_key: 'x',
    processing_error: null,
    processed_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: null,
    scheduled_publish_at: null,
    scheduled_unpublish_at: null,
    first_published_at: null,
    ...overrides,
  } as ArticleRow;
}

const FUTURE = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const FURTHER_FUTURE = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
const PAST = new Date(Date.now() - 60 * 60 * 1000).toISOString();

describe('validateScheduleUpdate — future publish', () => {
  it('accepted for a ready article', () => {
    const result = validateScheduleUpdate(makeArticle({ status: 'ready' }), { scheduledPublishAt: FUTURE });
    expect(result.scheduledPublishAt).toEqual(new Date(FUTURE));
  });

  it('rejected for a non-ready article (must be publishable/ready)', () => {
    expect(() => validateScheduleUpdate(makeArticle({ status: 'draft' }), { scheduledPublishAt: FUTURE })).toThrow(HttpError);
    expect(() => validateScheduleUpdate(makeArticle({ status: 'published' }), { scheduledPublishAt: FUTURE })).toThrow(HttpError);
    expect(() => validateScheduleUpdate(makeArticle({ status: 'processing' }), { scheduledPublishAt: FUTURE })).toThrow(HttpError);
    expect(() => validateScheduleUpdate(makeArticle({ status: 'failed' }), { scheduledPublishAt: FUTURE })).toThrow(HttpError);
  });

  it('a past start is rejected', () => {
    expect(() => validateScheduleUpdate(makeArticle({ status: 'ready' }), { scheduledPublishAt: PAST })).toThrow(HttpError);
  });
});

describe('validateScheduleUpdate — future unpublish', () => {
  it('accepted for a ready article (future publish + future end)', () => {
    const result = validateScheduleUpdate(makeArticle({ status: 'ready' }), { scheduledUnpublishAt: FUTURE });
    expect(result.scheduledUnpublishAt).toEqual(new Date(FUTURE));
  });

  it('accepted for an already-published article with no pending start', () => {
    const result = validateScheduleUpdate(makeArticle({ status: 'published' }), { scheduledUnpublishAt: FUTURE });
    expect(result.scheduledUnpublishAt).toEqual(new Date(FUTURE));
  });

  it('rejected for draft/processing/failed', () => {
    expect(() => validateScheduleUpdate(makeArticle({ status: 'draft' }), { scheduledUnpublishAt: FUTURE })).toThrow(HttpError);
    expect(() => validateScheduleUpdate(makeArticle({ status: 'processing' }), { scheduledUnpublishAt: FUTURE })).toThrow(HttpError);
    expect(() => validateScheduleUpdate(makeArticle({ status: 'failed' }), { scheduledUnpublishAt: FUTURE })).toThrow(HttpError);
  });

  it('a past end is rejected', () => {
    expect(() => validateScheduleUpdate(makeArticle({ status: 'published' }), { scheduledUnpublishAt: PAST })).toThrow(HttpError);
  });
});

describe('validateScheduleUpdate — end must be later than start', () => {
  it('rejected when end <= start, both in this same PATCH', () => {
    expect(() =>
      validateScheduleUpdate(makeArticle({ status: 'ready' }), { scheduledPublishAt: FURTHER_FUTURE, scheduledUnpublishAt: FUTURE }),
    ).toThrow(HttpError);
  });

  it('accepted when end > start, both in this same PATCH', () => {
    const result = validateScheduleUpdate(makeArticle({ status: 'ready' }), { scheduledPublishAt: FUTURE, scheduledUnpublishAt: FURTHER_FUTURE });
    expect(result.scheduledPublishAt).toEqual(new Date(FUTURE));
    expect(result.scheduledUnpublishAt).toEqual(new Date(FURTHER_FUTURE));
  });

  it('CROSS-FIELD: patching only scheduledUnpublishAt is rejected against the EXISTING stored scheduledPublishAt', () => {
    // existing scheduledPublishAt = further future; PATCH only scheduledUnpublishAt = an earlier future time
    const article = makeArticle({ status: 'ready', scheduled_publish_at: new Date(FURTHER_FUTURE) });
    expect(() => validateScheduleUpdate(article, { scheduledUnpublishAt: FUTURE })).toThrow(HttpError);
  });

  it('CROSS-FIELD: patching only scheduledPublishAt is validated against the EXISTING stored scheduledUnpublishAt', () => {
    const article = makeArticle({ status: 'ready', scheduled_unpublish_at: new Date(FUTURE) });
    expect(() => validateScheduleUpdate(article, { scheduledPublishAt: FURTHER_FUTURE })).toThrow(HttpError);
  });
});

describe('validateScheduleUpdate — cancellation via null', () => {
  it('scheduledPublishAt: null cancels without touching status', () => {
    const result = validateScheduleUpdate(makeArticle({ status: 'ready', scheduled_publish_at: new Date(FUTURE) }), {
      scheduledPublishAt: null,
    });
    expect(result.scheduledPublishAt).toBeNull();
  });

  it('scheduledUnpublishAt: null cancels without touching status', () => {
    const result = validateScheduleUpdate(makeArticle({ status: 'published', scheduled_unpublish_at: new Date(FUTURE) }), {
      scheduledUnpublishAt: null,
    });
    expect(result.scheduledUnpublishAt).toBeNull();
  });

  it('cancelling one field does not require the article to still satisfy that field\'s status precondition', () => {
    // A published article can still cancel a (structurally-impossible-but-defensively-handled) scheduledPublishAt.
    const result = validateScheduleUpdate(makeArticle({ status: 'published' }), { scheduledPublishAt: null });
    expect(result.scheduledPublishAt).toBeNull();
  });
});
