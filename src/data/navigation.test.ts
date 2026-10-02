import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  aboutNavigation,
  dataCentreServiceLink,
  footerServiceLinks,
  pendingContentPaths,
  servicesNavigation,
  servicesNavigationGroups,
} from './navigation';
import { services } from './services';

const readLocale = (locale: 'en' | 'ar', ns: string) =>
  JSON.parse(readFileSync(join(__dirname, '../../public/locales', locale, `${ns}.json`), 'utf8'));

const lookup = (tree: Record<string, unknown>, dottedKey: string): unknown =>
  dottedKey.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), tree);

describe('navigation data', () => {
  const navKeys = [
    ...servicesNavigationGroups.flatMap((group) => [group.i18nKey, ...group.links.map((link) => link.i18nKey)]),
    ...aboutNavigation.map((link) => link.i18nKey),
    dataCentreServiceLink.i18nKey,
  ];

  it.each(['en', 'ar'] as const)('every nav i18nKey is translated in %s', (locale) => {
    const nav = readLocale(locale, 'nav');
    const missing = navKeys.filter((key) => typeof lookup(nav, key) !== 'string' || !(lookup(nav, key) as string).trim());
    expect(missing).toEqual([]);
  });

  it('keeps every existing service URL reachable from the Services navigation', () => {
    const hrefs = servicesNavigation.map((link) => link.href);
    for (const service of services) expect(hrefs).toContain(`/services/${service.slug}`);
  });

  it('has unique destinations', () => {
    const hrefs = servicesNavigation.map((link) => link.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('keeps structure-only pages out of the footer', () => {
    const footerHrefs = footerServiceLinks.map((link) => link.href);
    for (const path of pendingContentPaths) expect(footerHrefs).not.toContain(path);
  });

  it('only marks destinations that exist in the navigation as pending', () => {
    const known = [...servicesNavigation, ...aboutNavigation].map((link) => link.href);
    for (const path of pendingContentPaths) expect(known).toContain(path);
  });

  it('every service group href is either a live service page or explicitly pending', () => {
    const liveSlugs = new Set(services.map((service) => `/services/${service.slug}`));
    for (const group of servicesNavigationGroups) {
      if (!group.href) continue;
      const isLiveService = liveSlugs.has(group.href);
      const isPending = (pendingContentPaths as readonly string[]).includes(group.href);
      expect(isLiveService || isPending, `${group.href} is neither a live service page nor registered as pending`).toBe(true);
    }
  });

  it('no pending parent-category page collides with a services.ts slug', () => {
    // Structure-only parent pages (mep, civil, ...) get their own explicit
    // route ahead of services/:slug (src/app/router.tsx) — this only matters
    // if their slug happens to also be a real service's slug, which would
    // make the explicit route shadow it. Manufacturing & Prefabrication is
    // exempt: its href IS the real live service page, by design.
    const pendingGroupSlugs = servicesNavigationGroups
      .filter((g) => g.href && (pendingContentPaths as readonly string[]).includes(g.href))
      .map((g) => g.href!.replace('/services/', ''));
    for (const slug of pendingGroupSlugs) {
      const matchesRealService = services.some((service) => service.slug === slug);
      expect(matchesRealService, `${slug} collides with a real service slug`).toBe(false);
    }
  });
});
