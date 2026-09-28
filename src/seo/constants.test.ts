import { describe, it, expect } from 'vitest';
import { toAbsoluteUrl, SITE_URL } from './constants';

/**
 * `toAbsoluteUrl` exists specifically to fix a real bug: Newsroom public
 * image URLs come back from the API as first-party-relative paths (e.g.
 * `/api/newsroom/public/images/:id`, proxied to AWS by a Vercel rewrite —
 * correct for same-origin <img> tags), but og:image/twitter:image/
 * NewsArticle.image must be absolute for crawlers that don't resolve
 * relative to the page.
 */
describe('toAbsoluteUrl', () => {
  it('prefixes a relative path with SITE_URL', () => {
    expect(toAbsoluteUrl('/api/newsroom/public/images/abc123')).toBe(`${SITE_URL}/api/newsroom/public/images/abc123`);
  });

  it('never produces the AWS API Gateway hostname — only the canonical SITE_URL', () => {
    const url = toAbsoluteUrl('/api/newsroom/public/images/abc123');
    expect(url).not.toContain('execute-api');
    expect(url).not.toContain('amazonaws.com');
    expect(url.startsWith(SITE_URL)).toBe(true);
  });

  it('passes an already-absolute URL through unchanged rather than double-prefixing', () => {
    expect(toAbsoluteUrl('https://example.com/already/absolute.png')).toBe('https://example.com/already/absolute.png');
  });

  it('adds a leading slash if the given path is missing one', () => {
    expect(toAbsoluteUrl('api/newsroom/public/images/abc123')).toBe(`${SITE_URL}/api/newsroom/public/images/abc123`);
  });
});
