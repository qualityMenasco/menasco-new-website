import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Container } from '../../layout/Container';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { Statistic } from '../../content/Statistic';
import { foundingYear } from '../../../data/companyStats';
import { regionalCountries } from '../../../data/locations';
import { useTransparentHeader } from '../../../app/header-transparency';

/** Full-bleed editorial hero for the About page, matching the homepage's visual language. */
export function AboutHero() {
  useTransparentHeader(true);
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation('about');

  const heroStats = [
    { value: String(foundingYear), label: t('hero.stats.established') },
    { value: `${new Date().getFullYear() - foundingYear}+`, label: t('hero.stats.yearsOfExcellence'), animate: true },
    {
      value: String(regionalCountries.length),
      label: t('hero.stats.regionalPresence'),
      description: t('hero.stats.regionalPresenceDescription'),
    },
  ];

  const rise = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative flex min-h-[70vh] scroll-mt-24 items-end overflow-hidden bg-ink md:min-h-[75vh]">
      <img
        src="/about-hero-fire-suppression.jpg"
        alt="Fire suppression piping and control valves installed by MENASCO"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-transparent to-transparent rtl:bg-gradient-to-l" />

      <Container className="relative z-10 pb-16 pt-28 md:pb-20 md:pt-32">
        <div className="max-w-3xl">
          <motion.div initial={rise.initial} animate={rise.animate} transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.22, 0.61, 0.36, 1] }}>
            <Eyebrow theme="dark">{t('hero.eyebrow', { year: foundingYear })}</Eyebrow>
          </motion.div>
          <motion.div
            initial={rise.initial}
            animate={rise.animate}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.08, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Heading level="display" as="h2" theme="dark" className="mt-4">
              {t('hero.title')}
            </Heading>
          </motion.div>
          <motion.div
            initial={rise.initial}
            animate={rise.animate}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.16, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Text variant="body-lg" theme="dark" className="mt-6 max-w-xl text-gray-200">
              {t('hero.description')}
            </Text>
          </motion.div>
          <motion.div
            initial={rise.initial}
            animate={rise.animate}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.26, ease: [0.22, 0.61, 0.36, 1] }}
            className="mt-12 border-t border-white/15 pt-8"
          >
            <Statistic
              layout="grid"
              columns={3}
              theme="dark"
              items={heroStats}
              className="lg:!grid-cols-[repeat(3,minmax(0,220px))] lg:!justify-start lg:gap-x-14"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
