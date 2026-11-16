import type { Theme } from '../types';

export interface HomeSectionMeta {
  id: string;
  theme: Theme;
}

/**
 * Every major homepage section, top to bottom, tagged with the light/dark
 * theme matching its own `<Section background="...">` (see each section's
 * component for the source of truth on background). Used by HomePage.tsx for
 * anchor ids and the auto-scroll sequence. The header no longer reads these
 * themes — it samples the real background behind it on every page (see
 * src/lib/useBackdropTheme.ts) — so `theme` here is documentation only.
 */
export const homeSections: HomeSectionMeta[] = [
  { id: 'hero', theme: 'dark' }, // HomeHeroEditorial — bg-ink (company stats strip along its bottom edge, id "stats")
  { id: 'projects', theme: 'light' }, // FeaturedProjectsEditorial — warmwhite
  { id: 'data-center', theme: 'dark' }, // DataCenterFeature — bg-ink
  { id: 'services', theme: 'light' }, // ServicesShowcase — warmwhite (About MENASCO intro + What we deliver)
  { id: 'sectors', theme: 'light' }, // SectorsShowcase — stone
  { id: 'regional-presence', theme: 'light' }, // RegionalPresence — warmwhite
  { id: 'bim', theme: 'light' }, // EngineeringDelivery — stone (BIM card; the manufacturing card carries id "manufacturing")
  { id: 'quality', theme: 'light' }, // QualityAndSafety — stone
  { id: 'careers', theme: 'light' }, // CareersPreview — stone
];

export const homeSectionIds = homeSections.map((section) => section.id);

export const homeSectionThemeById: Record<string, Theme> = Object.fromEntries(
  homeSections.map((section) => [section.id, section.theme]),
);
