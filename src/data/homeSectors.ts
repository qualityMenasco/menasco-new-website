/**
 * Sector copy keys and THE sector photo set. Every place that shows a sector with
 * a photo reads `sectorImages` (home "Where we work" tiles on desktop, the home
 * sector rail on phones/tablets, EPC "Industry Applications"), so the four
 * photos are always the same everywhere: change one here and every surface follows.
 */
export const sectorKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  'hospitality-landmark-entertainment': 'hospitalityLandmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
  'infrastructure-utilities': 'infrastructureUtilities',
};

/**
 * One cohesive set (client request 2026-11-24): generic, unidentifiable scenes (no
 * landmarks or projects MENASCO didn't build), public domain, CC0 (no attribution
 * required) or client-supplied, with one shared light finish baked into the files so they read as a set:
 * natural colour, saturation 82%, contrast 106%, no tint (a blue brand tint was tried
 * and rejected, 2026-11-24). 1200 px wide JPEG. Sources:
 *   advanced-technical-facilities: surgical team operating under theatre lights, IV line in the
 *     foreground, supplied by the client 2026-11-24 (its own teal grade kept; light finish only).
 *   infrastructure-utilities: central chilled-water plant, Utility Annex, Kennedy Space
 *     Center (NASA/Kim Shiflett, KSC-20190724-PH_KLS02_0055; NASA imagery, public
 *     domain; must not imply NASA endorsement). Bottom 18% (bare floor) cropped.
 *   residential-commercial: "Imposing white skyscraper", Jonathan Denney / Unsplash (CC0, Wikimedia Commons)
 *   hospitality-landmark-entertainment: observation wheel against blue sky, "Ferris wheel sky",
 *     Dean Moriarty (CC0, ISO Republic); left 22% cropped so the hub stays in frame.
 *     Client request 2026-11-24.
 * Give any replacement photo the same finish so the set stays consistent.
 */
export const sectorImages: Record<string, string> = {
  'advanced-technical-facilities': '/sectors/Menasco_Sector_Mission_Critical_Surgical_Theatre.jpg',
  'infrastructure-utilities': '/sectors/Menasco_Sector_Infrastructure_Chilled_Water_Plant.jpg',
  'residential-commercial': '/sectors/Menasco_Sector_Residential_Commercial_Tower.jpg',
  'hospitality-landmark-entertainment': '/sectors/Menasco_Sector_Hospitality_Observation_Wheel.jpg',
};
