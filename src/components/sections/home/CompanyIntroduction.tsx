import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { SplitContent } from '../../content/SplitContent';
import { foundingYear } from '../../../data/companyStats';

export function CompanyIntroduction() {
  const { t } = useTranslation('home');

  return (
    <Section background="warmwhite" spacing="lg" edgeFade>
      <SplitContent
        image="/company-intro-mep-hero.jpg"
        imageAlt="Engineers reviewing coordinated MEP drawings"
        imageSide="right"
        eyebrow={t('companyIntro.eyebrow')}
        heading={t('companyIntro.heading', { years: new Date().getFullYear() - foundingYear })}
        headingAs="h3"
        description={t('companyIntro.description', { foundingYear })}
        action={{ label: t('companyIntro.cta'), href: '/about' }}
      />
    </Section>
  );
}
