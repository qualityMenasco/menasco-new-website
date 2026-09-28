import { useTranslation } from 'react-i18next';
import { ContactHero } from '../components/ContactHero';
import { OfficeDetailsPanel } from '../components/OfficeDetailsPanel';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { ContactEnquiryForm } from '../../components/forms/ContactEnquiryForm';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';
import { officeLocations, primaryContact } from '../../data/locations';

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
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="font-display text-h4 font-semibold text-ink">{t('selectOffice')}</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {officeLocations.map((office) => (
                <OfficeDetailsPanel key={office.id} office={office} email={primaryContact.email} />
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <ContactEnquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
