import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Dev-only /sitemap.xml. The dev server only serves public/, but the sitemap
 * is generated (postbuild writes dist/sitemap.xml) — so render it per request
 * from the same route registry + builder the build uses (single source of
 * truth; nothing is written to public/).
 */
function devSitemapPlugin(): Plugin {
  return {
    name: 'menasco-dev-sitemap',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        const pathname = (req.url ?? '').split('?')[0];
        if (pathname !== '/sitemap.xml') return next();
        (async () => {
          const { routes } = await server.ssrLoadModule('/scripts/seo/routes.ts');
          const { buildSitemapXml } = await server.ssrLoadModule('/scripts/seo/sitemap.ts');
          const xml: string = buildSitemapXml(routes);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.end(req.method === 'HEAD' ? undefined : xml);
        })().catch(next);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Not VITE_-prefixed on purpose — this is the same server-side var
  // api/newsroom-article-page.ts and scripts/newsroom-public-data.ts already
  // use (see newsroomApiConfig.ts's own doc comment), loaded here with the
  // empty-prefix form of loadEnv() since this file runs in Node at dev-server
  // start, not in the browser, so it isn't restricted to VITE_* vars.
  const env = loadEnv(mode, process.cwd(), '');
  const newsroomPublicApiBaseUrl = env.NEWSROOM_PUBLIC_API_BASE_URL;

  return {
    plugins: [react(), devSitemapPlugin()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      // Mirrors vercel.json's "/api/newsroom/public/:path*" rewrite to the
      // same AWS API Gateway target, so the browser's public Newsroom fetch
      // (a same-origin, relative /api/newsroom/public/* request by design —
      // see newsroomApiConfig.ts) resolves under plain `vite` dev the same
      // way it does on Vercel. This is a server-to-server proxy request, not
      // a browser one, so it isn't subject to the API Gateway's CORS policy
      // the way a direct cross-origin browser fetch would be — no CORS
      // change needed on the AWS side. Only registered when the var is
      // actually configured, so dev still falls back to today's behavior
      // (an unhandled relative request) if it's unset, rather than proxying
      // to an empty target.
      proxy: newsroomPublicApiBaseUrl
        ? {
            '/api/newsroom/public': {
              target: newsroomPublicApiBaseUrl,
              changeOrigin: true,
            },
          }
        : undefined,
    },
  };
});
