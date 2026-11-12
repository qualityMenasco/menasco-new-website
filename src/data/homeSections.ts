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
  { id: 'hero', theme: 'dark' }, // HomeHeroEditorial — bg-ink
  { id: 'stats', theme: 'light' }, // CompanyStatistics — warmwhite
  { id: 'data-center', theme: 'dark' }, // DataCenterFeature — bg-ink
  { id: 'about', theme: 'light' }, // CompanyIntroduction — warmwhite
  { id: 'services', theme: 'light' }, // ServicesShowcase — warmwhite
  { id: 'projects', theme: 'light' }, // FeaturedProjectsEditorial — stone
  { id: 'sectors', theme: 'light' }, // SectorsShowcase — warmwhite
  { id: 'bim', theme: 'dark' }, // DigitalEngineering — charcoal
  { id: 'manufacturing', theme: 'light' }, // PrefabricationFeature — warmwhite
  { id: 'quality', theme: 'light' }, // QualityAndSafety — stone
  { id: 'regional-presence', theme: 'light' }, // RegionalPresence — warmwhite
  { id: 'careers', theme: 'light' }, // CareersPreview — stone
];

export const homeSectionIds = homeSections.map((section) => section.id);

export const homeSectionThemeById: Record<string, Theme> = Object.fromEntries(
  homeSections.map((section) => [section.id, section.theme]),
);
