import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { ServicesBento } from '../components/services/ServicesBento';
import { ServicesFaq } from '../components/services/ServicesFaq';
import { ServicesDelivery } from '../components/services/ServicesDelivery';
import { PhotoTreatment } from '../components/media/TreatedPhoto';
import { servicesListingHeroImage } from '../data/services';
import { SEO } from '../seo/SEO';

/**
 * Services index (desktop). A light hero (blue title, dark body) beside a
 * treated photo, then the five umbrella destinations as a bento grid
 * (ServicesBento) on the same surface, then the FAQ.
 */
export default function ServicesPage() {
  const { t } = useTranslation(['services', 'nav', 'common']);

  return (
    <>
      <SEO
        title={t('services:seo.title')}
        description={t('services:seo.description')}
        path="/services"
        pageType="CollectionPage"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Services', path: '/services' }]}
      />
      <Section background="warmwhite" spacing="lg" className="md:pt-12">
        <div className="grid grid-cols-12 items-center gap-12">
          <div className="col-span-7">
            <Eyebrow>{t('services:listing.eyebrow')}</Eyebrow>
            <Heading level="h1" as="h2" className="mt-3 text-balance !text-brand-600">
              {t('services:listing.heading')}
            </Heading>
            <Text variant="body-lg" className="mt-5 leading-relaxed !text-gray-700">
              {t('services:listing.description')}
            </Text>
          </div>
          <div className="relative col-span-5 aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
            <img
              src={servicesListingHeroImage}
              alt={t('services:listing.heroImageAlt')}
              className="h-full w-full object-cover object-[70%_50%]"
            />
            <PhotoTreatment />
          </div>
        </div>
      </Section>

      <Section background="warmwhite" spacing="lg" joinTop>
        <ServicesBento />
      </Section>

      {/* Warm sand surface (wrapper: Section's own background classes would override a bg class). */}
      <div className="bg-[#ebe4df]">
        <Section background="transparent" spacing="sm" id="how-we-deliver" aria-labelledby="services-delivery-heading">
          <ServicesDelivery layout="row" />
        </Section>
      </div>

      <Section background="stone" spacing="lg" id="faq" aria-labelledby="services-faq-heading">
        <ServicesFaq />
      </Section>
    </>
  );
}
