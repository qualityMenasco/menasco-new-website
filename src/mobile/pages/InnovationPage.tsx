import { Brain, ClipboardCheck, Database, Network, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { PhotoRail } from '../components/PhotoRail';
import { MobileTechnologyCard } from '../components/MobileTechnologyCard';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';
import { innovationHeroFilm, innovationHeroPhotos } from '../../data/innovationPhotos';
import {} from '../../seo/structuredData';

/**
 * Same order established on desktop: ATLAS → LYNX → AI → Enterprise Data
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
          // Non-breaking space keeps the "&" with "Innovation" so it never wraps onto a line alone.
          heading={t('innovationMobile.hero.heading').replace(' & ', ' & ')}
          headingAs="h2"
          description={t('innovationMobile.hero.description')}
        />

        {/* The desktop header's two photos as a swipeable row (side by side on tablets).
            The film doesn't fit beside them here, so it collapses into a "Watch the
            video" button on the first photo that opens it full screen. */}
        <PhotoRail
          images={innovationHeroPhotos.map((photo, index) => (index === 0 ? { ...photo, video: innovationHeroFilm.src } : photo))}
          label={t('innovationMobile.hero.heading')}
          className="-mx-4"
          gutterClassName="scroll-px-4 px-4"
          itemClassName="aspect-[4/5] w-[78vw] max-w-[22rem] md:w-[calc(50%-6px)] md:max-w-none"
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
