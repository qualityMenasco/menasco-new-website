import { Download, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { IconComponent } from '../types';
import {
  CertificationStrip,
  CompanySummary,
  ContactBlock,
  FooterContainer,
  FooterLinkGroup,
  LegalRow,
  LocationBlock,
  SocialLinks,
} from '../components/navigation';
import { ButtonLink } from '../components/ui/Button';
import { MenascoLogo } from '../components/brand/MenascoLogo';
import { Text } from '../components/typography/Typography';
import { certifications } from '../data/certifications';
import { officeLocations, primaryContact } from '../data/locations';
import { footerCompanyLinks, footerLegalLinks, footerProjectLinks, servicesNavigation } from '../data/navigation';
import { socialLinks } from '../data/socialLinks';
import { COMPANY_PROFILE_PATH } from '../seo/constants';

const socialIcons: Record<string, IconComponent> = {
  LinkedIn: Linkedin,
  Instagram: Instagram,
  Facebook: Facebook,
  X: Twitter,
};

const footerCompanyKeys: Record<string, string> = {
  'About MENASCO': 'aboutMenasco',
  'Quality & Safety': 'qualitySafety',
  'ESG Reporting': 'esgReporting',
  'Innovation & Technology': 'innovationTechnology',
  Team: 'team',
  Newsroom: 'newsroom',
  Careers: 'careers',
};

const footerProjectKeys: Record<string, string> = {
  'Projects & Sectors': 'projectsAndSectors',
  'Residential & Commercial': 'sectorsList.residentialCommercial',
  'Hospitality & Leisure': 'sectorsList.hospitalityLeisure',
  'Landmark & Entertainment': 'sectorsList.landmarkEntertainment',
  'Mission-Critical Facilities': 'sectorsList.missionCriticalFacilities',
  'Infrastructure & Utilities': 'sectorsList.infrastructureUtilities',
};

const footerLegalKeys: Record<string, string> = {
  'Privacy Policy': 'privacyPolicy',
  Terms: 'terms',
  'LYNXqc Privacy Policy': 'lynxqcPrivacyPolicy',
};

const servicesNavKeys: Record<string, string> = {
  'Mechanical Systems': 'servicesList.mechanical',
  'Electrical & ELV Systems': 'servicesList.electrical',
  'Plumbing, Water & Drainage Systems': 'servicesList.plumbing',
  'Fire Protection & Life Safety Systems': 'servicesList.firesProtection',
  'BIM & Digital Engineering': 'servicesList.bimDigitalEngineering',
  'Manufacturing & MEP Prefabrication': 'servicesList.manufacturingPrefabrication',
};

const locationKeys: Record<string, string> = { dubai: 'dubai', riyadh: 'riyadh', cairo: 'cairo', london: 'london' };

const certificationScopeKeys: Record<string, string> = {
  'ISO 9001:2015': 'qualityManagement',
  'ISO 14001:2015': 'environmentalManagement',
  'ISO 45001:2018': 'occupationalHealthSafety',
};

export function SiteFooter() {
  const { t } = useTranslation(['nav', 'common']);
  const headquarters = officeLocations.find((location) => location.isHeadquarters) ?? officeLocations[0];
  const regionalOffices = officeLocations.filter((location) => location.id !== headquarters.id);
  const verifiedSocialLinks = socialLinks
    .filter((link) => link.verificationStatus === 'verified' && link.href)
    .map((link) => ({ platform: link.platform, href: link.href, icon: socialIcons[link.platform] }))
    .filter((link) => Boolean(link.icon));

  const translatedLinks = (links: { label: string; href: string }[], keyMap: Record<string, string>) =>
    links.map((link) => ({ label: t(keyMap[link.label] ?? link.label), href: link.href }));

  return (
    <FooterContainer theme="dark">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
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
        </div>
        <FooterLinkGroup heading={t('common:footer.company')} links={translatedLinks(footerCompanyLinks, footerCompanyKeys)} />
        <FooterLinkGroup heading={t('common:footer.services')} links={translatedLinks(servicesNavigation, servicesNavKeys)} />
        <FooterLinkGroup heading={t('common:footer.projects')} links={translatedLinks(footerProjectLinks, footerProjectKeys)} />
      </div>

      <div className="grid grid-cols-1 gap-12 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
        <ContactBlock
          heading={locationKeys[headquarters.id] ? t(`common:locations.${locationKeys[headquarters.id]}.label`) : headquarters.label}
          address={headquarters.address}
          phone={headquarters.phone}
          email={primaryContact.email}
        />
        {regionalOffices.map((office) => (
          <LocationBlock
            key={office.id}
            name={locationKeys[office.id] ? t(`common:locations.${locationKeys[office.id]}.label`) : office.label}
            address={office.address}
            phone={office.phone}
          />
        ))}
        {verifiedSocialLinks.length > 0 && (
          <div className="flex flex-col gap-4">
            <Text variant="small" muted className="font-semibold uppercase tracking-wide">
              {t('common:footer.follow')}
            </Text>
            <SocialLinks links={verifiedSocialLinks} />
          </div>
        )}
      </div>

      <CertificationStrip
        certifications={certifications.map((certification) =>
          certificationScopeKeys[certification.name]
            ? `${certification.name}, ${t(`common:certifications.${certificationScopeKeys[certification.name]}`)}`
            : certification.name,
        )}
      />

      <LegalRow
        copyrightText={t('common:footer.copyright', { year: new Date().getFullYear() })}
        links={translatedLinks(footerLegalLinks, footerLegalKeys)}
      />
    </FooterContainer>
  );
}
