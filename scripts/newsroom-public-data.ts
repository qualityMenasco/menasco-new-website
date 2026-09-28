/**
 * Server-only, build-time fetch of published Newsroom articles for
 * `scripts/generate-seo-html.ts` (prerendered SEO shells + sitemap).
 *
 * Two strategies, in preference order:
 *
 * 1. HTTPS, via the real public Newsroom API (`NEWSROOM_PUBLIC_API_BASE_URL`
 *    set) — the Phase 6A-preferred path. The build environment (Amplify)
 *    calls `GET {base}/api/newsroom/public/articles` over plain HTTPS and
 *    needs NO database credentials at all; the running Lambda behind that
 *    API is the only thing that ever touches RDS. This is what makes it
 *    possible to remove DB_HOST/DB_USER/DB_PASSWORD/DB_NAME from the
 *    Amplify build environment entirely (see the Phase 6A report).
 *
 * 2. Direct RDS (`DB_HOST`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` set, no
 *    `NEWSROOM_PUBLIC_API_BASE_URL`) — the original Phase 4 path, kept for
 *    local-dev convenience only (no running API needed to iterate on
 *    prerender output locally). Still works exactly as before.
 *
 * Both paths fail OPEN to an empty list, never fail the build: if neither
 * strategy has what it needs, or either one errors for any reason, this
 * logs a clear warning and returns `[]` — Newsroom routes just prerender
 * with zero published articles for that run rather than the whole site
 * failing to build.
 *
 * Runs as a plain Node script via `tsx` during `postbuild` — never bundled
 * by Vite, so neither strategy's credentials/URLs ever reach the browser.
 */
import { getPool } from '../api/_lib/db';
import { getArticleImages, type ArticleRow } from '../api/_lib/articles';

/** The only fields `generate-seo-html.ts`'s Newsroom route loop actually reads — deliberately not the full article/structured_content shape, since prerendered SEO shells only need title/description/canonical/JSON-LD inputs, not the full renderable body. */
export interface PublicBuildTimeArticle {
  slug: string;
  title: string;
  subtitle: string | null;
  publishedAt: string;
  /** Relative path (e.g. `/api/newsroom/public/images/<id>`) — the caller prefixes with SITE_URL for OG/JSON-LD absolute URLs, same as every other route's image handling in that script. */
  primaryImageUrl?: string;
}

interface PublicArticleSummaryResponse {
  slug: string;
  title: string;
  subtitle: string | null;
  publishedAt: string;
  primaryImage: { url: string } | null;
}

async function fetchViaHttpsApi(baseUrl: string): Promise<PublicBuildTimeArticle[]> {
  const url = `${baseUrl.replace(/\/+$/, '')}/api/newsroom/public/articles`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const summaries = (await res.json()) as PublicArticleSummaryResponse[];
  return summaries.map((a) => ({
    slug: a.slug,
    title: a.title,
    subtitle: a.subtitle,
    publishedAt: a.publishedAt,
    primaryImageUrl: a.primaryImage?.url,
  }));
}

const DB_ENV_VARS = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

async function fetchViaDirectRds(): Promise<PublicBuildTimeArticle[]> {
  const pool = getPool();
  const [rows] = await pool.query<ArticleRow[]>(`SELECT * FROM news_articles WHERE status = 'published' ORDER BY published_at DESC LIMIT 100`);

  const articles: PublicBuildTimeArticle[] = [];
  for (const row of rows) {
    if (!row.slug || !row.title || !row.structured_content || !row.published_at) continue; // publishArticle() requires these — a row missing one would indicate a data inconsistency, not a valid published article to render
    const images = await getArticleImages(row.id);
    articles.push({
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      publishedAt: row.published_at.toISOString(),
      primaryImageUrl: images[0] ? `/api/newsroom/public/images/${images[0].id}` : undefined,
    });
  }

  await pool.end();
  return articles;
}

export async function fetchPublishedNewsroomArticles(): Promise<PublicBuildTimeArticle[]> {
  const apiBaseUrl = process.env.NEWSROOM_PUBLIC_API_BASE_URL;
  if (apiBaseUrl) {
    try {
      return await fetchViaHttpsApi(apiBaseUrl);
    } catch (err) {
      console.warn(
        `[newsroom-public-data] Failed to fetch published articles via HTTPS (${apiBaseUrl}) — treating as zero published articles for this build. ${(err as Error).message}`,
      );
      return [];
    }
  }

  const missingDbVars = DB_ENV_VARS.filter((name) => !process.env[name]);
  if (missingDbVars.length > 0) {
    console.warn(
      `[newsroom-public-data] Skipping fetch — neither NEWSROOM_PUBLIC_API_BASE_URL nor all of ${DB_ENV_VARS.join('/')} are set. ` +
        `Newsroom routes will prerender with zero published articles for this build.`,
    );
    return [];
  }

  try {
    return await fetchViaDirectRds();
  } catch (err) {
    console.warn(`[newsroom-public-data] Failed to fetch published articles from RDS — treating as zero published articles for this build. ${(err as Error).message}`);
    return [];
  }
}
