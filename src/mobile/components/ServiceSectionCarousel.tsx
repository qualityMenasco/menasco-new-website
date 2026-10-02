import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useServiceCarousel, type ServiceCarouselSection, type ServiceCarouselImage } from '../../hooks/useServiceCarousel';

interface ServiceSectionCarouselProps {
  sections: ServiceCarouselSection[];
  regionLabel: string;
  /**
   * A verified, on-topic photograph for this discipline. Renders once above
   * the text cards, not repeated per card, and not shown at all when
   * omitted — some disciplines currently have no honestly-matching image and
   * stay text-only rather than get a misleading photo.
   */
  image?: ServiceCarouselImage;
}

/**
 * Full-bleed, one-card-at-a-time horizontal carousel for the service detail
 * sections. See useServiceCarousel for the shared interaction logic
 * (scroll-snap, active-card tracking, height sync).
 */
export function ServiceSectionCarousel({ sections, regionLabel, image }: ServiceSectionCarouselProps) {
  const { t } = useTranslation('services');
  const { trackRef, cardRefs, activeIndex, cardHeight, goTo } = useServiceCarousel(sections.length);
  const total = sections.length;

  return (
    <section className="px-4 py-6">
      {image && (
        <div className="mb-3 aspect-[16/9] w-full overflow-hidden rounded-md" style={{ maxHeight: 'min(38vh, 14rem)' }}>
          <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="relative">
        <div
          ref={trackRef}
          role="region"
          aria-label={regionLabel}
          aria-roledescription="carousel"
          tabIndex={0}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
        >
          {sections.map((section, index) => (
            <div
              key={section.heading}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              data-card-index={index}
              className="w-full shrink-0 snap-start"
            >
              <div
                className="flex flex-col gap-3 rounded-md border border-gray-200 bg-warmwhite p-5 pb-14"
                style={cardHeight ? { minHeight: cardHeight } : undefined}
              >
                <span className="block h-0.5 w-8 bg-brand-600" aria-hidden="true" />
                <h3 className="font-display text-h4 font-semibold text-ink">{section.heading}</h3>
                <p className="text-body text-gray-700">{section.paragraph}</p>
                {section.list && section.list.length > 0 && (
                  <ul className="mt-1 flex flex-col gap-2">
                    {section.list.map((item) => (
                      <li key={item} className="flex gap-2 text-body text-ink">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {total > 1 && (
          <div className="absolute bottom-5 end-5 flex items-center gap-2">
            <span dir="ltr" className="text-[11px] font-semibold tabular-nums text-gray-500">
              {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                disabled={activeIndex === 0}
                aria-label={t('services:detail.previousSection')}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-ink transition-colors duration-base active:border-brand-600 active:text-brand-600 disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowLeft size={13} aria-hidden="true" className="rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                disabled={activeIndex === total - 1}
                aria-label={t('services:detail.nextSection')}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-ink transition-colors duration-base active:border-brand-600 active:text-brand-600 disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowRight size={13} aria-hidden="true" className="rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
