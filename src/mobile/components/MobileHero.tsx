import { useTranslation } from 'react-i18next';
import { HeroH1 } from '../../components/typography/HeroH1';
import { MobileVideo } from './MobileVideo';
import { foundingYear } from '../../data/companyStats';
import { MobileStatsGrid } from './MobileStatsGrid';

/**
 * Compact mobile/tablet hero: label, headline and the company stats along its bottom edge (like
 * the desktop hero), over the film. Sized to its content plus a band of film above the text,
 * not a fixed share of the screen, which left 135-290px (phones) and ~500px (tablets) of empty
 * film (client request 2026-11-24; previous version: git tag pre-mobile-home-hero). The headline
 * is capped on tablets so it breaks into two balanced lines.
 */
export function MobileHero() {
  const { t } = useTranslation(['home', 'common']);

  return (
    <section className="relative flex w-full items-end overflow-hidden bg-ink">
      <div className="absolute inset-0">
        {/* 720p (6.6 MB) for tablets, 480p (2.9 MB) for phones; poster is a frame from the film. */}
        <MobileVideo src="/menasco-landing-clean.mp4" smallSrc="/menasco-landing-clean-480.mp4" poster="/Menasco_Home_Hero_Ceiling_Services_Film_Poster.jpg" alt="" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/30" />

      <div className="relative z-10 flex w-full flex-col gap-6 px-4 pb-6 pt-28 md:gap-8 md:pb-8 md:pt-40">
        <HeroH1
          eyebrow={<span className="block text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('home:hero.eyebrow', { year: foundingYear })}</span>}
          title={<span className="block font-display text-h1 font-semibold leading-tight text-warmwhite text-balance md:max-w-2xl">{t('home:hero.title')}</span>}
        />
        <MobileStatsGrid compact onDark />
      </div>
    </section>
  );
}
