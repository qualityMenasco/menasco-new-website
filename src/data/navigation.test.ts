import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  aboutNavigation,
  dataCentreServiceLink,
  footerServiceLinks,
  headerServiceLinks,
  pendingContentPaths,
  servicesNavigationGroups,
  subServiceHref,
  umbrellaServiceLinks,
} from './navigation';
import { services } from './services';

const readLocale = (locale: 'en' | 'ar', ns: string) =>
  JSON.parse(readFileSync(join(__dirname, '../../public/locales', locale, `${ns}.json`), 'utf8'));

const lookup = (tree: Record<string, unknown>, dottedKey: string): unknown =>
  dottedKey.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), tree);

/** Every umbrella service page with a route in src/app/router.tsx. */
const UMBRELLA_PAGES = ['/services/mep', '/services/civil', '/services/manufacturing-prefabrication', '/services/turnkey-developments', '/services/data-centers'];

describe('navigation data', () => {
  const navKeys = [
    ...servicesNavigationGroups.flatMap((group) => [group.i18nKey, ...group.links.map((link) => link.i18nKey)]),
    ...headerServiceLinks.map((link) => link.i18nKey),
    ...aboutNavigation.map((link) => link.i18nKey),
    dataCentreServiceLink.i18nKey,
  ];

  it.each(['en', 'ar'] as const)('every nav i18nKey is translated in %s', (locale) => {
    const nav = readLocale(locale, 'nav');
    const missing = navKeys.filter((key) => typeof lookup(nav, key) !== 'string' || !(lookup(nav, key) as string).trim());
    expect(missing).toEqual([]);
  });

  it('header Services menu lists All Services and the umbrella pages only, in order', () => {
    expect(headerServiceLinks.map((link) => link.href)).toEqual(['/services', ...UMBRELLA_PAGES]);
  });

  it('umbrella links are unique and each one is a real page', () => {
    const hrefs = umbrellaServiceLinks.map((link) => link.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toEqual(UMBRELLA_PAGES);
  });

  it('every sub-service links to its umbrella page, or a section of it', () => {
    for (const group of servicesNavigationGroups) {
      for (const link of group.links) {
        expect(link.href).toBe(subServiceHref(group.href, link.sectionId));
        expect(link.href === group.href || link.href.startsWith(`${group.href}#`)).toBe(true);
      }
    }
  });

  it('footer lists every umbrella and every sub-service, with no removed sub-service URLs', () => {
    const labels = footerServiceLinks.map((link) => link.label);
    for (const group of servicesNavigationGroups) {
      expect(labels).toContain(group.label);
      for (const link of group.links) expect(labels).toContain(link.label);
    }
    expect(labels).toContain(dataCentreServiceLink.label);
    expect(new Set(labels).size).toBe(labels.length);
    for (const link of footerServiceLinks) {
      expect(UMBRELLA_PAGES.some((page) => link.href === page || link.href.startsWith(`${page}#`)), link.href).toBe(true);
    }
  });

  it('keeps structure-only pages out of the footer', () => {
    const footerHrefs = footerServiceLinks.map((link) => link.href);
    for (const path of pendingContentPaths) expect(footerHrefs).not.toContain(path);
  });

  it('every services.ts record is an umbrella page', () => {
    for (const service of services) expect(UMBRELLA_PAGES).toContain(`/services/${service.slug}`);
  });
});
