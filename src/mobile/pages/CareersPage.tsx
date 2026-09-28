import { Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { ButtonLink } from '../../components/ui/Button';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';
import { primaryContact } from '../../data/locations';

export default function CareersPage() {
  const { t } = useTranslation('careers');
  return (
    <>
      <NavSectionH1 section="careers" />
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        path="/careers"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Careers', path: '/careers' }]}
      />
      <section className="px-4 py-8">
        <SectionHeader
          eyebrow={t('eyebrow')}
          heading={t('heading')}
          headingAs="h2"
          description={t('description')}
        />
        <div className="mt-6 flex flex-col items-center gap-3 rounded-md border border-dashed border-gray-300 px-6 py-10 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone text-gray-500">
            <Briefcase size={22} aria-hidden="true" />
          </span>
          <h3 className="font-display text-h4 font-semibold text-ink">{t('emptyState.title')}</h3>
          <p className="max-w-sm text-small text-gray-600">
            {t('emptyState.description', { email: primaryContact.email })
              .split(primaryContact.email)
              .map((part, index, arr) => (
                <span key={index}>
                  {part}
                  {index < arr.length - 1 && (
                    <a href={`mailto:${primaryContact.email}`} className="font-semibold text-brand-600">
                      {primaryContact.email}
                    </a>
                  )}
                </span>
              ))}
          </p>
          <ButtonLink href="/contact?type=career" variant="outline" size="sm" className="mt-2">
            {t('emptyState.cta')}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
