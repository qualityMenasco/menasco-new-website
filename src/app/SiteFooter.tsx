import { useState } from 'react';
import { Download, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CertificationStrip, CompanySummary, FooterContainer, FooterLinkGroup, LegalRow, SocialLinks } from '../components/navigation';
import { ButtonLink } from '../components/ui/Button';
import { ContactLink } from '../components/ui/ContactLink';
import { MenascoLogo } from '../components/brand/MenascoLogo';
import { cn } from '../lib/utils';
import { certifications } from '../data/certifications';
import { officeLocations } from '../data/locations';
import { footerLegalLinks } from '../data/navigation';
import { footerSocialLinks } from '../data/socialLinks';
import { useFooterLinkGroups } from '../lib/useFooterLinkGroups';
import { COMPANY_PROFILE_PATH } from '../seo/constants';

const footerLegalKeys: Record<string, string> = {
  'Privacy Policy': 'privacyPolicy',
  Terms: 'terms',
  'LYNX Privacy Policy': 'lynxqcPrivacyPolicy',
};


const certificationScopeKeys: Record<string, string> = {
  'ISO 9001:2015': 'qualityManagement',
  'ISO 14001:2015': 'environmentalManagement',
  'ISO 45001:2018': 'occupationalHealthSafety',
};

export function SiteFooter() {
  const { t } = useTranslation(['nav', 'common']);
  const linkGroups = useFooterLinkGroups();
  const headquarters = officeLocations.find((office) => office.isHeadquarters) ?? officeLocations[0];
  const [selectedOfficeId, setSelectedOfficeId] = useState(headquarters.id);
  const selectedOffice = officeLocations.find((office) => office.id === selectedOfficeId) ?? headquarters;

  const translatedLinks = (links: { label: string; href: string }[], keyMap: Record<string, string>) =>
    links.map((link) => ({ label: t(keyMap[link.label] ?? link.label), href: link.href }));

  return (
    <FooterContainer theme="dark">
      {/* Band 1 — brand + social on the left, then the link columns.
          Services (12 links) gets two inner columns so it ends level with
          Company and Projects instead of setting the row's height. */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_2fr_1fr_1fr] lg:gap-10">
        <div className="flex flex-col gap-6">
          <CompanySummary logo={<MenascoLogo className="h-10" onDark />} description={t('common:footer.description')} />
          <ButtonLink
            href={COMPANY_PROFILE_PATH}
            download="MENASCO-Company-Profile.pdf"
            variant="primary"
            size="sm"
            leadingIcon={Download}
            className="w-fit"
          >
            {t('common:buttons.downloadCompanyProfile')}
          </ButtonLink>
          <div className="flex flex-col gap-3">
            <span className="text-small font-semibold uppercase tracking-wide text-gray-400">{t('common:footer.connect')}</span>
            <SocialLinks links={footerSocialLinks} />
          </div>
        </div>
        {linkGroups.map((group) => (
          <FooterLinkGroup key={group.id} heading={group.heading} links={group.links} columns={group.id === 'services' ? 2 : 1} />
        ))}
      </div>

      {/* Band 2 — offices: country chips on the left drive one details panel
          on the right (same pattern as tablet and phone). */}
      <div className="grid grid-cols-1 items-start gap-8 border-t border-white/10 pt-10 lg:grid-cols-[1.4fr_2fr] lg:gap-10">
        <div className="flex flex-col gap-4">
          <span className="text-small font-semibold uppercase tracking-wide text-gray-400">{t('common:footer.offices')}</span>
          <div role="group" aria-label={t('common:footer.offices')} className="flex flex-wrap gap-2">
            {officeLocations.map((office) => {
              const isSelected = office.id === selectedOffice.id;
              return (
                <button
                  key={office.id}
                  type="button"
                  aria-pressed={isSelected}
                  aria-controls="site-footer-office-panel"
                  onClick={() => setSelectedOfficeId(office.id)}
                  className={cn(
                    'inline-flex h-9 items-center rounded-full border px-4 text-small font-medium transition-colors duration-base',
                    isSelected ? 'border-brand-500 text-warmwhite' : 'border-white/15 text-gray-300 hover:border-white/40 hover:text-warmwhite',
                  )}
                >
                  {t(`common:locations.${office.id}.short`, office.country)}
                </button>
              );
            })}
          </div>
        </div>
        {/* Same structure as the tablet panel: small office title, then
            phone above address. */}
        <div id="site-footer-office-panel" aria-live="polite" className="flex flex-col gap-3 rounded-md border border-white/10 bg-white/[0.03] p-4">
          <span className="text-small font-semibold uppercase tracking-wide text-gray-400">
            {t(`common:locations.${selectedOffice.id}.officeHeading`, selectedOffice.label)}
          </span>
          <ul role="list" className="flex flex-col gap-3">
            <li className="flex items-start gap-2 text-small text-gray-300">
              <Phone size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-gray-500" />
              {selectedOffice.phone ? (
                <ContactLink kind="tel" value={selectedOffice.phone} className="transition-colors duration-base hover:text-warmwhite" />
              ) : (
                <span className="italic text-gray-500">{t('common:footer.pending')}</span>
              )}
            </li>
            <li className="flex items-start gap-2 text-small text-gray-300">
              <MapPin size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-gray-500" />
              {selectedOffice.address ? (
                <span dir="ltr" className="text-start">
                  {selectedOffice.address}
                </span>
              ) : (
                <span className="italic text-gray-500">{t('common:footer.pending')}</span>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* Band 3 — certifications + legal, one band. */}
      <div className="flex flex-col gap-6 border-t border-white/10 pt-8">
        <CertificationStrip
          align="start"
          certifications={certifications.map((certification) =>
            certificationScopeKeys[certification.name]
              ? `${certification.name}, ${t(`common:certifications.${certificationScopeKeys[certification.name]}`)}`
              : certification.name,
          )}
        />
        <LegalRow
          className="!border-t-0 !pt-0"
          copyrightText={t('common:footer.copyright', { year: new Date().getFullYear() })}
          links={translatedLinks(footerLegalLinks, footerLegalKeys)}
        />
      </div>
    </FooterContainer>
  );
}
