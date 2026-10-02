import { useTranslation } from 'react-i18next';
import { Download, Mail, Phone } from 'lucide-react';
import { officeLocations, primaryContact } from '../../data/locations';
import { certifications } from '../../data/certifications';
import { COMPANY_PROFILE_PATH } from '../../seo/constants';
import { MenascoLogo } from './MenascoLogo';
import { LocaleLink } from './LocaleLink';

const certificationKeys: Record<string, string> = {
  'ISO 9001:2015': 'qualityManagement',
  'ISO 14001:2015': 'environmentalManagement',
  'ISO 45001:2018': 'occupationalHealthSafety',
};

const locationKeys: Record<string, string> = {
  dubai: 'dubai',
  riyadh: 'riyadh',
  cairo: 'cairo',
  london: 'london',
};

/** Condensed mobile footer — company summary, CTAs, head office contact, certifications, legal. */
export function MobileFooter() {
  const { t } = useTranslation(['nav', 'common']);
  const headquarters = officeLocations.find((location) => location.isHeadquarters) ?? officeLocations[0];
  const hqKey = locationKeys[headquarters.id];

  // Bottom clearance = fixed bottom nav (49px) + BackToTopButton (12px gap + 44px) + breathing room,
  // plus the home-indicator safe area — keeps the last legal links clear of both at the end of every page.
  return (
    <footer className="bg-ink pb-[calc(8rem+env(safe-area-inset-bottom))] pt-10 text-warmwhite">
      <div className="flex flex-col gap-6 px-4">
        <MenascoLogo className="h-9" onDark />
        <p className="text-small text-gray-300">{t('common:footer.description')}</p>
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

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
          <span className="text-small font-semibold uppercase tracking-wide text-gray-400">
            {hqKey ? t(`common:locations.${hqKey}.label`) : headquarters.label}
          </span>
          <p dir="ltr" className="text-start text-small text-gray-300">{headquarters.address}</p>
          <a href={`tel:${primaryContact.dubaiPhonePrimary.replace(/\s+/g, '')}`} className="inline-flex items-center gap-2 text-small text-gray-300">
            <Phone size={15} aria-hidden="true" />
            <span dir="ltr">{primaryContact.dubaiPhonePrimary}</span>
          </a>
          <a href={`mailto:${primaryContact.email}`} className="inline-flex items-center gap-2 text-small text-gray-300">
            <Mail size={15} aria-hidden="true" />
            <span dir="ltr">{primaryContact.email}</span>
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-2 border-t border-white/10 pt-6">
          {certifications.map((cert) => (
            <span key={cert.name} className="rounded-sm border border-white/15 px-2.5 py-1 text-caption text-gray-300">
              {cert.name}
              {certificationKeys[cert.name] ? `, ${t(`common:certifications.${certificationKeys[cert.name]}`)}` : ''}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-caption text-gray-400">
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
