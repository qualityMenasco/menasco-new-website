import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export interface MobileAccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/** Single expandable accordion group — used for nav sub-sections and for progressive disclosure of longer content. */
export function MobileAccordion({ title, children, defaultOpen = false, className }: MobileAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const reducedMotion = useReducedMotion();
  const panelId = useId();

  return (
    <div className={cn('border-b border-gray-200', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 py-4 text-start"
      >
        <span className="font-display text-body-lg font-semibold text-ink">{title}</span>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={cn('shrink-0 text-gray-500 transition-transform duration-base', isOpen && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
