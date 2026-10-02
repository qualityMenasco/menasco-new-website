import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '../components/ui/Button';
import { DesktopNav } from '../components/navigation/DesktopNav';
import { HeaderShell } from '../components/navigation/HeaderShell';
import { MenascoLogo } from '../components/brand/MenascoLogo';
import { LanguageSwitch } from '../components/navigation/LanguageSwitch';
import { SmartLink } from '../lib/SmartLink';
import { aboutNavigation, dataCentreServiceLink, homeSectionNavigation, servicesNavigationGroups } from '../data/navigation';
import { homeSectionIds, homeSectionThemeById } from '../data/homeSections';
import type { NavItem } from '../components/navigation/types';
import { useActiveSection } from '../hooks/useActiveSection';
import { useHeaderTransparencyState } from './header-transparency';
import { stripLocale } from '../lib/locale';

const REQUEST_QUOTE_HREF = '/contact?type=project';

// Maps each data file's (permanently English) label to its translation key —
// the data files stay the single source of truth for routing/structure,
// translation only ever affects what's displayed.
const primaryNavKeys: Record<string, string> = {
  About: 'about',
  Services: 'services',
  'Projects / Sectors': 'projectsSectors',
  Newsroom: 'newsroom',
  Careers: 'careers',
};

const SCROLL_THRESHOLD = 24;

export function SiteHeader() {
  const { t } = useTranslation(['nav', 'common']);
  const { transparent: transparentAllowed, mode: transparencyMode, themeOverride } = useHeaderTransparencyState();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  // stripLocale normalises '/ar' and '/ar/' to '/', so every homepage variant is recognised.
  const isHomePage = stripLocale(location.pathname) === '/';

  const navItems: NavItem[] = useMemo(
    () =>
      homeSectionNavigation.map((item) => {
        const key = primaryNavKeys[item.label];
        const base: NavItem = {
          href: item.directHref ?? `/#${item.sectionId}`,
          label: key ? t(`nav:${key}`) : item.label,
        };
        if (item.label === 'About') {
          return { ...base, dropdown: aboutNavigation.map((link) => ({ label: t(`nav:${link.i18nKey}`), href: link.href })) };
        }
        if (item.label === 'Services') {
          return {
            ...base,
            megaMenu: {
              columns: servicesNavigationGroups.map((group) => ({
                heading: t(`nav:${group.i18nKey}`),
                href: group.href,
                links: group.links.map((link) => ({ label: t(`nav:${link.i18nKey}`), href: link.href })),
              })),
              footerLinks: [
                { label: t('nav:allServices'), href: '/services' },
                { label: t(`nav:${dataCentreServiceLink.i18nKey}`), href: dataCentreServiceLink.href },
              ],
            },
          };
        }
        return base;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Watches every homepage section so the always-transparent home header can
  // match its text colour to whichever section is currently behind it.
  const activeHomeThemeSectionId = useActiveSection(homeSectionIds, isHomePage, '0px 0px -88% 0px');

  const isItemActive = useMemo(() => {
    return (item: NavItem) => {
      const navEntry = homeSectionNavigation.find((entry) => {
        const key = primaryNavKeys[entry.label];
        const expected = key ? t(`nav:${key}`) : entry.label;
        return expected === item.label;
      });
      if (!navEntry) return false;
      // The homepage is a neutral top-level state: no main nav item is the
      // current section there (Home has no nav item of its own), even while
      // scrolling past homepage sections that share a nav item's topic.
      if (isHomePage) return false;
      // Nav entries' routePrefix/directHref/dropdown hrefs are always the
      // canonical English path (see data/navigation.ts) — strip a /ar prefix
      // from the current path first so active-item detection (and, via it,
      // the H1 wrap below) works identically in both locales.
      const path = stripLocale(location.pathname);
      if (path === navEntry.routePrefix || path.startsWith(`${navEntry.routePrefix}/`)) return true;
      if (navEntry.directHref && (path === navEntry.directHref || path.startsWith(`${navEntry.directHref}/`))) return true;
      // Dropdown children (e.g. About's Leadership Team, Quality & Safety) don't
      // live under the parent's own route prefix, so check their hrefs too.
      const childLinks = [
        ...(item.dropdown ?? []),
        ...(item.megaMenu?.columns.flatMap((column) => [...(column.href ? [{ href: column.href }] : []), ...column.links]) ?? []),
        ...(item.megaMenu?.footerLinks ?? []),
      ];
      return childLinks.some((link) => path === link.href || path.startsWith(`${link.href}/`));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHomePage, location.pathname, t]);

  const isTransparent = transparentAllowed && (transparencyMode === 'always' || !isScrolled);
  const homeSectionTheme = isHomePage ? homeSectionThemeById[activeHomeThemeSectionId ?? 'hero'] : undefined;
  const headerTheme = themeOverride ?? homeSectionTheme ?? (isTransparent ? 'dark' : 'light');

  return (
    <HeaderShell
      variant={isTransparent ? 'transparent' : 'solid'}
      theme={headerTheme}
      navBreakpoint="none"
      floatOverContent={isHomePage}
      logo={
        <SmartLink href="/" className="flex items-center" aria-label={t('nav:menascoHome')}>
          <MenascoLogo className="h-9 sm:h-10" onDark={headerTheme === 'dark'} />
        </SmartLink>
      }
      nav={<DesktopNav items={navItems} theme={headerTheme} gap="md" isItemActive={isItemActive} />}
      actions={
        <div className="flex items-center gap-2">
          <LanguageSwitch isDark={headerTheme === 'dark'} />
          <ButtonLink href={REQUEST_QUOTE_HREF} variant="primary" size="sm" theme={headerTheme}>
            {t('common:buttons.requestQuote')}
          </ButtonLink>
        </div>
      }
    />
  );
}
