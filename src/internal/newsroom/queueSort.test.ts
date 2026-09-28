import { describe, it, expect } from 'vitest';
import { sortArticlesByCreatedAt } from './queueSort';
import type { ArticleSummary } from './types';

function makeArticle(overrides: Partial<ArticleSummary> & { id: string; createdAt: string }): ArticleSummary {
  return {
    slug: null,
    title: `Article ${overrides.id}`,
    category: null,
    featured: false,
    status: 'draft',
    updatedAt: overrides.createdAt,
    publishedAt: null,
    scheduledPublishAt: null,
    scheduledUnpublishAt: null,
    ...overrides,
  };
}

const oldest = makeArticle({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z', status: 'published', title: 'Oldest (published)' });
const middle = makeArticle({ id: 'b', createdAt: '2026-02-01T00:00:00.000Z', status: 'draft', title: 'Middle (draft)' });
const newest = makeArticle({ id: 'c', createdAt: '2026-03-01T00:00:00.000Z', status: 'draft', title: 'Newest (draft)' });

describe('sortArticlesByCreatedAt', () => {
  it('orders newest createdAt first when order is "newest"', () => {
    const result = sortArticlesByCreatedAt([oldest, newest, middle], 'newest');
    expect(result.map((a) => a.id)).toEqual(['c', 'b', 'a']);
  });

  it('orders oldest createdAt first when order is "oldest"', () => {
    const result = sortArticlesByCreatedAt([newest, oldest, middle], 'oldest');
    expect(result.map((a) => a.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by createdAt regardless of status — draft and published participate in the same chronological order', () => {
    // oldest is published, middle/newest are draft — order must still be purely chronological.
    const result = sortArticlesByCreatedAt([middle, oldest, newest], 'newest');
    expect(result.map((a) => a.status)).toEqual(['draft', 'draft', 'published']);
    expect(result.map((a) => a.id)).toEqual(['c', 'b', 'a']);
  });

  it('never uses updatedAt or publishedAt to order, even when they contradict createdAt', () => {
    const early = makeArticle({ id: 'x', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z', publishedAt: '2026-06-01T00:00:00.000Z', status: 'published' });
    const late = makeArticle({ id: 'y', createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z', publishedAt: null, status: 'draft' });
    const result = sortArticlesByCreatedAt([early, late], 'newest');
    // "y" has the later createdAt despite an earlier updatedAt and no publishedAt at all.
    expect(result.map((a) => a.id)).toEqual(['y', 'x']);
  });

  it('does not mutate the input array', () => {
    const input = [newest, oldest, middle];
    const originalOrder = input.map((a) => a.id);
    sortArticlesByCreatedAt(input, 'oldest');
    expect(input.map((a) => a.id)).toEqual(originalOrder);
  });

  it('handles an empty list', () => {
    expect(sortArticlesByCreatedAt([], 'newest')).toEqual([]);
  });

  it('breaks ties on id ascending, identically in both directions, when createdAt values are equal', () => {
    const sameTime = '2026-04-01T00:00:00.000Z';
    const tied = [
      makeArticle({ id: 'z', createdAt: sameTime }),
      makeArticle({ id: 'a', createdAt: sameTime }),
      makeArticle({ id: 'm', createdAt: sameTime }),
    ];
    expect(sortArticlesByCreatedAt(tied, 'newest').map((a) => a.id)).toEqual(['a', 'm', 'z']);
    expect(sortArticlesByCreatedAt(tied, 'oldest').map((a) => a.id)).toEqual(['a', 'm', 'z']);
  });

  it('does not silently no-op when createdAt is unparseable — sorts bad values to the oldest end instead', () => {
    const bad = makeArticle({ id: 'bad', createdAt: 'not-a-date' });
    const result = sortArticlesByCreatedAt([newest, bad, oldest, middle], 'newest');
    expect(result.map((a) => a.id)).toEqual(['c', 'b', 'a', 'bad']);
  });
});
