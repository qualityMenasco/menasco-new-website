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

/**
 * Homepage-only card order. Projects pages and the contact form keep the
 * taxonomy order from projectCategories.ts; any category not listed here
 * falls in after these, in that taxonomy order.
 */
const homepageOrder = [
  'advanced-technical-facilities',
  'infrastructure-utilities',
  'residential-commercial',
  'hospitality-landmark-entertainment',
];

const homepageRank = (slug: string) => {
  const rank = homepageOrder.indexOf(slug);
  return rank === -1 ? homepageOrder.length : rank;
};

export const sectors: Sector[] = [...projectCategoryList]
  .sort((a, b) => homepageRank(a.slug) - homepageRank(b.slug))
  .map((category) => ({
    id: category.id,
    slug: category.slug,
    icon: iconBySlug[category.slug] ?? 'building',
  }));
