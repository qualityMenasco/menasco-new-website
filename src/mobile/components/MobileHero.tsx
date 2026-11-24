import { useTranslation } from 'react-i18next';
import { HeroH1 } from '../../components/typography/HeroH1';
import { MobileVideo } from './MobileVideo';
import { foundingYear } from '../../data/companyStats';

/**
 * Compact mobile hero — short heading, one supporting line, primary CTA
 * visible without scrolling. Deliberately shorter than desktop's ~78vh hero
 * so the first useful content (company intro/stats) appears sooner.
 */
export function MobileHero() {
  const { t } = useTranslation(['home', 'common']);

  return (
    <section className="relative flex min-h-[62svh] w-full items-end overflow-hidden bg-ink">
      <div className="absolute inset-0">
        {/* 720p (6.6 MB) for tablets, 480p (2.9 MB) for phones; poster is a frame from the film. */}
        <MobileVideo src="/menasco-landing-clean.mp4" smallSrc="/menasco-landing-clean-480.mp4" poster="/Menasco_Home_Hero_Ceiling_Services_Film_Poster.jpg" alt="" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/30" />

      <div className="relative z-10 flex flex-col gap-4 px-4 pb-10 pt-24">
        <HeroH1
          eyebrow={<span className="block text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('home:hero.eyebrow', { year: foundingYear })}</span>}
          title={<span className="block font-display text-h1 font-semibold leading-tight text-warmwhite">{t('home:hero.title')}</span>}
        />
      </div>
    </section>
  );
}
