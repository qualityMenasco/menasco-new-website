import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '../components/layout/Container';
import { Heading, Text } from '../components/typography/Typography';
import { ButtonLink } from '../components/ui/Button';
import { useTransparentHeader, useHeaderThemeOverride } from '../app/header-transparency';
import { CtaBand } from '../components/sections/CtaBand';
import { Section } from '../components/layout/Section';
import { ProfessionalList } from '../components/content/ProfessionalList';
import { ServiceSectionCarousel } from '../components/services/ServiceSectionCarousel';
import type { ServiceCarouselSection } from '../hooks/useServiceCarousel';
import { services } from '../data/services';
import { COMPANY_PROFILE_PATH } from '../seo/constants';
import { SEO } from '../seo/SEO';
import { serviceEntity } from '../seo/structuredData';
import { SITE_URL } from '../seo/constants';

const serviceKeys: Record<string, string> = {
  mechanical: 'mechanical',
  electrical: 'electrical',
  plumbing: 'plumbing',
  'fire-protection': 'fireProtection',
  'bim-digital-engineering': 'bimDigitalEngineering',
  'manufacturing-prefabrication': 'manufacturingPrefabrication',
};

// Only these disciplines currently have a verified, on-topic photograph that
// is ALSO distinct from that service's own page hero — reusing the hero photo
// again in the carousel panel would show the identical image twice in one
// scroll pass, so each entry here deliberately points at a different,
// already-verified asset. electrical.jpg and plumbing.jpg were inspected and
// found to depict unrelated equipment/a hotel bathroom respectively; dedicated
// web searches for licensed stock photography turned up genuine matches for
// both electrical and plumbing (see per-entry comments below).
const serviceCarouselImage: Record<string, { src: string; alt: string }> = {
  mechanical: {
    src: '/mechanical-plant-room.jpg',
    alt: 'Mechanical plant room with insulated chilled-water piping, pumps, and control panels.',
  },
  electrical: {
    // Stock photo (Pexels, free commercial-use license, no attribution
    // required) of a medium-voltage switchgear room — not a MENASCO project
    // photo. Genuinely depicts labeled transformer/cable feeder switchgear
    // panels, matching the Power Distribution & Switchgear content.
    src: '/electrical-switchgear-room.jpg',
    alt: 'Medium-voltage switchgear room with labeled transformer and cable feeder panels.',
  },
  plumbing: {
    // Stock photo (Unsplash, free commercial-use license, no attribution
    // required) of a duty/standby water pump set with pressure gauges and
    // isolation valves — not a MENASCO project photo. Genuinely depicts water
    // supply pumping equipment, matching the Water Supply & Distribution
    // content.
    src: '/plumbing-pump-set.jpg',
    alt: 'Duty/standby water pump set with pressure gauges and isolation valves.',
  },
  'fire-protection': {
    src: '/about-hero-fire-suppression.jpg',
    alt: 'Fire suppression riser assembly with control valves and actuator stations.',
  },
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
  const sections = t(`services:items.${key}.sections`, { returnObjects: true, defaultValue: [] }) as ServiceCarouselSection[];
  const carouselImage = serviceCarouselImage[service.slug];

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
        <ServiceSectionCarousel
          sections={sections}
          regionLabel={t('services:detail.sectionsRegionLabel', { name })}
          image={carouselImage}
        />
      ) : (
        <Section spacing="md" background="warmwhite">
          <div className="mt-10 rounded-md bg-transparent p-4 shadow-sm sm:p-6">
            <ProfessionalList
              variant="bullet"
              columns={2}
              gap="md"
              className="text-start"
              items={capabilities.map((capability) => ({ title: capability }))}
            />
          </div>
        </Section>
      )}

      <CtaBand
        headingLevel="h1"
        heading={t('services:detail.discussRequirements', { name })}
        primary={{ label: t('services:detail.requestQuote'), href: '/contact?type=project' }}
        secondary={{ label: t('services:detail.allServices'), href: '/services' }}
      />
    </>
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
