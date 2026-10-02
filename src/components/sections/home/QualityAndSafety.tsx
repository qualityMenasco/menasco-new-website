import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ButtonLink } from '../../ui/Button';
import { certifications } from '../../../data/certifications';

/** Pillar ↔ certificate pairing, in display order. */
const evidenceRows = [
  { pillar: 'qualityManagement', certification: 'ISO 9001:2015' },
  { pillar: 'healthSafety', certification: 'ISO 45001:2018' },
  { pillar: 'environmentalManagement', certification: 'ISO 14001:2015' },
] as const;

const certificationScopeKeys: Record<string, string> = {
  'ISO 9001:2015': 'qualityManagement',
  'ISO 14001:2015': 'environmentalManagement',
  'ISO 45001:2018': 'occupationalHealthSafety',
};

export function QualityAndSafety() {
  const { t } = useTranslation(['home', 'common']);
  const [leadParagraph, ...restParagraphs] = t('qualitySafety.description').split(/\n\n/);
  const captionLines = t('qualitySafety.standardsCaption').split('\n');

  return (
    <Section background="stone" spacing="md" edgeFade>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start lg:gap-x-8">
        <Stack space="md" className="lg:col-span-5 xl:col-span-6">
          <Eyebrow>{t('qualitySafety.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3">{t('qualitySafety.heading')}</Heading>
          <div className="flex max-w-[34rem] flex-col gap-4">
            <Text variant="body-lg">{leadParagraph}</Text>
            {restParagraphs.map((paragraph, index) => (
              <Text key={index} muted>
                {paragraph}
              </Text>
            ))}
          </div>
          <ButtonLink href="/quality-safety" variant="primary" className="mt-2 w-fit" trailingIcon={ArrowRight}>
            {t('qualitySafety.cta')}
          </ButtonLink>
        </Stack>

        <div className="lg:col-span-7 xl:col-span-6">
          <h4 className="text-small font-semibold text-ink">{t('qualitySafety.standardsHeading')}</h4>
          <Text variant="small" muted className="mt-2">
            {captionLines.map((line, index) => (
              <span key={index}>
                {line}
                {index < captionLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </Text>
          <ul role="list" className="mt-5 border-t border-gray-200">
            {evidenceRows.map(({ pillar, certification: certificationName }) => {
              const certification = certifications.find((item) => item.name === certificationName);
              const scopeKey = certification ? certificationScopeKeys[certification.name] : undefined;
              const viewLabel = t('common:certifications.viewCertificate');

              return (
                <li
                  key={pillar}
                  className="grid grid-cols-1 gap-x-8 gap-y-3 border-b border-gray-200 py-5 sm:grid-cols-[1fr_auto]"
                >
                  <div className="text-start">
                    <p className="font-semibold text-ink">{t(`qualitySafety.pillars.${pillar}.title`)}</p>
                    <Text variant="small" muted className="mt-1">
                      {t(`qualitySafety.pillars.${pillar}.description`)}
                    </Text>
                  </div>
                  {certification && (
                    <div className="flex min-w-[9rem] flex-col items-start sm:items-end sm:text-end">
                      <p className="font-display font-semibold text-ink">
                        <span dir="ltr">{certification.name}</span>
                      </p>
                      <Text variant="caption" className="mt-0.5 max-w-[13rem]">
                        {scopeKey ? t(`common:certifications.${scopeKey}`) : certification.scope}
                      </Text>
                      {certification.fileUrl && (
                        <a
                          href={certification.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${viewLabel} — ${certification.name} (PDF)`}
                          className="inline-flex min-h-[44px] items-center gap-1.5 text-small font-semibold text-brand-600 transition-colors duration-base ease-engineered hover:text-brand-700"
                        >
                          {viewLabel}
                          <ArrowUpRight size={14} aria-hidden="true" className="rtl:-scale-x-100" />
                        </a>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
}
