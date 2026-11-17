import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildNewsroomSitemapXml } from './newsroom-sitemap';
import handler from './newsroom-sitemap';
import { SITE_URL } from '../src/seo/constants';

const articles = [
  { slug: 'advancing-mep-delivery-through-prefabrication', publishedAt: '2026-09-15T12:18:51.000Z' },
  { slug: 'menasco-completes-data-centre-fitout', publishedAt: '2026-10-02T08:00:00.000Z' },
];

describe('buildNewsroomSitemapXml', () => {
  const xml = buildNewsroomSitemapXml(articles);

  it('is valid, namespaced sitemap XML', () => {
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });

  it('includes one <url> per published article with the real English article URL', () => {
    expect(xml).toContain(`<loc>${SITE_URL}/newsroom/advancing-mep-delivery-through-prefabrication</loc>`);
    expect(xml).toContain(`<loc>${SITE_URL}/newsroom/menasco-completes-data-centre-fitout</loc>`);
  });

  it('uses a real lastmod date derived from publishedAt, not the current timestamp', () => {
    expect(xml).toContain('<lastmod>2026-09-15</lastmod>');
    expect(xml).toContain('<lastmod>2026-10-02</lastmod>');
  });

  it('omits every URL when there are no published articles, without producing invalid XML', () => {
    const empty = buildNewsroomSitemapXml([]);
    expect(empty).toContain('<urlset');
    expect(empty).not.toContain('<url>');
  });
});

function mockRes() {
  const res: Partial<VercelResponse> & { _status?: number; _headers: Record<string, string>; _body?: unknown } = { _headers: {} };
  res.status = vi.fn((code: number) => {
    res._status = code;
    return res as VercelResponse;
  });
  res.setHeader = vi.fn((name: string, value: string) => {
    res._headers[name] = value;
    return res as VercelResponse;
  });
  res.send = vi.fn((body: unknown) => {
    res._body = body;
    return res as VercelResponse;
  });
  return res as VercelResponse & { _status?: number; _headers: Record<string, string>; _body?: unknown };
}

function mockReq(): VercelRequest {
  return { method: 'GET', query: {} } as unknown as VercelRequest;
}

describe('handler — network behavior (public API only, same published-only source as the article page)', () => {
  const originalEnv = process.env.NEWSROOM_PUBLIC_API_BASE_URL;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NEWSROOM_PUBLIC_API_BASE_URL = 'https://example-lambda.test';
  });

  afterEach(() => {
    process.env.NEWSROOM_PUBLIC_API_BASE_URL = originalEnv;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('calls only the public article-list endpoint and returns real XML with a short Cache-Control', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => articles });
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = mockRes();
    await handler(mockReq(), res);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://example-lambda.test/api/newsroom/public/articles');
    expect(res._status).toBe(200);
    expect(res._headers['Content-Type']).toContain('application/xml');
    expect(res._headers['Cache-Control']).toBe('public, s-maxage=300, must-revalidate');
    expect(String(res._body)).toContain('advancing-mep-delivery-through-prefabrication');
  });

  it('non-GET/HEAD method: 405, no upstream call made', async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    const req = { method: 'POST', query: {} } as unknown as VercelRequest;
    const res = mockRes();
    await handler(req, res);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(res._status).toBe(405);
  });
});
