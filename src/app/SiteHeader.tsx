import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '../components/ui/Button';
import { DesktopNav } from '../components/navigation/DesktopNav';
import { HeaderShell } from '../components/navigation/HeaderShell';
import { MenascoLogo } from '../components/brand/MenascoLogo';
import { LanguageSwitch } from '../components/navigation/LanguageSwitch';
import { SmartLink } from '../lib/SmartLink';
import { aboutNavigation, homeSectionNavigation, servicesNavigation } from '../data/navigation';
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

const aboutNavKeys: Record<string, string> = {
  'About MENASCO': 'aboutMenasco',
  'Leadership Team': 'leadershipTeam',
  'Quality & Safety': 'qualitySafety',
  'ESG Reporting': 'esgReporting',
  'Innovation & Technology': 'innovationTechnology',
};

const servicesNavKeys: Record<string, string> = {
  'Mechanical Systems': 'servicesList.mechanical',
  'Electrical & ELV Systems': 'servicesList.electrical',
  'Plumbing, Water & Drainage Systems': 'servicesList.plumbing',
  'Fire Protection & Life Safety Systems': 'servicesList.firesProtection',
  'BIM & Digital Engineering': 'servicesList.bimDigitalEngineering',
  'Manufacturing & MEP Prefabrication': 'servicesList.manufacturingPrefabrication',
};

const sectionIds = homeSectionNavigation.map((item) => item.sectionId);

const SCROLL_THRESHOLD = 24;

export function SiteHeader() {
  const { t } = useTranslation(['nav', 'common']);
  const { transparent: transparentAllowed, mode: transparencyMode, themeOverride } = useHeaderTransparencyState();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/ar';

  const dropdownByLabel: Record<string, typeof servicesNavigation> = {
    About: aboutNavigation,
    Services: servicesNavigation,
  };

  const navItems: NavItem[] = useMemo(
    () =>
      homeSectionNavigation.map((item) => ({
        href: item.directHref ?? `/#${item.sectionId}`,
        label: ((): string => {
          const key = primaryNavKeys[item.label];
          return key ? t(`nav:${key}`) : item.label;
        })(),
        ...(dropdownByLabel[item.label]
          ? {
              dropdown: dropdownByLabel[item.label].map((link) => ({
                label: ((): string => {
                  const map = item.label === 'About' ? aboutNavKeys : servicesNavKeys;
                  const childKey = map[link.label];
                  return childKey ? t(`nav:${childKey}`) : link.label;
                })(),
                href: link.href,
              })),
            }
          : {}),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeSectionId = useActiveSection(sectionIds, isHomePage);
  // Separate from the nav-highlighting observer above (which only watches the
  // subset of sections with their own nav link) — this one watches every
  // homepage section so the always-transparent home header can match its
  // text colour to whichever section is currently behind it.
  const activeHomeThemeSectionId = useActiveSection(homeSectionIds, isHomePage, '0px 0px -88% 0px');

  const isItemActive = useMemo(() => {
    return (item: NavItem) => {
      const navEntry = homeSectionNavigation.find((entry) => {
        const key = primaryNavKeys[entry.label];
        const expected = key ? t(`nav:${key}`) : entry.label;
        return expected === item.label;
      });
      if (!navEntry) return false;
      if (isHomePage) return navEntry.sectionId === activeSectionId;
      // Nav entries' routePrefix/directHref/dropdown hrefs are always the
      // canonical English path (see data/navigation.ts) — strip a /ar prefix
      // from the current path first so active-item detection (and, via it,
      // the H1 wrap below) works identically in both locales.
      const path = stripLocale(location.pathname);
      if (path === navEntry.routePrefix || path.startsWith(`${navEntry.routePrefix}/`)) return true;
      if (navEntry.directHref && (path === navEntry.directHref || path.startsWith(`${navEntry.directHref}/`))) return true;
      // Dropdown children (e.g. About's Leadership Team, Quality & Safety) don't
      // live under the parent's own route prefix, so check their hrefs too.
      return item.dropdown?.some((link) => path === link.href || path.startsWith(`${link.href}/`)) ?? false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHomePage, activeSectionId, location.pathname, t]);

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
