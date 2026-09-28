import { Building2, ClipboardCheck, Droplets, Flame, Layers, Siren, Wind, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ScrollRevealGroup } from '../../common/ScrollReveal';

const expertiseIcons = {
  hvac: Wind,
  plumbing: Droplets,
  fireProtection: Flame,
  electrical: Zap,
  elv: Siren,
  buildingServices: Building2,
  integratedMep: Layers,
  commissioning: ClipboardCheck,
} as const;
const expertiseKeys = ['hvac', 'plumbing', 'fireProtection', 'electrical', 'elv', 'buildingServices', 'integratedMep', 'commissioning'] as const;

export function OurExperience() {
  const { t } = useTranslation('about');

  return (
    <Section background="stone" spacing="lg" border="top" edgeFade>
      <Stack space="xl">
        <Stack space="sm" className="max-w-2xl">
          <Eyebrow>{t('ourExperience.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3">
            {t('ourExperience.heading')}
          </Heading>
          <Text variant="body-lg">{t('ourExperience.description')}</Text>
        </Stack>

        <ScrollRevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
          {expertiseKeys.map((key) => {
            const Icon = expertiseIcons[key];
            return (
              <div
                key={key}
                className="flex flex-col items-center gap-3 rounded-md border border-gray-200 bg-warmwhite p-6 text-center transition-colors duration-base hover:border-brand-300"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone text-brand-600">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <Text variant="small" className="font-semibold text-ink">
                  {t(`ourExperience.expertise.${key}`)}
                </Text>
              </div>
            );
          })}
        </ScrollRevealGroup>
      </Stack>
    </Section>
  );
}
