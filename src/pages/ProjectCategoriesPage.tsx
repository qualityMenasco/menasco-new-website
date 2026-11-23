import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ProjectsHero } from '../components/projects/ProjectsHero';
import { SectorFilterCard } from '../components/projects/SectorFilterCard';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Section } from '../components/layout/Section';
import { Grid } from '../components/layout/Grid';
import { Stack } from '../components/layout/Stack';
import { Text } from '../components/typography/Typography';
import { projectCategoryList, resolveCategorySlug } from '../data/projectCategories';
import { publishedProjects, deriveCapacityBadge } from '../data/projects';
import { getProjectImage } from '../data/images';
import { prioritizeProjectsByCategory } from '../lib/projectOrdering';
import { translateProjectLocation } from '../lib/projectLocation';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

// Only categorized projects participate in this view — every project
// belongs to exactly one category here, so uncategorized entries (pending
// classification) simply sit outside this taxonomy rather than being guessed.
const categorizedProjects = publishedProjects.filter((project) => project.category);

/** Projects per category, shown on each filter card. */
const categoryCounts = categorizedProjects.reduce<Record<string, number>>((acc, project) => {
  acc[project.category!] = (acc[project.category!] ?? 0) + 1;
  return acc;
}, {});

const ADVANCED_TECHNICAL_FACILITIES_SLUG = 'advanced-technical-facilities';

// Matches the widest grid breakpoint (Grid variant="three" → lg:grid-cols-3)
// so the first rendered row loads eagerly regardless of viewport width.
const PRIORITY_IMAGE_COUNT = 3;

const categoryKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  'hospitality-landmark-entertainment': 'hospitalityLandmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
  'infrastructure-utilities': 'infrastructureUtilities',
};

export default function ProjectCategoriesPage() {
  const { t } = useTranslation(['projects', 'common']);
  const reducedMotion = useReducedMotion();
  const [searchParams] = useSearchParams();
  const categoryTitle = (slug: string) => t(`categories.${categoryKeys[slug] ?? slug}.title`);
  // A category can exist in the taxonomy before any project is assigned to
  // it (e.g. Infrastructure & Utilities). Selecting one never hides/errors —
  // it just reorders nothing — so without this check the status line below
  // would claim "<category> projects first, N total" while nothing actually
  // matched, silently implying results that don't exist.
  const categoryHasNoMatches = (slug: string) => !categorizedProjects.some((project) => project.category === slug);

  // `category` is the current param; `sector` is accepted too, purely for
  // old links from before the 2026-08-06 move to four categories — both are
  // resolved through the same legacy-slug map, so an old `?sector=mission-
  // critical` link still lands on Advanced Technical Facilities.
  const deepLinkedCategory = resolveCategorySlug(searchParams.get('category') ?? searchParams.get('sector'));
  const seoTitle = deepLinkedCategory
    ? t(`categories.${categoryKeys[deepLinkedCategory] ?? deepLinkedCategory}.seoTitle`, t('seo.title'))
    : t('seo.title');
  const seoDescription = deepLinkedCategory
    ? t(`categories.${categoryKeys[deepLinkedCategory] ?? deepLinkedCategory}.description`, t('seo.description'))
    : t('seo.description');
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(deepLinkedCategory);
  const [announcement, setAnnouncement] = useState('');
  const isFirstRender = useRef(true);

  // Arriving with a category already selected (e.g. from a shared link) —
  // scroll straight to the gallery rather than leaving the user at the top.
  useEffect(() => {
    if (!deepLinkedCategory) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById('project-gallery')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Category front-loads that category and shuffles the rest (see
  // prioritizeProjectsByCategory); it never removes a project.
  // The location filter was removed 2026-11-23 (client request).
  const visibleProjects = useMemo(
    () => prioritizeProjectsByCategory(categorizedProjects, activeCategory, ADVANCED_TECHNICAL_FACILITIES_SLUG),
    [activeCategory],
  );

  const handleSelectCategory = (value: string | null) => {
    setActiveCategory(value);
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      setAnnouncement(
        value
          ? categoryHasNoMatches(value)
            ? t('common:pendingContent.notice')
            : t('categoriesPage.categoryFirst', { category: categoryTitle(value), count: categorizedProjects.length })
          : t('categoriesPage.showingAll', { count: categorizedProjects.length }),
      );
    }
    requestAnimationFrame(() => {
      document.getElementById('project-gallery')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  };

  // With a sector selected, its projects form the first group and the rest follow
  // under a divider; with none selected, everything is one group.
  const selectedProjects = activeCategory ? visibleProjects.filter((project) => project.category === activeCategory) : visibleProjects;
  const otherProjects = activeCategory ? visibleProjects.filter((project) => project.category !== activeCategory) : [];

  const renderGrid = (list: typeof visibleProjects, offset: number) => (
    <Grid variant="three" gap="md">
      <AnimatePresence mode="popLayout">
        {list.map((project, index) => (
          <motion.div
            key={project.id}
            layout={!reducedMotion}
            initial={reducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <ProjectCard
              title={project.title}
              href={`/projects/${project.slug}`}
              {...(project.category === ADVANCED_TECHNICAL_FACILITIES_SLUG
                ? { variant: 'icon' as const }
                : { image: getProjectImage(project.heroImage || undefined, project.slug) })}
              location={translateProjectLocation(t, project.location)}
              capacity={deriveCapacityBadge(project)}
              muted={hoveredSlug !== null && !activeCategory && project.category !== hoveredSlug}
              priority={offset + index < PRIORITY_IMAGE_COUNT}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </Grid>
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
          { label: 'Projects', path: '/projects/categories' },
        ]}
      />
      <ProjectsHero spacing="sm" title={t('categoriesPage.title')} description={t('categoriesPage.description')} />

      <Section spacing="sm" background="warmwhite" className="!pt-0">
        <div
          className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4 lg:gap-x-8"
          onMouseLeave={() => setHoveredSlug(null)}
        >
          {projectCategoryList.map((category) => (
            <SectorFilterCard
              key={category.slug}
              title={categoryTitle(category.slug)}
              count={t('categoriesPage.featuredCount', { count: categoryCounts[category.slug] ?? 0 })}
              isActive={activeCategory === category.slug}
              isDimmed={hoveredSlug !== null && hoveredSlug !== category.slug}
              onHoverStart={() => setHoveredSlug(category.slug)}
              onHoverEnd={() => setHoveredSlug(null)}
              onSelect={() => handleSelectCategory(activeCategory === category.slug ? null : category.slug)}
            />
          ))}
        </div>
      </Section>

      <Section spacing="sm" background="warmwhite" className="!pt-6">
          <div id="project-gallery" className="scroll-mt-28">
            <Stack space="lg">
              <div aria-live="polite" className="sr-only">
                {announcement}
              </div>

              <div className="flex min-h-[2.5rem] items-center justify-between">
                <Text variant="small" muted>
                  {activeCategory && categoryHasNoMatches(activeCategory)
                    ? t('common:pendingContent.notice')
                    : activeCategory
                      ? t('categoriesPage.categoryFirst', { category: categoryTitle(activeCategory), count: categorizedProjects.length })
                      : t('categoriesPage.showingAll', { count: categorizedProjects.length })}
                </Text>
                <AnimatePresence>
                  {activeCategory && (
                    <motion.button
                      type="button"
                      initial={reducedMotion ? undefined : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reducedMotion ? undefined : { opacity: 0 }}
                      onClick={() => handleSelectCategory(null)}
                      className="text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700"
                    >
                      {t('categoriesPage.allProjects')}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {activeCategory && !categoryHasNoMatches(activeCategory) && (
                <Text className="font-display font-semibold text-ink">
                  {t('categoriesPage.categoryProjects', { category: categoryTitle(activeCategory) })}
                </Text>
              )}

              {/* Selected sector first, then a labelled divider and every other project
                  (client request 2026-11-23); with no sector selected, one grid. */}
              {renderGrid(selectedProjects, 0)}
              {activeCategory && otherProjects.length > 0 && selectedProjects.length > 0 && (
                <div className="flex items-center gap-4 pt-4 md:pt-6">
                  <span className="shrink-0 font-display text-caption font-semibold uppercase tracking-widest text-gray-500 rtl:tracking-normal">
                    {t('categoriesPage.otherProjects')}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-gray-300" />
                </div>
              )}
              {otherProjects.length > 0 && renderGrid(otherProjects, selectedProjects.length)}
            </Stack>
          </div>
      </Section>
    </>
  );
}
