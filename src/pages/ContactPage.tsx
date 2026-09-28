import { useTranslation } from 'react-i18next';
import { MapPin, Phone } from 'lucide-react';
import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { NavSectionH1 } from '../components/typography/NavSectionH1';
import { Badge } from '../components/ui/Badge';
import { ContactEnquiryForm } from '../components/forms/ContactEnquiryForm';
import { officeLocations } from '../data/locations';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

const locationKeys: Record<string, string> = { dubai: 'dubai', riyadh: 'riyadh', cairo: 'cairo', london: 'london' };

/** Compact office list — same officeLocations data the Home page's Regional Presence section and mobile Contact page already use. */
function OfficesPanel() {
  const { t } = useTranslation(['contact', 'common']);
  return (
    <Stack space="md" className="rounded-md border border-gray-200 bg-warmwhite p-5 lg:sticky lg:top-28">
      <Heading level="h4" as="h3">
        {t('selectOffice')}
      </Heading>
      <Stack space="sm">
        {officeLocations.map((office) => {
          const key = locationKeys[office.id];
          const label = key ? t(`common:locations.${key}.label`) : office.label;
          return (
            <div key={office.id} className="flex flex-col gap-1.5 border-t border-gray-200 pt-3 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <Text className="font-display font-semibold text-ink">{label}</Text>
                {office.isHeadquarters && <Badge variant="status">{t('common:footer.headOffice')}</Badge>}
              </div>
              <div className="flex items-start gap-2 text-small text-gray-600">
                <MapPin size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-gray-400" />
                <span>{office.address}</span>
              </div>
              {office.phone && (
                <div className="flex items-center gap-2 text-small text-gray-600" dir="ltr">
                  <Phone size={14} aria-hidden="true" className="shrink-0 text-gray-400" />
                  <a href={`tel:${office.phone.replace(/\s+/g, '')}`} className="hover:text-brand-600">
                    {office.phone}
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </Stack>
    </Stack>
  );
}

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

      <Section spacing="sm" background="warmwhite">
        <Stack space="lg">
          <Stack space="xs" className="max-w-2xl">
            <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
            <Heading level="h1" as="h2">
              {t('hero.title')}
            </Heading>
            <Text variant="body" muted>
              {t('hero.description')}
            </Text>
          </Stack>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:gap-10">
            <ContactEnquiryForm />
            <OfficesPanel />
          </div>
        </Stack>
      </Section>
    </>
  );
}
