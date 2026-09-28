import { describe, it, expect } from 'vitest';
import { getLocaleFromPath, directionForLocale } from './locale';
import { formatNewsDate } from './formatDate';

/**
 * NewsroomPage/NewsDetailPage derive EN vs AR/RTL behavior entirely from
 * these two functions (`getLocaleFromPath(location.pathname)` then
 * `directionForLocale`/`formatNewsDate`) — the same mechanism every other
 * page on the site already relies on, not something Newsroom-specific.
 * Testing the mechanism directly is more meaningful than a shallow
 * full-page render, which would mostly just be re-testing React Router
 * itself.
 */
describe('Newsroom EN/AR locale + RTL behavior', () => {
  it('/newsroom resolves to English, left-to-right', () => {
    expect(getLocaleFromPath('/newsroom')).toBe('en');
    expect(directionForLocale(getLocaleFromPath('/newsroom'))).toBe('ltr');
  });

  it('/ar/newsroom resolves to Arabic, right-to-left', () => {
    expect(getLocaleFromPath('/ar/newsroom')).toBe('ar');
    expect(directionForLocale(getLocaleFromPath('/ar/newsroom'))).toBe('rtl');
  });

  it('/ar/newsroom/:slug (article detail) also resolves to Arabic, right-to-left', () => {
    expect(getLocaleFromPath('/ar/newsroom/some-article-slug')).toBe('ar');
    expect(directionForLocale(getLocaleFromPath('/ar/newsroom/some-article-slug'))).toBe('rtl');
  });

  it('the same published date renders differently for en vs ar — confirms the locale mechanism actually affects rendered output, not just an isolated flag', () => {
    const en = formatNewsDate('2026-08-10', 'en');
    const ar = formatNewsDate('2026-08-10', 'ar');
    expect(en).not.toBe(ar);
    expect(en).toBe(en.toUpperCase()); // en dates are uppercased by design
  });
});
