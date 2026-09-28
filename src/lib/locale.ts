import type { Locale } from './i18n';

const AR_PREFIX = '/ar';

/**
 * RTL audit checklist for any component being made locale-aware (documented
 * once here rather than repeated at every call site):
 * 1. Physical Tailwind properties (margin-left, margin-right, padding-left,
 *    padding-right, the "left"/"right" position utilities, and text-left /
 *    text-right) need to become their logical equivalents (margin-inline
 *    -start/-end, padding-inline-start/-end, "start"/"end" position
 *    utilities, and text-start / text-end). Plain flex/grid layouts already
 *    mirror under dir="rtl" for free — only hardcoded physical properties
 *    need swapping.
 * 2. Direction-sensitive transforms/animations (e.g. a slide-in panel's
 *    `x: '100%'`) need an `isRtl` branch.
 * 3. Directional icons (arrows) need an `rtl:rotate-180` treatment.
 * 4. Explicit "order" classes that hardcode visual position instead of
 *    relying on DOM order need re-checking — DOM-order-based layouts already
 *    flip automatically, explicit order overrides do not.
 */

/** Derives the active locale purely from a pathname — the URL is the single source of truth, not localStorage. */
export function getLocaleFromPath(pathname: string): Locale {
  return pathname === AR_PREFIX || pathname.startsWith(`${AR_PREFIX}/`) ? 'ar' : 'en';
}

/** Strips a leading /ar prefix, if present, returning the canonical English-equivalent path. */
export function stripLocale(pathname: string): string {
  if (pathname === AR_PREFIX) return '/';
  if (pathname.startsWith(`${AR_PREFIX}/`)) return pathname.slice(AR_PREFIX.length) || '/';
  return pathname;
}

/** Builds the equivalent path under the given locale, preserving the rest of the path. */
export function withLocale(pathname: string, locale: Locale): string {
  const base = stripLocale(pathname);
  if (locale === 'en') return base;
  return base === '/' ? AR_PREFIX : `${AR_PREFIX}${base}`;
}

export function directionForLocale(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
