import { officeLocations, primaryContact, regionalCountries } from '../data/locations';
import { socialLinks } from '../data/socialLinks';
import { foundingYear } from '../data/companyStats';
import { SITE_LOGO_PATH, SITE_NAME, SITE_URL } from './constants';
import { withLocale } from '../lib/locale';
import type { Locale } from '../lib/i18n';

/**
 * Pure, no-React, no-Node-API module — importable from both browser page
 * components (via SEO.tsx) and the Node postbuild prerender script
 * (scripts/generate-seo-html.ts), the same pattern already used by
 * src/lib/locale.ts. This is the single place MENASCO's structured-data
 * entity graph is built, so the client-rendered and crawler-visible JSON-LD
 * can never drift apart.
 *
 * Stable @id values used throughout the graph — every page references the
 * SAME Organization/WebSite entity rather than declaring a fresh anonymous
 * one, so search engines resolve them to one consistent node site-wide.
 */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Safe for embedding inside a raw `<script type="application/ld+json">` — escapes `<` so a value that happens to contain the literal text `</script>` (or any other tag) can never prematurely terminate the script element or break the surrounding HTML. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/**
 * The Organization entity, without `@context` — used both as the
 * standalone top-level Organization script (via `organizationJsonLd`) and
 * embedded inline (as `about`/`provider`/`publisher`) on every other page's
 * own JSON-LD, always under the same `@id`. Built only from verified data:
 * no invented employee counts, ratings, or social profiles — `sameAs` stays
 * empty until a real, verified social URL exists in `socialLinks`.
 */
function organizationEntity() {
  const headquarters = officeLocations.find((location) => location.isHeadquarters) ?? officeLocations[0];
  const sameAs = socialLinks.filter((link) => link.verificationStatus === 'verified' && link.href).map((link) => link.href);

  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${SITE_LOGO_PATH}`,
    foundingDate: String(foundingYear),
    areaServed: regionalCountries,
    contactPoint: {
      '@type': 'ContactPoint',
      email: primaryContact.email,
      telephone: primaryContact.dubaiPhonePrimary,
      contactType: 'customer service',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: headquarters.address,
      addressLocality: headquarters.city,
      addressCountry: headquarters.country,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/** schema.org Organization — standalone top-level entity, rendered once on the homepage. */
export function organizationJsonLd() {
  return { '@context': 'https://schema.org', ...organizationEntity() };
}

function websiteEntity() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': ORGANIZATION_ID },
    // No SearchAction — the site has no functioning site-search feature.
  };
}

/** schema.org WebSite — standalone top-level entity, rendered once on the homepage. */
export function websiteJsonLd() {
  return { '@context': 'https://schema.org', ...websiteEntity() };
}

export type WebPageType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';

export interface WebPageJsonLdInput {
  type?: WebPageType;
  /** Full absolute canonical URL for this page, in this locale. */
  url: string;
  name: string;
  description: string;
  inLanguage: 'en' | 'ar';
  /** A more specific entity this page is primarily about — a Service on a service/project page, a Person on a leadership profile. Embedded, not just referenced, so the page's own JSON-LD stays self-contained. */
  mainEntity?: Record<string, unknown>;
}

/**
 * Generic WebPage-family schema — automatically attached to every page via
 * SEO.tsx (see that file), so no page needs to hand-build this. `isPartOf`
 * and `about` embed the same WebSite/Organization entities (matching @id)
 * declared standalone on the homepage.
 */
export function webPageJsonLd({ type = 'WebPage', url, name, description, inLanguage, mainEntity }: WebPageJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage,
    isPartOf: websiteEntity(),
    about: organizationEntity(),
    ...(mainEntity ? { mainEntity } : {}),
  };
}

export interface BreadcrumbEntry {
  label: string;
  path: string;
}

/**
 * schema.org BreadcrumbList for a route's breadcrumb trail. `locale`
 * defaults to 'en' (the canonical/unprefixed root) — pass the page's actual
 * locale so each `item` URL lands in the same locale's URL namespace as the
 * page itself (e.g. `/ar/services/mechanical`, not the English path),
 * using the same `withLocale` helper every other canonical/hreflang URL on
 * the site is built from — no second URL-building system.
 */
export function breadcrumbJsonLd(entries: BreadcrumbEntry[], locale: Locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.label,
      item: `${SITE_URL}${withLocale(entry.path, locale)}`,
    })),
  };
}

export interface ServiceEntityInput {
  name: string;
  description: string;
  /** Full absolute canonical URL of the service's own page. */
  url: string;
  /** Countries/regions this specific service is offered in, if narrower than or worth restating alongside the Organization's own `areaServed`. */
  areaServed?: string[];
}

/**
 * A `Service` entity — used as a page's `mainEntity` (service detail pages)
 * without `@context`/`@id` of its own (it's embedded, not standalone), so
 * it never risks colliding with the page's own WebPage `@id`. No pricing,
 * ratings, or Offer — none of that is verified/real for MENASCO's services.
 */
export function serviceEntity({ name, description, url, areaServed }: ServiceEntityInput) {
  return {
    '@type': 'Service',
    name,
    description,
    url,
    provider: { '@id': ORGANIZATION_ID },
    ...(areaServed && areaServed.length > 0 ? { areaServed } : {}),
  };
}

export interface PersonEntityInput {
  name: string;
  jobTitle: string;
  /** Full absolute canonical URL of the person's own profile page. */
  url: string;
  /** Absolute URL to a real portrait already used on the page. */
  image?: string;
  /** Verified external profile links only (e.g. a real LinkedIn URL already in src/data/leadership.ts) — never invented. */
  sameAs?: string[];
}

/** A `Person` entity — used as a leadership profile page's `mainEntity`. Only verified fields: no education, awards, or credentials not already present in src/data/leadership.ts. */
export function personEntity({ name, jobTitle, url, image, sameAs }: PersonEntityInput) {
  return {
    '@type': 'Person',
    name,
    jobTitle,
    url,
    worksFor: { '@id': ORGANIZATION_ID },
    ...(image ? { image } : {}),
    ...(sameAs && sameAs.length > 0 ? { sameAs } : {}),
  };
}

export interface ArticleJsonLdInput {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  image?: string;
}

/** schema.org NewsArticle for a Newsroom article page. */
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
        url: `${SITE_URL}${SITE_LOGO_PATH}`,
      },
    },
  };
}
