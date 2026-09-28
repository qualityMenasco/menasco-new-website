import { describe, it, expect } from 'vitest';
import { matchRoute, pathHasAnyMethod, routes } from './projects-router';

describe('projects-router', () => {
  it('has exactly one route per method/pattern combination — no ambiguous duplicates', () => {
    const seen = new Set<string>();
    for (const route of routes) {
      const key = `${route.method} ${route.pattern}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('matches the public routes and extracts params', () => {
    expect(matchRoute('GET', '/public/projects')).not.toBeNull();
    const detail = matchRoute('GET', '/public/projects/vela-by-omniyat');
    expect(detail?.params).toEqual({ slug: 'vela-by-omniyat' });
    const img = matchRoute('GET', '/public/images/abc-123');
    expect(img?.params).toEqual({ imageId: 'abc-123' });
  });

  it('matches admin CRUD routes for a project id', () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    expect(matchRoute('GET', `/${id}`)?.params).toEqual({ id });
    expect(matchRoute('PATCH', `/${id}`)?.params).toEqual({ id });
    expect(matchRoute('DELETE', `/${id}`)?.params).toEqual({ id });
    expect(matchRoute('GET', '/')).not.toBeNull();
    expect(matchRoute('POST', '/')).not.toBeNull();
  });

  it('routes the literal images/metrics suffixes before the generic :id catch-all, never colliding with an imageId/metricId literally named "reorder"/"primary"/"uploads"', () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const reorderImages = matchRoute('POST', `/${id}/images/reorder`);
    expect(reorderImages?.route.pattern).toBe('/:id/images/reorder');

    const uploads = matchRoute('POST', `/${id}/images/uploads`);
    expect(uploads?.route.pattern).toBe('/:id/images/uploads');

    const uploadsComplete = matchRoute('POST', `/${id}/images/uploads/complete`);
    expect(uploadsComplete?.route.pattern).toBe('/:id/images/uploads/complete');

    const primary = matchRoute('POST', `/${id}/images/some-image-id/primary`);
    expect(primary?.route.pattern).toBe('/:id/images/:imageId/primary');
    expect(primary?.params).toEqual({ id, imageId: 'some-image-id' });

    const reorderMetrics = matchRoute('POST', `/${id}/metrics/reorder`);
    expect(reorderMetrics?.route.pattern).toBe('/:id/metrics/reorder');
  });

  it('loads a real handler module for every route', async () => {
    for (const route of routes) {
      const mod = await route.load();
      expect(typeof mod.default).toBe('function');
    }
  });

  it('reports 405-worthy (path exists, method does not) rather than 404 for an unsupported method on a real path', () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    expect(pathHasAnyMethod(`/${id}`)).toBe(true);
    expect(matchRoute('DELETE', '/public/projects')).toBeNull(); // GET-only
    expect(pathHasAnyMethod('/public/projects')).toBe(true);
  });

  it('returns null for a genuinely unknown path', () => {
    expect(matchRoute('GET', '/this/does/not/exist')).toBeNull();
    expect(pathHasAnyMethod('/this/does/not/exist')).toBe(false);
  });
});
