import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchPublicArticles, fetchPublicArticleBySlug } from './newsroomPublicApi';

function mockFetchOnce(status: number, body: unknown, ok = status >= 200 && status < 300) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: async () => body,
    }),
  );
}

beforeEach(() => {
  vi.unstubAllEnvs();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchPublicArticles', () => {
  it('handles an empty [] response (zero published articles) gracefully', async () => {
    mockFetchOnce(200, []);
    await expect(fetchPublicArticles()).resolves.toEqual([]);
  });

  it('handles a populated response', async () => {
    mockFetchOnce(200, [{ id: 'a1', slug: 'test', title: 'Test', subtitle: null, category: null, publishedAt: '2026-01-01T00:00:00.000Z', featured: false, tags: [], primaryImage: null }]);
    const result = await fetchPublicArticles();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('test');
  });

  it('treats a malformed (non-array) list response as empty rather than crashing the page', async () => {
    mockFetchOnce(200, { unexpected: 'shape' });
    await expect(fetchPublicArticles()).resolves.toEqual([]);
  });

  it('throws a safe, generic error on a non-2xx response — never leaks the response body', async () => {
    mockFetchOnce(500, { error: 'Internal server error' });
    await expect(fetchPublicArticles()).rejects.toThrow(/HTTP 500/);
    // The thrown message must not include the raw body content, even though the body itself is already safe server-side — this client layer doesn't rely on that alone.
    try {
      await fetchPublicArticles();
    } catch (err) {
      expect((err as Error).message).not.toContain('Internal server error');
    }
  });

  it('throws a safe error when the response body is not valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      }),
    );
    await expect(fetchPublicArticles()).rejects.toThrow(/invalid response/);
  });
});

describe('fetchPublicArticleBySlug', () => {
  it('returns null for a 404 (nonexistent or unpublished slug) rather than throwing', async () => {
    mockFetchOnce(404, { error: 'Article not found' });
    await expect(fetchPublicArticleBySlug('does-not-exist')).resolves.toBeNull();
  });

  it('returns the parsed article on success', async () => {
    mockFetchOnce(200, {
      id: 'a1', slug: 'test', title: 'Test', subtitle: null, category: null, publishedAt: '2026-01-01T00:00:00.000Z',
      featured: false, tags: [], primaryImage: null, images: [], structuredContent: { version: 1, sections: [] },
    });
    const result = await fetchPublicArticleBySlug('test');
    expect(result?.slug).toBe('test');
  });
});
