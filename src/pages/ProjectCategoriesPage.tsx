import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ProjectsHero } from '../components/projects/ProjectsHero';
import { SectorFilterCard } from '../components/projects/SectorFilterCard';
import { CountrySidebar, type CountryNavOption } from '../components/projects/CountrySidebar';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Section } from '../components/layout/Section';
import { Grid } from '../components/layout/Grid';
import { Stack } from '../components/layout/Stack';
import { Text } from '../components/typography/Typography';
import { projectCategoryList, resolveCategorySlug } from '../data/projectCategories';
import { projects } from '../data/projects';
import { getProjectImage } from '../data/images';
import { prioritizeProjectsByCategory, prioritizeByField } from '../lib/projectOrdering';
import { translateProjectLocation } from '../lib/projectLocation';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

// Only categorized projects participate in this view — every project
// belongs to exactly one category here, so uncategorized entries (pending
// classification) simply sit outside this taxonomy rather than being guessed.
const categorizedProjects = projects.filter((project) => project.category);

// Derived entirely from project data (first-appearance order), so a new
// country shows up in the nav automatically the moment a project is tagged
// with it — nothing here is a hardcoded country list.
const countryList = Array.from(new Set(categorizedProjects.map((project) => project.country).filter(Boolean)));

function isKnownCountry(value: string | null): value is string {
  return !!value && countryList.includes(value);
}

const ADVANCED_TECHNICAL_FACILITIES_SLUG = 'advanced-technical-facilities';

// Matches the widest grid breakpoint (Grid variant="three" → lg:grid-cols-3)
// so the first rendered row loads eagerly regardless of viewport width.
const PRIORITY_IMAGE_COUNT = 3;

const categoryKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  hotels: 'hospitality',
  'landmark-entertainment': 'landmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
};

export default function ProjectCategoriesPage() {
  const { t } = useTranslation('projects');
  const reducedMotion = useReducedMotion();
  const [searchParams] = useSearchParams();
  const categoryTitle = (slug: string) => t(`categories.${categoryKeys[slug] ?? slug}.title`);

  const countryNavOptions: CountryNavOption[] = useMemo(
    () => [{ value: null, label: t('categoriesPage.allProjects') }, ...countryList.map((country) => ({ value: country, label: country }))],
    [t],
  );

  // `category` is the current param; `sector` is accepted too, purely for
  // old links from before the 2026-08-06 move to four categories — both are
  // resolved through the same legacy-slug map, so an old `?sector=mission-
  // critical` link still lands on Advanced Technical Facilities.
  const deepLinkedCategory = resolveCategorySlug(searchParams.get('category') ?? searchParams.get('sector'));
  const deepLinkedCountry = searchParams.get('country');
  const seoTitle = deepLinkedCategory
    ? t(`categories.${categoryKeys[deepLinkedCategory] ?? deepLinkedCategory}.seoTitle`, t('seo.title'))
    : t('seo.title');
  const seoDescription = deepLinkedCategory
    ? t(`categories.${categoryKeys[deepLinkedCategory] ?? deepLinkedCategory}.description`, t('seo.description'))
    : t('seo.description');
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(deepLinkedCategory);
  const [activeCountry, setActiveCountry] = useState<string | null>(() => (isKnownCountry(deepLinkedCountry) ? deepLinkedCountry : null));
  const [announcement, setAnnouncement] = useState('');
  const isFirstRender = useRef(true);

  // Arriving with a category or country already selected (e.g. from a
  // shared link) — scroll straight to the gallery rather than leaving the
  // user at the top of the page.
  useEffect(() => {
    if (!deepLinkedCategory && !isKnownCountry(deepLinkedCountry)) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById('project-gallery')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Category prioritizes first (front-loads that category, shuffles the
  // rest — see prioritizeProjectsByCategory); country then does a simple,
  // unshuffled partition on top of that same list, pulling its matches to
  // the very front while preserving whatever order they were already in.
  // Neither ever removes a project — both controls compose instead of
  // fighting each other, and either can be used alone or together.
  const visibleProjects = useMemo(() => {
    const byCategory = prioritizeProjectsByCategory(categorizedProjects, activeCategory, ADVANCED_TECHNICAL_FACILITIES_SLUG);
    return prioritizeByField(byCategory, activeCountry, (project) => project.country);
  }, [activeCategory, activeCountry]);

  const handleSelectCategory = (value: string | null) => {
    setActiveCategory(value);
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      setAnnouncement(
        value
          ? t('categoriesPage.categoryFirst', { category: categoryTitle(value), count: categorizedProjects.length })
          : t('categoriesPage.showingAll', { count: categorizedProjects.length }),
      );
    }
    requestAnimationFrame(() => {
      document.getElementById('project-gallery')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  };

  const handleSelectCountry = (value: string | null) => {
    setActiveCountry(value);
    setAnnouncement(
      value
        ? t('categoriesPage.countryFirst', { country: value, count: categorizedProjects.length })
        : t('categoriesPage.showingAll', { count: categorizedProjects.length }),
    );
    requestAnimationFrame(() => {
      document.getElementById('project-gallery')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  };

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
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6"
          onMouseLeave={() => setHoveredSlug(null)}
        >
          {projectCategoryList.map((category) => (
            <SectorFilterCard
              key={category.slug}
              title={categoryTitle(category.slug)}
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
        <div className="mb-8 md:hidden">
          <CountrySidebar options={countryNavOptions} activeValue={activeCountry} onSelect={handleSelectCountry} />
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr] lg:gap-16">
          <div className="hidden md:sticky md:top-28 md:block md:self-start">
            <CountrySidebar options={countryNavOptions} activeValue={activeCountry} onSelect={handleSelectCountry} />
          </div>

          <div id="project-gallery" className="scroll-mt-24">
            <Stack space="lg">
              <div aria-live="polite" className="sr-only">
                {announcement}
              </div>

              <div className="flex min-h-[2.5rem] items-center justify-between">
                <Text variant="small" muted>
                  {activeCategory && activeCountry
                    ? t('categoriesPage.categoryAndCountryFirst', {
                        category: categoryTitle(activeCategory),
                        country: activeCountry,
                        count: categorizedProjects.length,
                      })
                    : activeCategory
                      ? t('categoriesPage.categoryFirst', { category: categoryTitle(activeCategory), count: categorizedProjects.length })
                      : activeCountry
                        ? t('categoriesPage.countryFirst', { country: activeCountry, count: categorizedProjects.length })
                        : t('categoriesPage.showingAll', { count: categorizedProjects.length })}
                </Text>
                <AnimatePresence>
                  {(activeCategory || activeCountry) && (
                    <motion.button
                      type="button"
                      initial={reducedMotion ? undefined : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reducedMotion ? undefined : { opacity: 0 }}
                      onClick={() => {
                        handleSelectCategory(null);
                        setActiveCountry(null);
                      }}
                      className="text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700"
                    >
                      {t('categoriesPage.allProjects')}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {activeCategory && (
                <Text variant="small" className="font-semibold uppercase tracking-wide text-ink">
                  {t('categoriesPage.categoryProjects', { category: categoryTitle(activeCategory) })}
                </Text>
              )}

              <Grid variant="three" gap="md">
                <AnimatePresence mode="popLayout">
                  {visibleProjects.map((project, index) => (
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
                        capacity={project.capacity}
                        muted={hoveredSlug !== null && !activeCategory && project.category !== hoveredSlug}
                        priority={index < PRIORITY_IMAGE_COUNT}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Grid>
            </Stack>
          </div>
        </div>
      </Section>
    </>
  );
}
