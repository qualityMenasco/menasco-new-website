import { describe, it, expect, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

vi.mock('../../../_lib/newsroom/publicArticles', () => ({
  listPublishedArticles: vi.fn().mockResolvedValue([{ id: 'a1', slug: 'a', title: 'A', subtitle: null, category: null, publishedAt: '2026-01-01T00:00:00.000Z', featured: true, tags: [], primaryImage: null }]),
}));

import handler from './index';

function mockRes() {
  const headers: Record<string, string> = {};
  const res: Partial<VercelResponse> = {};
  res.setHeader = vi.fn((k: string, v: string) => {
    headers[k] = v;
    return res as VercelResponse;
  });
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return { res: res as VercelResponse, headers };
}

/** Regression coverage for the pre-launch cache-withdrawal hardening: an unpublish must not remain publicly listed for up to an hour via stale-while-revalidate. */
describe('GET /api/newsroom/public/articles — cache-withdrawal hardening', () => {
  it('sets s-maxage=60 and must-revalidate', async () => {
    const { res, headers } = mockRes();
    await handler({ method: 'GET', query: {} } as unknown as VercelRequest, res);
    expect(headers['Cache-Control']).toBe('public, s-maxage=60, must-revalidate');
  });

  it('never includes stale-while-revalidate', async () => {
    const { res, headers } = mockRes();
    await handler({ method: 'GET', query: {} } as unknown as VercelRequest, res);
    expect(headers['Cache-Control']).not.toContain('stale-while-revalidate');
  });
});
