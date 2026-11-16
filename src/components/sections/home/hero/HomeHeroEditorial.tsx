import { ArrowRight, Download } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Container } from '../../../layout/Container';
import { Eyebrow, Heading, Text } from '../../../typography/Typography';
import { ButtonLink } from '../../../ui/Button';
import { companyStats, foundingYear } from '../../../../data/companyStats';
import { Statistic } from '../../../content/Statistic';
import { useTransparentHeader } from '../../../../app/header-transparency';
import { COMPANY_PROFILE_PATH } from '../../../../seo/constants';

const statKeys: Record<string, string> = {
  projects: 'stats.projects',
  years: 'stats.years',
  countries: 'stats.countries',
};

/** Only verified figures render. See src/data/companyStats.ts for the source and provenance of each value. */
const verifiedStats = companyStats.filter((stat) => stat.verificationStatus === 'verified');

/**
 * Full-bleed editorial hero, with the company stats folded into its bottom
 * edge so the numbers are on screen at first load. To swap for a different
 * treatment, change the single import in HomePage.tsx.
 */
export function HomeHeroEditorial() {
  useTransparentHeader(true, { alwaysTransparent: true });
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation(['home', 'common']);

  const rise = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <section id="hero" className="relative flex min-h-[92vh] w-full scroll-mt-24 items-end overflow-hidden bg-ink">
      {/* Poster is a real extracted frame from this exact video (not a stock photo), so it paints instantly as the LCP candidate without the mismatched-flash issue a generic placeholder caused previously. preload="metadata" avoids competing with critical-path JS/CSS/fonts for bandwidth — the browser still buffers enough to autoplay promptly. */}
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        src="/menasco-landing-clean.mp4"
        poster="/menasco-landing-clean-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />

      <Container className="relative z-10 pb-10 pt-28 md:pt-32">
        <div className="max-w-3xl">
          <motion.div initial={rise.initial} animate={rise.animate} transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.22, 0.61, 0.36, 1] }}>
            <Eyebrow theme="dark" className="text-warmwhite">{t('home:hero.eyebrow', { year: foundingYear })}</Eyebrow>
          </motion.div>
          <motion.div
            initial={rise.initial}
            animate={rise.animate}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.08, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Heading level="display" as="h1" theme="dark" className="mt-4">
              {t('home:hero.title')}
            </Heading>
          </motion.div>
          <motion.div
            initial={rise.initial}
            animate={rise.animate}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.16, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Text variant="body-lg" theme="dark" className="mt-6 max-w-xl text-gray-200">
              {t('home:hero.description')}
            </Text>
          </motion.div>
          <motion.div
            initial={rise.initial}
            animate={rise.animate}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.24, ease: [0.22, 0.61, 0.36, 1] }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <ButtonLink href="/projects/categories" variant="primary" size="lg" trailingIcon={ArrowRight}>
              {t('home:hero.ctaPrimary')}
            </ButtonLink>
            <ButtonLink href="/services" variant="outline" size="lg" theme="dark">
              {t('home:hero.ctaSecondary')}
            </ButtonLink>
            <ButtonLink
              href={COMPANY_PROFILE_PATH}
              download="MENASCO-Company-Profile.pdf"
              variant="text"
              size="lg"
              theme="dark"
              leadingIcon={Download}
            >
              {t('common:buttons.downloadCompanyProfile')}
            </ButtonLink>
          </motion.div>
        </div>

        {/* Stats strip along the hero's bottom edge (count up once on first view). */}
        <motion.div
          id="stats"
          initial={rise.initial}
          animate={rise.animate}
          transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.36, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-14 border-t border-white/15 pt-8"
        >
          <Statistic
            layout="grid"
            columns={3}
            theme="dark"
            items={verifiedStats.map((stat) => ({ value: stat.value, label: t(statKeys[stat.id] ?? stat.label), animate: true }))}
            className="lg:!grid-cols-[repeat(3,minmax(0,240px))] lg:!justify-start lg:gap-x-14"
          />
        </motion.div>
      </Container>
    </section>
  );
}
