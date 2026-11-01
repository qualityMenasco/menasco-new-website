import { useTranslation } from 'react-i18next';
import { CtaBand } from '../components/sections/CtaBand';
import { ServiceSectionCarousel } from '../components/services/ServiceSectionCarousel';
import { ServiceHero } from '../components/services/ServiceHero';
import type { ServiceCarouselSection } from '../hooks/useServiceCarousel';
import { COMPANY_PROFILE_PATH, SITE_URL } from '../seo/constants';
import { SEO } from '../seo/SEO';
import { serviceEntity } from '../seo/structuredData';

/**
 * A child of Manufacturing & Prefabrication — reuses the same hero +
 * section-carousel "cards" treatment as the Mechanical/Electrical/Plumbing/
 * Fire Protection discipline pages (ServiceHero + ServiceSectionCarousel),
 * rather than the fuller Manufacturing/EPC/MEP/Civil bespoke layout, since
 * this is a sub-page, not a top-level service.
 */
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

      <ServiceHero
        image="/custom-mep-fabrication-inspection.png"
        title={name}
        description={t('services:customPage.hero.description')}
        ctaLabel={t('services:detail.downloadCompanyProfile')}
        ctaHref={COMPANY_PROFILE_PATH}
      />

      <ServiceSectionCarousel sections={sections} regionLabel={t('services:detail.sectionsRegionLabel', { name })} />

      <CtaBand
        headingLevel="h1"
        heading={t('services:detail.discussRequirements', { name })}
        primary={{ label: t('services:detail.requestQuote'), href: '/contact?type=project' }}
        secondary={{ label: t('services:detail.allServices'), href: '/services' }}
      />
    </>
  );
}
