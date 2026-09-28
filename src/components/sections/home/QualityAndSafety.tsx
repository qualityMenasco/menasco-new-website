import { Award, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Grid } from '../../layout/Grid';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ButtonLink } from '../../ui/Button';
import { certifications } from '../../../data/certifications';

const pillarKeys = ['qualityManagement', 'healthSafety', 'environmentalManagement'] as const;

const certificationScopeKeys: Record<string, string> = {
  'ISO 9001:2015': 'qualityManagement',
  'ISO 14001:2015': 'environmentalManagement',
  'ISO 45001:2018': 'occupationalHealthSafety',
};

export function QualityAndSafety() {
  const { t } = useTranslation(['home', 'common']);

  return (
    <Section background="stone" spacing="lg" edgeFade>
      <Grid variant="asymmetrical" gap="lg" className="lg:items-start">
        <Stack space="lg">
          <Eyebrow>{t('qualitySafety.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3">{t('qualitySafety.heading')}</Heading>
          <Text variant="body-lg">{t('qualitySafety.description')}</Text>
          <Stack space="md" className="mt-2">
            {pillarKeys.map((key) => (
              <div key={key} className="flex items-start gap-3">
                <Check size={18} aria-hidden="true" className="mt-1 shrink-0 text-brand-600" />
                <div>
                  <Text className="font-semibold text-ink">{t(`qualitySafety.pillars.${key}.title`)}</Text>
                  <Text variant="small" muted>
                    {t(`qualitySafety.pillars.${key}.description`)}
                  </Text>
                </div>
              </div>
            ))}
          </Stack>
          <ButtonLink href="/quality-safety" variant="primary" className="mt-2 w-fit">
            {t('qualitySafety.cta')}
          </ButtonLink>
        </Stack>

        <div className="flex flex-col gap-4 lg:gap-5 lg:mt-14">
          <Heading level="h4" as="h3" className="leading-snug">{t('qualitySafety.standardsHeading')}</Heading>
          <Text variant="small" muted>
            {t('qualitySafety.standardsCaption')
              .split('\n')
              .map((line, index, lines) => (
                <span key={index}>
                  {line}
                  {index < lines.length - 1 ? <br /> : null}
                </span>
              ))}
          </Text>
          {certifications.map((certification) => {
            const scopeKey = certificationScopeKeys[certification.name];
            const cardContent = (
              <>
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sand-100 text-sand-600">
                  <Award size={22} aria-hidden="true" />
                </span>
                <div>
                  <Text className="font-display font-semibold text-ink">{certification.name}</Text>
                  <Text variant="small" muted>
                    {scopeKey ? t(`common:certifications.${scopeKey}`) : certification.scope}
                  </Text>
                </div>
              </>
            );

            if (certification.fileUrl) {
              return (
                <a
                  key={certification.name}
                  href={certification.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-5 rounded-md border border-gray-200 bg-warmwhite p-7 shadow-sm transition-colors hover:bg-sand-50"
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <div key={certification.name} className="flex items-center gap-5 rounded-md border border-gray-200 bg-warmwhite p-7 shadow-sm">
                {cardContent}
              </div>
            );
          })}
        </div>
      </Grid>
    </Section>
  );
}
