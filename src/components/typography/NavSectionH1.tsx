import { useTranslation } from 'react-i18next';

const SECTIONS = ['home', 'about', 'services', 'projectsSectors', 'newsroom', 'careers'] as const;

export type NavSection = (typeof SECTIONS)[number];

/**
 * Fallback page H1. Desktop's DesktopNav wraps its own active item's label
 * in a real <h1> for every route that has one (see DesktopNav.tsx) — mobile
 * has no equivalent (the mobile bottom tab bar that once did this was
 * removed site-wide), so every mobile page uses this component explicitly
 * instead. Visually hidden but present in the DOM and accessibility tree —
 * not display:none/visibility:hidden, so it remains real, legitimate page
 * content, just not visually duplicated.
 */
export function NavSectionH1({ section }: { section: NavSection }) {
  const { t } = useTranslation('nav');
  return <h1 className="sr-only">{t(section)}</h1>;
}
