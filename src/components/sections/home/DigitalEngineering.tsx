import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Grid } from '../../layout/Grid';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ProfessionalList } from '../../content/ProfessionalList';
import { ButtonLink } from '../../ui/Button';
import { placeholderImages } from '../../../data/images';

const capabilityKeys = ['federatedBim', 'clashDetection', 'constructability', 'dataDriven'] as const;

/** Deliberately more technical and dark than the surrounding company sections. */
export function DigitalEngineering() {
  const { t } = useTranslation('home');
  const capabilities = capabilityKeys.map((key) => ({
    title: t(`digitalEngineering.capabilities.${key}.title`),
    description: t(`digitalEngineering.capabilities.${key}.description`),
  }));

  return (
    <Section background="charcoal" spacing="md" edgeFade>
      <Grid variant="two" gap="lg" className="items-center">
        <div className="aspect-[4/3] overflow-hidden rounded-md">
          <img src={placeholderImages.controlRoom} alt="Engineer reviewing coordinated building systems on screen" className="h-full w-full object-cover" />
        </div>
        <Stack space="xs">
          <Eyebrow theme="dark">{t('digitalEngineering.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3" theme="dark">
            {t('digitalEngineering.heading')}
          </Heading>
          <Text variant="body-lg" theme="dark">
            {t('digitalEngineering.description')}
          </Text>
          <ProfessionalList variant="rule" items={capabilities} theme="dark" columns={2} gap="md" className="mt-2 sm:gap-y-6" />
          <ButtonLink href="/services/bim-digital-engineering" variant="primary" className="w-fit self-end">
            {t('digitalEngineering.cta')}
          </ButtonLink>
        </Stack>
      </Grid>
    </Section>
  );
}
