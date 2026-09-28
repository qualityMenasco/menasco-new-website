import { useTranslation } from 'react-i18next';
import { Container } from '../../layout/Container';
import { SectionThemeContext } from '../../../lib/theme-context';
import { Heading } from '../../typography/Typography';
import { ScrollRevealGroup } from '../../common/ScrollReveal';

/**
 * Premium editorial quote — a quiet visual pause between the company
 * introduction (WhoWeAre) and the operational philosophy (OurApproach).
 * Deliberately text-only: no buttons, icons or stats, just the brand
 * statement given room to breathe inside a thin corner-accented frame.
 */
export function AboutBrandStatement() {
  const { t } = useTranslation('about');

  return (
    <SectionThemeContext.Provider value="dark">
      <section className="relative overflow-hidden bg-gradient-to-b from-ink via-charcoal to-ink py-16 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #1cb7f0 0%, transparent 70%)' }}
        />

        <Container>
          <div className="relative mx-auto max-w-4xl px-6 py-12 sm:px-16 sm:py-16">
            <span
              aria-hidden="true"
              className="absolute start-0 top-0 h-8 w-8 border-s border-t border-sand-400/50 sm:h-10 sm:w-10"
            />
            <span
              aria-hidden="true"
              className="absolute end-0 top-0 h-8 w-8 border-e border-t border-sand-400/50 sm:h-10 sm:w-10"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-0 start-0 h-8 w-8 border-b border-s border-sand-400/50 sm:h-10 sm:w-10"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-0 end-0 h-8 w-8 border-b border-e border-sand-400/50 sm:h-10 sm:w-10"
            />

            <ScrollRevealGroup className="flex flex-col items-center gap-6 text-center">
              <Heading level="h1" as="h3" theme="dark" className="leading-[1.25]">
                {t('brandStatement.heading1')}
                <br />
                {t('brandStatement.heading2')}
              </Heading>
              <p className="max-w-xl text-[0.8125rem] font-sans font-semibold uppercase tracking-[0.2em] text-sand-300 sm:text-small">
                {t('brandStatement.tagline')}
                <br />
                {t('brandStatement.innovation')} <span className="text-sand-400">•</span> {t('brandStatement.integrity')}{' '}
                <span className="text-sand-400">•</span> {t('brandStatement.excellence')}
              </p>
            </ScrollRevealGroup>
          </div>
        </Container>
      </section>
    </SectionThemeContext.Provider>
  );
}
