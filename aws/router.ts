/**
 * Explicit route table for the AWS Lambda adapter — mirrors the existing
 * Vercel file-based route structure under `api/newsroom/` exactly (same
 * paths, same methods, same handler modules), just expressed as data
 * instead of a directory layout. `api/_lib/*` and every handler module
 * stay completely unmodified; this table is the ONLY new "routing"
 * knowledge Phase 6A adds.
 *
 * Route order matters: more literal/specific patterns are listed before
 * more general dynamic ones that could otherwise ambiguously match the
 * same path (e.g. `/articles/:id/images/reorder` must be checked before
 * `/articles/:id/images/:imageId`, or a request to `.../images/reorder`
 * would incorrectly match the imageId route with `imageId="reorder"`).
 * The matcher below checks routes top-to-bottom, first match wins.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

export interface RouteDefinition {
  method: string;
  /** Segments: literal strings match exactly; `:name` segments match any single path segment and are captured. */
  pattern: string;
  /** Dynamically imported so a cold Lambda invocation only pays for the modules the matched route actually needs — same lazy-import shape `api/newsroom/**` already uses per-file, just resolved through one entrypoint instead of Vercel's file router. */
  load: () => Promise<{ default: Handler }>;
}

export const routes: RouteDefinition[] = [
  // --- Public (unauthenticated) ---
  { method: 'GET', pattern: '/public/articles', load: () => import('../api/newsroom/public/articles/index') },
  { method: 'GET', pattern: '/public/articles/:slug', load: () => import('../api/newsroom/public/articles/[slug]') },
  { method: 'GET', pattern: '/public/images/:imageId', load: () => import('../api/newsroom/public/images/[imageId]') },

  // --- Admin (x-newsroom-admin-key required — enforced inside each handler via requireNewsroomAuth, same as today) ---
  { method: 'GET', pattern: '/articles', load: () => import('../api/newsroom/articles/index') },
  { method: 'POST', pattern: '/articles', load: () => import('../api/newsroom/articles/index') },

  // Literal suffixes before the bare `/articles/:id` and `/articles/:id/images/:imageId` catch-alls.
  { method: 'POST', pattern: '/articles/:id/uploads/complete', load: () => import('../api/newsroom/articles/[id]/uploads/complete') },
  { method: 'POST', pattern: '/articles/:id/uploads', load: () => import('../api/newsroom/articles/[id]/uploads/index') },
  { method: 'POST', pattern: '/articles/:id/process', load: () => import('../api/newsroom/articles/[id]/process') },
  { method: 'POST', pattern: '/articles/:id/publish', load: () => import('../api/newsroom/articles/[id]/publish') },
  { method: 'POST', pattern: '/articles/:id/unpublish', load: () => import('../api/newsroom/articles/[id]/unpublish') },
  { method: 'GET', pattern: '/articles/:id/source-url', load: () => import('../api/newsroom/articles/[id]/source-url') },
  { method: 'POST', pattern: '/articles/:id/images/reorder', load: () => import('../api/newsroom/articles/[id]/images/reorder') },
  { method: 'GET', pattern: '/articles/:id/images/:imageId/preview-url', load: () => import('../api/newsroom/articles/[id]/images/[imageId]/preview-url') },
  { method: 'PATCH', pattern: '/articles/:id/images/:imageId', load: () => import('../api/newsroom/articles/[id]/images/[imageId]/index') },

  { method: 'GET', pattern: '/articles/:id', load: () => import('../api/newsroom/articles/[id]/index') },
  { method: 'PATCH', pattern: '/articles/:id', load: () => import('../api/newsroom/articles/[id]/index') },
  { method: 'DELETE', pattern: '/articles/:id', load: () => import('../api/newsroom/articles/[id]/index') },
];

export interface MatchedRoute {
  route: RouteDefinition;
  params: Record<string, string>;
}

/** `path` must already have the `/api/newsroom` prefix stripped (done by the Lambda entrypoint before calling this). */
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

/** Any path segment matched *some* route's shape but not this exact method — used to return 405 instead of 404 when that's the more accurate answer, mirroring how `requireMethod` itself would respond if Vercel had routed the request through at all. */
export function pathHasAnyMethod(path: string): boolean {
  const requestSegments = path.split('/').filter(Boolean);
  return routes.some((route) => {
    const routeSegments = route.pattern.split('/').filter(Boolean);
    if (routeSegments.length !== requestSegments.length) return false;
    return routeSegments.every((seg, i) => seg.startsWith(':') || seg === requestSegments[i]);
  });
}
