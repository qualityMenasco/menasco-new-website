import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';
import { primaryContact } from '../../data/locations';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation('legal');
  return (
    <>
      <NavSectionH1 section="home" />
      <SEO title={t('privacy.seo.title')} description={t('privacy.seo.description')} path="/privacy-policy" />
      <section className="px-4 py-8">
        <SectionHeader eyebrow={t('eyebrow')} heading={t('privacy.heading')} headingAs="h2" />
        <p className="mt-4 text-body text-gray-700">{t('privacy.body')}</p>
        <p className="mt-3 text-small text-gray-500">{t('privacy.contactNote', { email: primaryContact.email })}</p>
      </section>
    </>
  );
}
