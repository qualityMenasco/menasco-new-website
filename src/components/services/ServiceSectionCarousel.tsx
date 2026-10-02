import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../layout/Section';
import { Heading, Text } from '../typography/Typography';
import { ProfessionalList } from '../content/ProfessionalList';
import { useServiceCarousel, type ServiceCarouselSection, type ServiceCarouselImage } from '../../hooks/useServiceCarousel';

interface ServiceSectionCarouselProps {
  sections: ServiceCarouselSection[];
  regionLabel: string;
  /**
   * A verified, on-topic photograph for this discipline. Renders once as a
   * persistent panel beside the text cards — not repeated per card, and not
   * shown at all when omitted (some disciplines currently have no honestly-
   * matching image; they stay text-only rather than get a misleading photo).
   */
  image?: ServiceCarouselImage;
}

/**
 * Full-bleed, one-card-at-a-time horizontal carousel for the service detail
 * sections — each card is exactly the track's own width, so nothing of the
 * previous/next card is ever visible. See useServiceCarousel for the shared
 * interaction logic (scroll-snap, active-card tracking, height sync).
 */
export function ServiceSectionCarousel({ sections, regionLabel, image }: ServiceSectionCarouselProps) {
  const { t } = useTranslation('services');
  const { trackRef, cardRefs, activeIndex, cardHeight, goTo } = useServiceCarousel(sections.length);
  const total = sections.length;

  return (
    <Section spacing="md" background="warmwhite">
      <div className="mx-auto w-full md:w-[82%] lg:w-[78%]">
        <div className={image ? 'overflow-hidden rounded-md border border-gray-200 bg-warmwhite lg:grid lg:grid-cols-[1fr_1.35fr]' : ''}>
          {image && (
            <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:self-stretch">
              <img src={image.src} alt={image.alt} className="h-full w-full object-cover lg:absolute lg:inset-0" />
            </div>
          )}

          <div className="relative min-w-0">
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
                    className={
                      image
                        ? 'flex h-full flex-col gap-4 p-8 pb-20 md:p-10 md:pb-24 lg:p-12 lg:pb-24'
                        : 'flex flex-col gap-4 rounded-md border border-gray-200 bg-warmwhite p-8 pb-20 md:p-10 md:pb-24 lg:p-12 lg:pb-24'
                    }
                    style={cardHeight ? { minHeight: cardHeight } : undefined}
                  >
                    <span className="block h-0.5 w-10 bg-brand-600" aria-hidden="true" />
                    <Heading level="h3" as="h3">
                      {section.heading}
                    </Heading>
                    <div className={image ? undefined : 'flex flex-col gap-4 lg:max-w-prose'}>
                      <Text variant="body">{section.paragraph}</Text>
                      {section.list && section.list.length > 0 && (
                        <ProfessionalList variant="divided" className="mt-1" items={section.list.map((title) => ({ title }))} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {total > 1 && (
              <div className="absolute bottom-8 end-8 flex items-center gap-3 md:bottom-10 md:end-10 lg:bottom-12 lg:end-12">
                <span dir="ltr" className="text-caption font-semibold tabular-nums text-gray-500">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex - 1)}
                    disabled={activeIndex === 0}
                    aria-label={t('services:detail.previousSection')}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-ink transition-colors duration-base hover:border-brand-600 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowLeft size={15} aria-hidden="true" className="rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex + 1)}
                    disabled={activeIndex === total - 1}
                    aria-label={t('services:detail.nextSection')}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-ink transition-colors duration-base hover:border-brand-600 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
