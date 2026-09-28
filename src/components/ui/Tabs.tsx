import { useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';

export interface TabData {
  id: string;
  label: string;
  content: ReactNode;
}

export type TabsVariant = 'underline' | 'pill';

export interface TabsProps {
  tabs: TabData[];
  variant?: TabsVariant;
  defaultTabId?: string;
  theme?: Theme;
  className?: string;
}

export function Tabs({ tabs, variant = 'underline', defaultTabId, theme, className }: TabsProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
  const uid = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = useReducedMotion();

  const activeIndex = Math.max(tabs.findIndex((tab) => tab.id === activeId), 0);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = tabs.length;
    let target: number | null = null;
    if (event.key === 'ArrowRight') target = (index + 1) % count;
    else if (event.key === 'ArrowLeft') target = (index - 1 + count) % count;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = count - 1;
    if (target !== null) {
      event.preventDefault();
      const nextTab = tabs[target];
      setActiveId(nextTab.id);
      tabRefs.current[target]?.focus();
    }
  };

  const indicatorTransition = reducedMotion ? { duration: 0 } : { duration: 0.25, ease: [0.22, 0.61, 0.36, 1] as const };

  return (
    <div className={className}>
      <div
        role="tablist"
        className={cn(
          '-mx-6 flex gap-1 overflow-x-auto px-6 sm:mx-0 sm:px-0',
          variant === 'underline'
            ? cn('gap-6 border-b', isDark ? 'border-white/10' : 'border-gray-200')
            : cn('w-fit rounded-md p-1', isDark ? 'bg-white/5' : 'bg-stone'),
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              type="button"
              id={`${uid}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${uid}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                'relative shrink-0 whitespace-nowrap font-sans text-small font-semibold transition-colors duration-base',
                variant === 'underline'
                  ? cn('pb-4 pt-1', isActive ? (isDark ? 'text-warmwhite' : 'text-ink') : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-ink')
                  : cn(
                      'rounded-sm px-4 py-2',
                      isActive ? (isDark ? 'text-ink' : 'text-ink') : isDark ? 'text-gray-300 hover:text-warmwhite' : 'text-gray-600 hover:text-ink',
                    ),
              )}
            >
              {variant === 'pill' && isActive && (
                <motion.span
                  layoutId={`${uid}-pill`}
                  transition={indicatorTransition}
                  className="absolute inset-0 -z-10 rounded-sm bg-warmwhite shadow-soft"
                />
              )}
              <span className="relative">{tab.label}</span>
              {variant === 'underline' && isActive && (
                <motion.span
                  layoutId={`${uid}-underline`}
                  transition={indicatorTransition}
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600"
                />
              )}
            </button>
          );
        })}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${uid}-panel-${tab.id}`}
          aria-labelledby={`${uid}-tab-${tab.id}`}
          hidden={index !== activeIndex}
          tabIndex={0}
          className="pt-6"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
