import { Navigate, useParams } from 'react-router-dom';
// Use standard bullets on mobile service lists
import { useTranslation } from 'react-i18next';
import { MobileCTA } from '../components/MobileCTA';
import { ServiceSectionCarousel } from '../components/ServiceSectionCarousel';
import type { ServiceCarouselSection } from '../../hooks/useServiceCarousel';
import { SEO } from '../../seo/SEO';
import { serviceEntity } from '../../seo/structuredData';
import { SITE_URL } from '../../seo/constants';
import { services } from '../../data/services';

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

      <section className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">
            {t('services:detail.eyebrowLabel')}
          </span>
          <h2 className="font-display text-h2 font-semibold tracking-tight text-ink">{name}</h2>
          {safeIntroduction && <p className="whitespace-pre-line text-small text-gray-600">{safeIntroduction}</p>}
        </div>

        <div className="mt-2.5 aspect-[2.2/1] w-full overflow-hidden rounded-md bg-gray-100">
          <img src={service.image} alt={`MENASCO ${name} services`} className="h-full w-full object-cover" />
        </div>

        {sections.length === 0 && (
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 list-disc ps-5">
            {capabilities.map((capability) => (
              <li key={capability} className="text-body text-ink">
                {capability}
              </li>
            ))}
          </ul>
        )}
      </section>

      {sections.length > 0 && (
        <ServiceSectionCarousel
          sections={sections}
          regionLabel={t('services:detail.sectionsRegionLabel', { name })}
          image={carouselImage}
        />
      )}

      <MobileCTA
        heading={t('services:detail.discussRequirements', { name })}
        primary={{ label: t('services:detail.requestQuote'), href: '/contact?type=project' }}
        secondary={{ label: t('services:detail.allServices'), href: '/services' }}
      />
    </>
  );
}

