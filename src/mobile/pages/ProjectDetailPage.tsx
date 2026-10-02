import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { SectionHeader } from '../components/SectionHeader';
import { MobileCTA } from '../components/MobileCTA';
import { LocaleLink } from '../components/LocaleLink';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';
import { serviceEntity } from '../../seo/structuredData';
import { buildProjectFallbackDescription, pickProjectSeoDescription, formatProjectLocation } from '../../seo/projectDescription';
import { SITE_URL } from '../../seo/constants';
import { projects, getMainContractor } from '../../data/projects';
import { projectCategories } from '../../data/projectCategories';
import { getProjectImage } from '../../data/images';
import { translateProjectLocation } from '../../lib/projectLocation';
import { getLocaleFromPath } from '../../lib/locale';

const categoryKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  'hospitality-landmark-entertainment': 'hospitalityLandmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
  'infrastructure-utilities': 'infrastructureUtilities',
};

const statusKeys: Record<string, string> = {
  'On-Going': 'onGoing',
  Completed: 'completed',
  Executed: 'executed',
};

/**
 * Simplified mobile project page — real approved content (title, location,
 * description), presented plainly rather than desktop's cinematic
 * scroll-frame treatment, which is a deliberately heavier experience not
 * well suited to a fast mobile connection.
 */
export default function ProjectDetailPage() {
  const { t } = useTranslation(['projects', 'common']);
  const { slug } = useParams<{ slug: string }>();
  const routerLocation = useLocation();
  const locale = getLocaleFromPath(routerLocation.pathname);
  const project = projects.find((entry) => entry.slug === slug);

  if (!project) return <Navigate to="/404" replace />;

  const category = project.category ? projectCategories[project.category] : undefined;
  const categoryTitle = category ? t(`projects:categories.${categoryKeys[category.slug] ?? category.slug}.title`) : undefined;
  const descriptionKey = `projects:items.${project.slug}.description`;
  const rawTranslatedDescription = t(descriptionKey);
  const translatedDescription = rawTranslatedDescription === descriptionKey ? project.description : rawTranslatedDescription;
  const description = translatedDescription || t('projects:detail.contentPendingPlaceholder');
  const seoDescriptionText = pickProjectSeoDescription({
    locale,
    seoDescription: project.seoDescription,
    translatedDescription,
    rawEnglishDescription: project.description,
    fallback: buildProjectFallbackDescription({ title: project.title, location: project.location, country: project.country, categoryTitle, capacity: project.capacity }),
  });

  const sectorKey = `projects:items.${project.slug}.sector`;
  const translatedSector = t(sectorKey);
  const sector = translatedSector === sectorKey ? project.sector : translatedSector;
  const translatedStatus = project.status ? t(`projects:statuses.${statusKeys[project.status] ?? project.status}`) : undefined;
  const translatedLocation = translateProjectLocation(t, project.location);
  const workforceHours = project.workforceHours
    ? project.workforceHours.replace(/\bhours\b/, t('projects:detail.hoursUnit'))
    : undefined;
  const safetyRecord = project.safetyRecord
    ? project.safetyRecord === 'Zero LTI'
      ? t('projects:detail.zeroLti')
      : project.safetyRecord
    : undefined;
  const pendingValue = t('projects:detail.pendingValue');
  const scopeKey = `projects:items.${project.slug}.menascoScope`;
  const translatedScope = t(scopeKey);
  // Only verified records show scope — the mobile page has no "pending verification" badge to qualify unconfirmed details the way desktop does.
  const menascoScope =
    project.menascoScope && project.verificationStatus === 'verified' ? (translatedScope === scopeKey ? project.menascoScope : translatedScope) : '';

  // Order: Workforce Hours / Status / Completion, then Safety / Category /
  // Location, then Main Contractor last — its trailing position is what lets
  // the 2-col grid below span it full-width for the 7th slot instead of
  // leaving a narrow orphan card.
  const highlightStats = [
    { label: t('projects:detail.workforceHoursLabel'), value: workforceHours },
    { label: t('projects:detail.statusLabel'), value: translatedStatus },
    { label: t('projects:detail.completionLabel'), value: project.year || undefined },
    { label: t('projects:detail.safetyRecordLabel'), value: safetyRecord },
    { label: t('projects:detail.categoryLabel'), value: categoryTitle || sector || undefined },
    { label: t('projects:detail.locationLabel'), value: translatedLocation || undefined },
    { label: t('projects:detail.mainContractorLabel'), value: getMainContractor(project) },
  ];

  return (
    <>
      <NavSectionH1 section="projectsSectors" />
      <SEO
        title={project.title}
        description={seoDescriptionText}
        path={`/projects/${project.slug}`}
        // MENASCO delivered the MEP engineering scope for this project — it is
        // not the project's owner, developer, or architect, so this is
        // deliberately a `Service` (what MENASCO did), not a claim of
        // ownership/creation over the project/building itself.
        mainEntity={serviceEntity({
          name: `MENASCO MEP Engineering Scope: ${project.title}`,
          description: seoDescriptionText,
          url: `${SITE_URL}/projects/${project.slug}`,
          areaServed: formatProjectLocation(project.location, project.country) ? [formatProjectLocation(project.location, project.country)] : undefined,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Projects / Sectors', path: '/projects/categories' },
          ...(category ? [{ label: category.title, path: `/projects/categories?category=${category.slug}` }] : []),
          { label: project.title, path: `/projects/${project.slug}` },
        ]}
      />

      <section className="px-4 py-8">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
          <img src={getProjectImage(project.heroImage || undefined, project.slug)} alt={project.title} className="h-full w-full object-cover" />
        </div>

        <div className="mt-5">
          {category && (
            <LocaleLink
              to={`/projects/categories?category=${category.slug}`}
              className="text-caption font-semibold uppercase tracking-wide text-brand-600"
            >
              {categoryTitle}
            </LocaleLink>
          )}
          <SectionHeader heading={project.title} headingAs="h2" description={description} className="mt-1" />
          {(translatedLocation || project.client) && (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-small text-gray-600">
              {translatedLocation && <span>{translatedLocation}</span>}
              {project.client && <span>{t('projects:detail.client', { client: project.client })}</span>}
            </div>
          )}
        </div>
      </section>

      <section className="bg-stone px-4 py-8">
        <h3 className="font-display text-h2 font-semibold uppercase tracking-tight text-ink">
          {t('projects:detail.projectHighlights')}
        </h3>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {highlightStats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                'flex flex-col gap-1 rounded-sm border border-transparent bg-gradient-to-b from-[#fffdfa] via-warmwhite to-stone px-3.5 py-3 shadow-[0_2px_8px_-2px_rgba(10,11,13,0.07)]',
                index === highlightStats.length - 1 && highlightStats.length % 2 === 1 && 'col-span-2',
              )}
            >
              <span className="text-caption font-semibold uppercase tracking-wide text-gray-500">{stat.label}</span>
              {stat.value ? (
                <span className="font-display text-h4 font-semibold leading-snug text-ink">{stat.value}</span>
              ) : (
                <span className="font-display text-h4 font-semibold italic leading-snug text-gray-300">{pendingValue}</span>
              )}
            </div>
          ))}
        </div>
        {menascoScope && (
          <p className="mt-6 text-body text-gray-600">
            <strong className="font-semibold text-ink">{t('projects:detail.scopeOfWork')}</strong>{' '}
            <span className="text-brand-700">{menascoScope}</span>
          </p>
        )}
      </section>

      <MobileCTA
        heading={t('projects:detail.discussSimilarProject')}
        primary={{ label: t('common:buttons.requestQuote'), href: '/contact?type=project' }}
        secondary={{
          label: t('projects:detail.viewAllProjects'),
          href: category ? `/projects/categories?category=${category.slug}` : '/projects/categories',
        }}
      />
    </>
  );
}
