import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export interface ExpandableTextProps {
  /** Always-visible summary text. */
  summary: string;
  /** Full paragraphs, revealed on "Read more" — none of it is removed, only collapsed by default. */
  paragraphs: string[];
  expandLabel?: string;
  collapseLabel?: string;
  className?: string;
  /** Paragraph text classes; defaults to body-size ink (override for dark sections or larger copy). */
  textClassName?: string;
  /** "Read more" button colour; defaults to brand-600. */
  buttonClassName?: string;
}

/**
 * Progressive disclosure for long approved copy — shows a short summary
 * first, with the complete text (unedited) available one tap away. The full
 * text stays in the DOM even when collapsed (just visually hidden via
 * height animation), so it's still crawlable by search engines.
 */
export function ExpandableText({
  summary,
  paragraphs,
  expandLabel = 'Read more',
  collapseLabel = 'Show less',
  className,
  textClassName = 'text-body leading-relaxed text-ink',
  buttonClassName = 'text-brand-600',
}: ExpandableTextProps) {
  const [isOpen, setIsOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <div className={className}>
      <p className={textClassName}>{summary}</p>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-3">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className={textClassName}>
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {paragraphs.length > 0 && (
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          className={cn('mt-2 inline-flex items-center gap-1 text-small font-semibold', buttonClassName)}
        >
          {isOpen ? collapseLabel : expandLabel}
          <ChevronDown size={15} aria-hidden="true" className={cn('transition-transform duration-base', isOpen && 'rotate-180')} />
        </button>
      )}
    </div>
  );
}
