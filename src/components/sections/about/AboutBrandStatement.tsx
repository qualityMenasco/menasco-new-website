import { useTranslation } from 'react-i18next';
import { Container } from '../../layout/Container';
import { SectionThemeContext } from '../../../lib/theme-context';

/**
 * Brand statement as a minimal poster: the flush-left headline alone on charcoal
 * (was black ink; charcoal like the other dark sections, client request 2026-11-23).
 * Desktop only (the mobile About page doesn't include this section).
 */
export function AboutBrandStatement() {
  const { t } = useTranslation('about');

  return (
    <SectionThemeContext.Provider value="dark">
      <section className="bg-charcoal py-16 md:py-24">
        <Container>
          <h3 className="py-12 font-display text-[clamp(3.75rem,6.4vw,5.75rem)] font-bold leading-[0.92] tracking-[-0.045em] text-warmwhite">
            <span className="block">{t('brandStatement.heading1')}</span>
            <span className="block text-brand-400">{t('brandStatement.heading2')}</span>
          </h3>
        </Container>
      </section>
    </SectionThemeContext.Provider>
  );
}
