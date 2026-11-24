import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

/* "On this page" section switcher for the sticky tab bar (client-approved 2026-11-24). */

/** Scroll offset so a jumped-to section clears the site header and the sticky section bar. */
export const SECTION_SCROLL_MARGIN = 'scroll-mt-[104px] md:scroll-mt-[112px] desktop:scroll-mt-[136px]';

export interface JumpSection {
  id: string;
  label: string;
}

/**
 * "On this page" menu for a sticky section bar: shows the section currently in view
 * (scrollspy), opens a numbered list to jump to any section, and draws a thin reading-
 * progress line along the bottom of the bar (the bar must be the nearest positioned
 * ancestor, e.g. a sticky <nav>).
 */
export function SectionJumpMenu({ sections, label, shortLabel, light = false }: { sections: JumpSection[]; label: string; /** Phones: shown with an "04/11" counter instead of the section name. */ shortLabel: string; light?: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // A section counts as current once its top passes just under the sticky bar (measured, so it
      // stays right whatever the header height).
      const bar = wrapRef.current?.closest('nav');
      const offset = (bar ? bar.getBoundingClientRect().bottom : 120) + 32;
      let current: string | null = null;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= offset) current = section.id;
      }
      setActive(current);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sections]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };
  const currentIndex = sections.findIndex((s) => s.id === active);
  const current = currentIndex >= 0 ? sections[currentIndex] : undefined;

  return (
    <>
      <div ref={wrapRef} className="relative ms-auto flex min-w-0 items-stretch">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="true"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex min-w-0 items-center gap-2 font-display text-small font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400',
            light ? 'text-ink hover:text-brand-600' : 'text-white hover:text-brand-300',
          )}
        >
          {/* "On this page:" prefix only once a section is current (avoids "On this page: On this page" at the top). */}
          {current && <span className={cn('hidden shrink-0 lg:inline', light ? 'text-gray-500' : 'text-gray-400')}>{label}:</span>}
          {/* Phones: "Sections 04/11" (no truncated names); full names live in the bottom sheet. */}
          <span className="sm:hidden">
            {shortLabel}
            {current && (
              <span className={cn('ms-1.5 tabular-nums', light ? 'text-gray-500' : 'text-gray-400')}>
                {String(currentIndex + 1).padStart(2, '0')}/{sections.length}
              </span>
            )}
          </span>
          <span className="hidden max-w-[15rem] truncate sm:inline">{current?.label ?? label}</span>
          <ChevronDown size={16} aria-hidden="true" className={cn('shrink-0 transition-transform duration-base', open && 'rotate-180')} />
        </button>
        {open && (
          <>
          {/* Phones: dim the page behind the bottom sheet; tapping it closes the sheet. */}
          <div aria-hidden="true" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-ink/45 sm:hidden" />
          <div
            className={cn(
              // Phones: a full-width sheet from the bottom of the screen. From sm: a dropdown under the bar.
              'fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-auto rounded-t-xl border border-b-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-strong',
              'sm:absolute sm:inset-x-auto sm:bottom-auto sm:end-0 sm:top-full sm:z-40 sm:max-h-[70vh] sm:w-[18rem] sm:rounded-b-md sm:rounded-t-none sm:border-b sm:border-t-0 sm:pb-2',
              light ? 'border-gray-200 bg-white' : 'border-white/10 bg-charcoal',
            )}
          >
            <span aria-hidden="true" className={cn('mx-auto mb-2 block h-1 w-10 rounded-full sm:hidden', light ? 'bg-gray-300' : 'bg-white/25')} />
            <p className={cn('px-4 pb-1 pt-1 font-display text-caption font-semibold uppercase tracking-widest rtl:tracking-normal', light ? 'text-gray-500' : 'text-gray-400')}>{label}</p>
            <ol>
              {sections.map((section, i) => {
                const on = section.id === active;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => go(section.id)}
                      aria-current={on ? 'true' : undefined}
                      className={cn(
                        'flex min-h-11 w-full items-center gap-3 px-4 py-2 text-start text-body transition-colors duration-base sm:min-h-0 sm:items-baseline sm:text-small',
                        on
                          ? light
                            ? 'bg-stone font-semibold text-brand-600'
                            : 'bg-white/5 font-semibold text-brand-400'
                          : light
                            ? 'text-gray-700 hover:bg-stone hover:text-ink'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white',
                      )}
                    >
                      <span className={cn('w-5 shrink-0 font-display text-caption tabular-nums', on ? '' : 'text-gray-500')}>{String(i + 1).padStart(2, '0')}</span>
                      {section.label}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          </>
        )}
      </div>
      {/* Reading progress along the bar's bottom edge: a 1px neutral line, so brand blue stays
          reserved for the active page tab (client feedback 2026-11-24). */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-px h-px overflow-hidden">
        <span className={cn('block h-full origin-left rtl:origin-right', light ? 'bg-ink/30' : 'bg-white/35')} style={{ transform: `scaleX(${progress})` }} />
      </span>
    </>
  );
}
