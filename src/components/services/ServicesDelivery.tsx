import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Eyebrow } from '../typography/Typography';
import { cn } from '../../lib/utils';

interface Step {
  title: string;
  body: string;
}

interface ServicesDeliveryProps {
  /**
   * `row` (desktop): all five steps in one horizontal row, revealed in
   * sequence on scroll — the line draws across, then each marker pops in and
   * its text rises. `stepper` (phones/tablets): a tap-through stepper — the
   * five markers on a short track, one step's text shown at a time.
   */
  layout?: 'row' | 'stepper';
}

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.25 } },
};
const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } },
};
const stepVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const markerVariants: Variants = {
  hidden: { scale: 0.5, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 380, damping: 22 } },
};

/** Section surface — markers sit on it, so they mask the line behind them. */
const SURFACE = 'bg-[#ebe4df]';

/**
 * Services "How we deliver" — the five-step delivery sequence that ties the
 * disciplines together, on a light taupe surface.
 */
export function ServicesDelivery({ layout = 'row' }: ServicesDeliveryProps) {
  const { t } = useTranslation('services');
  const steps = t('listing.delivery.steps', { returnObjects: true }) as Step[];

  return (
    <div>
      <Eyebrow>{t('listing.delivery.eyebrow')}</Eyebrow>
      <h2 id="services-delivery-heading" className="mt-3 max-w-4xl font-display text-h2 font-semibold text-ink text-balance">
        {t('listing.delivery.heading')}
      </h2>
      {layout === 'stepper' ? <DeliveryStepper steps={steps} /> : <DeliveryRow steps={steps} />}
    </div>
  );
}

/* ------------------------------------------------------------- desktop row */

function DeliveryRow({ steps }: { steps: Step[] }) {
  const reducedMotion = useReducedMotion();
  const motionOn = !reducedMotion;
  const reveal = motionOn ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.45 } } : {};

  return (
    <motion.ol role="list" variants={listVariants} {...reveal} className="relative mt-10 grid grid-cols-5 gap-6">
      {/* Connecting line through the markers, ending at the last one. */}
      <motion.span
        aria-hidden="true"
        variants={motionOn ? lineVariants : undefined}
        className="absolute end-[calc((100%-6rem)/5-1rem)] start-4 top-4 h-px origin-left bg-gray-300 rtl:origin-right"
      />
      {steps.map((step, index) => (
        <motion.li key={step.title} variants={motionOn ? stepVariants : undefined} className="relative">
          <motion.span
            variants={motionOn ? markerVariants : undefined}
            className={cn('flex h-8 w-8 items-center justify-center rounded-full border border-brand-500 font-display text-caption font-semibold tabular-nums text-brand-600', SURFACE)}
          >
            {String(index + 1).padStart(2, '0')}
          </motion.span>
          <h3 className="mt-4 font-display text-h4 font-semibold text-ink">{step.title}</h3>
          <p className="mt-2 text-small leading-relaxed text-gray-700">{step.body}</p>
        </motion.li>
      ))}
    </motion.ol>
  );
}

/* ------------------------------------------------ phones/tablets: stepper */

function DeliveryStepper({ steps }: { steps: Step[] }) {
  const { t } = useTranslation('services');
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const last = steps.length - 1;
  const label = (index: number) => t('listing.delivery.stepLabel', { number: String(index + 1).padStart(2, '0') });

  const navButton =
    'inline-flex h-11 items-center gap-1.5 rounded-full border border-gray-400/60 px-4 text-small font-semibold text-ink transition-colors duration-base hover:border-ink disabled:cursor-default disabled:opacity-35';

  return (
    <div className="mt-6">
      {/* Track: every step on one short line; the brand line fills up to the current step. */}
      <div role="group" aria-label={t('listing.delivery.stepsLabel')} className="relative flex items-center justify-between">
        <span aria-hidden="true" className="absolute end-4 start-4 top-1/2 h-px -translate-y-1/2 bg-gray-300" />
        <span
          aria-hidden="true"
          className="absolute start-4 top-1/2 h-0.5 -translate-y-1/2 bg-brand-600 transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `calc((100% - 2rem) * ${active / last})` }}
        />
        {steps.map((s, index) => {
          const done = index < active;
          const current = index === active;
          return (
            <button
              key={s.title}
              type="button"
              onClick={() => setActive(index)}
              aria-current={current ? 'step' : undefined}
              aria-label={`${label(index)}: ${s.title}`}
              className={cn(
                'relative flex h-8 w-8 items-center justify-center rounded-full border font-display text-caption font-semibold tabular-nums transition-[background-color,border-color,color,box-shadow] duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                done && 'border-brand-600 bg-brand-600 text-white',
                current && 'border-2 border-brand-500 bg-white text-brand-600 shadow-[0_0_0_4px_rgba(28,183,240,0.15)]',
                !done && !current && cn('border-gray-400/60 text-gray-500', SURFACE),
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </button>
          );
        })}
      </div>

      {/* Current step — fades between steps; announced politely to screen readers. */}
      <div aria-live="polite" className="relative mt-6 min-h-[9rem]">
        {/* Every step is in the HTML (SEO); only the current one is shown, fading in. */}
        {steps.map((s, index) => {
          const isCurrent = index === active;
          return (
            <motion.div
              key={s.title}
              hidden={!isCurrent}
              initial={false}
              animate={isCurrent ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
            >
              <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{label(index)}</p>
              <h3 className="mt-2 font-display text-h3 font-semibold text-ink">{s.title}</h3>
              <p className="mt-3 max-w-xl text-body leading-relaxed text-gray-700">{s.body}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={() => setActive((i) => Math.max(0, i - 1))} disabled={active === 0} className={navButton}>
          <ChevronLeft size={16} aria-hidden="true" className="rtl:rotate-180" />
          {t('listing.delivery.back')}
        </button>
        <button type="button" onClick={() => setActive((i) => Math.min(last, i + 1))} disabled={active === last} className={navButton}>
          {t('listing.delivery.next')}
          <ChevronRight size={16} aria-hidden="true" className="rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
