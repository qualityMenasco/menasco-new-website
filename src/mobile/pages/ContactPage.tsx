import { useTranslation } from 'react-i18next';
import { ContactHero } from '../components/ContactHero';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { ContactEnquiryForm } from '../../components/forms/ContactEnquiryForm';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';

/** Mobile contact page: hero and enquiry form. The office details grid under the form was removed (client request 2026-11-25). */
export default function ContactPage() {
  const { t } = useTranslation('contact');

  return (
    <>
      <NavSectionH1 section="home" />
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        path="/contact"
        pageType="ContactPage"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Contact', path: '/contact' }]}
      />

      <ContactHero />

      <section className="px-4 pb-10 pt-4">
        <ContactEnquiryForm />
      </section>
    </>
  );
}
