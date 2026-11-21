import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LocaleLink } from './LocaleLink';
import { SectionHeader } from './SectionHeader';
import { cn } from '../../lib/utils';
import { sectors } from '../../data/sectors';
import { sectorImages, sectorKeys } from '../../data/homeSectors';

/**
 * Home "Where we work" (phones + tablets): one photo card per sector in a
 * swipeable row; each card links to that sector's projects.
 *
 * - Enlarge when viewing: cards fully in view sit at full size; cards cut off
 *   at the edge are slightly smaller and dimmer, so the one(s) you're looking
 *   at stand out as the row moves.
 * - Pop on hover (mouse/trackpad): the card lifts with a deeper shadow and
 *   the photo eases in.
 * - Cards are sized so about 1.5-2.5 show at once from 480px up.
 * - Small phones (under 480px): no arrows; position dots instead.
 * - From 480px: prev/next arrows at the bottom right for mouse users; trackpads
 *   and touch scroll the row natively. Each arrow disables at its end, and
 *   in RTL "next" follows the content flow (scrollLeft runs negative).
 */
export function HomeSectorsRail() {
  const { t } = useTranslation(['home', 'projects', 'common']);
  const reducedMotion = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState<Set<string>>(() => new Set(sectors.map((s) => s.id)));
  const [edges, setEdges] = useState({ canPrev: false, canNext: true });
  // Small phones: position dots (same style as the Community & People photo rails).
  const [active, setActive] = useState(0);

  const updateEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const travelled = Math.abs(rail.scrollLeft);
    const max = rail.scrollWidth - rail.clientWidth;
    setEdges((prev) => {
      const next = { canPrev: travelled > 4, canNext: travelled < max - 4 };
      return prev.canPrev === next.canPrev && prev.canNext === next.canNext ? prev : next;
    });
    const first = rail.firstElementChild as HTMLElement | null;
    const index = travelled >= max - 4 ? sectors.length - 1 : first ? Math.round(travelled / (first.offsetWidth + 12)) : 0;
    setActive(Math.min(sectors.length - 1, Math.max(0, index)));
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    updateEdges();
    window.addEventListener('resize', updateEdges);
    const observer = new IntersectionObserver(
      (entries) => {
        setInView((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const id = (entry.target as HTMLElement).dataset.sectorId!;
            if (entry.intersectionRatio >= 0.9) next.add(id);
            else next.delete(id);
          });
          return next;
        });
      },
      { root: rail, threshold: [0, 0.9, 1] },
    );
    Array.from(rail.children).forEach((child) => observer.observe(child));
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges]);

  const step = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.firstElementChild as HTMLElement | null;
    const distance = card ? card.getBoundingClientRect().width + 12 : rail.clientWidth * 0.8;
    const rtl = getComputedStyle(rail).direction === 'rtl';
    rail.scrollBy({ left: direction * distance * (rtl ? -1 : 1), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const arrow = 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-ink transition-colors duration-base hover:border-ink disabled:cursor-default disabled:opacity-35';

  return (
    <section className="py-5 md:py-8">
      <div className="px-4 md:px-8">
        <SectionHeader eyebrow={t('home:sectors.eyebrow')} heading={t('home:sectors.heading')} headingAs="h3" />
      </div>
      <div
        id="home-sectors-rail"
        ref={railRef}
        onScroll={updateEdges}
        className="no-scrollbar mt-1 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 pt-2 md:mt-2 md:scroll-px-8 md:px-8 md:pb-4 md:pt-3"
      >
        {sectors.map((sector) => {
          const key = sectorKeys[sector.slug] ?? sector.slug;
          const visible = inView.has(sector.id);
          return (
            <LocaleLink
              key={sector.id}
              data-sector-id={sector.id}
              to={`/projects/categories?category=${sector.slug}`}
              className={cn(
                'group flex w-[78vw] max-w-[20rem] shrink-0 snap-start flex-col overflow-hidden rounded-md border border-gray-200 bg-stone shadow-sm transition-[transform,opacity,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 motion-reduce:transition-none min-[480px]:w-[58%] min-[480px]:max-w-none md:w-[42%]',
                visible ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-70',
              )}
            >
              <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-gray-100">
                <img
                  src={sectorImages[sector.slug]}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
                />
              </div>
              <div className="flex flex-1 flex-col px-4 pb-3 pt-3 md:p-4">
                <h4 className="font-display text-h4 font-semibold text-ink">{t(`home:sectors.items.${key}.title`, t(`projects:categories.${key}.title`))}</h4>
                <p className="mt-2 line-clamp-4 text-small text-gray-600">{t(`home:sectors.items.${key}.description`, t('common:pendingContent.notice'))}</p>
              </div>
            </LocaleLink>
          );
        })}
      </div>
      {/* Small phones (under 480px): no arrows. Instead one dot per sector,
          the current one stretched into a short pill (same style as the
          Community & People photo rails). */}
      <div aria-hidden="true" className="flex justify-center gap-1.5 pt-1 min-[480px]:hidden">
        {sectors.map((sector, index) => (
          <span key={sector.id} className={cn('h-1.5 rounded-full transition-all duration-base', index === active ? 'w-5 bg-ink' : 'w-1.5 bg-gray-300')} />
        ))}
      </div>
      {/* From 480px (large phones held sideways, tablets): arrows at the bottom
          right (bottom left in RTL). */}
      <div className="hidden justify-end gap-2 px-4 pt-2 min-[480px]:flex md:px-8">
        <button type="button" onClick={() => step(-1)} disabled={!edges.canPrev} aria-label={t('common:buttons.previousSectors')} aria-controls="home-sectors-rail" className={arrow}>
          <ChevronLeft size={18} aria-hidden="true" className="rtl:rotate-180" />
        </button>
        <button type="button" onClick={() => step(1)} disabled={!edges.canNext} aria-label={t('common:buttons.nextSectors')} aria-controls="home-sectors-rail" className={arrow}>
          <ChevronRight size={18} aria-hidden="true" className="rtl:rotate-180" />
        </button>
      </div>
    </section>
  );
}
