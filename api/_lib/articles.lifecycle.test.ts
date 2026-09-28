import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * A minimal in-memory fake that actually SIMULATES the conditional
 * UPDATE/COALESCE/CASE semantics publishArticle/unpublishArticle/
 * runScheduledPublishingWorker rely on — not just asserting the SQL text
 * contains the right substrings. There's no real MySQL instance available
 * in this test environment; this is deliberately a behavioral simulation
 * of the exact same state-transition rules the real SQL encodes, so these
 * tests would catch a real logic regression (e.g. published_at being reset
 * on a redundant republish), not just a string-shape one. It is NOT a
 * substitute for a real integration test against MySQL before Production
 * rollout — flagged as a residual risk in the implementation report.
 */
interface FakeRow {
  id: string;
  status: string;
  title: string | null;
  slug: string | null;
  structured_content: unknown;
  published_at: Date | null;
  first_published_at: Date | null;
  scheduled_publish_at: Date | null;
  scheduled_unpublish_at: Date | null;
}

let store: Map<string, FakeRow>;
let queryLog: string[];

function fakeQuery(sql: string, params?: Record<string, unknown>) {
  queryLog.push(sql);
  const now = new Date();
  const id = params?.id as string | undefined;

  if (sql.includes('SELECT * FROM news_articles WHERE id')) {
    const row = id ? store.get(id) : undefined;
    return Promise.resolve([row ? [{ ...row }] : []]);
  }

  // publishArticle's atomic UPDATE — discriminated on its WHERE clause
  // (`WHERE id = :id AND status IN (...)`), not its SET clause: the
  // worker's UPDATE shares the same "status = 'published'" /
  // "first_published_at = COALESCE" SET-clause text, so matching on those
  // alone would (and initially did) misattribute the worker's own
  // statement to this branch.
  if (sql.includes("status IN ('ready', 'published')")) {
    const row = id ? store.get(id) : undefined;
    if (!row || !['ready', 'published'].includes(row.status)) return Promise.resolve([{ affectedRows: 0 }]);
    const wasReady = row.status === 'ready';
    row.status = 'published';
    if (wasReady) row.published_at = now;
    if (!row.first_published_at) row.first_published_at = now;
    row.scheduled_publish_at = null;
    if (!(row.scheduled_unpublish_at && row.scheduled_unpublish_at > now)) row.scheduled_unpublish_at = null;
    return Promise.resolve([{ affectedRows: 1 }]);
  }

  // unpublishArticle's atomic UPDATE
  if (sql.includes("status = 'ready', published_at = NULL, scheduled_unpublish_at = NULL")) {
    const row = id ? store.get(id) : undefined;
    if (!row || row.status !== 'published') return Promise.resolve([{ affectedRows: 0 }]);
    row.status = 'ready';
    row.published_at = null;
    row.scheduled_unpublish_at = null;
    return Promise.resolve([{ affectedRows: 1 }]);
  }

  // worker: due scheduled publishes
  if (sql.includes("WHERE status = 'ready'") && sql.includes('scheduled_publish_at <= CURRENT_TIMESTAMP')) {
    let affected = 0;
    for (const row of store.values()) {
      if (row.status === 'ready' && row.scheduled_publish_at && row.scheduled_publish_at <= now) {
        row.status = 'published';
        row.published_at = now;
        if (!row.first_published_at) row.first_published_at = now;
        row.scheduled_publish_at = null;
        affected++;
      }
    }
    return Promise.resolve([{ affectedRows: affected }]);
  }

  // worker: due scheduled unpublishes
  if (sql.includes("WHERE status = 'published'") && sql.includes('scheduled_unpublish_at <= CURRENT_TIMESTAMP')) {
    let affected = 0;
    for (const row of store.values()) {
      if (row.status === 'published' && row.scheduled_unpublish_at && row.scheduled_unpublish_at <= now) {
        row.status = 'ready';
        row.published_at = null;
        row.scheduled_unpublish_at = null;
        affected++;
      }
    }
    return Promise.resolve([{ affectedRows: affected }]);
  }

  throw new Error(`fakeQuery: unrecognized SQL: ${sql}`);
}

vi.mock('./db', () => ({
  getPool: () => ({ query: fakeQuery }),
  isDuplicateEntryError: () => false,
}));

const { publishArticle, unpublishArticle, runScheduledPublishingWorker } = await import('./articles');
const { HttpError } = await import('./http');

function seed(id: string, overrides: Partial<FakeRow> = {}): FakeRow {
  const row: FakeRow = {
    id,
    status: 'ready',
    title: 'Title',
    slug: 'slug',
    structured_content: { version: 1, sections: [] },
    published_at: null,
    first_published_at: null,
    scheduled_publish_at: null,
    scheduled_unpublish_at: null,
    ...overrides,
  };
  store.set(id, row);
  return row;
}

const FUTURE = () => new Date(Date.now() + 60 * 60 * 1000);
const PAST = () => new Date(Date.now() - 60 * 60 * 1000);

beforeEach(() => {
  store = new Map();
  queryLog = [];
});

describe('REGRESSION: publishArticle SET-clause ordering (real-MySQL-only bug)', () => {
  /**
   * A real bug, found only by an actual MySQL 8.4 integration run (this
   * in-memory fake, which checks `wasReady` before mutating, could not
   * reproduce it): MySQL evaluates a single UPDATE's SET assignments left
   * to right, so an expression referencing a column already assigned
   * earlier in the SAME statement sees that NEW value. With
   * `status = 'published'` listed before `published_at = CASE WHEN
   * status = 'ready' ...`, the CASE always saw the just-updated
   * 'published' value and was therefore never true — published_at stayed
   * NULL forever on a real first publish. Fixed by moving `status =
   * 'published'` to the end of the SET list. This test guards the fix at
   * the SQL-text level so a future refactor can't silently reintroduce the
   * same ordering mistake without a live database to catch it.
   */
  it('published_at\'s CASE (which reads `status`) appears before `status = \'published\'` is assigned', async () => {
    seed('a1', { status: 'ready' });
    await publishArticle('a1');
    const publishSql = queryLog.find((sql) => sql.includes("status IN ('ready', 'published')"));
    expect(publishSql).toBeDefined();
    const caseIndex = publishSql!.indexOf('published_at = CASE');
    const statusAssignIndex = publishSql!.indexOf("status = 'published'");
    expect(caseIndex).toBeGreaterThan(-1);
    expect(statusAssignIndex).toBeGreaterThan(-1);
    expect(caseIndex).toBeLessThan(statusAssignIndex);
  });
});

describe('MANUAL OVERRIDES — publishArticle', () => {
  it('ready -> published sets published_at and first_published_at', async () => {
    seed('a1');
    await publishArticle('a1');
    const row = store.get('a1')!;
    expect(row.status).toBe('published');
    expect(row.published_at).not.toBeNull();
    expect(row.first_published_at).not.toBeNull();
  });

  it('redundant Publish on an already-published article does NOT change published_at', async () => {
    const originalPublishedAt = new Date(Date.now() - 5000);
    seed('a1', { status: 'published', published_at: originalPublishedAt, first_published_at: originalPublishedAt });
    await publishArticle('a1');
    const row = store.get('a1')!;
    expect(row.published_at).toEqual(originalPublishedAt);
  });

  it('redundant Publish does NOT change first_published_at', async () => {
    const original = new Date(Date.now() - 100_000);
    seed('a1', { status: 'published', published_at: new Date(), first_published_at: original });
    await publishArticle('a1');
    expect(store.get('a1')!.first_published_at).toEqual(original);
  });

  it('a republish after unpublish (first_published_at already set) preserves it, but sets a NEW published_at', async () => {
    const original = new Date(Date.now() - 200_000);
    seed('a1', { status: 'ready', published_at: null, first_published_at: original });
    await publishArticle('a1');
    const row = store.get('a1')!;
    expect(row.first_published_at).toEqual(original);
    expect(row.published_at).not.toBeNull();
  });

  it('manual publish cancels a pending scheduled_publish_at', async () => {
    seed('a1', { scheduled_publish_at: FUTURE() });
    await publishArticle('a1');
    expect(store.get('a1')!.scheduled_publish_at).toBeNull();
  });

  it('manual publish preserves a valid future scheduled_unpublish_at', async () => {
    const end = FUTURE();
    seed('a1', { scheduled_unpublish_at: end });
    await publishArticle('a1');
    expect(store.get('a1')!.scheduled_unpublish_at).toEqual(end);
  });

  it('manual publish clears a past-due scheduled_unpublish_at rather than leaving it dangling', async () => {
    seed('a1', { scheduled_unpublish_at: PAST() });
    await publishArticle('a1');
    expect(store.get('a1')!.scheduled_unpublish_at).toBeNull();
  });

  it('rejects publishing a draft article', async () => {
    seed('a1', { status: 'draft' });
    await expect(publishArticle('a1')).rejects.toBeInstanceOf(HttpError);
  });
});

describe('MANUAL OVERRIDES — unpublishArticle', () => {
  it('published -> ready clears current published_at', async () => {
    seed('a1', { status: 'published', published_at: new Date() });
    await unpublishArticle('a1');
    const row = store.get('a1')!;
    expect(row.status).toBe('ready');
    expect(row.published_at).toBeNull();
  });

  it('preserves first_published_at', async () => {
    const original = new Date(Date.now() - 100_000);
    seed('a1', { status: 'published', published_at: new Date(), first_published_at: original });
    await unpublishArticle('a1');
    expect(store.get('a1')!.first_published_at).toEqual(original);
  });

  it('cancels a pending scheduled_unpublish_at', async () => {
    seed('a1', { status: 'published', scheduled_unpublish_at: FUTURE() });
    await unpublishArticle('a1');
    expect(store.get('a1')!.scheduled_unpublish_at).toBeNull();
  });

  it('rejects unpublishing a non-published article', async () => {
    seed('a1', { status: 'ready' });
    await expect(unpublishArticle('a1')).rejects.toBeInstanceOf(HttpError);
  });
});

describe('WORKER — runScheduledPublishingWorker', () => {
  it('publishes a due ready article', async () => {
    seed('a1', { status: 'ready', scheduled_publish_at: PAST() });
    const result = await runScheduledPublishingWorker();
    expect(result.published).toBe(1);
    expect(store.get('a1')!.status).toBe('published');
  });

  it('leaves a future-scheduled article untouched', async () => {
    seed('a1', { status: 'ready', scheduled_publish_at: FUTURE() });
    const result = await runScheduledPublishingWorker();
    expect(result.published).toBe(0);
    expect(store.get('a1')!.status).toBe('ready');
  });

  it('unpublishes a due published article', async () => {
    seed('a1', { status: 'published', published_at: new Date(), scheduled_unpublish_at: PAST() });
    const result = await runScheduledPublishingWorker();
    expect(result.unpublished).toBe(1);
    expect(store.get('a1')!.status).toBe('ready');
  });

  it('duplicate worker invocation is idempotent — second run is a no-op', async () => {
    seed('a1', { status: 'ready', scheduled_publish_at: PAST() });
    const first = await runScheduledPublishingWorker();
    const second = await runScheduledPublishingWorker();
    expect(first.published).toBe(1);
    expect(second.published).toBe(0);
    expect(store.get('a1')!.status).toBe('published');
  });

  it('first_published_at is set only once, across repeated worker runs', async () => {
    seed('a1', { status: 'ready', scheduled_publish_at: PAST() });
    await runScheduledPublishingWorker();
    const firstPublishedAt = store.get('a1')!.first_published_at;
    // simulate an unpublish + reschedule + fire again
    store.get('a1')!.status = 'ready';
    store.get('a1')!.scheduled_publish_at = PAST();
    await runScheduledPublishingWorker();
    expect(store.get('a1')!.first_published_at).toEqual(firstPublishedAt);
  });

  it('SAME-TICK ORDERING: an article whose start and end have both already passed ends the tick unpublished, not published', async () => {
    seed('a1', { status: 'ready', scheduled_publish_at: PAST(), scheduled_unpublish_at: PAST() });
    const result = await runScheduledPublishingWorker();
    expect(result.published).toBe(1);
    expect(result.unpublished).toBe(1);
    const row = store.get('a1')!;
    expect(row.status).toBe('ready');
    expect(row.published_at).toBeNull();
    // first_published_at still gets recorded even though the article ends the tick unpublished.
    expect(row.first_published_at).not.toBeNull();
  });
});
