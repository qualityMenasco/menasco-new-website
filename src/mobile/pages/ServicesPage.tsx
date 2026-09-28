import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { MobileServiceCard } from '../components/MobileServiceCard';
import { MobileCTA } from '../components/MobileCTA';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';
import { services } from '../../data/services';

const serviceKeys: Record<string, string> = {
  mechanical: 'mechanical',
  electrical: 'electrical',
  plumbing: 'plumbing',
  'fire-protection': 'fireProtection',
  'bim-digital-engineering': 'bimDigitalEngineering',
  'manufacturing-prefabrication': 'manufacturingPrefabrication',
};

export default function ServicesPage() {
  const { t } = useTranslation(['services', 'common']);

  return (
    <>
      <SEO
        title={t('services:seo.title')}
        description={t('services:seo.description')}
        path="/services"
        pageType="CollectionPage"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Services', path: '/services' }]}
      />

      <section className="px-4 py-8">
        <SectionHeader
          eyebrow={t('services:listing.eyebrow')}
          heading={t('services:listing.mobileHeading')}
          headingAs="h2"
          description={t('services:listing.description')}
        />
        <div className="mt-5 grid grid-cols-1 gap-4 xs:grid-cols-2">
          {services.map((service) => {
            const key = serviceKeys[service.slug] ?? service.slug;
            return (
              <MobileServiceCard
                key={service.id}
                image={service.image}
                title={t(`services:items.${key}.name`)}
                description={t(`services:items.${key}.shortDescription`)}
                href={`/services/${service.slug}`}
              />
            );
          })}
        </div>
      </section>

      <MobileCTA
        heading={t('services:listing.mobileCtaHeading')}
        description={t('services:listing.mobileCtaDescription')}
        primary={{ label: t('common:buttons.requestQuote'), href: '/contact?type=project' }}
      />
    </>
  );
}
