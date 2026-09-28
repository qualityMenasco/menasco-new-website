import { Download, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { MenascoLogo } from './MenascoLogo';
import { LocaleLink } from './LocaleLink';
import { COMPANY_PROFILE_PATH } from '../../seo/constants';
import { getLocaleFromPath, withLocale } from '../../lib/locale';

export interface MobileHeaderProps {
  onOpenMenu: () => void;
}

/** Compact, sticky mobile header — logo, hamburger, and a small quick-action CTA. */
export function MobileHeader({ onOpenMenu }: MobileHeaderProps) {
  const { t } = useTranslation('nav');
  const { pathname } = useLocation();
  const locale = getLocaleFromPath(pathname);
  const isHome = pathname === withLocale('/', locale);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-gray-200/60 bg-warmwhite/90 backdrop-blur-md backdrop-saturate-150',
        isHome && 'border-transparent',
      )}
    >
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <LocaleLink to="/" aria-label={t('menascoHome')} className="flex items-center">
          <MenascoLogo className="h-7" />
        </LocaleLink>
        <div className="flex items-center gap-1.5">
          <LocaleLink
            to="/contact"
            aria-label={t('contactUs')}
            className="inline-flex h-9 shrink-0 items-center rounded-md border border-gray-300 px-2.5 text-caption font-semibold text-ink xs:text-small"
          >
            {t('callUs')}
          </LocaleLink>
          <a
            href={COMPANY_PROFILE_PATH}
            download="MENASCO-Company-Profile.pdf"
            aria-label={t('profile')}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md bg-brand-600 px-2.5 text-caption font-semibold text-warmwhite xs:text-small"
          >
            <Download size={13} aria-hidden="true" className="shrink-0" />
            {t('profile')}
          </a>
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label={t('openMenu')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink transition-colors duration-base hover:bg-ink/5 active:bg-ink/10"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
