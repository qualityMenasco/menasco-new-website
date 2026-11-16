import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { SectionHeader } from '../../typography/SectionHeader';
import { SmartLink } from '../../../lib/SmartLink';
import { sectors } from '../../../data/sectors';
import { sectorImages, sectorKeys } from '../../../data/homeSectors';

/**
 * "Where we work" — one photo tile per sector. The sector name sits on the
 * photo; on hover or keyboard focus the tile lifts (pop) and the description
 * slides up over it. The whole tile links to that sector's projects. (The mobile tree uses the same data
 * as a swipeable row with the description always visible.)
 */
export function SectorsShowcase() {
  const { t } = useTranslation(['home', 'projects', 'common']);
  const reducedMotion = useReducedMotion();

  // Small desktop windows (1025-1279px): the tiles scroll sideways with
  // arrows (trackpads scroll natively). Each arrow disables at its end; in
  // RTL "next" follows the content flow (scrollLeft runs negative there).
  const railRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ canPrev: false, canNext: true });
  const updateEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const travelled = Math.abs(rail.scrollLeft);
    const max = rail.scrollWidth - rail.clientWidth;
    setEdges((prev) => {
      const next = { canPrev: travelled > 4, canNext: travelled < max - 4 };
      return prev.canPrev === next.canPrev && prev.canNext === next.canNext ? prev : next;
    });
  }, []);
  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [updateEdges]);
  const step = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const tile = rail.firstElementChild as HTMLElement | null;
    const distance = tile ? tile.getBoundingClientRect().width + 16 : rail.clientWidth * 0.8;
    const rtl = getComputedStyle(rail).direction === 'rtl';
    rail.scrollBy({ left: direction * distance * (rtl ? -1 : 1), behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  const arrow = 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-ink transition-colors duration-base hover:border-ink disabled:cursor-default disabled:opacity-35';

  return (
    <Section background="stone" spacing="md">
      <SectionHeader eyebrow={t('home:sectors.eyebrow')} heading={t('home:sectors.heading')} headingAs="h3" description={t('home:sectors.description')} className="max-w-2xl" />
      <div
        id="home-sectors-tiles"
        ref={railRef}
        onScroll={updateEdges}
        className="no-scrollbar -mx-2 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-2 px-2 pb-4 pt-2 xl:mx-0 xl:grid xl:grid-cols-4 xl:overflow-visible xl:px-0"
      >
        {sectors.map((sector) => {
          const key = sectorKeys[sector.slug] ?? sector.slug;
          // A homepage-specific title (home:sectors.items) wins over the shared projects-page category title.
          const title = t(`home:sectors.items.${key}.title`, t(`projects:categories.${key}.title`));
          const description = t(`home:sectors.items.${key}.description`, t('common:pendingContent.notice'));
          return (
            <SmartLink
              key={sector.id}
              href={`/projects/categories?category=${sector.slug}`}
              className="group relative block aspect-square w-[42%] shrink-0 snap-start overflow-hidden xl:aspect-[3/4] xl:w-auto rounded-md bg-ink shadow-sm transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl focus-visible:-translate-y-1.5 focus-visible:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <img
                src={sectorImages[sector.slug]}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent transition-colors duration-500 group-hover:bg-ink/55 group-focus-visible:bg-ink/55" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-h4 font-semibold leading-snug text-warmwhite">{title}</h3>
                {/* Description: collapsed to zero height until hover/focus, then slides up. */}
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] motion-reduce:transition-none">
                  <div className="overflow-hidden">
                    <p className="line-clamp-5 pt-3 text-small text-gray-200">{description}</p>
                  </div>
                </div>
              </div>
            </SmartLink>
          );
        })}
      </div>
      {/* Below 1280px: arrows at the bottom right (bottom left in RTL). */}
      <div className="flex justify-end gap-2 pt-2 xl:hidden">
        <button type="button" onClick={() => step(-1)} disabled={!edges.canPrev} aria-label={t('common:buttons.previousSectors')} aria-controls="home-sectors-tiles" className={arrow}>
          <ChevronLeft size={18} aria-hidden="true" className="rtl:rotate-180" />
        </button>
        <button type="button" onClick={() => step(1)} disabled={!edges.canNext} aria-label={t('common:buttons.nextSectors')} aria-controls="home-sectors-tiles" className={arrow}>
          <ChevronRight size={18} aria-hidden="true" className="rtl:rotate-180" />
        </button>
      </div>
    </Section>
  );
}
