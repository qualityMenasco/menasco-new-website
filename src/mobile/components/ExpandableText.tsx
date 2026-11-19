import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
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
 * text stays mounted in the DOM even when collapsed (zero height, inert),
 * so it's in the HTML for search engines.
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
      {/* Always mounted (so the full text is in the HTML for search engines); collapsed to zero height and inert when closed. */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
        className="overflow-hidden"
        {...(isOpen ? {} : { inert: '' })}
      >
        <div className="mt-3 flex flex-col gap-3">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className={textClassName}>
              {paragraph}
            </p>
          ))}
        </div>
      </motion.div>
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
