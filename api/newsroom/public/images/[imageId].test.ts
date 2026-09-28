import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const getPublicImageS3Key = vi.fn();
vi.mock('../../../_lib/newsroom/publicArticles', () => ({
  getPublicImageS3Key: (...args: unknown[]) => getPublicImageS3Key(...args),
}));

const getObjectWithContentType = vi.fn();
vi.mock('../../../_lib/s3', () => ({
  getObjectWithContentType: (...args: unknown[]) => getObjectWithContentType(...args),
}));

import handler from './[imageId]';

const VALID_IMAGE_ID = 'e58cfbed-f651-4833-911c-416f85fe1e2c';

function mockRes() {
  const headers: Record<string, string> = {};
  let statusCode = 0;
  let body: unknown;
  const res: Partial<VercelResponse> = {};
  res.setHeader = vi.fn((k: string, v: string) => {
    headers[k] = v;
    return res as VercelResponse;
  });
  res.status = vi.fn((code: number) => {
    statusCode = code;
    return res as VercelResponse;
  });
  res.send = vi.fn((b: unknown) => {
    body = b;
    return res as VercelResponse;
  });
  res.json = vi.fn((b: unknown) => {
    body = b;
    return res as VercelResponse;
  });
  return { res: res as VercelResponse, headers, getStatus: () => statusCode, getBody: () => body };
}

/**
 * Regression coverage for the pre-launch cache-withdrawal hardening.
 * getPublicImageS3Key's own `status = 'published'` SQL join is the real
 * security boundary (untouched by this change) — these tests confirm the
 * handler still respects it and that the new short, non-SWR cache policy is
 * actually what's set.
 */
describe('GET /api/newsroom/public/images/:imageId — cache-withdrawal hardening', () => {
  beforeEach(() => {
    getPublicImageS3Key.mockReset();
    getObjectWithContentType.mockReset();
  });

  it('published image: 200, correct bytes, hardened cache policy with no stale-while-revalidate', async () => {
    getPublicImageS3Key.mockResolvedValueOnce('newsroom/articles/x/images/y.png');
    getObjectWithContentType.mockResolvedValueOnce({ body: Buffer.from('fake-png-bytes'), contentType: 'image/png' });

    const { res, headers, getStatus, getBody } = mockRes();
    await handler({ method: 'GET', query: { imageId: VALID_IMAGE_ID } } as unknown as VercelRequest, res);

    expect(getStatus()).toBe(200);
    expect(getBody()).toEqual(Buffer.from('fake-png-bytes'));
    expect(headers['Cache-Control']).toBe('public, max-age=60, must-revalidate');
    expect(headers['Cache-Control']).not.toContain('stale-while-revalidate');
  });

  it('image belonging to an unpublished/nonexistent article: 404 at origin, regardless of caching', async () => {
    getPublicImageS3Key.mockResolvedValueOnce(null);
    const { res, getStatus } = mockRes();
    await handler({ method: 'GET', query: { imageId: VALID_IMAGE_ID } } as unknown as VercelRequest, res);
    expect(getStatus()).toBe(404);
    expect(getObjectWithContentType).not.toHaveBeenCalled();
  });
});
