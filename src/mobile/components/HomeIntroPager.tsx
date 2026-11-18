import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LocaleLink } from './LocaleLink';
import { cn } from '../../lib/utils';
import { foundingYear } from '../../data/companyStats';
import { umbrellaServiceLinks } from '../../data/navigation';

const PAGES = ['about', 'services'] as const;

/**
 * Home (phones + tablets): About MENASCO and What we deliver as two pages of
 * one section. A scroll-snap rail gives native swipe; the tab switcher above
 * jumps between pages; the "All services" / "About MENASCO" buttons below are
 * shared, so they stay visible on both pages. The rail height follows the
 * visible page so the buttons sit right under it.
 *
 * Smoothness: the pager is its own component (page changes don't re-render
 * the whole home page), scroll events are rAF-throttled and only commit when
 * the page actually changes, and while a tab-click scroll is in flight the
 * scroll handler is ignored. Without that lock the mid-animation position
 * rounded back to the old page, so the active tab and the rail height flipped
 * back and forth during the scroll (the earlier stutter).
 */
export function HomeIntroPager() {
  const { t } = useTranslation(['home', 'nav', 'services']);
  const reducedMotion = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [height, setHeight] = useState<{ value: number; animate: boolean }>();
  const targetRef = useRef<number | null>(null);
  const releaseTimer = useRef<number | undefined>(undefined);
  const frame = useRef<number | undefined>(undefined);

  const pageFromScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail || !rail.clientWidth) return 0;
    return Math.round(Math.abs(rail.scrollLeft) / rail.clientWidth);
  }, []);

  const release = useCallback(() => {
    targetRef.current = null;
    window.clearTimeout(releaseTimer.current);
    setPage(pageFromScroll());
  }, [pageFromScroll]);

  const onScroll = () => {
    if (frame.current !== undefined) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = undefined;
      const rail = railRef.current;
      if (!rail) return;
      const target = targetRef.current;
      if (target !== null) {
        // Programmatic scroll: wait until it lands, then hand control back.
        if (Math.abs(Math.abs(rail.scrollLeft) - target * rail.clientWidth) < 2) release();
        return;
      }
      const next = pageFromScroll();
      setPage((current) => (current === next ? current : next));
    });
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onEnd = () => {
      if (targetRef.current !== null) release();
    };
    rail.addEventListener('scrollend', onEnd);
    return () => {
      rail.removeEventListener('scrollend', onEnd);
      window.clearTimeout(releaseTimer.current);
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
  }, [release]);

  // Fit the rail to the visible page. The height eases only when the page
  // switches; when a services row opens or the width changes it follows the
  // content instantly. (Easing those too made the rail restart a 300ms
  // transition on every frame of the accordion animation, so it trailed the
  // content: the lag when expanding a row.)
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const measure = (animate: boolean) => {
      const current = rail.children[page] as HTMLElement | undefined;
      if (!current) return;
      const next = current.offsetHeight;
      setHeight((prev) => (prev && prev.value === next ? prev : { value: next, animate }));
    };
    measure(true);
    const observer = new ResizeObserver(() => measure(false));
    Array.from(rail.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [page]);

  const goTo = (index: number) => {
    const rail = railRef.current;
    const target = rail?.children[index] as HTMLElement | undefined;
    if (!rail || !target || index === page) return;
    targetRef.current = index;
    setPage(index);
    window.clearTimeout(releaseTimer.current);
    releaseTimer.current = window.setTimeout(release, 900); // fallback where scrollend is unsupported
    rail.scrollBy({
      left: target.getBoundingClientRect().left - rail.getBoundingClientRect().left,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  const tabLabel = (key: (typeof PAGES)[number]) => (key === 'about' ? t('home:companyIntro.eyebrow') : t('home:servicesShowcase.eyebrow'));

  return (
    <section className="bg-stone py-8">
      {/* Tab switcher: plain pill; the selected tab is white with a blue outline. */}
      <div className="px-4">
        <div
          role="tablist"
          aria-label={t('home:companyIntro.eyebrow')}
          className="grid grid-cols-2 gap-1 rounded-full border border-gray-200 bg-warmwhite p-1 md:inline-grid"
        >
          {PAGES.map((key, index) => (
            <button
              key={key}
              id={`home-intro-tab-${key}`}
              type="button"
              role="tab"
              aria-selected={page === index}
              aria-controls={`home-intro-page-${key}`}
              onClick={() => goTo(index)}
              className={cn(
                'min-h-10 rounded-full border px-4 text-small font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:px-5',
                page === index ? 'border-brand-600 bg-white text-brand-600' : 'border-transparent text-gray-600 hover:text-ink',
              )}
            >
              {tabLabel(key)}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={railRef}
        onScroll={onScroll}
        style={height ? { height: height.value } : undefined}
        className={cn(
          'no-scrollbar mt-6 flex snap-x snap-mandatory items-start overflow-x-auto overflow-y-hidden overscroll-x-contain',
          height?.animate && 'transition-[height] duration-300 ease-out motion-reduce:transition-none',
        )}
      >
        <div id="home-intro-page-about" role="tabpanel" aria-labelledby="home-intro-tab-about" className="w-full shrink-0 snap-start px-4">
          <h3 className="font-display text-h3 font-semibold tracking-tight text-ink md:text-h2">
            {t('home:companyIntro.mobileHeading', { years: new Date().getFullYear() - foundingYear })}
          </h3>
          <p className="mt-3 text-small text-gray-600 md:text-body">{t('home:companyIntro.mobileDescription', { foundingYear })}</p>
        </div>
        <div id="home-intro-page-services" role="tabpanel" aria-labelledby="home-intro-tab-services" className="w-full shrink-0 snap-start px-4">
          <h3 className="font-display text-h3 font-semibold tracking-tight text-ink md:text-h2">{t('home:servicesShowcase.mobileHeading')}</h3>
          <nav aria-label={t('home:servicesShowcase.eyebrow')} className="mt-4 flex flex-col">
            {/* Umbrella pages only — each row links straight to its page (sub-services are sections there). */}
            {umbrellaServiceLinks.map((link) => (
              <LocaleLink
                key={link.href}
                to={link.href}
                className="flex items-center justify-between gap-4 border-t border-gray-200 py-3 font-display text-h4 font-semibold text-gray-500 transition-colors duration-base hover:text-brand-600"
              >
                <span className="min-w-0">{t(`nav:${link.i18nKey}`)}</span>
                <ArrowRight size={18} aria-hidden="true" className="shrink-0 rtl:rotate-180" />
              </LocaleLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 px-4 pt-4">
        <LocaleLink to="/services" className="inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-brand-600">
          {t('home:servicesShowcase.cta')}
          <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
        </LocaleLink>
        <LocaleLink to="/about" className="inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-brand-600">
          {t('home:companyIntro.cta')}
          <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
        </LocaleLink>
      </div>
    </section>
  );
}
