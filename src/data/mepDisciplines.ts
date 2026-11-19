/**
 * In-page anchors for the four MEP disciplines on /services/mep. Links to
 * `/services/mep#<anchor>` (footer sub-service links, src/data/navigation.ts)
 * land on the Technical Disciplines section with that discipline's sheet open
 * (src/components/services/mep/MepDisciplineSheets.tsx).
 */
export const MEP_DISCIPLINE_ANCHORS = {
  mechanical: 'mechanical',
  electrical: 'electrical',
  plumbing: 'plumbing',
  fire: 'fire-protection',
} as const;

export type MepDisciplineId = keyof typeof MEP_DISCIPLINE_ANCHORS;
