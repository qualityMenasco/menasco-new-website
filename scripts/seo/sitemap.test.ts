// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { pendingContentPaths } from '../../src/data/navigation';
import { routes } from './routes';
import { buildSitemapXml, xmlEscape } from './sitemap';

const SITE = 'https://menascogroup.com';
const xml = buildSitemapXml(routes);
const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
const indexable = routes.filter((route) => !route.noIndex);

describe('route registry', () => {
  it('registers every structure-only page as a noIndex route (so it keeps a shell but stays out of the sitemap)', () => {
    for (const path of pendingContentPaths) {
      const route = routes.find((entry) => entry.path === path);
      expect(route, path).toBeDefined();
      expect(route?.noIndex, path).toBe(true);
    }
  });

  it('lets crawlers follow links from structure-only pages (their children are real, indexable pages)', () => {
    for (const path of pendingContentPaths) {
      const route = routes.find((entry) => entry.path === path);
      expect(route?.follow, path).toBe(true);
    }
  });
});

describe('buildSitemapXml', () => {
  it('uses the sitemaps.org 0.9 namespace', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });

  it('emits one EN and one AR URL per indexable route', () => {
    expect(indexable.length).toBeGreaterThan(0);
    expect((xml.match(/<url>/g) ?? []).length).toBe(2 * indexable.length);
    expect(locs.length).toBe(2 * indexable.length);
  });

  it('only lists absolute production URLs, without duplicates', () => {
    for (const loc of locs) expect(loc.startsWith(SITE)).toBe(true);
    expect(new Set(locs).size).toBe(locs.length);
  });

  it('excludes pending, internal, query-string and legacy URLs', () => {
    for (const path of pendingContentPaths) {
      expect(locs).not.toContain(`${SITE}${path}`);
      expect(locs).not.toContain(`${SITE}/ar${path}`);
    }
    for (const loc of locs) {
      expect(loc).not.toContain('/dev/');
      expect(loc).not.toContain('/api/');
      expect(loc).not.toContain('?');
      expect(loc).not.toContain('/services/data-centres');
    }
  });

  it('includes EN/AR pairs for core pages', () => {
    for (const path of ['/services/mechanical', '/services', '/about']) {
      expect(locs).toContain(`${SITE}${path}`);
      expect(locs).toContain(`${SITE}/ar${path}`);
    }
    expect(locs).toContain(`${SITE}/`);
    expect(locs).toContain(`${SITE}/ar`);
  });
});

describe('xmlEscape', () => {
  it('escapes XML special characters', () => {
    expect(xmlEscape(`a&b<c>"d"'e'`)).toBe('a&amp;b&lt;c&gt;&quot;d&quot;&apos;e&apos;');
  });
});
