/**
 * Explicit route table for the Projects Lambda adapter — mirrors
 * aws/router.ts exactly (same technique: a data table instead of Vercel's
 * file-based routing, dynamically imported per-route), pointed at
 * `api/projects/**` instead of `api/newsroom/**`. Deliberately a SEPARATE
 * table/Lambda from Newsroom's, not a shared/generalized router — the two
 * backends stay logically isolated end to end (separate Lambda, separate
 * DB user, separate IAM, separate API key), matching the Phase 3
 * architecture decision.
 *
 * Route order matters: more literal/specific patterns are listed before
 * more general dynamic ones (e.g. `/:id/images/reorder` before
 * `/:id/images/:imageId`) — first match wins, top to bottom.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

export interface RouteDefinition {
  method: string;
  pattern: string;
  load: () => Promise<{ default: Handler }>;
}

export const routes: RouteDefinition[] = [
  // --- Public (unauthenticated) ---
  { method: 'GET', pattern: '/public/projects', load: () => import('../api/projects/public/projects/index') },
  { method: 'GET', pattern: '/public/projects/:slug', load: () => import('../api/projects/public/projects/[slug]') },
  { method: 'GET', pattern: '/public/images/:imageId', load: () => import('../api/projects/public/images/[imageId]') },

  // --- Admin (x-projects-admin-key required — enforced inside each handler via requireProjectsAuth) ---
  { method: 'GET', pattern: '/', load: () => import('../api/projects/index') },
  { method: 'POST', pattern: '/', load: () => import('../api/projects/index') },

  // Literal suffixes before the bare `/:id` and `/:id/images/:imageId` catch-alls.
  { method: 'POST', pattern: '/:id/images/uploads/complete', load: () => import('../api/projects/[id]/images/uploads/complete') },
  { method: 'POST', pattern: '/:id/images/uploads', load: () => import('../api/projects/[id]/images/uploads/index') },
  { method: 'POST', pattern: '/:id/images/reorder', load: () => import('../api/projects/[id]/images/reorder') },
  { method: 'POST', pattern: '/:id/images/:imageId/primary', load: () => import('../api/projects/[id]/images/[imageId]/primary') },
  { method: 'GET', pattern: '/:id/images/:imageId/preview-url', load: () => import('../api/projects/[id]/images/[imageId]/preview-url') },
  { method: 'PATCH', pattern: '/:id/images/:imageId', load: () => import('../api/projects/[id]/images/[imageId]/index') },
  { method: 'DELETE', pattern: '/:id/images/:imageId', load: () => import('../api/projects/[id]/images/[imageId]/index') },

  { method: 'POST', pattern: '/:id/metrics/reorder', load: () => import('../api/projects/[id]/metrics/reorder') },
  { method: 'POST', pattern: '/:id/metrics', load: () => import('../api/projects/[id]/metrics/index') },
  { method: 'PATCH', pattern: '/:id/metrics/:metricId', load: () => import('../api/projects/[id]/metrics/[metricId]/index') },
  { method: 'DELETE', pattern: '/:id/metrics/:metricId', load: () => import('../api/projects/[id]/metrics/[metricId]/index') },

  { method: 'GET', pattern: '/:id', load: () => import('../api/projects/[id]/index') },
  { method: 'PATCH', pattern: '/:id', load: () => import('../api/projects/[id]/index') },
  { method: 'DELETE', pattern: '/:id', load: () => import('../api/projects/[id]/index') },
];

export interface MatchedRoute {
  route: RouteDefinition;
  params: Record<string, string>;
}

/** `path` must already have the `/api/projects` prefix stripped (done by the Lambda entrypoint before calling this). */
export function matchRoute(method: string, path: string): MatchedRoute | null {
  const requestSegments = path.split('/').filter(Boolean);

  for (const route of routes) {
    if (route.method !== method) continue;
    const routeSegments = route.pattern.split('/').filter(Boolean);
    if (routeSegments.length !== requestSegments.length) continue;

    const params: Record<string, string> = {};
    let matched = true;
    for (let i = 0; i < routeSegments.length; i++) {
      const routeSeg = routeSegments[i];
      const reqSeg = requestSegments[i];
      if (routeSeg.startsWith(':')) {
        params[routeSeg.slice(1)] = decodeURIComponent(reqSeg);
      } else if (routeSeg !== reqSeg) {
        matched = false;
        break;
      }
    }
    if (matched) return { route, params };
  }
  return null;
}

/** Any path segment matched *some* route's shape but not this exact method — used to return 405 instead of 404. */
export function pathHasAnyMethod(path: string): boolean {
  const requestSegments = path.split('/').filter(Boolean);
  return routes.some((route) => {
    const routeSegments = route.pattern.split('/').filter(Boolean);
    if (routeSegments.length !== requestSegments.length) return false;
    return routeSegments.every((seg, i) => seg.startsWith(':') || seg === requestSegments[i]);
  });
}
