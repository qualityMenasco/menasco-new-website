import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { SplitContent } from '../../content/SplitContent';

export function PrefabricationFeature() {
  const { t } = useTranslation('home');

  return (
    <Section background="warmwhite" spacing="lg" edgeFade>
      <SplitContent
        image="/manufacturing-prefab-hero.jpg"
        imageAlt="Ductwork fabrication on the MENASCO manufacturing floor"
        imageSide="right"
        eyebrow={t('prefabrication.eyebrow')}
        heading={t('prefabrication.heading')}
        headingAs="h3"
        description={t('prefabrication.description')}
        action={{ label: t('prefabrication.cta'), href: '/services/manufacturing-prefabrication' }}
      />
    </Section>
  );
}
