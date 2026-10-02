import { useTranslation } from 'react-i18next';
import { HomeHeroEditorial } from '../components/sections/home/hero/HomeHeroEditorial';
import { DataCenterFeature } from '../components/sections/home/DataCenterFeature';
import { CompanyIntroduction } from '../components/sections/home/CompanyIntroduction';
import { CompanyStatistics } from '../components/sections/home/CompanyStatistics';
import { ServicesShowcase } from '../components/sections/home/ServicesShowcase';
import { FeaturedProjectsEditorial } from '../components/sections/home/projects/FeaturedProjectsEditorial';
import { SectorsShowcase } from '../components/sections/home/SectorsShowcase';
import { DigitalEngineering } from '../components/sections/home/DigitalEngineering';
import { PrefabricationFeature } from '../components/sections/home/PrefabricationFeature';
import { QualityAndSafety } from '../components/sections/home/QualityAndSafety';
import { RegionalPresence } from '../components/sections/home/RegionalPresence';
import { CareersPreview } from '../components/sections/home/CareersPreview';
import { CtaBand } from '../components/sections/CtaBand';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { SEO } from '../seo/SEO';
import { organizationJsonLd, websiteJsonLd } from '../seo/structuredData';

/**
 * Each section below is a single, independent component — replace any one
 * of them by changing its import and its line here. Sections with an
 * anchor `id` are targets for the header nav's scroll-to-section links
 * (see src/data/navigation.ts + src/lib/SmartLink.tsx). Scrolling to those
 * anchors — including landing on "/#section" from another page or a fresh
 * page load — is handled centrally in RootLayout, not here. See
 * src/components/sections/home/ for the full set, and docs/COMPONENTS.md
 * for what each accepts and how to add an alternate variant.
 */
export default function HomePage() {
  const { t } = useTranslation(['home', 'common']);

  return (
    <>
      <SEO title={t('home:seo.title')} description={t('home:seo.description')} path="/" structuredData={[organizationJsonLd(), websiteJsonLd()]} />
      <HomeHeroEditorial />
      <ScrollReveal id="stats">
        <CompanyStatistics />
      </ScrollReveal>
      <ScrollReveal id="data-center">
        <DataCenterFeature />
      </ScrollReveal>
      <ScrollReveal id="about">
        <CompanyIntroduction />
      </ScrollReveal>
      <ScrollReveal id="services">
        <ServicesShowcase />
      </ScrollReveal>
      <ScrollReveal id="projects">
        <FeaturedProjectsEditorial />
      </ScrollReveal>
      <ScrollReveal id="sectors">
        <SectorsShowcase />
      </ScrollReveal>
      <ScrollReveal id="bim">
        <DigitalEngineering />
      </ScrollReveal>
      <ScrollReveal id="manufacturing">
        <PrefabricationFeature />
      </ScrollReveal>
      <ScrollReveal id="quality">
        <QualityAndSafety />
      </ScrollReveal>
      <ScrollReveal id="regional-presence">
        <RegionalPresence />
      </ScrollReveal>
      <ScrollReveal id="careers">
        <CareersPreview />
      </ScrollReveal>
      <CtaBand
        headingLevel="h1"
        heading={t('home:finalCta.heading')}
        description={t('home:finalCta.description')}
        primary={{ label: t('common:buttons.requestQuote'), href: '/contact?type=project' }}
        secondary={{ label: t('common:buttons.viewAllServices'), href: '/services' }}
      />
    </>
  );
}
