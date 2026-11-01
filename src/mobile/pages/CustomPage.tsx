import { useTranslation } from 'react-i18next';
import { MobileCTA } from '../components/MobileCTA';
import { ServiceSectionCarousel } from '../components/ServiceSectionCarousel';
import type { ServiceCarouselSection } from '../../hooks/useServiceCarousel';
import { SEO } from '../../seo/SEO';
import { serviceEntity } from '../../seo/structuredData';
import { SITE_URL } from '../../seo/constants';

export default function CustomPage() {
  const { t } = useTranslation(['services']);
  const name = t('services:customPage.name');
  const sections = t('services:customPage.sections', { returnObjects: true, defaultValue: [] }) as ServiceCarouselSection[];

  return (
    <>
      <SEO
        title={t('services:customPage.seo.title')}
        description={t('services:customPage.seo.description')}
        path="/services/manufacturing-prefabrication/custom"
        mainEntity={serviceEntity({
          name: t('services:customPage.seo.title'),
          description: t('services:customPage.seo.description'),
          url: `${SITE_URL}/services/manufacturing-prefabrication/custom`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'Manufacturing & Prefabrication', path: '/services/manufacturing-prefabrication' },
          { label: name, path: '/services/manufacturing-prefabrication/custom' },
        ]}
      />

      <section className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">
            {t('services:detail.eyebrowLabel')}
          </span>
          <h2 className="font-display text-h2 font-semibold tracking-tight text-ink">{name}</h2>
          <p className="whitespace-pre-line text-small text-gray-600">{t('services:customPage.hero.description')}</p>
        </div>
        <div className="mt-2.5 aspect-[2.2/1] w-full overflow-hidden rounded-md bg-gray-100">
          <img src="/custom-mep-fabrication-inspection.png" alt={`MENASCO ${name}`} className="h-full w-full object-cover" />
        </div>
      </section>

      <ServiceSectionCarousel sections={sections} regionLabel={t('services:detail.sectionsRegionLabel', { name })} />

      <MobileCTA
        heading={t('services:detail.discussRequirements', { name })}
        primary={{ label: t('services:detail.requestQuote'), href: '/contact?type=project' }}
        secondary={{ label: t('services:detail.allServices'), href: '/services' }}
      />
    </>
  );
}
