import { useTranslation } from 'react-i18next';
import { footerCompanyLinks, footerProjectLinks, footerServiceLinks } from '../data/navigation';

const footerCompanyKeys: Record<string, string> = {
  'About MENASCO': 'aboutMenasco',
  'Quality & Safety': 'qualitySafety',
  'Community & People': 'communityPeople',
  'Innovation & Technology': 'innovationTechnology',
  Team: 'team',
  Newsroom: 'newsroom',
  Careers: 'careers',
};

const footerProjectKeys: Record<string, string> = {
  'Projects & Sectors': 'projectsAndSectors',
  'Residential & Commercial': 'sectorsList.residentialCommercial',
  'Hospitality & Landmark Entertainment': 'sectorsList.hospitalityLandmarkEntertainment',
  'Mission-Critical Facilities': 'sectorsList.missionCriticalFacilities',
  'Infrastructure & Utilities': 'sectorsList.infrastructureUtilities',
};

export interface FooterLinkGroupData {
  id: 'services' | 'company' | 'projects';
  heading: string;
  links: { label: string; href: string }[];
}

/**
 * The footer's link columns, translated and in display order (Services,
 * Company, Projects). Shared by the desktop and mobile footers so the two
 * can't drift apart.
 */
export function useFooterLinkGroups(): FooterLinkGroupData[] {
  const { t } = useTranslation(['nav', 'common']);
  const translated = (links: { label: string; href: string }[], keyMap: Record<string, string>) =>
    links.map((link) => ({ label: t(keyMap[link.label] ?? link.label), href: link.href }));

  return [
    { id: 'services', heading: t('common:footer.services'), links: footerServiceLinks.map((link) => ({ label: t(link.i18nKey), href: link.href })) },
    { id: 'company', heading: t('common:footer.company'), links: translated(footerCompanyLinks, footerCompanyKeys) },
    { id: 'projects', heading: t('common:footer.projects'), links: translated(footerProjectLinks, footerProjectKeys) },
  ];
}
