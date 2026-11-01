import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CtaBand } from '../components/sections/CtaBand';
import { Section } from '../components/layout/Section';
import { ProfessionalList } from '../components/content/ProfessionalList';
import { ServiceSectionCarousel } from '../components/services/ServiceSectionCarousel';
import { ServiceHero } from '../components/services/ServiceHero';
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
