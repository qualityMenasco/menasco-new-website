import type { LucideIcon } from 'lucide-react';
import type { Theme } from '../types';
import { Award, Cpu, Download, Layers, Leaf, MapPin, ShieldCheck } from 'lucide-react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { Badge } from '../components/ui/Badge';
import { Heading, Text } from '../components/typography/Typography';
import { ButtonLink } from '../components/ui/Button';
import { ScrollFrameAnimation } from '../components/ScrollFrameAnimation';
import { ProjectHeroBanner } from '../components/projects/ProjectHeroBanner';
import { ProjectHighlights } from '../components/projects/ProjectHighlights';
import { ScrollReveal, ScrollRevealGroup } from '../components/common/ScrollReveal';
import { SectionThemeContext } from '../lib/theme-context';
import { translateProjectLocation } from '../lib/projectLocation';
import { getLocaleFromPath } from '../lib/locale';
import { cn } from '../lib/utils';
import { projects, type ProjectRecord } from '../data/projects';
import { projectCategories } from '../data/projectCategories';
import { velaTimeline } from '../data/velaTimeline';
import { saudiF1Timeline } from '../data/saudiF1Timeline';
import { COMPANY_PROFILE_PATH, SITE_URL } from '../seo/constants';
import { SEO } from '../seo/SEO';
import { serviceEntity } from '../seo/structuredData';
import { buildProjectFallbackDescription, pickProjectSeoDescription, formatProjectLocation } from '../seo/projectDescription';

interface CinematicFeatureConfig {
  icon: LucideIcon;
  key: string;
}

/**
 * Content + asset config for a project rendered with the shared cinematic
 * scroll-frame experience (see ScrollFrameAnimation). Every project in this
 * map shares the exact same layout/interaction — only these fields differ.
 * All copy is now sourced from the `projects:cinematic.<key>` translation
 * namespace (public/locales/{en,ar}/projects.json) rather than hardcoded
 * here — this config only keeps the non-textual/structural parts (frame
 * assets, milestone timeline, icons).
 */
interface CinematicProjectConfig {
  key: string;
  frameFolder: string;
  frameCount: number;
  /** Defaults to 'jpg' in ScrollFrameAnimation if unset. */
  frameFormat?: string;
  milestones: typeof velaTimeline;
  features?: CinematicFeatureConfig[];
  hasContribution?: boolean;
  hasOutcome?: boolean;
  immersiveImage?: { src: string; alt: string; captionKey?: string };
  /** Site-header theme for the opening beat (and reduced-motion fallback) — defaults to 'light' in ScrollFrameAnimation if unset. Only set this when a project's own frame sequence is dark from frame 1 (see saudiF1Timeline's milestones, all 'dark') and would otherwise mismatch the default. */
  introHeaderTheme?: Theme;
  /** Skips the separate opening title/CTA beat — the first milestone is active from scroll progress 0. */
  skipIntro?: boolean;
  /** Hides the right-edge milestone-progress dots. Defaults to true (shown). */
  showMilestoneRail?: boolean;
  /** Plays the sequence backward — scroll progress 0 shows the last frame. */
  reverse?: boolean;
  /** Viewport-heights of scroll dedicated to each beat — defaults to 100 in ScrollFrameAnimation if unset. */
  vhPerBeat?: number;
}

const velaFeatureConfig: CinematicFeatureConfig[] = [
  { icon: Layers, key: 'completeMep' },
  { icon: Cpu, key: 'smartBuilding' },
  { icon: Leaf, key: 'sustainable' },
  { icon: ShieldCheck, key: 'lifeSafety' },
  { icon: Award, key: 'reliability' },
];

const CINEMATIC_PROJECTS: Record<string, CinematicProjectConfig> = {
  'vela-by-omniyat': {
    key: 'vela',
    // 180-frame WebP sequence extracted from the supplied Higgsfield MEP-
    // installation MP4 (public/assets/projects/vela/vela-mep-engineering-16x9.mp4,
    // kept as the master source) — native 16:9, so the default cover-fit
    // single-canvas rendering (same as Qiddiya) applies directly, unlike the
    // earlier portrait cut this replaced. The older 240-frame sequence at
    // sibling frames/ dir is unrelated and still used by the homepage's
    // featured-projects thumbnail, untouched.
    frameFolder: '/assets/projects/vela/video-frames',
    frameCount: 180,
    frameFormat: 'webp',
    milestones: velaTimeline,
    features: velaFeatureConfig,
    hasContribution: true,
    hasOutcome: true,
    // The whole animation is one continuous story rather than a hero-intro-
    // then-numbered-stages structure.
    skipIntro: true,
    showMilestoneRail: false,
    introHeaderTheme: 'dark',
    // Lands on the completed building first, scrolling down toward the
    // exploded MEP view.
    reverse: true,
    // 4 beats × 175vh = 700vh total — with 180 frames that's roughly one
    // frame per ~35px of scroll on a 1080p viewport, fine-grained enough
    // that a small wheel movement advances by only a frame or two instead
    // of visibly skipping ahead.
    vhPerBeat: 175,
  },
  // Key must match slugify('Qiddiya') — see src/data/projects.ts. Renamed
  // from 'saudi-f1-track' when that project was merged into "Qiddiya".
  qiddiya: {
    key: 'qiddiya',
    frameFolder: '/assets/projects/saudi-f1/frames',
    frameCount: 240,
    milestones: saudiF1Timeline,
    // Every milestone in saudiF1Timeline is already 'dark' (the frame
    // sequence is dark from frame 1) — without this, only the opening beat
    // fell back to ScrollFrameAnimation's own 'light' default, causing a
    // visible light-to-dark header flash right after mount as the milestone
    // effect overwrote it. See header-transparency.tsx's matching initial-
    // paint fix for the other half of this — that one covers the render
    // before this effect has even run once.
    introHeaderTheme: 'dark',
    // Supplied directly by the user (2026-08-05) — a full aerial render of
    // the Speed Park Track and surrounding districts at night.
    immersiveImage: {
      src: '/assets/projects/qiddiya/qiddiya-speed-park-aerial.jpg',
      alt: 'Aerial night view of the Qiddiya Speed Park Track and surrounding entertainment districts',
    },
  },
};

const categoryKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  hotels: 'hospitality',
  'landmark-entertainment': 'landmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
};

const statusKeys: Record<string, string> = {
  'On-Going': 'onGoing',
  Completed: 'completed',
  Executed: 'executed',
};

/** Looks up a project's translated field, falling back to the English source data if no translation key exists (e.g. a project not yet covered by the projects:items namespace). */
function getProjectField(t: (key: string, options?: Record<string, unknown>) => string, slug: string) {
  return (field: 'description' | 'menascoScope' | 'sector', fallback: string) => {
    const key = `projects:items.${slug}.${field}`;
    const translated = t(key);
    return translated === key ? fallback : translated;
  };
}

/**
 * Stat grid + "Scope of work" line shared by both the cinematic and default
 * templates below, so a project's data renders identically regardless of
 * which template it uses. Renders nothing if the project has none of these
 * fields populated.
 */
function ProjectHighlightsSection({ project, categoryTitle }: { project: ProjectRecord; categoryTitle?: string }) {
  const { t } = useTranslation(['projects', 'common']);
  const field = getProjectField(t, project.slug);
  const translatedStatus = project.status ? t(`projects:statuses.${statusKeys[project.status] ?? project.status}`) : undefined;
  const scope = field('menascoScope', project.menascoScope);
  const category = categoryTitle || field('sector', project.sector) || undefined;
  const location = translateProjectLocation(t, project.location) ?? undefined;
  const workforceHours = project.workforceHours
    ? project.workforceHours.replace(/\bhours\b/, t('projects:detail.hoursUnit'))
    : undefined;
  const safetyRecord = project.safetyRecord
    ? project.safetyRecord === 'Zero LTI'
      ? t('projects:detail.zeroLti')
      : project.safetyRecord
    : undefined;

  // Fixed 3×2 order: Workforce Hours / Status / Completion, then Safety / Category / Location.
  const stats = [
    { label: t('projects:detail.workforceHoursLabel'), value: workforceHours },
    { label: t('projects:detail.statusLabel'), value: translatedStatus },
    { label: t('projects:detail.completionLabel'), value: project.year || undefined },
    { label: t('projects:detail.safetyRecordLabel'), value: safetyRecord },
    { label: t('projects:detail.categoryLabel'), value: category },
    { label: t('projects:detail.locationLabel'), value: location },
  ];

  return (
    <ScrollReveal>
      <Section spacing="lg" background="warmwhite" edgeFade>
        <Stack space="xl">
          <Heading level="h2" as="h3" className="uppercase">
            {t('projects:detail.projectHighlights')}
          </Heading>

          <ProjectHighlights stats={stats} pendingLabel={t('projects:detail.pendingValue')} />

          {project.menascoScope && (
            <Text variant="body-lg">
              <strong className="font-semibold text-ink">{t('projects:detail.scopeOfWork')}</strong>{' '}
              <span className="text-brand-700">{scope}</span>
            </Text>
          )}
        </Stack>
      </Section>
    </ScrollReveal>
  );
}

export default function ProjectDetailPage() {
  const { t } = useTranslation(['projects', 'common']);
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const project = projects.find((entry) => entry.slug === slug);

  if (!project) return <Navigate to="/404" replace />;

  const field = getProjectField(t, project.slug);
  const category = project.category ? projectCategories[project.category] : undefined;
  const categoryTitle = category ? t(`projects:categories.${categoryKeys[category.slug] ?? category.slug}.title`) : undefined;
  const translatedDescription = field('description', project.description);
  const seoDescriptionText = pickProjectSeoDescription({
    locale,
    seoDescription: project.seoDescription,
    translatedDescription,
    rawEnglishDescription: project.description,
    fallback: buildProjectFallbackDescription({ title: project.title, location: project.location, country: project.country, categoryTitle, capacity: project.capacity }),
  });
  const seo = (
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
  );

  const cinematicConfig = CINEMATIC_PROJECTS[project.slug];
  if (cinematicConfig) {
    const eyebrow = categoryTitle || [field('sector', project.sector), translateProjectLocation(t, project.location)].filter(Boolean).join(' · ') || undefined;
    const overview = t(`projects:cinematic.${cinematicConfig.key}.overview`, { returnObjects: true }) as string[];
    const outcome = cinematicConfig.hasOutcome
      ? (t(`projects:cinematic.${cinematicConfig.key}.outcome`, { returnObjects: true }) as string[])
      : undefined;
    const translatedCopy = t(`projects:timelines.${cinematicConfig.key}`, {
      returnObjects: true,
      defaultValue: cinematicConfig.milestones,
    }) as { title: string; description: string; eyebrow?: string }[];
    const translatedMilestones = cinematicConfig.milestones.map((milestone, index) => ({
      ...milestone,
      title: translatedCopy[index]?.title ?? milestone.title,
      description: translatedCopy[index]?.description ?? milestone.description,
      eyebrow: translatedCopy[index]?.eyebrow ?? milestone.eyebrow,
    }));

    return (
      <>
        {seo}
        <ScrollFrameAnimation
          frameFolder={cinematicConfig.frameFolder}
          frameCount={cinematicConfig.frameCount}
          frameFormat={cinematicConfig.frameFormat}
          milestones={translatedMilestones}
          title={project.title}
          eyebrow={eyebrow}
          introHeaderTheme={cinematicConfig.introHeaderTheme}
          description={translatedDescription || t('projects:detail.cinematicPendingPlaceholder', { title: project.title })}
          ctaLabel={cinematicConfig.skipIntro ? undefined : t('projects:detail.downloadCompanyProfile')}
          ctaHref={cinematicConfig.skipIntro ? undefined : COMPANY_PROFILE_PATH}
          ctaDownload="MENASCO-Company-Profile.pdf"
          showVerificationBadge={project.verificationStatus === 'pending'}
          skipIntro={cinematicConfig.skipIntro}
          showMilestoneRail={cinematicConfig.showMilestoneRail}
          reverse={cinematicConfig.reverse}
          vhPerBeat={cinematicConfig.vhPerBeat}
        />

        <ScrollReveal>
          <Section spacing="lg" background="ink" edgeFade>
            <Stack space="sm" className="max-w-3xl">
              <Heading level="h2" as="h3" theme="dark">
                {t('projects:detail.projectOverview')}
              </Heading>
              <Stack space="sm">
                {overview.map((paragraph, index) => (
                  <Text key={index} variant="body-lg" theme="dark">
                    {paragraph}
                  </Text>
                ))}
              </Stack>
            </Stack>
          </Section>
        </ScrollReveal>

        {cinematicConfig.immersiveImage && (
          <ScrollReveal>
            <div className="relative h-[60vh] w-full overflow-hidden bg-ink md:h-[75vh]">
              <img
                src={cinematicConfig.immersiveImage.src}
                alt={cinematicConfig.immersiveImage.alt}
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/80 to-transparent" />
              <Container className="absolute inset-x-0 bottom-8">
                <Text variant="small" theme="dark" className="font-semibold uppercase tracking-wide text-warmwhite">
                  {project.title}
                </Text>
              </Container>
            </div>
          </ScrollReveal>
        )}

        {cinematicConfig.features && (
          <ScrollReveal>
            <Section spacing="md" background="charcoal" edgeFade>
              <Stack space="lg">
                <Heading level="h2" as="h3" theme="dark">
                  {t('projects:detail.projectFeatures')}
                </Heading>
                <ScrollRevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                  {(() => {
                    const total = cinematicConfig.features!.length;
                    const remainder = total % 3;
                    const nodes: JSX.Element[] = [];

                    cinematicConfig.features!.forEach((feature, index) => {
                      // For a trailing row of exactly 2 items (e.g. 3 + 2 = 5 total),
                      // span them 3/6 columns each so that row shares the exact same
                      // left/right edges as the row of 3 above (2/6 columns each) —
                      // one shared 6-column grid, no separate/narrower wrapper.
                      const isInTrailingPair = remainder === 2 && index >= total - 2;
                      const rowStartIndex = isInTrailingPair ? total - 2 : Math.floor(index / 3) * 3;
                      const isFirstInRow = index === rowStartIndex;

                      // A dedicated full-width divider row, inserted right before the
                      // first item of every row after the first. At lg it spans all 6
                      // columns (the horizontal line between the two rows); below lg it
                      // spans however many columns the grid currently has, so it's
                      // always a clean full-width line, never a stray fragment.
                      if (isFirstInRow && index !== 0) {
                        nodes.push(
                          <div
                            key={`divider-${feature.key}`}
                            aria-hidden="true"
                            className="col-span-1 my-2 border-t border-white/10 sm:col-span-2 lg:col-span-6"
                          />,
                        );
                      }

                      nodes.push(
                        <div
                          key={feature.key}
                          className={cn(
                            'flex h-full flex-col',
                            isInTrailingPair ? 'lg:col-span-3' : 'lg:col-span-2',
                            // Every item after the first gets a top divider by default —
                            // this is what separates stacked items on mobile/tablet.
                            index !== 0 && 'border-t border-white/10 pt-4',
                            // At desktop, an item that isn't first in its row sits beside
                            // its neighbour instead of below it, so its divider becomes a
                            // vertical line on its start edge instead of a top line.
                            !isFirstInRow && 'lg:border-t-0 lg:border-s lg:border-white/10 lg:pt-0 lg:ps-6',
                            // An item that IS first in its row (but not the very first
                            // overall) drops its mobile top divider at desktop — the
                            // dedicated divider row above already draws that line there.
                            isFirstInRow && index !== 0 && 'lg:border-t-0 lg:pt-0',
                          )}
                        >
                          <Text theme="dark" className="font-display font-semibold text-warmwhite">
                            {t(`projects:cinematic.${cinematicConfig.key}.features.${feature.key}.title`)}
                          </Text>
                          <Text variant="small" theme="dark" muted className="mt-1">
                            {t(`projects:cinematic.${cinematicConfig.key}.features.${feature.key}.description`)}
                          </Text>
                        </div>,
                      );
                    });

                    return nodes;
                  })()}
                </ScrollRevealGroup>
              </Stack>
            </Section>
          </ScrollReveal>
        )}

        {cinematicConfig.hasContribution && (
          <ScrollReveal>
            <SectionThemeContext.Provider value="light">
              <section className="bg-warmwhite py-16 md:py-24">
                <Container>
                  <div className="max-w-3xl">
                    <Heading level="h2" as="h3">
                      {t(`projects:cinematic.${cinematicConfig.key}.contribution.heading`)}
                    </Heading>
                    <Text variant="body-lg" className="mt-5">
                      {t(`projects:cinematic.${cinematicConfig.key}.contribution.body`)}
                    </Text>
                  </div>
                </Container>
              </section>
            </SectionThemeContext.Provider>
          </ScrollReveal>
        )}

        {outcome && (
          <ScrollReveal>
            <Section spacing="lg" background="charcoal" edgeFade>
              <Stack space="sm" className="max-w-3xl">
                <Heading level="h2" as="h3" theme="dark">
                  {t('projects:detail.projectOutcome')}
                </Heading>
                <Stack space="sm">
                  {outcome.map((paragraph, index) => (
                    <Text key={index} variant="body-lg" theme="dark">
                      {paragraph}
                    </Text>
                  ))}
                </Stack>
              </Stack>
            </Section>
          </ScrollReveal>
        )}

        <ProjectHighlightsSection project={project} categoryTitle={categoryTitle} />
      </>
    );
  }

  const translatedLocation = translateProjectLocation(t, project.location);
  const defaultEyebrow = categoryTitle || [field('sector', project.sector), translatedLocation].filter(Boolean).join(' · ') || undefined;
  const translatedStatus = project.status ? t(`projects:statuses.${statusKeys[project.status] ?? project.status}`) : undefined;

  return (
    <>
      {seo}
      {project.heroImage ? (
        <ProjectHeroBanner
          image={project.heroImage}
          title={project.title}
          eyebrow={defaultEyebrow}
          statusLabel={translatedStatus}
          description={translatedDescription || t('projects:detail.contentPendingPlaceholder')}
          ctaLabel={t('projects:detail.downloadCompanyProfile')}
          ctaHref={COMPANY_PROFILE_PATH}
          ctaDownload="MENASCO-Company-Profile.pdf"
          showVerificationBadge={project.verificationStatus === 'pending'}
        />
      ) : (
        <Section spacing="lg" background="warmwhite">
          <Stack space="lg">
            {project.verificationStatus === 'pending' && <Badge variant="status">{t('projects:detail.detailsPending')}</Badge>}

            <Stack space="sm">
              {(category || project.sector || project.status) && (
                <div className="flex flex-wrap items-center gap-2">
                  {(categoryTitle || project.sector) && (
                    <Badge variant="sector">{categoryTitle || field('sector', project.sector)}</Badge>
                  )}
                  {translatedStatus && <Badge variant="status">{translatedStatus}</Badge>}
                </div>
              )}
              <Heading level="h1" as="h2">
                {project.title}
              </Heading>
              {translatedLocation && (
                <div className="flex items-center gap-1.5 text-small text-gray-500">
                  <MapPin size={15} aria-hidden="true" />
                  <span>{translatedLocation}</span>
                </div>
              )}
            </Stack>

            <Text variant="body-lg" className="max-w-2xl">
              {translatedDescription || t('projects:detail.contentPendingPlaceholder')}
            </Text>

            <ButtonLink
              href={COMPANY_PROFILE_PATH}
              download="MENASCO-Company-Profile.pdf"
              variant="primary"
              leadingIcon={Download}
              className="w-fit"
            >
              {t('projects:detail.downloadCompanyProfile')}
            </ButtonLink>
          </Stack>
        </Section>
      )}

      <ProjectHighlightsSection project={project} categoryTitle={categoryTitle} />
    </>
  );
}
