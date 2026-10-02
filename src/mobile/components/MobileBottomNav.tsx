import { Home, Wrench, Building2, Users, Menu as MenuIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { LocaleLink } from './LocaleLink';
import { getLocaleFromPath, stripLocale, withLocale } from '../../lib/locale';

export interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

const items = [
  { key: 'home', href: '/', icon: Home },
  { key: 'services', href: '/services', icon: Wrench },
  { key: 'projectsSectors', href: '/projects/categories', icon: Building2 },
  { key: 'about', href: '/about', icon: Users },
];

/** Fixed bottom bar for the most common destinations, plus a "Menu" trigger for everything else. */
export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const { t } = useTranslation('nav');
  const { pathname } = useLocation();
  const locale = getLocaleFromPath(pathname);
  const isHomePage = stripLocale(pathname) === '/';

  return (
    <nav
      aria-label={t('siteNavigation')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-warmwhite/95 backdrop-blur-md backdrop-saturate-150 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const target = withLocale(item.href, locale);
          // Homepage ('/', '/ar', '/ar/') is a neutral state — no tab is marked current there.
          const isActive = !isHomePage && (pathname === target || (target !== withLocale('/', locale) && pathname.startsWith(`${target}/`)));
          return (
            <LocaleLink
              key={item.href}
              to={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex min-h-[48px] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold leading-none tracking-tight',
                isActive ? 'text-brand-600' : 'text-gray-600',
              )}
            >
              <item.icon size={20} aria-hidden="true" />
              <span className="whitespace-nowrap">{isActive ? <h1 className="contents">{t(item.key)}</h1> : t(item.key)}</span>
            </LocaleLink>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex min-h-[48px] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold leading-none tracking-tight text-gray-600"
        >
          <MenuIcon size={20} aria-hidden="true" />
          <span className="whitespace-nowrap">{t('menu')}</span>
        </button>
      </div>
    </nav>
  );
}
