import { ArrowRight, Download } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Container } from '../../../layout/Container';
import { Eyebrow, Heading, Text } from '../../../typography/Typography';
import { ButtonLink } from '../../../ui/Button';
import { foundingYear } from '../../../../data/companyStats';
import { useTransparentHeader } from '../../../../app/header-transparency';
import { COMPANY_PROFILE_PATH } from '../../../../seo/constants';

/**
 * Full-bleed editorial hero. To swap for a different treatment, change the
 * single import in HomePage.tsx — e.g. <HomeHeroSplit /> — nothing else
 * needs to change.
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
    <section id="hero" className="relative flex min-h-screen w-full scroll-mt-24 items-end overflow-hidden bg-ink">
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
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

      <Container className="relative z-10 pb-20 pt-28 md:pb-24 md:pt-32">
        <div className="max-w-3xl">
          <motion.div initial={rise.initial} animate={rise.animate} transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.22, 0.61, 0.36, 1] }}>
            <Eyebrow theme="dark">{t('home:hero.eyebrow', { year: foundingYear })}</Eyebrow>
          </motion.div>
          <motion.div
            initial={rise.initial}
            animate={rise.animate}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.08, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Heading level="display" as="h2" theme="dark" className="mt-4">
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
            <ButtonLink href="/#projects" variant="primary" size="lg" trailingIcon={ArrowRight}>
              {t('common:buttons.exploreProjects')}
            </ButtonLink>
            <ButtonLink href="/services" variant="outline" size="lg" theme="dark">
              {t('common:buttons.ourCapabilities')}
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
      </Container>
    </section>
  );
}
