import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { Statistic } from '../../content/Statistic';
import { AutoplayVideo } from '../../common/AutoplayVideo';
import { foundingYear } from '../../../data/companyStats';
import { regionalCountries } from '../../../data/locations';
import { useTransparentHeader } from '../../../app/header-transparency';

/** Silent portrait film of MENASCO's people on site (768×1332): Instagram reel, app overlay cropped out, upscaled 2x, audio removed. */
const FILM = { src: '/about/about-hero-film.mp4', poster: '/about/about-hero-film-poster.jpg' };

/**
 * About page opener: title, introduction and headline stats beside a silent
 * portrait film, on a plain charcoal section (no banner image). The Section's
 * dark background switches the eyebrow, heading, copy and stats to their dark theme.
 */
export function AboutHero() {
  useTransparentHeader(true);
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation('about');

  // `!` like DataCenterPage's stats (StatText sets its own colour); brand-500 reads on the dark ground.
  const statValue = '!text-brand-500';
  const heroStats = [
    { value: String(foundingYear), label: t('hero.stats.established'), valueClassName: statValue },
    { value: `${new Date().getFullYear() - foundingYear}+`, label: t('hero.stats.yearsOfExcellence'), animate: true, valueClassName: statValue },
    { value: String(regionalCountries.length), label: t('hero.stats.regionalPresence'), valueClassName: statValue },
  ];

  const rise = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
  };
  const step = (delay: number) => ({ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : delay, ease: [0.22, 0.61, 0.36, 1] as const });

  // Charcoal, the site's primary dark section colour, so the header separates from Who We Are's warm white below.
  // Extra top padding: the transparent header sits over this section.
  return (
    <Section spacing="lg" background="charcoal" className="scroll-mt-24 pt-36 md:pt-40">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-7 self-center">
          <motion.div initial={rise.initial} animate={rise.animate} transition={step(0)}>
            <Eyebrow>{t('hero.eyebrow', { year: foundingYear })}</Eyebrow>
          </motion.div>
          <motion.div initial={rise.initial} animate={rise.animate} transition={step(0.08)}>
            <Heading level="display" as="h2" className="mt-4">
              {t('hero.title')}
            </Heading>
          </motion.div>
          <motion.div initial={rise.initial} animate={rise.animate} transition={step(0.16)}>
            <Text variant="body-lg" muted className="mt-6 max-w-xl">
              {t('hero.description')}
            </Text>
          </motion.div>
          <motion.div initial={rise.initial} animate={rise.animate} transition={step(0.26)} className="mt-12 border-t border-white/15 pt-8">
            <Statistic layout="grid" columns={3} items={heroStats} className="gap-x-10" />
          </motion.div>
        </div>
        <motion.div initial={rise.initial} animate={rise.animate} transition={step(0.2)} className="col-span-4 col-start-9">
          <AutoplayVideo src={FILM.src} poster={FILM.poster} alt={t('hero.filmAlt')} hasAudio={false} className="aspect-[768/1332] w-full rounded-md" />
        </motion.div>
      </div>
    </Section>
  );
}
