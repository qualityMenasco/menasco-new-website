import { describe, it, expect } from 'vitest';
import { sanitizeStructuredContentForPublic, publicImageUrl } from './publicArticles';

/**
 * Regression coverage for the pre-launch cache-withdrawal hardening pass:
 * confirms this hardening (cache headers only) caused no regression in the
 * separate, pre-existing source-PDF privacy boundary. `sourcePdfKey` is the
 * private S3 key of the source PDF and must never cross into a public
 * response at any article status.
 */
describe('sanitizeStructuredContentForPublic — source PDF stays private', () => {
  it('strips sourcePdfKey (and all other processing provenance) from structured_content.source', () => {
    const raw = {
      version: 1,
      sections: [{ heading: 'A', blocks: [] }],
      summary: 'A safe summary',
      source: {
        extractor: 'unpdf',
        extractedAt: '2026-01-01T00:00:00.000Z',
        sourcePdfKey: 'newsroom/articles/some-id/source/article.pdf',
        pageCount: 2,
      },
    };
    const sanitized = sanitizeStructuredContentForPublic(raw) as Record<string, unknown>;
    expect(sanitized).toEqual({ version: 1, sections: raw.sections, summary: raw.summary });
    expect(JSON.stringify(sanitized)).not.toContain('sourcePdfKey');
    expect(JSON.stringify(sanitized)).not.toContain('article.pdf');
    expect('source' in sanitized).toBe(false);
  });

  it('omits summary entirely when absent, rather than emitting undefined', () => {
    const sanitized = sanitizeStructuredContentForPublic({ version: 1, sections: [], source: { sourcePdfKey: 'x' } });
    expect('summary' in (sanitized as object)).toBe(false);
  });

  it('non-object input passes through unchanged (defensive, not a source-PDF concern)', () => {
    expect(sanitizeStructuredContentForPublic(null)).toBeNull();
  });
});

describe('publicImageUrl — never exposes S3/AWS hosts, only the first-party proxy path', () => {
  it('builds a same-origin relative path, not a raw S3/presigned URL', () => {
    const url = publicImageUrl('abc123');
    expect(url).toBe('/api/newsroom/public/images/abc123');
    expect(url).not.toContain('amazonaws.com');
    expect(url).not.toContain('X-Amz-');
  });
});
