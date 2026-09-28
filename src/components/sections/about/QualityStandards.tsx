import { ArrowRight, ClipboardCheck, Cpu, HardHat, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ButtonLink } from '../../ui/Button';
import { ScrollRevealGroup } from '../../common/ScrollReveal';

const pillarIcons = { qualityAssurance: ClipboardCheck, healthSafety: HardHat, technicalExcellence: Cpu, continuousImprovement: TrendingUp } as const;
const pillarKeys = ['qualityAssurance', 'healthSafety', 'technicalExcellence', 'continuousImprovement'] as const;

export function QualityStandards() {
  const { t } = useTranslation('about');

  return (
    <Section background="warmwhite" spacing="lg" border="top" edgeFade>
      <Stack space="xl">
        <Stack space="sm" className="max-w-2xl">
          <Eyebrow>{t('qualityStandards.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3">
            {t('qualityStandards.heading')}
          </Heading>
          <Text variant="body-lg">{t('qualityStandards.paragraph1')}</Text>
          <Text variant="body-lg">{t('qualityStandards.paragraph2')}</Text>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink
              href="/certificates/qhse-policy.pdf"
              download="MENASCO-QHSE-Policy-2026.pdf"
              variant="primary"
              trailingIcon={ArrowRight}
              className="w-fit"
            >
              {t('qualityStandards.downloadPolicy')}
            </ButtonLink>
            <ButtonLink href="/quality-safety" variant="secondary" trailingIcon={ArrowRight} className="w-fit">
              {t('qualityStandards.exploreMore')}
            </ButtonLink>
          </div>
        </Stack>

        <ScrollRevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {pillarKeys.map((key) => {
            const Icon = pillarIcons[key];
            return (
              <div key={key} className="flex flex-col gap-4 rounded-md border border-gray-200 bg-stone p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-warmwhite text-brand-600">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <Text className="font-display font-semibold text-ink">{t(`qualityStandards.pillars.${key}.title`)}</Text>
                  <Text variant="small" muted className="mt-1">
                    {t(`qualityStandards.pillars.${key}.description`)}
                  </Text>
                </div>
              </div>
            );
          })}
        </ScrollRevealGroup>
      </Stack>
    </Section>
  );
}
