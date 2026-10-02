import { Award, HardHat, Leaf } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';
import { certifications } from '../../data/certifications';

const certificationIcons: Record<string, LucideIcon> = {
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
      <NavSectionH1 section="about" />
      <SEO
        title={t('qualitySafetyPage.seo.title')}
        description={t('qualitySafetyPage.seo.description')}
        path="/quality-safety"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Quality, Health & Safety', path: '/quality-safety' }]}
      />
      <section className="px-4 py-8">
        <SectionHeader
          eyebrow={t('qualitySafetyPage.eyebrow')}
          heading={t('qualitySafetyPage.heading')}
          headingAs="h2"
          description={t('qualitySafetyPageMobile.description')}
        />
        <p className="mt-4 text-body text-gray-700">{t('qualitySafetyPageMobile.body')}</p>
        <a
          href="/certificates/qhse-policy.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-3 text-small font-semibold text-warmwhite"
        >
          {t('qualitySafetyPage.downloadPolicy')}
        </a>
        <div className="mt-5 flex flex-col gap-3">
          {certifications.map((certification) => {
            const Icon = certificationIcons[certification.name] ?? Award;
            const scopeKey = certificationScopeKeys[certification.name];
            const cardContent = (
              <>
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-warmwhite text-brand-600">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <span className="block font-display font-semibold text-ink">{certification.name}</span>
                  <span className="text-small text-gray-600">{scopeKey ? t(`common:certifications.${scopeKey}`) : certification.scope}</span>
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
                  className="flex items-center gap-4 rounded-md border border-gray-200 bg-stone p-4"
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <div key={certification.name} className="flex items-center gap-4 rounded-md border border-gray-200 bg-stone p-4">
                {cardContent}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
