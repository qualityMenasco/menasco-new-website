import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { SectorFilterChips } from '../components/SectorFilterChips';
import { MobileProjectCard } from '../components/MobileProjectCard';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';
import { projects } from '../../data/projects';
import { projectCategoryList, resolveCategorySlug } from '../../data/projectCategories';
import { getProjectImage } from '../../data/images';
import { prioritizeProjectsByCategory } from '../../lib/projectOrdering';
import { translateProjectLocation } from '../../lib/projectLocation';

const categorizedProjects = projects.filter((project) => project.category);

// Matches the fixed 2-column mobile grid so the first row loads eagerly.
const PRIORITY_IMAGE_COUNT = 2;

// Same category desktop's ProjectCategoriesPage uses to render a dark
// watermark tile instead of a photo (these projects have no photography).
const ADVANCED_TECHNICAL_FACILITIES_SLUG = 'advanced-technical-facilities';

const categoryKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  hotels: 'hospitality',
  'landmark-entertainment': 'landmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
};

/** Project Categories hub — the single entry point the "Projects / Sectors" nav item opens directly. */
export default function ProjectsSectorsPage() {
  const { t } = useTranslation(['projects', 'nav']);
  const [searchParams] = useSearchParams();
  const categoryTitle = (slug: string) => t(`projects:categories.${categoryKeys[slug] ?? slug}.title`);
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

  return (
    <>
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
        <SectionHeader
          eyebrow={t('nav:projectsSectors')}
          heading={t('projects:categoriesPage.title')}
          headingAs="h2"
          description={t('projects:mobile.description')}
        />

        <div className="mt-5">
          <SectorFilterChips
            options={projectCategoryList.map((category) => ({ slug: category.slug, title: categoryTitle(category.slug) }))}
            activeSlug={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        <p className="mt-4 text-small text-gray-500">
          {activeCategory
            ? t('projects:categoriesPage.categoryFirst', { category: categoryTitle(activeCategory), count: categorizedProjects.length })
            : t('projects:categoriesPage.showingAll', { count: categorizedProjects.length })}
        </p>

        <div aria-live="polite" className="sr-only">
          {activeCategory
            ? t('projects:categoriesPage.categoryFirst', { category: categoryTitle(activeCategory), count: categorizedProjects.length })
            : ''}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {visibleProjects.map((project, index) => (
            <MobileProjectCard
              key={project.id}
              title={project.title}
              categoryLabel={categoryTitle(project.category!)}
              location={translateProjectLocation(t, project.location)}
              href={`/projects/${project.slug}`}
              priority={index < PRIORITY_IMAGE_COUNT}
              {...(project.category === ADVANCED_TECHNICAL_FACILITIES_SLUG
                ? { variant: 'icon' as const }
                : { image: getProjectImage(project.heroImage || undefined, project.slug) })}
            />
          ))}
        </div>
      </section>
    </>
  );
}
