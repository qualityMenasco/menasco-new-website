import { useTranslation } from 'react-i18next';
import { AboutHero } from '../components/sections/about/AboutHero';
import { WhoWeAre } from '../components/sections/about/WhoWeAre';
import { AboutBrandStatement } from '../components/sections/about/AboutBrandStatement';
import { OurApproach } from '../components/sections/about/OurApproach';
import { VisionMissionValues } from '../components/sections/about/VisionMissionValues';
import { QualityStandards } from '../components/sections/about/QualityStandards';
import { OurExperience } from '../components/sections/about/OurExperience';
import { OurPeople } from '../components/sections/about/OurPeople';
import { AboutFinalCTA } from '../components/sections/about/AboutFinalCTA';
import { ClientsSection } from '../components/sections/ClientsSection';
import { CredentialsSection } from '../components/sections/CredentialsSection';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

export default function AboutPage() {
  const { t } = useTranslation('about');

  return (
    <>
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        path="/about"
        pageType="AboutPage"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'About', path: '/about' }]}
      />

      <AboutHero />

      <ScrollReveal>
        <WhoWeAre />
      </ScrollReveal>

      <ScrollReveal>
        <AboutBrandStatement />
      </ScrollReveal>

      <ScrollReveal>
        <OurApproach />
      </ScrollReveal>

      <ScrollReveal>
        <VisionMissionValues />
      </ScrollReveal>

      <ScrollReveal>
        <QualityStandards />
      </ScrollReveal>

      <ScrollReveal>
        <OurExperience />
      </ScrollReveal>

      <ClientsSection />

      <ScrollReveal>
        <OurPeople />
      </ScrollReveal>

      <CredentialsSection />

      <ScrollReveal>
        <AboutFinalCTA />
      </ScrollReveal>
    </>
  );
}
