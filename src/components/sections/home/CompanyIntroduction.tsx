import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { SplitContent } from '../../content/SplitContent';
import { foundingYear } from '../../../data/companyStats';

export function CompanyIntroduction() {
  const { t } = useTranslation('home');

  return (
    // Stone: sits between the dark Data Centre band and the warmwhite Services
    // section, keeping the homepage's light sections strictly alternating.
    <Section background="stone" spacing="lg" edgeFade>
      <SplitContent
        image="/company-intro-mep-hero.jpg"
        imageAlt="Engineers reviewing coordinated MEP drawings"
        imageSide="right"
        eyebrow={t('companyIntro.eyebrow')}
        heading={t('companyIntro.heading', { years: new Date().getFullYear() - foundingYear })}
        headingAs="h3"
        description={t('companyIntro.description', { foundingYear })}
        // Image fills the text column's height (no floating gap on smaller
        // desktops), and the text gets more width there — same as Manufacturing.
        stretch
        textWeighted
      />
    </Section>
  );
}
