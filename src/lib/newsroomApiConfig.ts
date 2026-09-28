/**
 * Single source of truth for where the public Newsroom API lives.
 *
 * `VITE_NEWSROOM_API_BASE_URL` is public configuration, not a secret — the
 * API Gateway invoke URL is meant to be called directly by any browser
 * (that's the whole point of a public HTTP API), so shipping it in the
 * bundle via Vite's `VITE_*` convention is the correct, intended use of
 * that mechanism. Never put `NEWSROOM_ADMIN_API_KEY`, DB credentials, or
 * AWS credentials behind a `VITE_*` name — those must never reach the
 * browser at all.
 *
 * Left unset, every URL this builds stays relative (e.g.
 * `/api/newsroom/public/articles`) — today's same-origin Vercel rewrite
 * behavior, completely unchanged. Setting it to the deployed API Gateway
 * base URL (e.g. `https://wvojo9g543.execute-api.ap-south-1.amazonaws.com`)
 * switches every call to that absolute origin instead, with no other code
 * change required anywhere else in the app.
 */
const RAW_BASE_URL = import.meta.env.VITE_NEWSROOM_API_BASE_URL ?? '';

/** Strips exactly one trailing slash, if present — avoids the base URL and a leading-slash path producing `https://host//api/...`. */
const NEWSROOM_API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

/** Joins the configured base URL with a path that must start with `/`. Never produces a double slash regardless of whether the base URL was set with or without a trailing slash. */
export function buildNewsroomApiUrl(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error(`buildNewsroomApiUrl: path must start with "/", got ${JSON.stringify(path)}`);
  }
  return `${NEWSROOM_API_BASE_URL}${path}`;
}
