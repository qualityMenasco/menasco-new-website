import { Compass, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { CurvedCard } from '../../cards/CurvedCard';
import { ScrollRevealGroup } from '../../common/ScrollReveal';

const valueKeys = ['innovation', 'reliability', 'sustainability', 'integrity', 'excellence', 'collaboration'] as const;

export function VisionMissionValues() {
  const { t } = useTranslation('about');

  return (
    <Section background="charcoal" spacing="lg" edgeFade>
      <Stack space="xl">
        <Stack space="sm" className="max-w-2xl">
          <Eyebrow theme="dark">{t('visionMissionValues.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3" theme="dark">
            {t('visionMissionValues.heading')}
          </Heading>
        </Stack>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <CurvedCard
            theme="dark"
            icon={Compass}
            title={t('visionMissionValues.mission.title')}
            description={t('visionMissionValues.mission.description')}
            accent="sand"
          />
          <CurvedCard
            theme="dark"
            icon={Eye}
            title={t('visionMissionValues.vision.title')}
            description={t('visionMissionValues.vision.description')}
            accent="brand"
          />
        </div>

        <Stack space="md">
          <Text theme="dark" className="font-semibold uppercase tracking-wide text-warmwhite">
            {t('visionMissionValues.ourValues')}
          </Text>
          <ScrollRevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {valueKeys.map((key) => (
              <div
                key={key}
                className="flex flex-col justify-center gap-1.5 rounded-md border border-white/10 bg-graphite p-6 lg:min-h-[128px]"
              >
                <Text theme="dark" className="font-display font-semibold text-warmwhite">
                  {t(`visionMissionValues.values.${key}.title`)}
                </Text>
                <Text variant="small" theme="dark" muted>
                  {t(`visionMissionValues.values.${key}.description`)}
                </Text>
              </div>
            ))}
          </ScrollRevealGroup>
        </Stack>
      </Stack>
    </Section>
  );
}
