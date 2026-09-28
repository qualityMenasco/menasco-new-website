import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Container } from '../components/layout/Container';
import { Heading, Text } from '../components/typography/Typography';
import { ButtonLink } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useTransparentHeader, useHeaderThemeOverride } from '../app/header-transparency';
import { ProfessionalList } from '../components/content/ProfessionalList';
import { services } from '../data/services';
import { COMPANY_PROFILE_PATH } from '../seo/constants';
import { SEO } from '../seo/SEO';
import { serviceEntity } from '../seo/structuredData';
import { SITE_URL } from '../seo/constants';

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

export default function ServiceDetailPage() {
  const { t } = useTranslation(['services']);
  const { slug } = useParams<{ slug: string }>();
  const service = services.find((entry) => entry.slug === slug);

  if (!service) return <Navigate to="/404" replace />;

  const key = serviceKeys[service.slug] ?? service.slug;
  const name = t(`services:items.${key}.name`, service.name);
  const seoTitle = t(`services:items.${key}.seoTitle`, name);
  const introduction = t(`services:items.${key}.introduction`, service.introduction);
  // Some sources may contain literal `\n\n` sequences; convert them to
  // real newlines so `whitespace-pre-line` renders paragraph breaks.
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

      {/* Inline hero (service-specific) so we can control whitespace handling without editing ProjectHeroBanner */}
      <ServiceHero image={service.image} title={name} description={safeIntroduction} ctaLabel={t('services:detail.downloadCompanyProfile')} ctaHref={COMPANY_PROFILE_PATH} />

      {sections.length > 0 ? (
        <ServiceSectionCarousel sections={sections} regionLabel={t('services:detail.sectionsRegionLabel', { name })} />
      ) : (
        <Section spacing="md" background="warmwhite">
          <div className="mx-auto max-w-7xl">
            <div className="mt-10 rounded-2xl bg-transparent p-4 shadow-sm sm:p-6">
              <ProfessionalList
                variant="bullet"
                columns={2}
                gap="md"
                className="text-left"
                items={capabilities.map((capability) => ({ title: capability }))}
              />
            </div>
          </div>
        </Section>
      )}
    </>
  );
}

/**
 * Full-bleed, one-card-at-a-time horizontal carousel for the service detail
 * sections — each card is exactly the viewport's own width, so nothing of
 * the previous/next card is ever visible; native scroll-snap (not a
 * transform-based slider) provides trackpad/touch/drag support and the
 * smooth slide transition for free. Every card shares one min-height (the
 * tallest section's natural content height, measured on mount/resize) so
 * the page never changes height as the user moves between cards. Active-
 * card tracking uses IntersectionObserver (ratio-based, direction-agnostic)
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
    <Section spacing="md" background="warmwhite">
      <div className="relative mx-auto w-full md:w-[82%] lg:w-[78%]">
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
                className="flex flex-col gap-4 rounded-md border border-gray-200 bg-warmwhite p-8 pb-20 md:p-10 md:pb-24 lg:p-12 lg:pb-24"
                style={cardHeight ? { minHeight: cardHeight } : undefined}
              >
                <span className="block h-0.5 w-10 bg-brand-600" aria-hidden="true" />
                <Heading level="h3" as="h3">
                  {section.heading}
                </Heading>
                <Text variant="body">{section.paragraph}</Text>
                {section.list && section.list.length > 0 && (
                  <ProfessionalList variant="check" gap="sm" className="mt-1" items={section.list.map((title) => ({ title }))} />
                )}
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
    </Section>
  );
}

function ServiceHero({ image, title, description, ctaLabel, ctaHref }: { image: string; title: string; description?: string; ctaLabel: string; ctaHref: string }) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const handleScroll = () => setPastHero(el.getBoundingClientRect().top < 80);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useTransparentHeader(true);
  useHeaderThemeOverride(pastHero ? null : 'dark');

  return (
    <>
      <section className="relative -mt-20 flex min-h-[52vh] w-full flex-col overflow-hidden bg-ink lg:min-h-[56vh]">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/10" />

        <Container className="relative z-10 flex flex-1 items-end pb-10 pt-20 md:pb-14">
          <div className="max-w-3xl">
            <Heading level="h1" as="h2" theme="dark">
              {title}
            </Heading>
            {description && (
              <Text variant="body" theme="dark" className="mt-3 max-w-3xl !text-warmwhite whitespace-pre-line">
                {description}
              </Text>
            )}
            <div className="mt-5">
              <ButtonLink href={ctaHref} variant="outline" theme="dark" leadingIcon={Download}>
                {ctaLabel}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
    </>
  );
}
