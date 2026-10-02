import { Award, HardHat, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { SectionHeader } from '../components/typography/SectionHeader';
import { ButtonLink } from '../components/ui/Button';
import { Text } from '../components/typography/Typography';
import { ScrollReveal, ScrollRevealGroup } from '../components/common/ScrollReveal';
import { certifications } from '../data/certifications';
import type { IconComponent } from '../types';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

const certificationIcons: Record<string, IconComponent> = {
  'ISO 9001:2015': Award,
  'ISO 14001:2015': Leaf,
  'ISO 45001:2018': HardHat,
};

const certificationScopeKeys: Record<string, string> = {
  'ISO 9001:2015': 'qualityManagement',
  'ISO 14001:2015': 'environmentalManagement',
  'ISO 45001:2018': 'occupationalHealthSafety',
};

export default function QualitySafetyPage() {
  const { t } = useTranslation(['about', 'common']);
  return (
    <>
      <SEO
        title={t('qualitySafetyPage.seo.title')}
        description={t('qualitySafetyPage.seo.description')}
        path="/quality-safety"
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Quality, Health & Safety', path: '/quality-safety' },
        ]}
      />

      <Section spacing="lg" background="warmwhite">
        <Stack space="lg">
          <div className="flex w-full flex-col gap-6 md:flex-row md:items-start">
            <div className="flex flex-1 flex-col gap-4">
              <SectionHeader
                className="w-full"
                eyebrow={t('qualitySafetyPage.eyebrow')}
                heading={t('qualitySafetyPage.heading')}
                headingAs="h2"
                description={t('qualitySafetyPage.description')}
              />

              <Stack space="sm" className="max-w-3xl">
                <Text variant="body-lg">{t('qualitySafetyPage.paragraph1')}</Text>
                <Text variant="body-lg">
                  {t('qualitySafetyPage.paragraph2Prefix')}{' '}
                  <strong className="font-semibold text-ink">{t('qualitySafetyPage.continuousImprovement')}</strong>
                  {t('qualitySafetyPage.paragraph2Suffix')}
                </Text>
              </Stack>
            </div>

            <img
              src="/manufacturing-prefab-service-hero.jpg"
              alt="MENASCO site engineer at a construction site"
              className="aspect-[4/5] w-full rounded-md object-cover md:mt-24 md:w-[380px]"
            />
          </div>

          <ButtonLink
            href="/certificates/qhse-policy.pdf"
            download="MENASCO-QHSE-Policy-2026.pdf"
            variant="primary"
            className="w-fit"
          >
            {t('qualitySafetyPage.downloadPolicy')}
          </ButtonLink>

          <ScrollRevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:gap-6">
            {certifications.map((certification) => {
              const Icon = certificationIcons[certification.name] ?? Award;
              const scopeKey = certificationScopeKeys[certification.name];
              const cardContent = (
                <>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-warmwhite text-brand-600">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <Text className="font-display font-semibold text-ink">{certification.name}</Text>
                    <Text variant="small" muted className="mt-1">
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
                    className="flex h-full flex-col gap-4 rounded-md border border-gray-200 bg-stone p-6 transition-colors duration-base ease-engineered hover:border-gray-300"
                  >
                    {cardContent}
                  </a>
                );
              }

              return (
               <div key={certification.name} className="flex h-full flex-col gap-4 rounded-md border border-gray-200 bg-stone p-6">                 
                {cardContent}
                </div>
              );
            })}
          </ScrollRevealGroup>
        </Stack>
      </Section>

    </>
  );
}
