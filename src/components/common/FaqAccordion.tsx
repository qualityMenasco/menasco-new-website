import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FaqAccordionItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqAccordionItem[];
  /** Unique prefix for the question/answer ids on the page. */
  idPrefix: string;
  className?: string;
}

/**
 * Single-column FAQ accordion — thin dividers, one answer open at a time, a
 * cerulean bar and chevron on the active question. Answers stay in the DOM
 * (collapsed, inert) so they remain crawlable.
 */
export function FaqAccordion({ items, idPrefix, className }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={cn('border-t border-gray-200', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.question} className="relative border-b border-gray-200">
            <span
              aria-hidden="true"
              className={cn('absolute -start-px top-0 h-full w-0.5 bg-brand-500 transition-opacity duration-base', isOpen ? 'opacity-100' : 'opacity-0')}
            />
            <h3>
              <button
                type="button"
                id={`${idPrefix}-q-${i}`}
                aria-expanded={isOpen}
                aria-controls={`${idPrefix}-a-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-4 ps-5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
              >
                <span className={cn('font-display text-body-lg font-semibold transition-colors duration-base', isOpen ? 'text-brand-600' : 'text-charcoal')}>{item.question}</span>
                <ChevronDown size={20} aria-hidden="true" className={cn('shrink-0 transition-transform duration-base', isOpen ? 'rotate-180 text-brand-500' : 'text-gray-400')} />
              </button>
            </h3>
            <div
              id={`${idPrefix}-a-${i}`}
              role="region"
              aria-labelledby={`${idPrefix}-q-${i}`}
              {...(isOpen ? {} : { inert: '' })}
              className={cn('grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl pb-5 ps-5 text-body leading-relaxed text-gray-600">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
