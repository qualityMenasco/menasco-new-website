import { useTranslation } from 'react-i18next';
import { MobileCTA } from '../components/MobileCTA';
import { ServiceSectionCarousel } from '../components/ServiceSectionCarousel';
import type { ServiceCarouselSection } from '../../hooks/useServiceCarousel';
import { SEO } from '../../seo/SEO';
import { serviceEntity } from '../../seo/structuredData';
import { SITE_URL } from '../../seo/constants';

export default function ModularPage() {
  const { t } = useTranslation(['services']);
  const name = t('services:modularPage.name');
  const sections = t('services:modularPage.sections', { returnObjects: true, defaultValue: [] }) as ServiceCarouselSection[];

  return (
    <>
      <SEO
        title={t('services:modularPage.seo.title')}
        description={t('services:modularPage.seo.description')}
        path="/services/manufacturing-prefabrication/modular"
        mainEntity={serviceEntity({
          name: t('services:modularPage.seo.title'),
          description: t('services:modularPage.seo.description'),
          url: `${SITE_URL}/services/manufacturing-prefabrication/modular`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'Manufacturing & Prefabrication', path: '/services/manufacturing-prefabrication' },
          { label: name, path: '/services/manufacturing-prefabrication/modular' },
        ]}
      />

      <section className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">
            {t('services:detail.eyebrowLabel')}
          </span>
          <h2 className="font-display text-h2 font-semibold tracking-tight text-ink">{name}</h2>
          <p className="whitespace-pre-line text-small text-gray-600">{t('services:modularPage.hero.description')}</p>
        </div>
        <div className="mt-2.5 aspect-[2.2/1] w-full overflow-hidden rounded-md bg-gray-100">
          <img src="/data-centre-prefabrication-mep.webp" alt={`MENASCO ${name}`} className="h-full w-full object-cover" />
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
