import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface AccordionTopic {
  title: string;
  body: string[];
}

export interface TopicAccordionProps {
  topics: AccordionTopic[];
  /** Index open on first render; null for all closed. */
  defaultOpen?: number | null;
  /** Unique prefix for the button/panel ids. */
  idPrefix: string;
  className?: string;
}

/**
 * Expandable topic rows (Quality, Health & Safety page, desktop and mobile).
 * One open at a time; the panel stays mounted-on-demand and animates its
 * height, honouring reduced motion.
 */
export function TopicAccordion({ topics, defaultOpen = 0, idPrefix, className }: TopicAccordionProps) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const reducedMotion = useReducedMotion();
  return (
    <div className={cn('border-t border-gray-300', className)}>
      {topics.map((topic, i) => {
        const isOpen = open === i;
        return (
          <div key={topic.title} className="border-b border-gray-300">
            <h3>
              <button
                type="button"
                id={`${idPrefix}-btn-${i}`}
                aria-expanded={isOpen}
                aria-controls={`${idPrefix}-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <span className="flex items-baseline gap-4">
                  <span dir="ltr" className="text-small font-semibold tabular-nums text-brand-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-h4 font-semibold text-ink">{topic.title}</span>
                </span>
                <ChevronDown size={20} aria-hidden="true" className={cn('shrink-0 text-gray-500 transition-transform duration-base', isOpen && 'rotate-180')} />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${idPrefix}-panel-${i}`}
                  role="region"
                  aria-labelledby={`${idPrefix}-btn-${i}`}
                  initial={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="max-w-3xl space-y-3 pb-6 ps-10 text-body text-gray-700">
                    {topic.body.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
