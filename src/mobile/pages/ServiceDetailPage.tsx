import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
// Use standard bullets on mobile service lists
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MobileCTA } from '../components/MobileCTA';
import { SEO } from '../../seo/SEO';
import { serviceEntity } from '../../seo/structuredData';
import { SITE_URL } from '../../seo/constants';
import { services } from '../../data/services';

interface ServiceSection {
  heading: string;
  paragraph: string;
  list?: string[];
}

const serviceKeys: Record<string, string> = {
  mechanical: 'mechanical',
  electrical: 'electrical',
  plumbing: 'plumbing',
  'fire-protection': 'fireProtection',
  'bim-digital-engineering': 'bimDigitalEngineering',
  'manufacturing-prefabrication': 'manufacturingPrefabrication',
};

/** Full approved content for one discipline — nothing here is shortened, unlike the homepage/services-grid cards. */
export default function ServiceDetailPage() {
  const { t } = useTranslation(['services']);
  const { slug } = useParams<{ slug: string }>();
  const service = services.find((entry) => entry.slug === slug);

  if (!service) return <Navigate to="/404" replace />;

  const key = serviceKeys[service.slug] ?? service.slug;
  const name = t(`services:items.${key}.name`, service.name);
  const seoTitle = t(`services:items.${key}.seoTitle`, name);
  const introduction = t(`services:items.${key}.introduction`, service.introduction);
  const safeIntroduction = introduction?.replace(/\\n\\n/g, '\n\n') ?? introduction;
  const capabilities = t(`services:items.${key}.capabilities`, { returnObjects: true, defaultValue: service.capabilities }) as string[];
  const sections = t(`services:items.${key}.sections`, { returnObjects: true, defaultValue: [] }) as ServiceSection[];

  return (
    <>
      <SEO
        title={seoTitle}
        description={t(`services:items.${key}.seoDescription`, t(`services:items.${key}.shortDescription`, service.shortDescription))}
        path={`/services/${service.slug}`}
        mainEntity={serviceEntity({
          name: seoTitle,
          description: t(`services:items.${key}.seoDescription`, t(`services:items.${key}.shortDescription`, service.shortDescription)),
          url: `${SITE_URL}/services/${service.slug}`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: name, path: `/services/${service.slug}` },
        ]}
      />

      <section className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">
            {t('services:detail.eyebrowLabel')}
          </span>
          <h2 className="font-display text-h3 font-semibold tracking-tight text-ink">{name}</h2>
          {safeIntroduction && <p className="whitespace-pre-line text-small text-gray-600">{safeIntroduction}</p>}
        </div>

        <div className="mt-2.5 aspect-[2.2/1] w-full overflow-hidden rounded-md bg-gray-100">
          <img src={service.image} alt={`MENASCO ${name} services`} className="h-full w-full object-cover" />
        </div>

        {sections.length === 0 && (
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 list-disc pl-5">
            {capabilities.map((capability) => (
              <li key={capability} className="text-body text-ink">
                {capability}
              </li>
            ))}
          </ul>
        )}
      </section>

      {sections.length > 0 && (
        <ServiceSectionCarousel sections={sections} regionLabel={t('services:detail.sectionsRegionLabel', { name })} />
      )}

      <MobileCTA
        heading={t('services:detail.discussRequirements', { name })}
        primary={{ label: t('services:detail.requestQuote'), href: '/contact?type=project' }}
        secondary={{ label: t('services:detail.allServices'), href: '/services' }}
      />
    </>
  );
}

/**
 * Full-bleed, one-card-at-a-time horizontal carousel for the service detail
 * sections — each card is exactly the viewport's own width, so nothing of
 * the previous/next card is ever visible; native scroll-snap (not a
 * transform-based slider) provides touch-swipe support and the smooth
 * slide transition for free. Every card shares one min-height (the tallest
 * section's natural content height, measured on mount/resize) so the page
 * never changes height as the user swipes between cards. Active-card
 * tracking uses IntersectionObserver (ratio-based, direction-agnostic)
 * rather than scroll-position math, so it needs no RTL-specific branching.
 */
function ServiceSectionCarousel({ sections, regionLabel }: { sections: ServiceSection[]; regionLabel: string }) {
  const { t } = useTranslation('services');
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const recalc = () => {
      const tallest = cardRefs.current.reduce((max, card) => Math.max(max, card?.scrollHeight ?? 0), 0);
      setCardHeight(tallest || undefined);
    };
    recalc();
    let frame: number | null = null;
    const observer = new ResizeObserver(() => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(recalc);
    });
    cardRefs.current.forEach((card) => card && observer.observe(card));
    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [sections]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ratios = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number((entry.target as HTMLElement).dataset.cardIndex);
          ratios.set(index, entry.intersectionRatio);
        });
        let bestIndex = 0;
        let bestRatio = -1;
        ratios.forEach((ratio, index) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = index;
          }
        });
        setActiveIndex(bestIndex);
      },
      { root: track, threshold: [0, 0.5, 1] },
    );
    cardRefs.current.forEach((card) => card && observer.observe(card));
    return () => observer.disconnect();
  }, [sections]);

  const total = sections.length;
  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(total - 1, index));
    cardRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };

  return (
    <section className="px-4 py-6">
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
