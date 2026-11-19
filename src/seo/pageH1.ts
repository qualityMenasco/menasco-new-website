import { stripLocale } from '../lib/locale';

/**
 * Pages whose hero provides the page's single <h1> (its visible eyebrow +
 * title, see components/typography/HeroH1.tsx). On these, the desktop nav's
 * active item is NOT wrapped in an <h1>, and the mobile pages drop their
 * NavSectionH1 fallback. A static list (not a runtime flag) so the prerendered
 * HTML, which includes the header, gets it right before any script runs.
 * Pages not listed keep the nav-item <h1> until they adopt a hero <h1>.
 */
export const PAGES_WITH_OWN_H1: readonly string[] = [
  '/',
  '/about',
  '/team',
  '/quality-safety',
  '/innovation-technology',
  '/certification-training',
  '/community-people',
  '/services',
  '/services/mep',
  '/services/data-centers',
  '/services/data-centers/sustainability',
];

export function pageHasOwnH1(pathname: string): boolean {
  return PAGES_WITH_OWN_H1.includes(stripLocale(pathname));
}
