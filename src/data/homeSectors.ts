/**
 * Homepage "Where we work" tiles, shared by the desktop and mobile trees:
 * the i18n key for each sector's copy and the photo shown on its tile
 * (site photos already used elsewhere for that kind of work).
 */
export const sectorKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  'hospitality-landmark-entertainment': 'hospitalityLandmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
  'infrastructure-utilities': 'infrastructureUtilities',
};

export const sectorImages: Record<string, string> = {
  'advanced-technical-facilities': '/data-center-poster.jpg',
  'infrastructure-utilities': '/electrical-switchgear-room.jpg',
  'residential-commercial': 'https://menascouae.com/wp-content/uploads/2025/12/Casa-Cavalli-scaled.png',
  'hospitality-landmark-entertainment': '/assets/projects/qiddiya/qiddiya-speed-park-aerial.jpg',
};
