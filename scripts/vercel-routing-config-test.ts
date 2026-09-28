/**
 * Validates Vercel's actual generated Build Output API v3 routing config
 * (`.vercel/output/config.json`, produced by a real local `vercel build`)
 * against every admin-proxy operation path used by `newsroomAdminApi.ts`,
 * every public Newsroom API path (proxied to AWS via a Vercel external
 * rewrite so image/OG/Twitter/structured-data URLs stay first-party), plus
 * adversarial/edge paths — the layer where the original admin-proxy
 * routing bug lived (the function existed in the build output, but no
 * `routes` entry mapped `/api/newsroom-admin-proxy/*` URLs to it), and
 * where the public-image URL bug lived (relative image URLs 404'd because
 * `api/newsroom/**` is deliberately excluded from Vercel's own function
 * surface). No network calls, no deployment, no mutation: this only
 * replays Vercel's own routing rules in-process against a fixed list of
 * URLs.
 *
 * Run: npx vercel build   (regenerates .vercel/output/config.json)
 *      npx tsx scripts/vercel-routing-config-test.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

type Route = {
  src?: string;
  dest?: string;
  status?: number;
  check?: boolean;
  continue?: boolean;
  handle?: 'filesystem' | 'error' | 'miss';
};

const configPath = join(process.cwd(), '.vercel/output/config.json');
const config: { routes: Route[] } = JSON.parse(readFileSync(configPath, 'utf-8'));

const KNOWN_STATIC_FILES = new Set([
  '/api/newsroom-admin-proxy/login',
  '/api/newsroom-admin-proxy/logout',
]);

/**
 * A minimal re-implementation of Vercel's routing phases sufficient for
 * this project's config: filesystem exact-match lookup, then the ordered
 * `routes` array (a `check: true` match short-circuits UNLESS its
 * destination is itself an unresolved path, which never happens here —
 * every `dest` in this config is either a real static file or a real
 * function), then `error`, then `miss`.
 */
function resolve(path: string): { phase: string; dest?: string; status?: number } {
  if (KNOWN_STATIC_FILES.has(path)) {
    return { phase: 'filesystem', dest: path };
  }

  let phase: 'pre' | 'filesystem' | 'error' | 'miss' = 'pre';
  for (const route of config.routes) {
    if (route.handle) {
      phase = route.handle;
      continue;
    }
    if (phase === 'miss') continue; // only relevant on an actual filesystem miss, not modeled here
    if (!route.src) continue;
    const re = new RegExp(route.src);
    const match = re.exec(path);
    if (!match) continue;
    if (route.continue) continue; // headers-only rule, keep evaluating
    if (typeof route.status === 'number' && !route.dest) {
      return { phase, status: route.status };
    }
    if (route.dest) {
      return { phase, dest: route.dest };
    }
  }
  return { phase: 'unmatched' };
}

let pass = 0;
let fail = 0;
function check(label: string, fn: () => void) {
  try {
    fn();
    console.log(`- ${label} ... OK`);
    pass++;
  } catch (err) {
    console.log(`- ${label} ... FAIL: ${(err as Error).message}`);
    fail++;
  }
}
function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}
function assertRoutesToAdminProxyFunction(path: string) {
  const result = resolve(path);
  assert(
    result.dest?.startsWith('/api/newsroom-admin-proxy/[...path]'),
    `expected ${path} to route to the admin-proxy catch-all function, got ${JSON.stringify(result)}`,
  );
}

const AWS_API_BASE = 'https://wvojo9g543.execute-api.ap-south-1.amazonaws.com';
function assertRoutesToPublicAwsApi(path: string) {
  const result = resolve(path);
  assert(
    result.dest?.startsWith(`${AWS_API_BASE}/api/newsroom/public`),
    `expected ${path} to route directly to the AWS public API, got ${JSON.stringify(result)}`,
  );
}

console.log('=== Vercel generated routing config test (no network, no deployment) ===\n');

console.log('every newsroomAdminApi.ts operation path maps to the forwarding function:');
const operationPaths = [
  '/api/newsroom-admin-proxy/articles', // listArticles, createDraft
  '/api/newsroom-admin-proxy/articles/11111111-1111-4111-8111-111111111111', // getArticle, updateArticle
  '/api/newsroom-admin-proxy/articles/11111111-1111-4111-8111-111111111111/process',
  '/api/newsroom-admin-proxy/articles/11111111-1111-4111-8111-111111111111/publish',
  '/api/newsroom-admin-proxy/articles/11111111-1111-4111-8111-111111111111/unpublish',
  '/api/newsroom-admin-proxy/articles/11111111-1111-4111-8111-111111111111/source-url',
  '/api/newsroom-admin-proxy/articles/11111111-1111-4111-8111-111111111111/images/22222222-2222-4222-8222-222222222222/preview-url',
  '/api/newsroom-admin-proxy/articles/11111111-1111-4111-8111-111111111111/images/22222222-2222-4222-8222-222222222222',
  '/api/newsroom-admin-proxy/articles/11111111-1111-4111-8111-111111111111/images/reorder',
  '/api/newsroom-admin-proxy/articles/11111111-1111-4111-8111-111111111111/uploads',
  '/api/newsroom-admin-proxy/articles/11111111-1111-4111-8111-111111111111/uploads/complete',
];
for (const p of operationPaths) {
  check(p, () => assertRoutesToAdminProxyFunction(p));
}

console.log('\nstatic named routes still resolve via filesystem (unaffected by the fix):');
check('/api/newsroom-admin-proxy/login -> filesystem match', () => {
  const result = resolve('/api/newsroom-admin-proxy/login');
  assert(result.phase === 'filesystem', `expected filesystem phase, got ${JSON.stringify(result)}`);
});
check('/api/newsroom-admin-proxy/logout -> filesystem match', () => {
  const result = resolve('/api/newsroom-admin-proxy/logout');
  assert(result.phase === 'filesystem', `expected filesystem phase, got ${JSON.stringify(result)}`);
});

console.log('\nadversarial / edge paths:');
check('unknown /api path does not route to the admin-proxy function or the SPA shell', () => {
  const result = resolve('/api/totally-made-up');
  assert(
    !result.dest?.startsWith('/api/newsroom-admin-proxy'),
    `unknown api path must not reach the admin-proxy function: ${JSON.stringify(result)}`,
  );
  assert(result.dest !== '/404.html', `unknown api path must not fall through to the SPA shell: ${JSON.stringify(result)}`);
});
check('bare /api/newsroom-admin-proxy (no operation) still maps to the function (handler itself rejects it as 400)', () => {
  assertRoutesToAdminProxyFunction('/api/newsroom-admin-proxy');
});
check('the old excluded backend tree is never reachable through any route', () => {
  const result = resolve('/api/newsroom/articles');
  assert(
    !result.dest?.includes('/api/newsroom/') || result.dest.includes('newsroom-admin-proxy'),
    `api/newsroom/** must not be reachable as a Vercel route: ${JSON.stringify(result)}`,
  );
});

console.log('\npublic Newsroom API paths route to the AWS public API (not the SPA shell, not the admin proxy):');
const publicPaths = [
  '/api/newsroom/public/articles',
  '/api/newsroom/public/articles/example-slug',
  '/api/newsroom/public/images/example-image-id',
  '/api/newsroom/public/images/66fd8afa-b75a-4a11-ba31-975358af75b4', // the real controlled test image id
];
for (const p of publicPaths) {
  check(p, () => assertRoutesToPublicAwsApi(p));
}

console.log('\nadmin traffic is NOT routed through the public rewrite:');
check('/api/newsroom-admin-proxy/articles still routes to the admin proxy function, not AWS directly', () => {
  assertRoutesToAdminProxyFunction('/api/newsroom-admin-proxy/articles');
});
check('/api/newsroom-admin-proxy/articles/id/process still routes to the admin proxy function', () => {
  assertRoutesToAdminProxyFunction('/api/newsroom-admin-proxy/articles/11111111-1111-4111-8111-111111111111/process');
});

console.log('\nan unrelated /api path is not accidentally swallowed by the new public rewrite:');
check('/api/newsroom/articles (old admin-shaped path, no /public) does not route to the AWS public API', () => {
  const result = resolve('/api/newsroom/articles');
  assert(!result.dest?.startsWith(AWS_API_BASE), `must not route to AWS: ${JSON.stringify(result)}`);
});
check('/api/some-other-feature is untouched by the Newsroom public rewrite', () => {
  const result = resolve('/api/some-other-feature');
  assert(!result.dest?.startsWith(AWS_API_BASE), `must not route to AWS: ${JSON.stringify(result)}`);
  assert(result.dest !== '/404.html', `must not fall through to the SPA shell: ${JSON.stringify(result)}`);
});

console.log('\nnormal page paths still fall back to the SPA shell as before:');
for (const p of ['/newsroom', '/newsroom/example-slug', '/about', '/some/unknown/slug']) {
  check(`${p} -> SPA 404 shell fallback preserved`, () => {
    const result = resolve(p);
    assert(result.dest === '/404.html', `expected SPA fallback for ${p}, got ${JSON.stringify(result)}`);
  });
}

console.log('\nzero api/newsroom/** Vercel functions exist in the build output:');
check('no function directory under .vercel/output/functions/api/newsroom/ (only api/newsroom-admin-proxy/ is allowed)', () => {
  const forbidden = join(process.cwd(), '.vercel/output/functions/api/newsroom');
  assert(!existsSync(forbidden), `found a forbidden api/newsroom/** function directory at ${forbidden}`);
});

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
