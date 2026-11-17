import { describe, it, expect, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildGenericNotFoundHtml } from './not-found';
import handler from './not-found';

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

describe('buildGenericNotFoundHtml', () => {
  const html = buildGenericNotFoundHtml();

  it('is a real, noindex document that still boots the SPA bundle', () => {
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(html).toMatch(/<script type="module"[^>]*src="\/assets\/[^"]+\.js"/);
  });
});

describe('handler — the smallest change that gives unknown paths a real HTTP 404', () => {
  it('responds with real HTTP status 404 (not 200) for any unknown path, since this is what vercel.json\'s catch-all rewrite now points at', async () => {
    const req = { method: 'GET', query: {} } as unknown as VercelRequest;
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(404);
    expect(res._headers['X-Robots-Tag']).toBe('noindex, nofollow');
  });

  it('non-GET/HEAD method: 405', async () => {
    const req = { method: 'POST', query: {} } as unknown as VercelRequest;
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(405);
  });
});
