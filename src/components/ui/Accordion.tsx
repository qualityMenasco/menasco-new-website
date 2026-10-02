import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Text } from '../typography/Typography';

export interface AccordionItemData {
  id: string;
  title: string;
  content: string;
}

export interface AccordionProps {
  items: AccordionItemData[];
  /** Allows more than one panel open at once. Defaults to single-open. */
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  theme?: Theme;
  className?: string;
  triggerClassName?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  theme,
  className,
  triggerClassName,
}: AccordionProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpenIds));
  const baseId = useId();
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = useReducedMotion();
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) {
        if (allowMultiple) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = items.length;
    let target: number | null = null;
    if (event.key === 'ArrowDown') target = (index + 1) % count;
    else if (event.key === 'ArrowUp') target = (index - 1 + count) % count;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = count - 1;
    if (target !== null) {
      event.preventDefault();
      triggerRefs.current[target]?.focus();
    }
  };

  return (
    <div className={cn('flex flex-col border-t', borderColor, className)}>
      {items.map((item, index) => {
        const isOpen = openIds.has(item.id);
        const headerId = `${baseId}-header-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;
        return (
          <div key={item.id} className={cn('border-b', borderColor)}>
            <h3>
              <button
                ref={(el) => {
                  triggerRefs.current[index] = el;
                }}
                id={headerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={cn(
                  'flex w-full items-center justify-between gap-4 py-5 text-start font-display text-h4 font-semibold transition-colors duration-base',
                  triggerClassName,
                  isDark ? 'text-warmwhite hover:text-brand-400' : 'text-ink hover:text-brand-600',
                )}
              >
                <span>{item.title}</span>
                <ChevronDown
                  size={20}
                  aria-hidden="true"
                  className={cn('shrink-0 transition-transform duration-base ease-engineered', isOpen && 'rotate-180')}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={reducedMotion ? { duration: 0 } : { duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <Text theme={resolvedTheme} className="pb-5">
                    {item.content}
                  </Text>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
