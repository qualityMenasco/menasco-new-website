import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Download, Mail, Phone, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LocaleLink } from './LocaleLink';
import { LanguageSwitch } from './LanguageSwitch';
import { cn } from '../lib/utils';
import { useScrollLock } from '../hooks/useScrollLock';
import { aboutNavigation, dataCentreServiceLink, servicesNavigationGroups } from '../../data/navigation';
import { primaryContact } from '../../data/locations';
import { footerSocialLinks } from '../../data/socialLinks';
import { SocialLinks } from '../../components/navigation';
import { COMPANY_PROFILE_PATH } from '../../seo/constants';
import { getLocaleFromPath, withLocale } from '../../lib/locale';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

type Panel = 'root' | 'about' | 'services';

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.18 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Full-screen phone/tablet navigation — Apple-style drill-down panels.
 * The root panel is a short list in large type; About and Services slide in
 * as their own panels (with a Back control) instead of expanding into long
 * accordions. Services lists its five umbrella pages with a one-line
 * description, each umbrella's sub-pages as small inline links. A compact
 * contact block (head office phone/email, company profile, socials, then
 * the Get in contact button) sits at the bottom. The menu is a drawer that
 * slides in from the inline end over a dimmed backdrop, so the current page
 * stays visible; tapping the backdrop closes it.
 */
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { t } = useTranslation(['nav', 'common', 'services']);
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const reducedMotion = useReducedMotion();
  const [panel, setPanel] = useState<Panel>('root');
  const [direction, setDirection] = useState<1 | -1>(1);
  const rtl = locale === 'ar';
  useScrollLock(isOpen);

  const directLinks = [
    { key: 'projectsSectors', href: '/projects/categories' },
    { key: 'newsroom', href: '/newsroom' },
    { key: 'careers', href: '/careers' },
  ];

  const umbrellas = [
    ...servicesNavigationGroups
      .filter((group) => group.href)
      .map((group) => ({ href: group.href!, i18nKey: group.i18nKey, key: group.i18nKey.replace('servicesGroups.', ''), links: group.links })),
    { href: dataCentreServiceLink.href, i18nKey: dataCentreServiceLink.i18nKey, key: 'dataCenters', links: [] as typeof servicesNavigationGroups[number]['links'] },
  ];

  // Close (and reset to the root panel) the moment the route changes.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) setPanel('root');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (panel !== 'root') goTo('root');
      else onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, panel]);

  const goTo = (next: Panel) => {
    setDirection(next === 'root' ? -1 : 1);
    setPanel(next);
  };

  const isExact = (href: string) => location.pathname === withLocale(href, locale);
  const isActive = (href: string) => {
    const target = withLocale(href, locale);
    return location.pathname === target || (target !== withLocale('/', locale) && location.pathname.startsWith(`${target}/`));
  };
  const aboutActive = aboutNavigation.some((item) => isActive(item.href));
  const servicesActive = isActive('/services');

  // Panel slides, iOS-style: forward = the new panel slides in from the
  // inline end while the old one drifts back; Back = the reverse. Direction is
  // passed through AnimatePresence's `custom`, so the EXITING panel also uses
  // the current direction (not the one it was rendered with). Mirrored in RTL.
  const sign = rtl ? -1 : 1;
  const panelVariants: Variants = {
    enter: (dir: number) => ({ x: `${sign * (dir > 0 ? 100 : -30)}%`, opacity: dir > 0 ? 1 : 0 }),
    center: { x: '0%', opacity: 1 },
    // Leaving panels accelerate out and fade, so they never linger at the edge.
    exit: (dir: number) =>
      dir > 0
        ? { x: `${sign * -30}%`, opacity: 0, transition: { duration: 0.26, ease: [0.4, 0, 1, 1] } }
        : { x: `${sign * 100}%`, opacity: 0, transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } },
  };
  const panelMotion = reducedMotion
    ? {}
    : { custom: direction, variants: panelVariants, initial: 'enter', animate: 'center', exit: 'exit', transition: { duration: 0.34, ease: [0.32, 0.72, 0, 1] as const } };
  // Links stagger in when the menu opens or a sub-panel opens — not when returning to the root.
  const stagger = reducedMotion || direction < 0 ? {} : { variants: listVariants, initial: 'hidden', animate: 'show' };
  const item = reducedMotion ? {} : { variants: itemVariants };

  const topLink = (active: boolean) =>
    cn(
      'group flex min-h-[56px] w-full items-center justify-between gap-3 py-3 text-start font-display text-h3 font-semibold transition-colors duration-base',
      active ? 'text-brand-600' : 'text-ink hover:text-brand-600',
    );
  const activeDot = <span aria-hidden="true" className="ms-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600 align-middle" />;
  const subLink = (active: boolean) =>
    cn('flex min-h-[48px] items-center justify-between gap-3 py-2.5 text-body-lg font-medium transition-colors duration-base', active ? 'text-brand-600' : 'text-ink hover:text-brand-600');

  const PanelHeader = ({ title }: { title: string }) => (
    <button
      type="button"
      onClick={() => goTo('root')}
      className="mb-2 inline-flex min-h-11 items-center gap-1 text-small font-semibold text-gray-600 transition-colors duration-base hover:text-ink"
    >
      <ChevronLeft size={18} aria-hidden="true" className="rtl:rotate-180" />
      {t('menuBack')}
      <span className="sr-only">: {title}</span>
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="menu-layer" className="fixed inset-0 z-50" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 1, transition: { duration: 0.32 } }}>
          {/* Backdrop: the current page stays visible, dimmed; tapping it closes the menu. */}
          <motion.div
            aria-hidden="true"
            onClick={onClose}
            initial={reducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
          />
          {/* Drawer: slides in from the inline end (right in LTR, left in RTL). */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('siteNavigation')}
            initial={reducedMotion ? undefined : { x: rtl ? '-100%' : '100%' }}
            animate={{ x: '0%' }}
            exit={reducedMotion ? undefined : { x: rtl ? '-100%' : '100%' }}
            transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-y-0 end-0 flex w-[84vw] max-w-[26rem] flex-col bg-warmwhite shadow-[0_0_48px_rgba(10,11,13,0.25)]"
          >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-5">
            <span className="font-display text-small font-semibold uppercase tracking-widest text-gray-500 rtl:tracking-normal">{t('menu')}</span>
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

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex min-h-full flex-col px-5">
              {/* Navigation panels. */}
              <nav aria-label={t('nav:primaryNavigation')} className="relative pb-6 pt-4">
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                  {panel === 'root' && (
                    <motion.div key="root" {...panelMotion}>
                      <motion.ul role="list" className="divide-y divide-gray-200" {...stagger}>
                        <motion.li {...item}>
                          <LocaleLink to="/" aria-current={isExact('/') ? 'page' : undefined} className={topLink(isExact('/'))}>
                            <span>
                              {t('home')}
                              {isExact('/') && activeDot}
                            </span>
                          </LocaleLink>
                        </motion.li>
                        {(['about', 'services'] as const).map((key) => {
                          const active = key === 'about' ? aboutActive : servicesActive;
                          return (
                            <motion.li key={key} {...item}>
                              <button type="button" onClick={() => goTo(key)} aria-haspopup="true" className={topLink(active)}>
                                <span>
                                  {t(key)}
                                  {active && activeDot}
                                </span>
                                <ChevronRight size={22} aria-hidden="true" className="shrink-0 text-gray-400 transition-transform duration-base group-hover:translate-x-0.5 group-hover:text-brand-600 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                              </button>
                            </motion.li>
                          );
                        })}
                        {directLinks.map((link) => (
                          <motion.li key={link.href} {...item}>
                            <LocaleLink to={link.href} aria-current={isActive(link.href) ? 'page' : undefined} className={topLink(isActive(link.href))}>
                              <span>
                                {t(link.key)}
                                {isActive(link.href) && activeDot}
                              </span>
                            </LocaleLink>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  )}

                  {panel === 'about' && (
                    <motion.div key="about" {...panelMotion}>
                      <PanelHeader title={t('about')} />
                      <p className="font-display text-h3 font-semibold text-ink">{t('about')}</p>
                      <motion.ul role="list" className="mt-3 divide-y divide-gray-200 border-t border-gray-200" {...stagger}>
                        {aboutNavigation.map((link) => (
                          <motion.li key={link.href} {...item}>
                            <LocaleLink to={link.href} aria-current={isExact(link.href) ? 'page' : undefined} className={subLink(isExact(link.href))}>
                              <span>{link.href === '/about' ? t('menuOverview') : t(link.i18nKey)}</span>
                              <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-gray-400 rtl:rotate-180" />
                            </LocaleLink>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  )}

                  {panel === 'services' && (
                    <motion.div key="services" {...panelMotion}>
                      <PanelHeader title={t('services')} />
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="font-display text-h3 font-semibold text-ink">{t('services')}</p>
                        <LocaleLink to="/services" className="inline-flex shrink-0 items-center gap-1 text-small font-semibold text-brand-600">
                          {t('allServices')}
                          <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
                        </LocaleLink>
                      </div>
                      <motion.ul role="list" className="mt-3 divide-y divide-gray-200 border-t border-gray-200" {...stagger}>
                        {umbrellas.map((umbrella) => (
                          <motion.li key={umbrella.href} className="py-3" {...item}>
                            <LocaleLink
                              to={umbrella.href}
                              aria-current={isExact(umbrella.href) ? 'page' : undefined}
                              className={cn('group flex items-start justify-between gap-3', isExact(umbrella.href) ? 'text-brand-600' : 'text-ink')}
                            >
                              <span className="min-w-0">
                                <span className="block font-display text-body-lg font-semibold transition-colors duration-base group-hover:text-brand-600">{t(umbrella.i18nKey)}</span>
                                <span className="mt-0.5 block text-small leading-snug text-gray-500">{t(`services:listing.umbrellas.${umbrella.key}`)}</span>
                              </span>
                              <ArrowRight size={16} aria-hidden="true" className="mt-1.5 shrink-0 text-gray-400 transition-colors duration-base group-hover:text-brand-600 rtl:rotate-180" />
                            </LocaleLink>
                            {umbrella.links.length > 0 && (
                              <ul role="list" className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                {umbrella.links.map((link) => (
                                  <li key={link.href}>
                                    <LocaleLink
                                      to={link.href}
                                      aria-current={isActive(link.href) ? 'page' : undefined}
                                      className={cn(
                                        'inline-flex min-h-8 items-center text-small font-medium underline-offset-4 transition-colors duration-base hover:underline',
                                        isActive(link.href) ? 'text-brand-600' : 'text-gray-700 hover:text-brand-600',
                                      )}
                                    >
                                      {t(link.i18nKey)}
                                    </LocaleLink>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </nav>

              {/* Contact block — fills the empty space on phones, a side column on tablets. */}
              <aside className="mt-auto border-t border-gray-200 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
                <p className="font-display text-caption font-semibold uppercase tracking-widest text-gray-500 rtl:tracking-normal">{t('menuHeadOffice')}</p>
                <ul role="list" className="mt-3 space-y-1.5">
                  <li>
                    <a href={`tel:${primaryContact.dubaiPhonePrimary.replace(/\s/g, '')}`} dir="ltr" className="inline-flex min-h-10 items-center gap-2.5 text-body font-medium text-ink hover:text-brand-600">
                      <Phone size={16} aria-hidden="true" className="text-brand-600" />
                      {primaryContact.dubaiPhonePrimary}
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${primaryContact.email}`} className="inline-flex min-h-10 items-center gap-2.5 text-body font-medium text-ink hover:text-brand-600">
                      <Mail size={16} aria-hidden="true" className="text-brand-600" />
                      {primaryContact.email}
                    </a>
                  </li>
                  <li>
                    <a href={COMPANY_PROFILE_PATH} download="MENASCO-Company-Profile.pdf" className="inline-flex min-h-10 items-center gap-2.5 text-body font-medium text-ink hover:text-brand-600">
                      <Download size={16} aria-hidden="true" className="text-brand-600" />
                      {t('services:detail.downloadCompanyProfile')}
                    </a>
                  </li>
                </ul>
                <SocialLinks links={footerSocialLinks} theme="light" className="mt-4" />
                <LocaleLink
                  to="/contact?type=project"
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-md bg-brand-600 text-body font-semibold text-warmwhite transition-colors duration-base hover:bg-brand-700"
                >
                  {t('common:buttons.requestQuote')}
                </LocaleLink>
              </aside>
            </div>
          </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
