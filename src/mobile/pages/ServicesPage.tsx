import { useState } from 'react';
import { servicesFaqJsonLd } from '../../seo/structuredData';
import { HeroH1 } from '../../components/typography/HeroH1';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Eyebrow, Heading } from '../../components/typography/Typography';
import { ServicesBento } from '../../components/services/ServicesBento';
import { ServicesFaq } from '../../components/services/ServicesFaq';
import { ServicesDelivery } from '../../components/services/ServicesDelivery';
import { PhotoTreatment } from '../../components/media/TreatedPhoto';
import { SEO } from '../../seo/SEO';
import { servicesListingHeroImage } from '../../data/services';
import { cn } from '../../lib/utils';

/**
 * Services index (phones + tablets). A light hero (blue title, dark body,
 * clamped behind "Read more"; tablets add the treated photo), then the shared
 * ServicesBento: a swipeable row on phones, a paired grid on tablets.
 */
export default function ServicesPage() {
  const { t } = useTranslation(['services', 'common', 'nav']);
  const [introOpen, setIntroOpen] = useState(false);

  return (
    <>
      <SEO
        title={t('services:seo.title')}
        description={t('services:seo.description')}
        path="/services"
        pageType="CollectionPage"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Services', path: '/services' }]}
        structuredData={servicesFaqJsonLd(t('services:listing.faq.items', { returnObjects: true }))}
      />

      <section className="bg-warmwhite px-4 pt-8 md:px-6 md:pt-10">
        <div className="md:grid md:grid-cols-2 md:items-center md:gap-8">
          <div>
            <HeroH1
              eyebrow={
                <Eyebrow as="span" className="block">
                  {t('services:listing.eyebrow')}
                </Eyebrow>
              }
              title={
                <Heading level="h2" as="span" className="mt-2 block text-balance !text-brand-600">
                  {t('services:listing.mobileHeading')}
                </Heading>
              }
            />
            {/* Clamped to three lines behind "Read more"; the full text stays in the DOM. */}
            <p id="services-intro" className={cn('mt-3 text-body text-gray-700', !introOpen && 'line-clamp-3')}>
              {t('services:listing.description')}
            </p>
            <button
              type="button"
              aria-expanded={introOpen}
              aria-controls="services-intro"
              onClick={() => setIntroOpen((open) => !open)}
              className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-brand-600"
            >
              {introOpen ? t('common:buttons.showLess') : t('common:buttons.readMore')}
              <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform duration-base', introOpen && 'rotate-180')} />
            </button>
          </div>
          <div className="relative mt-4 hidden aspect-[4/3] overflow-hidden rounded-md bg-gray-100 md:mt-0 md:block">
            <img
              src={servicesListingHeroImage}
              alt={t('services:listing.heroImageAlt')}
              className="h-full w-full object-cover object-[70%_50%]"
            />
            <PhotoTreatment />
          </div>
        </div>
      </section>

      <section className="bg-warmwhite px-4 py-8 md:px-6 md:py-10">
        <ServicesBento />
      </section>

      <section id="how-we-deliver" aria-labelledby="services-delivery-heading" className="bg-[#ebe4df] px-4 py-8 md:px-6 md:py-10">
        <ServicesDelivery layout="stepper" />
      </section>

      <section id="faq" aria-labelledby="services-faq-heading" className="bg-stone px-4 py-10 md:px-6 md:py-12">
        <ServicesFaq />
      </section>
    </>
  );
}
