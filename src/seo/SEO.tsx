import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { SITE_NAME, SITE_URL } from './constants';
import { getLocaleFromPath, directionForLocale, withLocale, stripLocale } from '../lib/locale';
import { webPageJsonLd, breadcrumbJsonLd, serializeJsonLd, type WebPageType, type BreadcrumbEntry } from './structuredData';

export interface SEOProps {
  title: string;
  description: string;
  /** Canonical (English) path only, e.g. "/services/mechanical" — always unprefixed, regardless of current locale; this component derives the current locale's own canonical URL and the /ar hreflang alternate from it. */
  path: string;
  ogImage?: string;
  noIndex?: boolean;
  /** When `noIndex` is set, allow crawlers to follow this page's links (default: don't). Use for structure-only pages whose child links are real, indexable pages — never for 404/internal tooling. */
  follow?: boolean;
  /** WebPage-family schema.org type for this page's auto-generated JSON-LD. Defaults to 'WebPage'. */
  pageType?: WebPageType;
  /** A more specific entity (Service, Person, etc. — built via src/seo/structuredData.ts) embedded as this page's structured-data `mainEntity`. */
  mainEntity?: Record<string, unknown>;
  /**
   * This page's breadcrumb trail (English labels/paths — same as every
   * other page already passes). Built into a locale-aware BreadcrumbList
   * here, using the same `locale` this component already computes for the
   * canonical/hreflang URLs, so every `item` URL lands in the right
   * locale's URL namespace automatically — no page needs to compute or
   * pass its own locale just for this.
   */
  breadcrumb?: BreadcrumbEntry[];
  /** Pass one or more additional standalone JSON-LD objects (Organization+WebSite on the homepage, Article, etc.) built via src/seo/structuredData.ts. */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Per-route head management. Renders client-side via react-helmet-async;
 * scripts/generate-seo-html.ts mirrors this exact logic at build time so
 * the same content is visible to crawlers that don't execute JavaScript.
 */
export function SEO({ title, description, path, ogImage, noIndex = false, follow = false, pageType, mainEntity, breadcrumb, structuredData }: SEOProps) {
  const { t } = useTranslation('seo');
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const canonicalPath = stripLocale(path);
  const siteName = t('siteName');
  // `title` already carries the full desired title (and the site name) for pages
  // whose spec needs a custom suffix (e.g. "About MENASCO | MEP Engineering UAE");
  // everything else is a bare topic that gets the standard " | MENASCO" suffix.
  const fullTitle = title.includes(siteName) || title.includes(SITE_NAME) ? title : `${title} | ${siteName}`;
  const url = `${SITE_URL}${withLocale(canonicalPath, locale)}`;
  const enUrl = `${SITE_URL}${canonicalPath}`;
  const arUrl = `${SITE_URL}${withLocale(canonicalPath, 'ar')}`;
  const extraJsonLd = structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [];
  // Every indexable page gets a WebPage-family entity for free — noindex
  // pages (404, internal tools) don't need search engines building one.
  const jsonLd = noIndex
    ? extraJsonLd
    : [
        webPageJsonLd({ type: pageType, url, name: fullTitle, description, inLanguage: locale, mainEntity }),
        ...(breadcrumb ? [breadcrumbJsonLd(breadcrumb, locale)] : []),
        ...extraJsonLd,
      ];

  return (
    <Helmet>
      <html lang={locale} dir={directionForLocale(locale)} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="ar" href={arUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />
      {noIndex && <meta name="robots" content={follow ? 'noindex, follow' : 'noindex, nofollow'} />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={locale === 'ar' ? 'ar_AE' : 'en_US'} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {jsonLd.map((entry, index) => (
        <script key={index} type="application/ld+json">
          {serializeJsonLd(entry)}
        </script>
      ))}
    </Helmet>
  );
}
