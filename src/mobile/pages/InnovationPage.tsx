import { Brain, ClipboardCheck, Database, Network, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { MobileTechnologyCard } from '../components/MobileTechnologyCard';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';

/**
 * Same order established on desktop: ATLAS → LYNXqc → AI → Enterprise Data
 * Lake → MENASCO Connect, with "Where We're Investing" excluded.
 */
export default function InnovationPage() {
  const { t } = useTranslation('about');
  return (
    <>
      <NavSectionH1 section="about" />
      <SEO
        title={t('innovation.seo.title')}
        description={t('innovation.seo.description')}
        path="/innovation-technology"
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Innovation & Technology', path: '/innovation-technology' },
        ]}
      />

      <section className="px-4 py-8">
        <SectionHeader
          eyebrow={t('innovationMobile.hero.eyebrow')}
          heading={t('innovationMobile.hero.heading')}
          headingAs="h2"
          description={t('innovationMobile.hero.description')}
        />

        <div className="mt-5 flex flex-col gap-4">
          <MobileTechnologyCard
            icon={Scale}
            eyebrow={t('innovationMobile.cards.atlas.eyebrow')}
            title={t('innovationMobile.cards.atlas.title')}
            summary={t('innovationMobile.cards.atlas.summary')}
            featured
          />
          <MobileTechnologyCard
            icon={ClipboardCheck}
            eyebrow={t('innovationMobile.cards.lynxqc.eyebrow')}
            title={t('innovationMobile.cards.lynxqc.title')}
            summary={t('innovationMobile.cards.lynxqc.summary')}
            link={{ label: t('innovationMobile.cards.lynxqc.privacyPolicyLink'), href: '/lynxqc/privacy-policy' }}
          />
          <MobileTechnologyCard
            icon={Brain}
            eyebrow={t('innovationMobile.cards.ai.eyebrow')}
            title={t('innovationMobile.cards.ai.title')}
            summary={t('innovationMobile.cards.ai.summary')}
          />
          <MobileTechnologyCard
            icon={Database}
            eyebrow={t('innovationMobile.cards.dataLake.eyebrow')}
            title={t('innovationMobile.cards.dataLake.title')}
            summary={t('innovationMobile.cards.dataLake.summary')}
          />
          <MobileTechnologyCard
            icon={Network}
            eyebrow={t('innovationMobile.cards.connect.eyebrow')}
            title={t('innovationMobile.cards.connect.title')}
            summary={t('innovationMobile.cards.connect.summary')}
          />
        </div>
      </section>
    </>
  );
}
