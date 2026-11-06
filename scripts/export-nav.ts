/**
 * Exports the site HEADER navigation (links + labels, EN + AR) to
 * nav-export/navigation.json so the standalone <MenascoHeader> in nav-export/
 * can be dropped into another React app (e.g. the Amplify Careers site).
 *
 *   npm run export:nav
 *   NAV_EXPORT_BASE_URL=https://menascogroup.com npm run export:nav
 *
 * Structure comes from src/data/navigation.ts (the single source of nav data);
 * labels come from public/locales/{en,ar}/{nav,common}.json. Every link is
 * stored as a locale-prefixed `path` plus a resolved absolute `url`
 * (`baseUrl + path`). The component rebuilds URLs from `path` + its own
 * baseUrl, so changing the domain is a one-value change either here (env) or
 * via the component's `baseUrl` prop.
 *
 * Read-only against the site: it never writes outside nav-export/.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aboutNavigation, dataCentreServiceLink, homeSectionNavigation, servicesNavigationGroups } from '../src/data/navigation';
import { COMPANY_PROFILE_PATH } from '../src/seo/constants';

const DEFAULT_BASE_URL = 'https://menasco-new-website.vercel.app';
const LOCALES = ['en', 'ar'] as const;
type Locale = (typeof LOCALES)[number];

// Mirrors src/app/SiteHeader.tsx — header CTA destination.
const REQUEST_QUOTE_PATH = '/contact?type=project';
// Mirrors src/mobile/components/MobileHeader.tsx.
const CONTACT_PATH = '/contact';
const COMPANY_PROFILE_DOWNLOAD_NAME = 'MENASCO-Company-Profile.pdf';

// Primary item label (permanent English data label) -> { stable id, nav i18n key }.
// Same mapping SiteHeader.tsx uses; unknown labels fail loudly so a data change
// can't silently drop an item.
const primaryMeta: Record<string, { id: string; key: string }> = {
  About: { id: 'about', key: 'about' },
  Services: { id: 'services', key: 'services' },
  'Projects / Sectors': { id: 'projects', key: 'projectsSectors' },
  Newsroom: { id: 'newsroom', key: 'newsroom' },
  Careers: { id: 'careers', key: 'careers' },
};

// Real page path for each primary item. The source scrolls to homepage anchors
// for items without `directHref`; the export always links to the real page.
const primaryPathOverrides: Record<string, string> = {
  careers: '/careers',
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = resolve(root, 'nav-export', 'navigation.json');

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8')) as Record<string, unknown>;
}

function lookup(dict: Record<string, unknown>, key: string, ns: string, locale: Locale): string {
  const value = key.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), dict);
  if (typeof value !== 'string') throw new Error(`Missing translation ${locale}:${ns}:${key}`);
  return value;
}

function normaliseBaseUrl(raw: string): string {
  const url = new URL(raw); // throws on garbage
  return `${url.origin}${url.pathname}`.replace(/\/+$/, '');
}

/** Same rules as src/lib/locale.ts withLocale(), but query strings are preserved. */
function localisePath(path: string, locale: Locale): string {
  if (locale === 'en') return path;
  const [pathname, query] = path.split(/(?=\?)/);
  const localised = pathname === '/' ? '/ar' : `/ar${pathname}`;
  return `${localised}${query ?? ''}`;
}

const baseUrl = normaliseBaseUrl(process.env.NAV_EXPORT_BASE_URL || DEFAULT_BASE_URL);

function link(path: string, label: string, locale: Locale, extra: Record<string, unknown> = {}) {
  const localised = localisePath(path, locale);
  return { label, path: localised, url: `${baseUrl}${localised}`, ...extra };
}

function buildLocale(locale: Locale) {
  const nav = readJson(`public/locales/${locale}/nav.json`);
  const common = readJson(`public/locales/${locale}/common.json`);
  const t = (key: string) => lookup(nav, key, 'nav', locale);
  const tc = (key: string) => lookup(common, key, 'common', locale);

  const primary = homeSectionNavigation.map((item) => {
    const meta = primaryMeta[item.label];
    if (!meta) throw new Error(`Unmapped primary nav item "${item.label}" — add it to primaryMeta in scripts/export-nav.ts`);
    const path = primaryPathOverrides[meta.id] ?? item.directHref ?? item.routePrefix;
    const base = { id: meta.id, ...link(path, t(meta.key), locale) };

    if (meta.id === 'about') {
      return { ...base, dropdown: aboutNavigation.map((entry) => link(entry.href, t(entry.i18nKey), locale)) };
    }
    if (meta.id === 'services') {
      const allServices = link('/services', t('allServices'), locale, { id: 'all-services' });
      const dataCenters = link(dataCentreServiceLink.href, t(dataCentreServiceLink.i18nKey), locale, { id: 'data-centers' });
      return {
        ...base,
        megaMenu: {
          groups: servicesNavigationGroups.map((group) => ({
            id: group.i18nKey.replace(/^servicesGroups\./, ''),
            label: t(group.i18nKey),
            ...(group.href ? { path: localisePath(group.href, locale), url: `${baseUrl}${localisePath(group.href, locale)}` } : {}),
            links: group.links.map((entry) => link(entry.href, t(entry.i18nKey), locale)),
          })),
          // Row beneath the columns on desktop; on mobile "All Services" leads
          // the accordion and Data Centers closes it.
          footerLinks: [allServices, dataCenters],
          allServices,
          dataCenters,
        },
      };
    }
    return base;
  });

  return {
    locale,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
    labels: {
      home: t('home'),
      menu: t('menu'),
      openMenu: t('openMenu'),
      closeMenu: t('closeMenu'),
      siteNavigation: t('siteNavigation'),
      primaryNavigation: t('primaryNavigation'),
      menascoHome: t('menascoHome'),
      languageSwitch: tc('languageSwitch.label'),
    },
    logo: { alt: 'MENASCO', ...link('/', t('menascoHome'), locale) },
    primary,
    /** Mobile slide-out menu flat links (after the About / Services accordions) — mirrors MobileMenu.tsx. */
    mobileDirectLinks: [
      ...primary.filter((item) => item.id !== 'about' && item.id !== 'services').map(({ id, label, path, url }) => ({ id, label, path, url })),
      { id: 'contact', ...link(CONTACT_PATH, t('contactUs'), locale) },
    ],
    /** Desktop header + mobile menu footer CTA. */
    cta: link(REQUEST_QUOTE_PATH, tc('buttons.requestQuote'), locale),
    /** Mobile header outlined "Get in contact" button. */
    contact: link(CONTACT_PATH, t('callUs'), locale, { ariaLabel: t('contactUs') }),
    /** Mobile header download button — a static file, never locale-prefixed. */
    companyProfile: {
      label: t('profile'),
      path: COMPANY_PROFILE_PATH,
      url: `${baseUrl}${COMPANY_PROFILE_PATH}`,
      download: COMPANY_PROFILE_DOWNLOAD_NAME,
    },
    languageSwitch: {
      label: tc('languageSwitch.label'),
      options: LOCALES.map((target) => ({
        locale: target,
        label: tc(`languageSwitch.${target}`),
        path: localisePath('/', target),
        url: `${baseUrl}${localisePath('/', target)}`,
      })),
    },
  };
}

const output = {
  $comment: 'Generated by scripts/export-nav.ts (npm run export:nav). Do not edit by hand — edit src/data/navigation.ts or public/locales and regenerate.',
  baseUrl,
  generatedAt: new Date().toISOString(),
  locales: Object.fromEntries(LOCALES.map((locale) => [locale, buildLocale(locale)])),
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

const linkCount = JSON.stringify(output).match(/"url":/g)?.length ?? 0;
console.log(`nav-export: wrote ${outFile} (${linkCount} links, base ${baseUrl})`);
