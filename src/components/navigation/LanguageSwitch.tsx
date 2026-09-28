import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { getLocaleFromPath, withLocale } from '../../lib/locale';
import type { Locale } from '../../lib/i18n';

export interface LanguageSwitchProps {
  isDark: boolean;
  className?: string;
}

/** Segmented EN / العربية toggle — swaps the current page to its /ar equivalent client-side, no reload. */
export function LanguageSwitch({ isDark, className }: LanguageSwitchProps) {
  const { t } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();
  const activeLocale = getLocaleFromPath(location.pathname);

  const goTo = (locale: Locale) => {
    if (locale === activeLocale) return;
    navigate(`${withLocale(location.pathname, locale)}${location.search}`);
  };

  const optionClass = (locale: Locale) =>
    cn(
      'rounded-xs px-2 py-1 transition-colors duration-base',
      activeLocale === locale ? (isDark ? 'bg-white/15' : 'bg-stone') : 'opacity-60 hover:opacity-100',
    );

  return (
    <div
      role="group"
      aria-label={t('languageSwitch.label')}
      className={cn(
        'flex items-center gap-1 rounded-sm border p-0.5 text-caption font-semibold transition-colors duration-base',
        isDark ? 'border-white/25 text-warmwhite' : 'border-gray-300 text-ink',
        className,
      )}
    >
      <button type="button" onClick={() => goTo('en')} aria-current={activeLocale === 'en'} className={optionClass('en')}>
        {t('languageSwitch.en')}
      </button>
      <button type="button" onClick={() => goTo('ar')} aria-current={activeLocale === 'ar'} className={optionClass('ar')}>
        {t('languageSwitch.ar')}
      </button>
    </div>
  );
}
