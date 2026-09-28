import type { Theme } from '../types';

export interface HomeSectionMeta {
  id: string;
  theme: Theme;
}

/**
 * Every major homepage section, top to bottom, tagged with the light/dark
 * theme matching its own `<Section background="...">` (see each section's
 * component for the source of truth on background). Single list consumed by
 * HomePage.tsx (anchor ids, auto-scroll sequence) and SiteHeader.tsx (so the
 * always-transparent home header can switch its text colour to match
 * whichever section is currently behind it).
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
