import type { VerificationStatus } from '../types/content.js';
// The `with { type: 'json' }` import attribute is required by Node's native
// ESM loader whenever a JSON file is imported under NodeNext module
// resolution (api/**/*.ts's build target) — without it, the Vercel API
// function build reports only a TS warning and still "succeeds", but the
// deployed function crashes at module-load time the instant it's invoked
// (before any handler code, including error handling, ever runs), producing
// a bodyless platform 500. The Vite client build (esbuild) accepts this
// same syntax harmlessly, so one import works for both build targets.
import projectsData from './projects.json' with { type: 'json' };

export interface ProjectKeyMetric {
  label: string;
  value: string;
}

export interface ProjectRecord {
  id: string;
  slug: string;
  title: string;
  location: string;
  country: string;
  sector: string;
  status: string;
  year: string;
  client: string;
  developer: string;
  consultant: string;
  mainContractor: string;
  menascoScope: string;
  services: string[];
  description: string;
  featured: boolean;
  heroImage: string;
  gallery: string[];
  seoTitle: string;
  seoDescription: string;
  /** Applies to every field below `title` — the name itself is confirmed, the rest is not. */
  verificationStatus: VerificationStatus;
  /**
   * Editorial browsing category (see src/data/projectCategories.ts) — a site
   * organization choice, not a verified fact about the project. Left
   * undefined where the project type isn't unambiguous from its own
   * (confirmed) title, rather than guessed.
   */
  category?: string;
  /**
   * NOT YET CONFIRMED CONSUMED BY ANY COMPONENT — added 2026-08-05 because
   * the source HTML pages publish these stats and it seemed wasteful to
   * drop verified data on the floor. No ProjectCard / FeaturedProjectPanel
   * prop currently reads either field. Wire them into a detail-page
   * template, or remove them, once that component exists.
   */
  workforceHours?: string;
  safetyRecord?: string;
  /** IT capacity (e.g. "12 MW IT") — shown as a small badge on the project card visual, not baked into the title. */
  capacity?: string;
  /**
   * Up to 3 structured stats for the project detail page's metrics panel.
   * Auto-derived from workforceHours/safetyRecord/capacity at migration time
   * (scripts/cms/migrate-projects-to-content-json.ts) for existing projects;
   * the CMS upload form writes directly to this field for new ones.
   */
  keyMetrics: ProjectKeyMetric[];
  /**
   * 'draft' projects are excluded from the public project listing/filters
   * and are marked noIndex,nofollow with no JSON-LD by the SEO generator
   * (scripts/seo/routes.ts) — this is how "do not publish incomplete
   * projects as indexable pages" is enforced. Every pre-CMS project defaults
   * to 'published' (preserves current live behavior).
   */
  publishState: 'draft' | 'published';
  /**
   * True only for 'vela-by-omniyat' and 'qiddiya' — their slugs are also
   * hardcoded directly into ProjectDetailPage.tsx's CINEMATIC_PROJECTS map,
   * which is the actual mechanism that renders their bespoke scroll-driven
   * experience instead of the standard template. This flag is a second,
   * independent guard: the CMS (api/projects-cms/publish.ts) refuses to
   * delete or bulk-overwrite any record with `protected: true` unless the
   * uploader explicitly confirms the override. Never set this on a new
   * project via CSV/JSON import — it is not a user-settable field.
   */
  protected: boolean;
}

/** The canonical project dataset — see src/data/projects.json (the single file the CMS reads and writes). */
export const projects: ProjectRecord[] = projectsData as ProjectRecord[];

/**
 * Every public LISTING/filter surface (project cards, category pages, the
 * homepage's featured-projects panel) should read this, not `projects`
 * directly — it excludes 'draft' CMS uploads so an incomplete project never
 * appears in public browsing, matching the noIndex gating the SEO generator
 * applies to the same records (scripts/seo/routes.ts). A project's own
 * detail page (`/projects/:slug`) still resolves for a draft via `projects`
 * directly — a direct/preview link intentionally keeps working while it's
 * excluded from everywhere a visitor would discover it by browsing.
 */
export const publishedProjects: ProjectRecord[] = projects.filter((project) => project.publishState === 'published');

/**
 * MENASCO is the main contractor on every project in this portfolio by
 * default — every current record's own `mainContractor` field is empty (see
 * the dataset note below), so this fallback is what actually renders today.
 * A future project where MENASCO held a different role (e.g. a joint
 * venture, or a trade-only scope under someone else's main contract) can
 * still override this by setting `mainContractor` explicitly on its own
 * record — this helper only fills in the default, it never overwrites a
 * populated value.
 */
export const getMainContractor = (project: Pick<ProjectRecord, 'mainContractor'>): string => project.mainContractor || 'MENASCO';