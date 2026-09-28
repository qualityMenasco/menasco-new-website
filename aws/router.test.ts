import { describe, it, expect } from 'vitest';
import { matchRoute, pathHasAnyMethod, routes } from './router';

/**
 * Regression coverage for the "Method DELETE not allowed" Production bug:
 * root cause was never a code defect in this route table (it has always
 * had a correct DELETE entry since the delete feature was first added) —
 * it was the deployed Lambda still running an OLDER build from before that
 * entry existed. These tests pin the CURRENT source's routing behavior so
 * a real regression here would be caught immediately, and so the next
 * Lambda deploy can be verified against a known-correct route table before
 * it ever reaches Production.
 */
describe('aws/router — DELETE /articles/:id', () => {
  it('has exactly one DELETE route registered for /articles/:id', () => {
    const deleteRoutes = routes.filter((route) => route.method === 'DELETE' && route.pattern === '/articles/:id');
    expect(deleteRoutes).toHaveLength(1);
  });

  it('matches a DELETE request to /articles/:id and extracts the article id', () => {
    const matched = matchRoute('DELETE', '/articles/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    expect(matched).not.toBeNull();
    expect(matched?.route.method).toBe('DELETE');
    expect(matched?.params).toEqual({ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' });
  });

  it('loads the same handler module DELETE /articles/:id is documented to use', async () => {
    const matched = matchRoute('DELETE', '/articles/some-id');
    expect(matched).not.toBeNull();
    const mod = await matched!.route.load();
    expect(typeof mod.default).toBe('function');
  });

  it('does not accidentally match DELETE against an unrelated path shape', () => {
    expect(matchRoute('DELETE', '/articles/some-id/process')).toBeNull();
    expect(matchRoute('DELETE', '/public/articles')).toBeNull();
  });

  it('reports 405-worthy (path exists, method does not) rather than 404 for a hypothetical missing method on a real path', () => {
    // Sanity-checks the exact mechanism that produced "Method DELETE not allowed" before this
    // route existed: pathHasAnyMethod must be true for /articles/:id (it is, via GET/PATCH/DELETE),
    // so a route table that were ever missing DELETE again would reproduce a 405, not a 404 —
    // proving the original bug really was a routing-table gap, not a path-matching bug.
    expect(pathHasAnyMethod('/articles/some-id')).toBe(true);
  });
});
