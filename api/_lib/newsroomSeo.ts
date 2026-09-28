/**
 * A deliberate, documented duplicate of a few values from src/seo/constants.ts
 * and src/seo/structuredData.ts — NOT a second source of truth to maintain
 * casually, but a hard technical requirement: those files use Vite-bundler-
 * style extensionless relative imports (correct for the frontend and for
 * scripts/generate-seo-html.ts, which runs via `tsx`), but Vercel's Node
 * function runtime resolves modules with real Node ESM semantics, which
 * requires an explicit `.js` extension on every relative import — including
 * every transitive one (src/lib/locale.ts, src/data/socialLinks.ts, etc.).
 * api/newsroom-article-page.ts learned this the hard way: it imported
 * src/seo/constants.ts directly, built and typechecked fine, but crashed at
 * runtime in production with `ERR_MODULE_NOT_FOUND` because Node couldn't
 * resolve the extensionless `from '../src/seo/constants'` inside the
 * compiled output. Rewriting every extensionless import across the shared
 * src/ tree to satisfy Node ESM would be a much larger, riskier change than
 * this file. If SITE_URL, SITE_NAME, or the NewsArticle JSON-LD shape ever
 * change, update both this file and src/seo/constants.ts /
 * src/seo/structuredData.ts together.
 */

export const SITE_NAME = 'MENASCO';
export const SITE_URL = 'https://menascogroup.com';

/** Mirrors src/seo/constants.ts's toAbsoluteUrl exactly. */
export function toAbsoluteUrl(path: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export interface ArticleJsonLdInput {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  image?: string;
}

/** Mirrors src/seo/structuredData.ts's articleJsonLd exactly (same schema.org NewsArticle shape). */
export function articleJsonLd({ title, description, path, datePublished, image }: ArticleJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    datePublished,
    mainEntityOfPage: `${SITE_URL}${path}`,
    ...(image ? { image: [image] } : {}),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/Menasco-Logo.png`,
      },
    },
  };
}

/** Mirrors src/seo/structuredData.ts's serializeJsonLd exactly. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
