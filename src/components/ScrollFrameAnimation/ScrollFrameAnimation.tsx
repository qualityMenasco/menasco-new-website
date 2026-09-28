import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useScrollFrameAnimation } from '../../hooks/useScrollFrameAnimation';
import { useTransparentHeader, useHeaderThemeOverride } from '../../app/header-transparency';
import { Container } from '../layout/Container';
import { Eyebrow, Heading, Text } from '../typography/Typography';
import { Badge } from '../ui/Badge';
import { ButtonLink } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { Theme } from '../../types';

const EASE = [0.22, 0.61, 0.36, 1] as const;

export interface FrameSequenceMilestone {
  id: string;
  title: string;
  description: string;
  /** Scroll progress (0–1) at which this milestone becomes the active one. */
  startProgress: number;
  /** Site-header theme to show while this milestone is active — keeps the transparent header readable. */
  headerTheme: Theme;
  /** Overrides the default auto-generated "Stage X of Y" label with a short custom eyebrow (e.g. "MEP ENGINEERING"). */
  eyebrow?: string;
}

export interface ScrollFrameStoryProps {
  /**
   * Public path to the folder containing frame-001.jpg, frame-002.jpg, etc.
   * `vercel.json` currently gives `/assets/projects/vela/frames/*` a
   * moderate (1-day, SWR 7-day) Cache-Control policy rather than a
   * long-lived immutable one, specifically because these filenames are
   * stable and may be overwritten in place with re-exported/upscaled frames
   * of the same name. If this ever moves to a versioned path (e.g. a
   * `frames-v2/` folder) or content-hashed filenames, update that rule to
   * `public, max-age=31536000, immutable` — safe and preferable once the
   * URL itself changes on every content update instead of the file being
   * overwritten under the same URL.
   */
  frameFolder: string;
  frameCount: number;
  frameFormat?: string;
  /** Zero-padded digit width in frame filenames, e.g. 3 for "frame-007.jpg". */
  framePad?: number;
  milestones: FrameSequenceMilestone[];
  title: string;
  /** Only rendered when provided — never fabricate location/sector copy that hasn't been sourced. */
  eyebrow?: string;
  description?: string;
  /** Omit along with ctaHref to render no CTA button — used when skipIntro is set, since there's then no opening beat to hang it on. */
  ctaLabel?: string;
  ctaHref?: string;
  /** Set to give the CTA a `download` attribute (file downloads) instead of a normal navigation. */
  ctaDownload?: string;
  /** Shown next to the title when the project's supporting details are still unverified. */
  showVerificationBadge?: boolean;
  /** Viewport-heights of scroll dedicated to each beat (opening + one per milestone, unless skipIntro). */
  vhPerBeat?: number;
  /** Site-header theme to show during the opening beat. Defaults to 'light' (bright background → dark header text). */
  introHeaderTheme?: Theme;
  /**
   * 'full' (default) is the standalone page experience: owns the site header's
   * transparency, sits flush under it, and opens with its own hero-style intro
   * beat. 'feature' embeds the same animation mid-page (e.g. inside a category
   * page that already has its own header/intro above it) — no intro beat, no
   * header takeover, and a persistent "view full project" link instead.
   */
  mode?: 'full' | 'feature';
  /** Shown in 'feature' mode as a persistent link back to the full project page. */
  viewFullProjectHref?: string;
  /**
   * Skips the separate opening title/CTA beat even in 'full' mode — the
   * first milestone becomes active from scroll progress 0, so the whole
   * pinned range is spent on the frame sequence itself instead of holding on
   * frame 1 for one beat's worth of scroll. Use for a single continuous
   * story with no distinct "hero" state (eyebrow/description/ctaLabel/
   * ctaHref/showVerificationBadge are then ignored).
   */
  skipIntro?: boolean;
  /** Hides the right-edge milestone-progress dots — for a story that isn't meant to read as discrete numbered stages. Defaults to true. */
  showMilestoneRail?: boolean;
  /** Plays the sequence backward: scroll progress 0 shows the last frame, progress 1 shows the first — see useScrollFrameAnimation. */
  reverse?: boolean;
}

function frameUrl(frameFolder: string, index: number, framePad: number, frameFormat: string) {
  return `${frameFolder}/frame-${String(index).padStart(framePad, '0')}.${frameFormat}`;
}

export function ScrollFrameAnimation({
  frameFolder,
  frameCount,
  frameFormat = 'jpg',
  framePad = 3,
  milestones,
  title,
  eyebrow,
  description,
  ctaLabel,
  ctaHref,
  ctaDownload,
  showVerificationBadge = false,
  vhPerBeat = 100,
  introHeaderTheme = 'light',
  mode = 'full',
  viewFullProjectHref,
  skipIntro = false,
  showMilestoneRail = true,
  reverse = false,
}: ScrollFrameStoryProps) {
  const { t } = useTranslation('projects');
  const prefersReducedMotion = useReducedMotion();
  const isFullMode = mode === 'full';
  const hasIntroBeat = isFullMode && !skipIntro;

  const beatCount = hasIntroBeat ? milestones.length + 1 : milestones.length;
  const introFraction = hasIntroBeat ? 1 / beatCount : 0;

  const { wrapperRef, pinRef, canvasRef, isIntro: hookIsIntro, activeIndex } = useScrollFrameAnimation({
    frameFolder,
    frameCount,
    frameFormat,
    framePad,
    disabled: !!prefersReducedMotion,
    introHoldFraction: introFraction,
    resetScrollOnMount: isFullMode,
    milestoneStartProgress: useMemo(() => milestones.map((m) => m.startProgress), [milestones]),
    reverse,
  });

  const isIntro = hasIntroBeat && hookIsIntro;
  const activeMilestone = milestones[activeIndex];

  // A 1px sentinel at the very end of this component's output — works the
  // same whether the animated or static branch below is rendered — tells us
  // once the user has scrolled past the whole story into whatever follows it
  // (the site footer, always dark), independent of the GSAP pin mechanics.
  // A plain scroll-position comparison (rather than IntersectionObserver's
  // in/out signal) because the footer can be shorter than one viewport, in
  // which case the sentinel would never fully leave the viewport at all.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [pastStory, setPastStory] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const handleScroll = () => {
      const sentinelViewportTop = el.getBoundingClientRect().top;
      setPastStory(sentinelViewportTop < window.innerHeight * 0.5);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // In 'full' mode the header stays fully transparent for this whole page —
  // never a glass bar — and just switches its text between light and dark so
  // it stays readable: the active beat's theme while the story is on screen,
  // then 'dark' (white text) once scrolled past it into the footer. In
  // 'feature' mode this component is embedded mid-page and leaves the
  // header entirely alone — whatever the surrounding page already does.
  useTransparentHeader(isFullMode, { alwaysTransparent: isFullMode });
  useHeaderThemeOverride(
    isFullMode ? (pastStory ? 'dark' : prefersReducedMotion || isIntro ? introHeaderTheme : activeMilestone.headerTheme) : null,
  );

  if (prefersReducedMotion) {
    return (
      <>
        <StaticFrameStory
          frameFolder={frameFolder}
          frameCount={frameCount}
          frameFormat={frameFormat}
          framePad={framePad}
          milestones={milestones}
          title={title}
          eyebrow={eyebrow}
          description={description}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
          ctaDownload={ctaDownload}
          showVerificationBadge={showVerificationBadge}
          mode={mode}
          viewFullProjectHref={viewFullProjectHref}
          skipIntro={skipIntro}
          reverse={reverse}
        />
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      </>
    );
  }

  return (
    <section aria-label={`${title}: construction journey`} className={cn('relative bg-ink', isFullMode && '-mt-20')}>
      <div ref={wrapperRef} style={{ height: `${beatCount * vhPerBeat}vh` }} className="relative">
        <div ref={pinRef} className="relative h-screen w-full overflow-hidden bg-ink">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-transparent"
          />

          {!isFullMode && viewFullProjectHref && (
            <div className="absolute right-6 top-8 z-10 md:right-10 lg:right-16">
              <ButtonLink href={viewFullProjectHref} variant="outline" theme="dark" size="sm">
                {t('projects:detail.viewFullProject')}
              </ButtonLink>
            </div>
          )}

          <Container className="pointer-events-none relative z-10 flex h-full items-end pb-24 md:pb-32">
            <div className="pointer-events-auto max-w-2xl">
              <AnimatePresence mode="wait">
                {isIntro ? (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    {(eyebrow || showVerificationBadge) && (
                      <div className="mb-3 flex items-center gap-3">
                        {eyebrow && <Eyebrow theme="dark">{eyebrow}</Eyebrow>}
                        {showVerificationBadge && (
                          <Badge variant="status" theme="dark">
                            Details Pending Verification
                          </Badge>
                        )}
                      </div>
                    )}
                    <Heading level="display" as="h2" theme="dark">
                      {title}
                    </Heading>
                    {description && (
                      <Text variant="body-lg" theme="dark" className="mt-5 max-w-xl !text-warmwhite">
                        {description}
                      </Text>
                    )}
                    {ctaHref && ctaLabel && (
                      <div className="mt-8">
                        <ButtonLink href={ctaHref} download={ctaDownload} variant="outline" theme="dark">
                          {ctaLabel}
                        </ButtonLink>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeMilestone.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <Eyebrow theme="dark" as="p">
                      {activeMilestone.eyebrow ?? t('projects:detail.stageOf', { current: activeIndex + 1, total: milestones.length })}
                    </Eyebrow>
                    <Heading level="h2" as="h3" theme="dark" className="mt-2">
                      {activeMilestone.title}
                    </Heading>
                    <Text variant="body-lg" theme="dark" className="mt-3 max-w-xl">
                      {activeMilestone.description}
                    </Text>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>

          <AnimatePresence>
            {isIntro && (
              <motion.div
                className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.6, duration: 0.5 } }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                aria-hidden="true"
              >
                <span className="text-caption font-semibold uppercase tracking-widest text-gray-300">
                  {t('projects:detail.scrollToExplore')}
                </span>
                <span className="h-8 w-px bg-gray-300/60" />
              </motion.div>
            )}
          </AnimatePresence>

          {showMilestoneRail && <MilestoneRail milestones={milestones} activeIndex={activeIndex} visible={!isIntro} />}
        </div>
      </div>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
    </section>
  );
}

function MilestoneRail({
  milestones,
  activeIndex,
  visible,
}: {
  milestones: FrameSequenceMilestone[];
  activeIndex: number;
  visible: boolean;
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 right-6 z-10 hidden w-4 items-center transition-opacity duration-slow md:right-10 lg:right-16 lg:flex',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      aria-hidden="true"
    >
      <div className="relative flex h-40 flex-col justify-between">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/15" />
        {milestones.map((milestone, index) => (
          <span
            key={milestone.id}
            className={cn(
              'relative h-2 w-2 rounded-full border-2 transition-colors duration-base',
              index <= activeIndex ? 'border-brand-400 bg-brand-400' : 'border-white/30 bg-ink',
            )}
          />
        ))}
      </div>
    </div>
  );
}

function StaticFrameStory({
  frameFolder,
  frameCount,
  frameFormat = 'jpg',
  framePad = 3,
  milestones,
  title,
  eyebrow,
  description,
  ctaLabel,
  ctaHref,
  ctaDownload,
  showVerificationBadge,
  mode = 'full',
  viewFullProjectHref,
  skipIntro = false,
  reverse = false,
}: Omit<ScrollFrameStoryProps, 'vhPerBeat' | 'showMilestoneRail'>) {
  const { t } = useTranslation('projects');
  const isFullMode = mode === 'full';
  const hasIntroBeat = isFullMode && !skipIntro;
  const milestoneBeats = milestones.map((milestone) => {
    const forwardFrameIndex = Math.max(1, Math.min(frameCount, Math.round(milestone.startProgress * (frameCount - 1)) + 1));
    return {
      id: milestone.id,
      frameIndex: reverse ? frameCount + 1 - forwardFrameIndex : forwardFrameIndex,
      kind: 'milestone' as const,
      milestone,
    };
  });
  const introFrameIndex = reverse ? frameCount : 1;
  const beats = hasIntroBeat ? [{ id: 'intro', frameIndex: introFrameIndex, kind: 'intro' as const }, ...milestoneBeats] : milestoneBeats;

  return (
    <section aria-label={`${title}: construction journey`} className={cn('bg-ink', isFullMode && '-mt-20')}>
      {beats.map((beat, index) => (
        <div key={beat.id} className="relative flex min-h-screen w-full items-end overflow-hidden bg-ink">
          <img
            src={frameUrl(frameFolder, beat.frameIndex, framePad, frameFormat)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent"
          />

          <Container className="relative z-10 pb-24 md:pb-32">
            <div className="max-w-2xl">
              {beat.kind === 'intro' ? (
                <>
                  {(eyebrow || showVerificationBadge) && (
                    <div className="mb-3 flex items-center gap-3">
                      {eyebrow && <Eyebrow theme="dark">{eyebrow}</Eyebrow>}
                      {showVerificationBadge && (
                        <Badge variant="status" theme="dark">
                          {t('projects:detail.detailsPending')}
                        </Badge>
                      )}
                    </div>
                  )}
                  <Heading level="display" as="h2" theme="dark">
                    {title}
                  </Heading>
                  {description && (
                    <Text variant="body-lg" theme="dark" className="mt-5 max-w-xl !text-warmwhite">
                      {description}
                    </Text>
                  )}
                  {ctaHref && ctaLabel && (
                    <div className="mt-8">
                      <ButtonLink href={ctaHref} download={ctaDownload} variant="outline" theme="dark">
                        {ctaLabel}
                      </ButtonLink>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Eyebrow theme="dark" as="p">
                    {beat.milestone.eyebrow ??
                      t('projects:detail.stageOf', { current: hasIntroBeat ? index : index + 1, total: milestones.length })}
                  </Eyebrow>
                  <Heading level="h2" as="h3" theme="dark" className="mt-2">
                    {beat.milestone.title}
                  </Heading>
                  <Text variant="body-lg" theme="dark" className="mt-3 max-w-xl">
                    {beat.milestone.description}
                  </Text>
                  {!isFullMode && viewFullProjectHref && (
                    <div className="mt-6">
                      <ButtonLink href={viewFullProjectHref} variant="outline" theme="dark">
                        {t('projects:detail.viewFullProject')}
                      </ButtonLink>
                    </div>
                  )}
                </>
              )}
            </div>
          </Container>
        </div>
      ))}
    </section>
  );
}
