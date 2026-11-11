import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Download, MapPin, Phone } from 'lucide-react';
import { officeLocations, type OfficeLocation } from '../../data/locations';
import { footerSocialLinks } from '../../data/socialLinks';
import { ContactLink } from '../../components/ui/ContactLink';
import { SocialLinks } from '../../components/navigation';
import { cn } from '../../lib/utils';
import { useFooterLinkGroups, type FooterLinkGroupData } from '../../lib/useFooterLinkGroups';
import { certifications } from '../../data/certifications';
import { COMPANY_PROFILE_PATH } from '../../seo/constants';
import { MenascoLogo } from './MenascoLogo';
import { LocaleLink } from './LocaleLink';

const certificationKeys: Record<string, string> = {
  'ISO 9001:2015': 'qualityManagement',
  'ISO 14001:2015': 'environmentalManagement',
  'ISO 45001:2018': 'occupationalHealthSafety',
};

type FooterOffice = OfficeLocation;

function OfficeHeading({ id, label }: { id: string; label: string }) {
  const { t } = useTranslation('common');
  return (
    <span className="text-small font-semibold uppercase tracking-wide text-gray-400">
      {t(`common:locations.${id}.officeHeading`, label)}
    </span>
  );
}

/** Phone + location rows, "Pending" for anything not yet published. */
function OfficeDetails({ office }: { office: FooterOffice }) {
  const { t } = useTranslation('common');
  const pending = <span className="text-small italic text-gray-500">{t('common:footer.pending')}</span>;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 text-small text-gray-300">
        <Phone size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-gray-500" />
        {office.phone ? <ContactLink kind="tel" value={office.phone} /> : pending}
      </div>
      <div className="flex items-start gap-2 text-small text-gray-300">
        <MapPin size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-gray-500" />
        {office.address ? (
          <span dir="ltr" className="text-start">
            {office.address}
          </span>
        ) : (
          pending
        )}
      </div>
    </div>
  );
}

/**
 * One tablet link column. Services uses two newspaper-style columns (each
 * stacks independently, so a two-line item never leaves a blank line beside
 * it).
 */
function TabletLinkColumn({ group, twoColumns }: { group: FooterLinkGroupData; twoColumns: boolean }) {
  return (
    <div className={cn('flex flex-col gap-3', twoColumns && 'col-span-2')}>
      <span className="text-small font-semibold uppercase tracking-wide text-gray-400">{group.heading}</span>
      <ul role="list" className={twoColumns ? 'columns-2 gap-x-6' : 'flex flex-col gap-y-2.5'}>
        {group.links.map((link) => (
          <li key={link.href} className={cn(twoColumns && 'mb-2.5 break-inside-avoid')}>
            <LocaleLink to={link.href} className="text-small text-gray-300">
              {link.label}
            </LocaleLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Condensed mobile footer — company summary, CTAs, office contacts, certifications, legal. */
export function MobileFooter() {
  const { t } = useTranslation(['nav', 'common']);
  const headquarters = officeLocations.find((office) => office.isHeadquarters) ?? officeLocations[0];
  const [selectedOfficeId, setSelectedOfficeId] = useState(headquarters.id);
  const selectedOffice = officeLocations.find((office) => office.id === selectedOfficeId) ?? headquarters;
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const linkGroups = useFooterLinkGroups();

  // Bottom clearance = BackToTopButton's own offset (16px) + height (44px) + a little
  // breathing room, plus the home-indicator safe area — keeps the last legal links clear
  // of it at the end of every page. The fixed bottom tab bar this used to also clear was
  // removed site-wide; BackToTopButton is now the only fixed mobile chrome left to clear.
  return (
    <footer className="bg-ink pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-10 text-warmwhite">
      {/* Phones: one stacked column. Tablets (sm+): four bands — brand +
          social, link columns, offices, then certifications + legal. */}
      <div className="flex flex-col gap-6 px-4">
        <div className="flex flex-col gap-6 sm:grid sm:grid-cols-[1fr_auto] sm:items-start sm:gap-10">
          <div className="flex flex-col gap-6">
            <MenascoLogo className="h-9" onDark />
            <p className="max-w-xl text-small text-gray-300">{t('common:footer.description')}</p>
            <div className="flex flex-wrap gap-3">
              <LocaleLink
                to="/contact"
                className="inline-flex h-11 w-fit items-center gap-2 rounded-md bg-brand-600 px-4 text-small font-semibold text-warmwhite"
              >
                {t('contactUs')}
              </LocaleLink>
              <a
                href={COMPANY_PROFILE_PATH}
                download="MENASCO-Company-Profile.pdf"
                className="inline-flex h-11 w-fit items-center gap-2 rounded-md border border-white/30 px-4 text-small font-semibold text-warmwhite"
              >
                <Download size={16} aria-hidden="true" />
                {t('common:buttons.downloadCompanyProfile')}
              </a>
            </div>
          </div>
          {/* Tablets: social links sit with the brand block. */}
          <div className="hidden flex-col gap-3 sm:flex">
            <span className="text-small font-semibold uppercase tracking-wide text-gray-400">{t('common:footer.connect')}</span>
            <SocialLinks links={footerSocialLinks} theme="dark" />
          </div>
        </div>

        {/* Link columns — same Services / Company / Projects lists as the
            desktop footer. Phones: one collapsed row per column so the
            footer only grows by three rows; tablets: all three open. */}
        <div className="sm:border-t sm:border-white/10 sm:pt-6">
          <ul role="list" className="divide-y divide-white/10 border-y border-white/10 sm:hidden">
            {linkGroups.map((group) => {
              const isOpen = openGroup === group.id;
              const panelId = `footer-links-${group.id}`;
              return (
                <li key={group.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenGroup(isOpen ? null : group.id)}
                    className="flex min-h-11 w-full items-center justify-between gap-3 py-3 text-start"
                  >
                    <span className="text-small font-semibold uppercase tracking-wide text-gray-400">{group.heading}</span>
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className={cn('shrink-0 text-gray-500 transition-transform duration-base', isOpen && 'rotate-180')}
                    />
                  </button>
                  {/* Toggled by class, not the `hidden` attribute — `flex` would override it. */}
                  <ul id={panelId} role="list" className={cn('flex-col pb-3', isOpen ? 'flex' : 'hidden')}>
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <LocaleLink to={link.href} className="flex min-h-10 items-center text-small text-gray-300">
                          {link.label}
                        </LocaleLink>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>

          {/* Tablets: Services (12 links) gets two inner columns so it ends
              level with Company and Projects instead of setting the height. */}
          <div className="hidden grid-cols-4 gap-x-6 gap-y-3 sm:grid">
            {linkGroups.map((group) => (
              <TabletLinkColumn key={group.id} group={group} twoColumns={group.id === 'services'} />
            ))}
          </div>
        </div>

        {/* Offices — same list, rows and "Pending" handling as the desktop
            footer. A wrap of country chips drives one details panel, so seven
            offices take two short lines; tablets put the panel beside the chips. */}
        <div className="flex flex-col gap-5 sm:border-t sm:border-white/10 sm:pt-6">
          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:items-start sm:gap-x-8">
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
                    aria-controls="footer-office-panel"
                    onClick={() => setSelectedOfficeId(office.id)}
                    className={cn(
                      'inline-flex h-9 items-center rounded-full border px-3.5 text-small font-medium transition-colors duration-base',
                      isSelected ? 'border-brand-500 text-warmwhite' : 'border-white/15 text-gray-300 active:border-white/30',
                    )}
                  >
                    {t(`common:locations.${office.id}.short`, office.country)}
                  </button>
                );
              })}
              </div>
            </div>
            <div id="footer-office-panel" aria-live="polite" className="flex flex-col gap-3 rounded-md border border-white/10 bg-white/[0.03] p-4">
              <OfficeHeading id={selectedOffice.id} label={selectedOffice.label} />
              <OfficeDetails office={selectedOffice} />
            </div>
          </div>

          {/* Phones: social links follow the offices (tablets show them in the top band). */}
          <div className="flex flex-col gap-3 sm:hidden">
            <span className="text-small font-semibold uppercase tracking-wide text-gray-400">{t('common:footer.connect')}</span>
            <SocialLinks links={footerSocialLinks} theme="dark" />
          </div>
        </div>

        {/* Certifications + legal — one band on tablets (no divider between them). */}
        <div className="flex flex-wrap justify-center gap-2 border-t border-white/10 pt-6 sm:justify-start">
          {certifications.map((cert) => (
            <span key={cert.name} className="rounded-sm border border-white/15 px-2.5 py-1 text-caption text-gray-300">
              {cert.name}
              {certificationKeys[cert.name] ? `, ${t(`common:certifications.${certificationKeys[cert.name]}`)}` : ''}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-caption text-gray-400 sm:-mt-2 sm:border-t-0 sm:pt-0">
          <span>{t('common:footer.copyright', { year: new Date().getFullYear() })}</span>
          <div className="flex gap-4">
            <LocaleLink to="/privacy-policy">{t('privacyPolicy')}</LocaleLink>
            <LocaleLink to="/terms">{t('terms')}</LocaleLink>
            <LocaleLink to="/lynxqc/privacy-policy">{t('lynxqcPrivacyPolicy')}</LocaleLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
