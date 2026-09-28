import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';

export default function TermsPage() {
  const { t } = useTranslation('legal');
  return (
    <>
      <NavSectionH1 section="home" />
      <SEO title={t('terms.seo.title')} description={t('terms.seo.description')} path="/terms" />
      <section className="px-4 py-8">
        <SectionHeader eyebrow={t('eyebrow')} heading={t('terms.heading')} headingAs="h2" />
        <p className="mt-4 text-body text-gray-700">{t('terms.body')}</p>
      </section>
    </>
  );
}
