import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const getPublishedArticleBySlug = vi.fn();
vi.mock('../../../_lib/newsroom/publicArticles', () => ({
  getPublishedArticleBySlug: (...args: unknown[]) => getPublishedArticleBySlug(...args),
}));

import handler from './[slug]';

function mockRes() {
  const headers: Record<string, string> = {};
  let statusCode = 0;
  const res: Partial<VercelResponse> = {};
  res.setHeader = vi.fn((k: string, v: string) => {
    headers[k] = v;
    return res as VercelResponse;
  });
  res.status = vi.fn((code: number) => {
    statusCode = code;
    return res as VercelResponse;
  });
  res.json = vi.fn().mockReturnValue(res);
  return { res: res as VercelResponse, headers, getStatus: () => statusCode };
}

/** Regression coverage for the pre-launch cache-withdrawal hardening. */
describe('GET /api/newsroom/public/articles/:slug — cache-withdrawal hardening', () => {
  beforeEach(() => {
    getPublishedArticleBySlug.mockReset();
  });

  it('200 (published article): sets s-maxage=60 and must-revalidate, no stale-while-revalidate', async () => {
    getPublishedArticleBySlug.mockResolvedValueOnce({ id: 'a1', slug: 'a', title: 'A', subtitle: null, category: null, publishedAt: '2026-01-01T00:00:00.000Z', featured: false, tags: [], primaryImage: null, structuredContent: { version: 1, sections: [] }, images: [] });
    const { res, headers } = mockRes();
    await handler({ method: 'GET', query: { slug: 'a' } } as unknown as VercelRequest, res);
    expect(headers['Cache-Control']).toBe('public, s-maxage=60, must-revalidate');
    expect(headers['Cache-Control']).not.toContain('stale-while-revalidate');
  });

  it('404 (unpublished or nonexistent slug): no long-lived cache header that could block a future publish from appearing', async () => {
    getPublishedArticleBySlug.mockResolvedValueOnce(null);
    const { res, headers, getStatus } = mockRes();
    await handler({ method: 'GET', query: { slug: 'not-published' } } as unknown as VercelRequest, res);
    expect(getStatus()).toBe(404);
    expect(headers['Cache-Control']).toBeUndefined();
  });
});
