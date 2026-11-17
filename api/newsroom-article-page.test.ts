import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildArticleHtml, buildNotFoundHtml, escapeHtml } from './newsroom-article-page';
import handler from './newsroom-article-page';
import { SITE_URL } from '../src/seo/constants';

const article = {
  slug: 'advancing-mep-delivery-through-prefabrication',
  title: 'Advancing MEP Delivery Through Prefabrication',
  subtitle: 'MENASCO explores coordinated MEP prefabrication.',
  category: 'company-news',
  publishedAt: '2026-09-15T12:18:51.000Z',
  primaryImage: { url: '/api/newsroom/public/images/e58cfbed-f651-4833-911c-416f85fe1e2c' },
  tags: [{ name: 'MEP', slug: 'mep' }],
  structuredContent: {
    sections: [
      {
        blocks: [
          { type: 'paragraph' as const, text: 'MENASCO has coordinated prefabricated MEP assemblies across several live sites this year.' },
          { type: 'heading' as const, text: 'Scaling the approach', level: 2 as const },
        ],
      },
    ],
  },
  images: [],
};

describe('buildArticleHtml — published article, English', () => {
  const originalVercelEnv = process.env.VERCEL_ENV;
  const originalLaunchFlag = process.env.SEO_LAUNCH_INDEXING;
  let html: string;
  beforeEach(() => {
    // These assertions are about this function's OWN indexability logic
    // (locale/launch-state branching), not the launch gate itself — see the
    // separate 'buildArticleHtml — not an explicitly launched production
    // deployment' describe block below for that.
    process.env.VERCEL_ENV = 'production';
    process.env.SEO_LAUNCH_INDEXING = 'true';
    html = buildArticleHtml(article, 'en');
  });
  afterEach(() => {
    process.env.VERCEL_ENV = originalVercelEnv;
    process.env.SEO_LAUNCH_INDEXING = originalLaunchFlag;
  });

  it('has a real HTTP-response-shaped document with the built asset tags', () => {
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<div id="root">');
  });

  it('sets a real title suffixed with the site name', () => {
    expect(html).toContain('<title>Advancing MEP Delivery Through Prefabrication | MENASCO</title>');
  });

  it('sets the article subtitle as the meta description', () => {
    expect(html).toContain(`<meta name="description" content="${escapeHtml(article.subtitle)}" />`);
  });

  it('sets an English canonical URL', () => {
    expect(html).toContain(`<link rel="canonical" href="${SITE_URL}/newsroom/${article.slug}" />`);
  });

  it('marks the page indexable', () => {
    expect(html).toContain('<meta name="robots" content="index, follow" />');
  });

  it('sets hreflang en and x-default, but never advertises an hreflang="ar" alternate', () => {
    expect(html).toContain(`hreflang="en" href="${SITE_URL}/newsroom/${article.slug}"`);
    expect(html).toContain(`hreflang="x-default" href="${SITE_URL}/newsroom/${article.slug}"`);
    expect(html).not.toContain('hreflang="ar"');
  });

  it('sets Open Graph tags including an absolute first-party image URL', () => {
    expect(html).toContain('<meta property="og:type" content="article" />');
    expect(html).toContain('<meta property="og:title" content="Advancing MEP Delivery Through Prefabrication | MENASCO" />');
    expect(html).toContain(`<meta property="og:description" content="${escapeHtml(article.subtitle)}" />`);
    expect(html).toContain(`<meta property="og:url" content="${SITE_URL}/newsroom/${article.slug}" />`);
    const ogImage = `${SITE_URL}${article.primaryImage.url}`;
    expect(html).toContain(`<meta property="og:image" content="${ogImage}" />`);
    expect(ogImage).not.toContain('execute-api');
    expect(ogImage).not.toContain('amazonaws.com');
    expect(ogImage).not.toContain('s3.');
  });

  it('sets Twitter card metadata', () => {
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(html).toContain('<meta name="twitter:title" content="Advancing MEP Delivery Through Prefabrication | MENASCO" />');
    expect(html).toContain(`<meta name="twitter:image" content="${SITE_URL}${article.primaryImage.url}" />`);
  });

  it('embeds NewsArticle JSON-LD with headline, description, datePublished, image and publisher', () => {
    const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    expect(match).not.toBeNull();
    const jsonLd = JSON.parse(match![1]);
    expect(jsonLd['@type']).toBe('NewsArticle');
    expect(jsonLd.headline).toBe(article.title);
    expect(jsonLd.description).toBe(article.subtitle);
    expect(jsonLd.datePublished).toBe(article.publishedAt);
    expect(jsonLd.image).toEqual([`${SITE_URL}${article.primaryImage.url}`]);
    expect(jsonLd.publisher).toMatchObject({ '@type': 'Organization', name: 'MENASCO' });
  });

  it('references the current Vite JS bundle so the existing React app still boots', () => {
    expect(html).toMatch(/<script type="module"[^>]*src="\/assets\/[^"]+\.js"/);
  });

  it('renders the real article body — title (H1), subtitle, category, date, and structured-content sections as crawlable text inside #root', () => {
    expect(html).toContain('<h1>Advancing MEP Delivery Through Prefabrication</h1>');
    expect(html).toContain('<p>MENASCO explores coordinated MEP prefabrication.</p>');
    expect(html).toContain('Company News');
    expect(html).toMatch(/15 SEPT? 2026/);
    expect(html).toContain('MENASCO has coordinated prefabricated MEP assemblies across several live sites this year.');
    expect(html).toContain('<h3>Scaling the approach</h3>');
  });

  it('renders Related Topics as a real internal link to the Newsroom tag filter', () => {
    expect(html).toContain('<a href="/newsroom?tag=mep">MEP</a>');
  });

  it('renders a real internal link back to the Newsroom listing', () => {
    expect(html).toContain('<a href="/newsroom">Back to Newsroom</a>');
  });
});

describe('buildArticleHtml — Arabic (no independent Arabic content yet)', () => {
  const originalVercelEnv = process.env.VERCEL_ENV;
  const originalLaunchFlag = process.env.SEO_LAUNCH_INDEXING;
  let html: string;
  beforeEach(() => {
    process.env.VERCEL_ENV = 'production';
    process.env.SEO_LAUNCH_INDEXING = 'true';
    html = buildArticleHtml(article, 'ar');
  });
  afterEach(() => {
    process.env.VERCEL_ENV = originalVercelEnv;
    process.env.SEO_LAUNCH_INDEXING = originalLaunchFlag;
  });

  it('is noindex, follow — not indexed as a separate translated page', () => {
    expect(html).toContain('<meta name="robots" content="noindex, follow" />');
  });

  it('points canonical at the ENGLISH article URL, not an /ar URL', () => {
    expect(html).toContain(`<link rel="canonical" href="${SITE_URL}/newsroom/${article.slug}" />`);
    expect(html).not.toContain(`<link rel="canonical" href="${SITE_URL}/ar/newsroom/${article.slug}" />`);
  });

  it('never advertises an hreflang="ar" alternate', () => {
    expect(html).not.toContain('hreflang="ar"');
  });

  it('still renders in the Arabic document shell (lang/dir)', () => {
    expect(html).toContain('<html lang="ar" dir="rtl">');
  });

  it('reflects the actual /ar URL in og:url (what is actually being shared)', () => {
    expect(html).toContain(`<meta property="og:url" content="${SITE_URL}/ar/newsroom/${article.slug}" />`);
  });
});

describe('buildArticleHtml — not an explicitly launched production deployment (preview/branch/local)', () => {
  const originalVercelEnv = process.env.VERCEL_ENV;
  const originalLaunchFlag = process.env.SEO_LAUNCH_INDEXING;
  afterEach(() => {
    process.env.VERCEL_ENV = originalVercelEnv;
    process.env.SEO_LAUNCH_INDEXING = originalLaunchFlag;
  });

  it('forces noindex, nofollow for an English article when VERCEL_ENV is not "production"', () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.SEO_LAUNCH_INDEXING = 'true';
    const html = buildArticleHtml(article, 'en');
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />');
  });

  it('forces noindex, nofollow for an English article when SEO_LAUNCH_INDEXING is not "true", even on VERCEL_ENV=production', () => {
    process.env.VERCEL_ENV = 'production';
    delete process.env.SEO_LAUNCH_INDEXING;
    const html = buildArticleHtml(article, 'en');
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />');
  });
});

describe('buildNotFoundHtml — true 404, zero leakage', () => {
  const html = buildNotFoundHtml('en');

  it('is noindex, nofollow', () => {
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />');
  });

  it('leaks no article title, body, or metadata', () => {
    expect(html).not.toContain(article.title);
    expect(html).not.toContain(article.subtitle);
    expect(html).not.toContain(article.slug);
    expect(html).not.toContain(article.structuredContent.sections[0].blocks[0].text);
    expect(html).not.toContain('Related Topics');
  });

  it('embeds no NewsArticle JSON-LD', () => {
    expect(html).not.toContain('application/ld+json');
    expect(html).not.toContain('NewsArticle');
  });

  it('still references the app bundle (so the SPA can still boot behind it)', () => {
    expect(html).toMatch(/<script type="module"[^>]*src="\/assets\/[^"]+\.js"/);
  });
});

function mockRes() {
  const res: Partial<VercelResponse> & { _status?: number; _headers: Record<string, string>; _body?: unknown } = {
    _headers: {},
  };
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

function mockReq(query: Record<string, string>): VercelRequest {
  return { method: 'GET', query } as unknown as VercelRequest;
}

describe('handler — network behavior (public API only, no RDS/admin access)', () => {
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

  it('published article: calls only the public API endpoint (never an admin path) and returns a real 200 HTML response with a conservative Cache-Control', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => article,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const req = mockReq({ slug: article.slug, locale: 'en' });
    const res = mockRes();
    await handler(req, res);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toBe(`https://example-lambda.test/api/newsroom/public/articles/${article.slug}`);
    expect(calledUrl).not.toContain('admin');

    expect(res._status).toBe(200);
    expect(res._headers['Content-Type']).toContain('text/html');
    expect(res._headers['Cache-Control']).toBe('public, s-maxage=60, must-revalidate');
    expect(res._headers['Cache-Control']).not.toContain('stale-while-revalidate');
    expect(String(res._body)).toContain(article.title);
    // Not an explicitly launched production deployment in this test env
    // (VERCEL_ENV/SEO_LAUNCH_INDEXING are unset here) — the X-Robots-Tag
    // header must mirror the body's own <meta name="robots"> exactly.
    expect(res._headers['X-Robots-Tag']).toBe('noindex, nofollow');
  });

  it('unpublished/nonexistent slug: public API 404 produces a real HTTP 404 with no article leakage', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ status: 404, ok: false, json: async () => ({ error: 'Article not found' }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    const req = mockReq({ slug: 'not-a-real-article', locale: 'en' });
    const res = mockRes();
    await handler(req, res);

    expect(res._status).toBe(404);
    expect(String(res._body)).toContain('noindex, nofollow');
    expect(String(res._body)).not.toContain('NewsArticle');
  });

  it('missing slug: real 404, no upstream call made', async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const req = mockReq({ locale: 'en' });
    const res = mockRes();
    await handler(req, res);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(res._status).toBe(404);
  });

  it('non-GET/HEAD method: 405, no upstream call made', async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const req = { method: 'POST', query: { slug: article.slug, locale: 'en' } } as unknown as VercelRequest;
    const res = mockRes();
    await handler(req, res);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(res._status).toBe(405);
  });
});
