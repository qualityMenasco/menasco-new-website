import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LocaleLink } from './LocaleLink';
import { cn } from '../lib/utils';

/** Only the fields this carousel actually reads — narrower than the full static `NewsArticle` shape so callers can pass RDS-backed public-API article summaries directly (Phase 4) without adapting them into a fake legacy object. */
export interface FeaturedNewsCarouselStory {
  id: string;
  slug: string;
  category: string | null;
  date: string;
  title: string;
  subtitle: string | null;
  images: { src: string }[];
}

export interface FeaturedNewsCarouselProps {
  stories: FeaturedNewsCarouselStory[];
  categoryLabel: (category: string) => string;
  formatDate: (date: string) => string;
}

/**
 * Mobile Newsroom "Featured" carousel — one full-width story at a time,
 * swipeable via native snap-scroll, with a compact "‹ 1 / 3 ›" pagination
 * row (matching the Regional Presence office navigator's style) rather than
 * dots. No autoplay — the user drives it.
 */
export function FeaturedNewsCarousel({ stories, categoryLabel, formatDate }: FeaturedNewsCarouselProps) {
  const { t } = useTranslation(['newsroom', 'common']);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = (index: number, behavior: ScrollBehavior) => {
    cardRefs.current[index]?.scrollIntoView({ behavior, inline: 'start', block: 'nearest' });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame: number | null = null;
    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const trackLeft = track.getBoundingClientRect().left;
        let closestIndex = 0;
        let closestDistance = Infinity;
        cardRefs.current.forEach((card, index) => {
          if (!card) return;
          const distance = Math.abs(card.getBoundingClientRect().left - trackLeft);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        setActiveIndex(closestIndex);
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  const goTo = (direction: 1 | -1) => {
    const next = (activeIndex + direction + stories.length) % stories.length;
    scrollToIndex(next, 'smooth');
  };

  return (
    <div>
      <div
        ref={trackRef}
        role="region"
        aria-label={t('newsroom:featuredLabel')}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-1"
      >
        {stories.map((story, index) => (
          <div
            key={story.id}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            className="w-full shrink-0 snap-start"
          >
            <LocaleLink
              to={`/newsroom/${story.slug}`}
              className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-md bg-ink"
            >
              {story.images[0] && <img src={story.images[0].src} alt="" className="absolute inset-0 h-full w-full object-cover" />}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/50" aria-hidden="true" />

              <div className="relative z-10 flex items-start justify-between gap-3 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-300">
                  {story.category ? categoryLabel(story.category) : null}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-300">{formatDate(story.date)}</span>
              </div>

              <div className="relative z-10 flex flex-col gap-2 p-4">
                <h3 className="font-display text-h4 font-semibold leading-tight text-warmwhite">{story.title}</h3>
                <p className="text-small text-gray-200">{story.subtitle}</p>
                <span className="mt-1 inline-flex w-fit items-center gap-1.5 text-small font-semibold text-brand-300">
                  {t('newsroom:readMore')}
                  <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
                </span>
              </div>
            </LocaleLink>
          </div>
        ))}
      </div>

      {stories.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1 text-small text-gray-500">
          <button
            type="button"
            aria-label={t('newsroom:previousStory')}
            onClick={() => goTo(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-stone hover:text-brand-600 rtl:rotate-180"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <span className={cn('min-w-[3.5rem] text-center font-semibold tabular-nums text-ink')}>
            {activeIndex + 1} / {stories.length}
          </span>
          <button
            type="button"
            aria-label={t('newsroom:nextStory')}
            onClick={() => goTo(1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-stone hover:text-brand-600 rtl:rotate-180"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
