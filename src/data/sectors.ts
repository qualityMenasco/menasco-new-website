import { projectCategoryList } from './projectCategories';

export type SectorIcon = 'building' | 'hotel' | 'briefcase' | 'route' | 'server' | 'factory' | 'layers' | 'ticket';

export interface Sector {
  id: string;
  slug: string;
  icon: SectorIcon;
}

/**
 * Icon-only overlay for the homepage Sectors section — everything else
 * (name, description, order) is derived directly from `projectCategoryList`
 * in ./projectCategories.ts, the single source of truth for the category
 * taxonomy. This file previously carried its own hand-maintained `name`/
 * `description` copy that claimed to be "aligned" with projectCategories.ts
 * but had drifted from it (e.g. "HOSPITALITY & LEISURE" here vs.
 * "Hospitality" there); those fields were never actually read by
 * `SectorsShowcase.tsx`, which has always pulled its displayed title and
 * description from the translated `projects:categories.*` strings — so
 * they were dead, misleading duplication rather than real data. Deriving
 * this array instead means there's exactly one place a category's name or
 * description can be edited.
 */
const iconBySlug: Record<string, SectorIcon> = {
  'residential-commercial': 'building',
  'hospitality-landmark-entertainment': 'hotel',
  'advanced-technical-facilities': 'server',
  'infrastructure-utilities': 'route',
};

export const sectors: Sector[] = projectCategoryList.map((category) => ({
  id: category.id,
  slug: category.slug,
  icon: iconBySlug[category.slug] ?? 'building',
}));
