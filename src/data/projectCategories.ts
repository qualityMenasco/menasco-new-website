export interface ProjectCategoryMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** Display order for the category cards/nav — lower first. */
  order: number;
  /** Optional representative image for this category's card. */
  image?: string;
  /** Project id (see src/data/projects.ts) to feature within this category's page, if any. */
  featuredProjectId: string | null;
}

/**
 * MENASCO's own portfolio isn't published with a category taxonomy — this
 * grouping is an editorial/browsing organization for this site, not a
 * verified fact about any individual project. Descriptions are generic,
 * scope-level language, not project-specific claims.
 *
 * Replaced the original three categories (Hotel / Residential, Landmark
 * Entertainment, Mission-Critical) with four (2026-08-06) — every project
 * was reassigned to whichever of these best represents its primary use;
 * see src/data/projects.ts for the per-project category field.
 */
export const projectCategories: Record<string, ProjectCategoryMeta> = {
  'residential-commercial': {
    id: 'residential-commercial',
    slug: 'residential-commercial',
    title: 'Residential / Commercial',
    description: 'Integrated engineering solutions for residential, commercial, office, and mixed-use developments.',
    order: 1,
    featuredProjectId: 'vela-by-omniyat',
  },
  hotels: {
    id: 'hotels',
    slug: 'hotels',
    title: 'Hospitality',
    description: 'High-performance MEP delivery for premium hospitality, resort, and hotel environments.',
    order: 2,
    featuredProjectId: null,
  },
  'landmark-entertainment': {
    id: 'landmark-entertainment',
    slug: 'landmark-entertainment',
    title: 'Landmark Entertainment',
    description: 'Complex engineering for destination, entertainment, cultural, and landmark developments.',
    order: 3,
    featuredProjectId: 'qiddiya',
  },
  'advanced-technical-facilities': {
    id: 'advanced-technical-facilities',
    slug: 'advanced-technical-facilities',
    title: 'Advanced Technical Facilities',
    description: 'Specialist engineering for data centres, mission-critical, healthcare, energy, and technically demanding facilities.',
    order: 4,
    featuredProjectId: null,
  },
};

export const projectCategoryList = Object.values(projectCategories).sort((a, b) => a.order - b.order);

/**
 * Old category slugs this taxonomy replaced (2026-08-06), mapped to their
 * closest new equivalent — kept only so existing bookmarks/links using
 * `?sector=<old-slug>` (or the retired per-category routes) still land on
 * the right category instead of silently landing on "All Projects".
 */
export const legacyCategorySlugMap: Record<string, string> = {
  'hotel-residential': 'residential-commercial',
  'landmark-entertainment': 'landmark-entertainment',
  'mission-critical': 'advanced-technical-facilities',
};

/** Resolves a possibly-legacy slug (from `?sector=` or an old route) to a real, current category slug — or null if neither matches. */
export function resolveCategorySlug(slug: string | null): string | null {
  if (!slug) return null;
  if (slug in projectCategories) return slug;
  return legacyCategorySlugMap[slug] ?? null;
}
