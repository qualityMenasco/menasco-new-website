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
 * see src/data/projects.ts for the per-project category field. `Hospitality`
 * and `Landmark Entertainment` were then merged back into one combined
 * sector, `Hospitality & Landmark Entertainment` (2026-09-30), leaving
 * three categories.
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
  'hospitality-landmark-entertainment': {
    id: 'hospitality-landmark-entertainment',
    slug: 'hospitality-landmark-entertainment',
    title: 'Hospitality & Landmark Entertainment',
    description: 'High-performance MEP delivery for premium hospitality, resort, cultural landmark, and entertainment destination environments.',
    order: 2,
    featuredProjectId: 'qiddiya',
  },
  'advanced-technical-facilities': {
    id: 'advanced-technical-facilities',
    slug: 'advanced-technical-facilities',
    title: 'Advanced Technical Facilities',
    description: 'Specialist engineering for data centres, mission-critical, healthcare, energy, and technically demanding facilities.',
    order: 3,
    featuredProjectId: null,
  },
  // Added 2026-09-30 as an approved taxonomy addition — no projects exist for
  // it yet, so `description` deliberately carries no discipline/capability
  // language (no civil works, roads, utilities claims etc. — none of that is
  // approved). See scripts/generate-llms.ts, which excludes any category
  // with zero projects from the public sector listing, so this text is not
  // published anywhere until real projects justify a real description.
  'infrastructure-utilities': {
    id: 'infrastructure-utilities',
    slug: 'infrastructure-utilities',
    title: 'Infrastructure & Utilities',
    description: 'Category reserved for future projects — detailed scope has not yet been published.',
    order: 4,
    featuredProjectId: null,
  },
};

export const projectCategoryList = Object.values(projectCategories).sort((a, b) => a.order - b.order);

/**
 * Old category slugs this taxonomy replaced, mapped to their closest current
 * equivalent — kept only so existing bookmarks/links using `?sector=<old-slug>`
 * (or the retired per-category routes) still land on the right category
 * instead of silently landing on "All Projects".
 *
 * `hotels` and `landmark-entertainment` were themselves merged into
 * `hospitality-landmark-entertainment` (2026-09-30) — both map here now.
 */
export const legacyCategorySlugMap: Record<string, string> = {
  'hotel-residential': 'residential-commercial',
  hotels: 'hospitality-landmark-entertainment',
  'landmark-entertainment': 'hospitality-landmark-entertainment',
  'mission-critical': 'advanced-technical-facilities',
};

/** Resolves a possibly-legacy slug (from `?sector=` or an old route) to a real, current category slug — or null if neither matches. */
export function resolveCategorySlug(slug: string | null): string | null {
  if (!slug) return null;
  if (slug in projectCategories) return slug;
  return legacyCategorySlugMap[slug] ?? null;
}
