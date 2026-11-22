import { useCallback, useEffect, useRef, useState } from 'react';
import { HeroH1 } from '../components/typography/HeroH1';
import { ArrowDown, ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Section } from '../components/layout/Section';
import { Button, ButtonLink } from '../components/ui/Button';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { useTransparentHeader } from '../app/header-transparency';
import { certificationTrainingAnchors as anchors, certificationTrainingPhotos as photos } from '../data/certificationTraining';
import { cn } from '../lib/utils';
import { SEO } from '../seo/SEO';
import { faqPageJsonLd } from '../seo/structuredData';
import { SmartLink } from '../lib/SmartLink';

const EASE = [0.22, 0.61, 0.36, 1] as const;
const PROGRAMMES = ['workforce', 'initiative', 'internships'] as const;
type Programme = (typeof PROGRAMMES)[number];
type Step = { title: string; body: string; detail: string };
type FaqLink = { label: string; href: string };
type FaqItem = { category: string; question: string; answer: string; link?: FaqLink; link2?: FaqLink };
/**
 * Certification & Training. Built from the site's existing patterns (About
 * hero, home tab pager, sector rail) with an Apple-like restraint:
 *   1. Hero (charcoal): text beside a framed photo
 *   2. Programmes (warm white): segmented tabs, one programme at a time —
 *      photo + large heading + short body + one action. All panels stay in
 *      the DOM (stacked in one grid cell) so the height never jumps and the
 *      copy stays crawlable.
 *   3. Pathway (ink): MENASCO Academy's four steps as numbered cards — a
 *      swipe rail (dots on small phones, arrows from 480px to 1279px), a row
 *      of four from 1280px.
 *   4. Closing statement (warm white): text beside a framed photo, no actions.
 *   5. FAQ (stone), at the very bottom: questions for the whole page,
 *      in an accordion. Every answer stays in the
 *      DOM (collapsed, not unmounted) and is mirrored in FAQPage JSON-LD.
 * One responsive page for every screen size; phone layout first, then tablet
 * (md), then desktop (lg).
 */
export default function CertificationTrainingPage() {
  const { t } = useTranslation('about');
  const [programme, setProgramme] = useState<Programme>('workforce');
  const faqItems = t('certificationTrainingPage.faq.items', { returnObjects: true }) as FaqItem[];
  return (
    <>
      <SEO
        title={t('certificationTrainingPage.seo.title')}
        description={t('certificationTrainingPage.seo.description')}
        path="/certification-training"
        structuredData={Array.isArray(faqItems) ? faqPageJsonLd(faqItems) : undefined}
      />
      <Hero />
      <Programmes active={programme} onChange={setProgramme} />
      <Pathway />
      <Closing />
      <Faq />
    </>
  );
}

function scrollToId(id: string, reducedMotion: boolean | null) {
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}

function StatusBadge({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-caption font-semibold uppercase tracking-wide',
        dark ? 'border-brand-400/60 text-brand-400' : 'border-brand-600/40 bg-brand-50 text-brand-700',
      )}
    >
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 animate-pulse rounded-full motion-reduce:animate-none', dark ? 'bg-brand-400' : 'bg-brand-600')} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ Hero */

function Hero() {
  useTransparentHeader(true);
  const { t } = useTranslation('about');
  const reducedMotion = useReducedMotion();
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reducedMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : delay, ease: EASE },
  });

  return (
    // Extra top padding on desktop: the transparent header sits over this section.
    <Section background="charcoal" spacing="sm" className="pt-8 md:pt-10 lg:pt-32">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-8 lg:gap-12">
        <div className="md:col-span-7">
          <HeroH1
            eyebrow={
              <motion.span className="block" {...rise(0)}>
                <Eyebrow as="span" className="block">
                  {t('certificationTrainingPage.hero.eyebrow')}
                </Eyebrow>
              </motion.span>
            }
            title={
              <motion.span className="block" {...rise(0.08)}>
                <Heading level="display" as="span" className="mt-4 block text-balance">
                  {t('certificationTrainingPage.hero.title')}
                </Heading>
              </motion.span>
            }
          />
          <motion.div {...rise(0.16)}>
            <Text muted className="mt-6 max-w-xl">
              {t('certificationTrainingPage.hero.description')}
            </Text>
          </motion.div>
        </div>
        <motion.div {...rise(0.12)} className="md:col-span-5">
          <div className="mx-auto w-full aspect-[16/10] overflow-hidden rounded-md bg-graphite md:aspect-[4/5] lg:aspect-square">
            <img
              src={photos.hero.src}
              alt={t('certificationTrainingPage.hero.imageAlt')}
              className="h-full w-full object-cover"
              style={{ objectPosition: photos.hero.focus }}
              {...{ fetchpriority: 'high' }}
            />
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ Programmes */

function Programmes({ active, onChange }: { active: Programme; onChange: (p: Programme) => void }) {
  const { t } = useTranslation('about');
  const reducedMotion = useReducedMotion();
  const tabsRef = useRef<HTMLDivElement>(null);

  // Arrow keys move between tabs (standard tablist behaviour).
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = (event.key === 'ArrowRight') !== rtl;
    const next = PROGRAMMES[(PROGRAMMES.indexOf(active) + (forward ? 1 : PROGRAMMES.length - 1)) % PROGRAMMES.length];
    onChange(next);
    tabsRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${next}"]`)?.focus();
  };

  const panel = (key: Programme) => {
    const c = `certificationTrainingPage.${key}`;
    const body =
      key === 'initiative'
        ? [t(`${c}.lead`), (t(`${c}.paragraphs`, { returnObjects: true }) as string[])[0]]
        : (t(`${c}.paragraphs`, { returnObjects: true }) as string[]);
    return (
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-10 lg:gap-16">
        <div>
          <div className="mx-auto w-full aspect-[4/3] overflow-hidden rounded-md bg-gray-100 md:aspect-[4/5] xl:aspect-[10/9]">
            <img
              src={photos[key].src}
              alt={t(`${c}.imageAlt`)}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ objectPosition: photos[key].focus }}
            />
          </div>
          {/* MENASCO Academy: accreditation statement under its photo. */}
          {key === 'initiative' && (
            <p className="mt-5 border-s-2 border-brand-600 ps-4 text-small text-gray-700">{t(`${c}.disclaimer`)}</p>
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow className="mb-0">{t(`${c}.eyebrow`)}</Eyebrow>
            {key === 'initiative' && <StatusBadge label={t(`${c}.status`)} />}
          </div>
          <Heading level="h1" as="h3" className="mt-5 text-balance">
            {t(`${c}.heading`)}
          </Heading>
          {body.map((paragraph, i) => (
            <Text key={i} muted className={cn('max-w-xl', i === 0 ? 'mt-5' : 'mt-4')}>
              {paragraph}
            </Text>
          ))}
          <div className="mt-8">
            {key === 'workforce' && (
              <ButtonLink href="/innovation-technology" variant="primary" trailingIcon={ArrowRight}>
                {t(`${c}.cta`)}
              </ButtonLink>
            )}
            {key === 'initiative' && (
              <Button variant="primary" trailingIcon={ArrowDown} onClick={() => scrollToId(anchors.pathway, reducedMotion)}>
                {t(`${c}.pathwayCta`)}
              </Button>
            )}
            {key === 'internships' && (
              <ButtonLink href="/careers" variant="primary" trailingIcon={ArrowRight}>
                {t(`${c}.cta`)}
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Section id={anchors.programmes} background="warmwhite" spacing="sm" className="scroll-mt-20">
      <ScrollReveal>
        {/* Desktop: same two columns as the panel below, so the tabs span exactly the text column. */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <Eyebrow>{t('certificationTrainingPage.programmes.eyebrow')}</Eyebrow>
            <Heading level="h1" as="h2" className="mt-3 text-balance">
              {t('certificationTrainingPage.programmes.heading')}
            </Heading>
          </div>
          {/* Segmented control: full width of its column; from 640px each tab sizes to its label, on one line. */}
          <div
            ref={tabsRef}
            role="tablist"
            aria-label={t('certificationTrainingPage.programmes.tablistLabel')}
            onKeyDown={onKeyDown}
            className="grid grid-cols-3 gap-1 rounded-full border border-gray-200 bg-stone p-1 sm:flex"
          >
            {PROGRAMMES.map((key) => (
              <button
                key={key}
                data-tab={key}
                id={`ct-tab-${key}`}
                type="button"
                role="tab"
                aria-selected={active === key}
                aria-controls={`ct-panel-${key}`}
                tabIndex={active === key ? 0 : -1}
                onClick={() => onChange(key)}
                className={cn(
                  'min-h-10 rounded-full border px-2 text-caption font-semibold leading-tight transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:flex-auto sm:whitespace-nowrap sm:px-4 sm:text-small lg:px-3 lg:text-caption xl:px-4 xl:text-small',
                  active === key ? 'border-brand-600 bg-white text-brand-600 shadow-sm' : 'border-transparent text-gray-600 hover:text-ink',
                )}
              >
                {t(`certificationTrainingPage.${key}.tab`)}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Only the active panel is shown (the section fits it, no empty gap under shorter
          programmes); the others stay in the DOM, hidden, so their copy remains crawlable. */}
      <div className="mt-8 lg:mt-10">
        {PROGRAMMES.map((key) =>
          active === key ? (
            <motion.div
              key={key}
              id={`ct-panel-${key}`}
              role="tabpanel"
              aria-labelledby={`ct-tab-${key}`}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.45, ease: EASE }}
            >
              {panel(key)}
            </motion.div>
          ) : (
            <div key={key} id={`ct-panel-${key}`} role="tabpanel" aria-labelledby={`ct-tab-${key}`} hidden>
              {panel(key)}
            </div>
          ),
        )}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- Pathway */

function Pathway() {
  const { t } = useTranslation('about');
  const reducedMotion = useReducedMotion();
  const steps = t('certificationTrainingPage.initiative.steps', { returnObjects: true }) as Step[];
  const railRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [edges, setEdges] = useState({ canPrev: false, canNext: true });

  const update = useCallback(() => {
    const rail = railRef.current;
    const first = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !first) return;
    const max = rail.scrollWidth - rail.clientWidth;
    const travelled = Math.abs(rail.scrollLeft);
    setEdges({ canPrev: travelled > 4, canNext: travelled < max - 4 });
    setActive(travelled >= max - 4 ? steps.length - 1 : Math.round(travelled / (first.offsetWidth + 16)));
  }, [steps.length]);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  const step = (direction: 1 | -1) => {
    const rail = railRef.current;
    const first = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !first) return;
    const rtl = getComputedStyle(rail).direction === 'rtl';
    rail.scrollBy({ left: direction * (rtl ? -1 : 1) * (first.offsetWidth + 16), behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  const arrow = 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-warmwhite transition-colors duration-base hover:border-white disabled:cursor-default disabled:opacity-30';

  return (
    <Section id={anchors.pathway} background="charcoal" spacing="sm" className="scroll-mt-20 xl:py-10">
      <ScrollReveal>
        <div className="flex flex-wrap items-center gap-3">
          <Eyebrow className="mb-0">{t('certificationTrainingPage.initiative.eyebrow')}</Eyebrow>
          <StatusBadge label={t('certificationTrainingPage.initiative.status')} dark />
        </div>
        {/* 1280px+: title left, intro right (vertically centred) to save height. */}
        <div className="lg:mt-4 xl:grid xl:grid-cols-12 xl:items-center xl:gap-10">
          <Heading level="display" as="h2" className="mt-5 max-w-3xl text-balance lg:mt-0 xl:col-span-7">
            {t('certificationTrainingPage.initiative.pathwayTitle')}
          </Heading>
          <Text muted className="mt-5 max-w-2xl lg:mt-3 xl:col-span-5 xl:mt-0">
            {(t('certificationTrainingPage.initiative.paragraphs', { returnObjects: true }) as string[])[1]}
          </Text>
        </div>
      </ScrollReveal>

      {/* Phones: swipe rail (one card + a peek). Tablets: two at a time with arrows. Desktop: all four in a row. */}
      <ol
        ref={railRef}
        onScroll={update}
        role="list"
        className="no-scrollbar -mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-6 px-6 pb-2 md:-mx-10 md:scroll-px-10 md:px-10 lg:-mx-16 lg:mt-7 lg:scroll-px-16 xl:mt-6 lg:px-16 xl:mx-0 xl:grid xl:grid-cols-4 xl:overflow-visible xl:px-0"
      >
        {steps.map((s, i) => (
          <li key={s.title} className="w-[82%] shrink-0 snap-start min-[480px]:w-[60%] md:w-[42%] lg:w-[31%] xl:w-auto">
            <ScrollReveal delay={i * 0.1} className="h-full">
              <div className="flex h-full flex-col rounded-md border border-white/10 bg-graphite p-6 xl:px-6 xl:py-5">
                <span className="font-display text-stat font-semibold tabular-nums text-brand-500">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-6 font-display xl:mt-3 text-h3 font-semibold text-warmwhite">{s.title}</p>
                <p className="mt-1 text-small font-semibold text-brand-400">{s.body}</p>
                <p className="mt-4 text-small text-gray-400 xl:mt-3">{s.detail}</p>
              </div>
            </ScrollReveal>
          </li>
        ))}
      </ol>

      {/* One row under the rail: accreditation notice (start) + rail controls (end).
          Small phones: dots above the notice. 1280px+: all four cards fit, so no controls. */}
      <div className="mt-6 flex flex-col-reverse gap-5 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between min-[480px]:gap-8">
        {/* Accreditation statement (also shown in the Academy tab): label above, text clamped to
            one line until "Read more" — the full sentence stays in the DOM for crawlers. */}
        <div className="min-w-0 max-w-3xl flex-1">
          <div className="flex items-center gap-4">
            <p className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('certificationTrainingPage.initiative.disclaimerLabel')}</p>
            <button
              type="button"
              aria-expanded={noticeOpen}
              aria-controls="ct-accreditation-text"
              onClick={() => setNoticeOpen((open) => !open)}
              className="-my-2 inline-flex items-center gap-1 py-2 text-caption font-semibold text-gray-400 transition-colors duration-base hover:text-warmwhite"
            >
              {noticeOpen ? t('common:buttons.showLess') : t('common:buttons.readMore')}
              <ChevronDown size={14} aria-hidden="true" className={cn('transition-transform duration-base', noticeOpen && 'rotate-180')} />
            </button>
          </div>
          <p id="ct-accreditation-text" className={cn('mt-1.5 text-small text-gray-300', !noticeOpen && 'line-clamp-1')}>
            {t('certificationTrainingPage.initiative.disclaimer')}
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-center xl:hidden">
          <div aria-hidden="true" className="flex gap-1.5 min-[480px]:hidden">
            {steps.map((s, i) => (
              <span key={s.title} className={cn('h-1.5 rounded-full transition-all duration-base', i === active ? 'w-5 bg-warmwhite' : 'w-1.5 bg-white/25')} />
            ))}
          </div>
          <div className="hidden gap-2 min-[480px]:flex">
            <button type="button" onClick={() => step(-1)} disabled={!edges.canPrev} aria-label={t('certificationTrainingPage.initiative.prevStep')} className={arrow}>
              <ChevronLeft size={18} aria-hidden="true" className="rtl:rotate-180" />
            </button>
            <button type="button" onClick={() => step(1)} disabled={!edges.canNext} aria-label={t('certificationTrainingPage.initiative.nextStep')} className={arrow}>
              <ChevronRight size={18} aria-hidden="true" className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- Closing */

function Closing() {
  const { t } = useTranslation('about');
  return (
    <Section background="warmwhite" spacing="sm">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-8 lg:gap-12">
        <ScrollReveal className="md:col-span-7">
          <Eyebrow>{t('certificationTrainingPage.closing.eyebrow')}</Eyebrow>
          <Heading level="display" as="h2" className="mt-4 text-balance">
            {t('certificationTrainingPage.closing.heading')}
          </Heading>
          <Text muted className="mt-6 max-w-2xl">
            {t('certificationTrainingPage.closing.body')}
          </Text>
        </ScrollReveal>
        <ScrollReveal delay={0.08} className="md:col-span-5">
          <div className="mx-auto w-full aspect-[4/3] overflow-hidden rounded-md bg-gray-100 md:aspect-[4/5] lg:aspect-[5/4]">
            <img
              src={photos.closing.src}
              alt={t('certificationTrainingPage.closing.imageAlt')}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ objectPosition: photos.closing.focus }}
            />
          </div>
        </ScrollReveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------- FAQ */

/** Questions shown before "View more questions" — same pattern as the Services FAQ. */
const FAQ_INITIAL_VISIBLE = 6;

function Faq() {
  const { t } = useTranslation(['about', 'services']);
  const items = t('certificationTrainingPage.faq.items', { returnObjects: true }) as FaqItem[];
  const [open, setOpen] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);
  const hasMore = items.length > FAQ_INITIAL_VISIBLE;

  return (
    // Stone: offset from the warm-white closing section above.
    <Section id="faq" background="stone" spacing="sm" className="scroll-mt-20">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Heading column: sticks on desktop while the questions scroll past, so it never leaves blank space. */}
        <ScrollReveal className="lg:sticky lg:top-[97px] lg:col-span-4 lg:self-start">
          <Eyebrow>{t('certificationTrainingPage.faq.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" className="mt-3 text-balance">
            {t('certificationTrainingPage.faq.heading')}
          </Heading>
          <Text muted className="mt-5 max-w-md">
            {t('certificationTrainingPage.faq.intro')}
          </Text>
          <ButtonLink href="/contact" variant="primary" trailingIcon={ArrowRight} className="mt-8">
            {t('certificationTrainingPage.faq.contactCta')}
          </ButtonLink>
        </ScrollReveal>

        {/* Questions. */}
        <div className="lg:col-span-8">
          <div className="border-t border-gray-200">
            {items.map((item, i) => {
              const shown = showAll || i < FAQ_INITIAL_VISIBLE;
              const isOpen = open === i;
              return (
                <div key={item.question} hidden={!shown} className="relative border-b border-gray-200">
                  {/* Subtle cerulean indicator on the active question. */}
                  <span
                    aria-hidden="true"
                    className={cn('absolute -start-px top-0 h-full w-0.5 bg-brand-500 transition-opacity duration-base', isOpen ? 'opacity-100' : 'opacity-0')}
                  />
                  <h3>
                    <button
                      type="button"
                      id={`ct-faq-q-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`ct-faq-a-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-5 ps-5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
                    >
                      <span className={cn('font-display text-body-lg font-semibold transition-colors duration-base', isOpen ? 'text-brand-600' : 'text-charcoal')}>{item.question}</span>
                      <ChevronDown size={20} aria-hidden="true" className={cn('shrink-0 transition-transform duration-base', isOpen ? 'rotate-180 text-brand-500' : 'text-gray-400')} />
                    </button>
                  </h3>
                  {/* Collapsed answers stay in the DOM (crawlable); grid rows animate the height. */}
                  <div
                    id={`ct-faq-a-${i}`}
                    role="region"
                    aria-labelledby={`ct-faq-q-${i}`}
                    aria-hidden={!isOpen}
                    {...(isOpen ? {} : { inert: '' })}
                    className={cn('grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
                  >
                    <div className="overflow-hidden">
                      <div className="max-w-2xl pb-6 ps-5">
                        <p className="text-body leading-relaxed text-gray-600">{item.answer}</p>
                        {(item.link || item.link2) && (
                          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                            {[item.link, item.link2].filter((l): l is FaqLink => Boolean(l)).map((l) => (
                              <SmartLink key={l.href} href={l.href} className="inline-flex min-h-9 items-center gap-1.5 text-small font-semibold text-brand-600 hover:text-brand-700">
                                {l.label}
                                <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
                              </SmartLink>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <button
              type="button"
              aria-expanded={showAll}
              onClick={() => {
                if (showAll && open !== null && open >= FAQ_INITIAL_VISIBLE) setOpen(null);
                setShowAll((value) => !value);
              }}
              className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700"
            >
              {showAll ? t('services:listing.faq.viewLess') : t('services:listing.faq.viewMore')}
              <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform duration-base', showAll && 'rotate-180')} />
            </button>
          )}
        </div>
      </div>
    </Section>
  );
}
