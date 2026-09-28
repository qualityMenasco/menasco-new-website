import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MobileAccordion } from './MobileAccordion';
import { LocaleLink } from './LocaleLink';
import { LanguageSwitch } from './LanguageSwitch';
import { cn } from '../lib/utils';
import { useScrollLock } from '../hooks/useScrollLock';
import { aboutNavigation, servicesNavigation } from '../../data/navigation';
import { getLocaleFromPath, withLocale } from '../../lib/locale';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

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

/** Full-screen mobile nav overlay — About/Services as accordions, everything else a flat, one-tap link. */
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { t } = useTranslation(['nav', 'common']);
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const reducedMotion = useReducedMotion();
  useScrollLock(isOpen);

  const directLinks = [
    { key: 'projectsSectors', href: '/projects/categories' },
    { key: 'newsroom', href: '/newsroom' },
    { key: 'careers', href: '/careers' },
    { key: 'contactUs', href: '/contact' },
  ];

  // Close automatically the moment the route changes (link tap navigates away).
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const isActive = (href: string) => {
    const target = withLocale(href, locale);
    return location.pathname === target || (target !== withLocale('/', locale) && location.pathname.startsWith(`${target}/`));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t('siteNavigation')}
          initial={reducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-warmwhite"
        >
          <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
            <span className="font-display text-small font-semibold uppercase tracking-widest text-gray-500">{t('menu')}</span>
            <div className="flex items-center gap-3">
              <LanguageSwitch />
              <button
                type="button"
                onClick={onClose}
                aria-label={t('closeMenu')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-ink/5 active:bg-ink/10"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4" aria-label={t('nav:primaryNavigation')}>
            <MobileAccordion title={t('about')}>
              <div className="flex flex-col gap-1">
                {aboutNavigation.map((item) => (
                  <LocaleLink
                    key={item.href}
                    to={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'min-h-[44px] rounded-sm px-2 py-2.5 text-body',
                      isActive(item.href) ? 'font-semibold text-brand-600' : 'text-ink',
                    )}
                  >
                    {t(aboutNavKeys[item.label] ?? item.label)}
                  </LocaleLink>
                ))}
              </div>
            </MobileAccordion>

            <MobileAccordion title={t('services')}>
              <div className="flex flex-col gap-1">
                <LocaleLink
                  to="/services"
                  aria-current={isActive('/services') && location.pathname === withLocale('/services', locale) ? 'page' : undefined}
                  className="min-h-[44px] rounded-sm px-2 py-2.5 text-body font-semibold text-brand-600"
                >
                  {t('allServices')}
                </LocaleLink>
                {servicesNavigation.map((item) => (
                  <LocaleLink
                    key={item.href}
                    to={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'min-h-[44px] rounded-sm px-2 py-2.5 text-body',
                      isActive(item.href) ? 'font-semibold text-brand-600' : 'text-ink',
                    )}
                  >
                    {t(servicesNavKeys[item.label] ?? item.label)}
                  </LocaleLink>
                ))}
              </div>
            </MobileAccordion>

            {directLinks.map((item) => (
              <LocaleLink
                key={item.href}
                to={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'block border-b border-gray-200 py-4 font-display text-body-lg font-semibold',
                  isActive(item.href) ? 'text-brand-600' : 'text-ink',
                )}
              >
                {t(item.key)}
              </LocaleLink>
            ))}
          </nav>

          <div className="border-t border-gray-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <LocaleLink
              to="/contact?type=project"
              className="flex h-12 w-full items-center justify-center rounded-md bg-brand-600 text-body font-semibold text-warmwhite transition-colors duration-base hover:bg-brand-700"
            >
              {t('common:buttons.requestQuote')}
            </LocaleLink>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
