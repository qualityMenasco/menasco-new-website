import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { SectorFilterChips } from '../components/SectorFilterChips';
import { MobileProjectCard } from '../components/MobileProjectCard';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';
import { publishedProjects } from '../../data/projects';
import { projectCategoryList, resolveCategorySlug } from '../../data/projectCategories';
import { getProjectImage } from '../../data/images';
import { prioritizeProjectsByCategory } from '../../lib/projectOrdering';
import { translateProjectLocation } from '../../lib/projectLocation';

const categorizedProjects = publishedProjects.filter((project) => project.category);

// Matches the fixed 2-column mobile grid so the first row loads eagerly.
const PRIORITY_IMAGE_COUNT = 2;

// Same category desktop's ProjectCategoriesPage uses to render a dark
// watermark tile instead of a photo (these projects have no photography).
const ADVANCED_TECHNICAL_FACILITIES_SLUG = 'advanced-technical-facilities';

const categoryKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  'hospitality-landmark-entertainment': 'hospitalityLandmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
  'infrastructure-utilities': 'infrastructureUtilities',
};

/** Project Categories hub — the single entry point the "Projects / Sectors" nav item opens directly. */
export default function ProjectsSectorsPage() {
  const { t } = useTranslation(['projects', 'nav', 'common']);
  const [searchParams] = useSearchParams();
  const categoryTitle = (slug: string) => t(`projects:categories.${categoryKeys[slug] ?? slug}.title`);
  // A category can exist before any project is assigned to it (e.g.
  // Infrastructure & Utilities) — see the matching desktop page for why this
  // must not fall through to "X projects first" wording.
  const categoryHasNoMatches = (slug: string) => !categorizedProjects.some((project) => project.category === slug);
  // `category` is current; `sector` is accepted too, purely for old links
  // from before the 2026-08-06 move to four categories.
  const deepLinkedCategory = resolveCategorySlug(searchParams.get('category') ?? searchParams.get('sector'));
  const [activeCategory, setActiveCategory] = useState<string | null>(deepLinkedCategory);
  const seoTitle = deepLinkedCategory
    ? t(`projects:categories.${categoryKeys[deepLinkedCategory] ?? deepLinkedCategory}.seoTitle`, t('projects:seo.title'))
    : t('projects:seo.title');
  const seoDescription = deepLinkedCategory
    ? t(`projects:categories.${categoryKeys[deepLinkedCategory] ?? deepLinkedCategory}.description`, t('projects:seo.description'))
    : t('projects:seo.description');

  // Selecting a category never hides anything — it moves that category's
  // projects to the front and shuffles the rest underneath for variety
  // (same shared, seeded logic the desktop page uses).
  const visibleProjects = useMemo(
    () => prioritizeProjectsByCategory(categorizedProjects, activeCategory),
    [activeCategory],
  );

  const selectedProjects = activeCategory ? visibleProjects.filter((project) => project.category === activeCategory) : visibleProjects;
  const otherProjects = activeCategory ? visibleProjects.filter((project) => project.category !== activeCategory) : [];
  const renderGrid = (list: typeof visibleProjects, offset: number) => (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {list.map((project, index) => (
        <MobileProjectCard
          key={project.id}
          title={project.title}
          location={translateProjectLocation(t, project.location)}
          href={`/projects/${project.slug}`}
          priority={offset + index < PRIORITY_IMAGE_COUNT}
          {...(project.category === ADVANCED_TECHNICAL_FACILITIES_SLUG
            ? { variant: 'icon' as const }
            : { image: getProjectImage(project.heroImage || undefined, project.slug) })}
        />
      ))}
    </div>
  );

  return (
    <>
      <NavSectionH1 section="projectsSectors" />
      <SEO
        title={seoTitle}
        description={seoDescription}
        path="/projects/categories"
        pageType="CollectionPage"
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Projects / Sectors', path: '/projects/categories' },
        ]}
      />

      <section className="px-4 py-8">
        {/* No intro line on phones and tablets (client request 2026-11-23); desktop keeps it. */}
        <SectionHeader eyebrow={t('nav:projectsSectors')} heading={t('projects:categoriesPage.title')} headingAs="h2" />

        <div className="mt-4">
          <SectorFilterChips
            options={projectCategoryList.map((category) => ({ slug: category.slug, title: categoryTitle(category.slug) }))}
            activeSlug={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        <p className="mt-3 text-small text-gray-500">
          {activeCategory
            ? categoryHasNoMatches(activeCategory)
              ? t('common:pendingContent.notice')
              : t('projects:categoriesPage.categoryFirst', { category: categoryTitle(activeCategory), count: categorizedProjects.length })
            : t('projects:categoriesPage.showingAll', { count: categorizedProjects.length })}
        </p>

        <div aria-live="polite" className="sr-only">
          {activeCategory
            ? categoryHasNoMatches(activeCategory)
              ? t('common:pendingContent.notice')
              : t('projects:categoriesPage.categoryFirst', { category: categoryTitle(activeCategory), count: categorizedProjects.length })
            : ''}
        </div>

        {/* Selected sector first, then a labelled divider and the other projects (client request 2026-11-23). */}
        {renderGrid(selectedProjects, 0)}
        {activeCategory && otherProjects.length > 0 && selectedProjects.length > 0 && (
          <div className="mt-6 flex items-center gap-3">
            <span className="shrink-0 text-caption font-semibold uppercase tracking-widest text-gray-500 rtl:tracking-normal">{t('projects:categoriesPage.otherProjects')}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-gray-300" />
          </div>
        )}
        {otherProjects.length > 0 && renderGrid(otherProjects, selectedProjects.length)}
      </section>
    </>
  );
}
