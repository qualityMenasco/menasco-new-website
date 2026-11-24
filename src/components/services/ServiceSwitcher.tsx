import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { SmartLink } from '../../lib/SmartLink';
import { stripLocale } from '../../lib/locale';
import { cn } from '../../lib/utils';
import { headerI18nKey, umbrellaServiceLinks } from '../../data/navigation';
import { Container } from '../layout/Container';

// Shorter labels than the header's, so the row fits a phone screen (client request 2026-11-24).
const SWITCHER_LABEL_KEYS: Record<string, string> = {
  '/services/manufacturing-prefabrication': 'servicesGroups.modularShort',
};

/**
 * Service switcher (client request 2026-11-24): a sticky bar under the header on the MEP,
 * Civil, Manufacturing & Prefabrication and EPC pages, so arriving on a service page is
 * obvious and visitors can hop between services. Phones and tablets only (below the
 * `desktop` breakpoint, where the hamburger header replaces the main navigation): on desktop
 * it competed with the main nav (client), so it is hidden there and the desktop header keeps
 * floating over the hero as before. Same look as the Data Centers
 * Technical / Sustainability bar (DataCenterTabs), which those pages keep instead.
 *
 * Lists every umbrella service in menu order (MEP, Civil, Modular Fabrication, EPC, Data
 * Centers) with the header's short labels ("Modular" here, to fit phones); "Services" (wider screens) links to the overview.
 * Tone matches the hero below it; no bottom rule (the framed hero below marks the edge, client
 * 2026-11-24). Phones: the row scrolls sideways edge to edge, current
 * service centred.
 */
export function ServiceSwitcher({ tone }: { tone: 'dark' | 'light' }) {
  const { t } = useTranslation('nav');
  const { pathname } = useLocation();
  const path = stripLocale(pathname);
  const listRef = useRef<HTMLUListElement | null>(null);
  const dark = tone === 'dark';

  // When the row overflows (phones), centre the current service in it. Scrolls the row only.
  useEffect(() => {
    const list = listRef.current;
    const current = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !current || list.scrollWidth <= list.clientWidth + 1) return;
    const l = list.getBoundingClientRect();
    const c = current.getBoundingClientRect();
    list.scrollLeft += c.left + c.width / 2 - (l.left + l.width / 2);
  }, [path]);

  return (
    <nav aria-label={t('services')} className={cn('sticky top-14 z-30 desktop:hidden', dark ? 'bg-charcoal' : 'bg-warmwhite')}>
      <Container className="flex h-12 items-stretch gap-5 sm:gap-8 md:h-14">
        <SmartLink
          href="/services"
          className={cn(
            'hidden items-center pe-8 font-display text-caption font-semibold uppercase tracking-widest text-gray-500 transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400 sm:flex sm:border-e rtl:tracking-normal',
            dark ? 'hover:text-white sm:border-white/10' : 'hover:text-ink sm:border-gray-200',
          )}
        >
          {t('services')}
        </SmartLink>
        <ul ref={listRef} className="no-scrollbar -mx-6 flex min-w-0 items-stretch gap-4 overflow-x-auto overflow-y-hidden px-6 sm:mx-0 sm:gap-8 sm:px-0">
          {umbrellaServiceLinks.map((link) => {
            const on = path === link.href || path.startsWith(`${link.href}/`);
            return (
              <li key={link.href} className="relative flex shrink-0">
                <SmartLink
                  href={link.href}
                  aria-current={on ? 'page' : undefined}
                  className={cn(
                    'flex items-center whitespace-nowrap font-display text-small font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400 md:text-body',
                    dark ? (on ? 'text-white' : 'text-gray-400 hover:text-white') : on ? 'text-ink' : 'text-gray-500 hover:text-ink',
                  )}
                >
                  {t(SWITCHER_LABEL_KEYS[link.href] ?? headerI18nKey(link))}
                </SmartLink>
                <span aria-hidden="true" className={cn('absolute inset-x-0 bottom-0 h-0.5 transition-opacity duration-base', dark ? 'bg-brand-400' : 'bg-brand-600', on ? 'opacity-100' : 'opacity-0')} />
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
