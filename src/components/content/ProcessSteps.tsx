import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Eyebrow, Heading, Text } from '../typography/Typography';

export interface ProcessStepData {
  title: string;
  description?: string;
  number?: string;
  /** Small uppercase label above the title — e.g. a project stage ("Design", "Handover"). */
  eyebrow?: string;
}

export interface ProcessStepsProps {
  steps: ProcessStepData[];
  theme?: Theme;
  className?: string;
}

const COLUMNS_AT_LG = 4;

/** Horizontal on desktop (wraps every 4 into a row), vertical with a connecting line on mobile. */
export function ProcessSteps({ steps, theme, className }: ProcessStepsProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const lineColor = isDark ? 'bg-white/15' : 'bg-gray-300';
  const badgeColor = isDark ? 'border-warmwhite text-warmwhite' : 'border-ink text-ink';

  return (
    <div className={cn('relative', className)}>
      <span className={cn('absolute start-[19px] top-2 bottom-2 w-px sm:hidden', lineColor)} aria-hidden="true" />
      <ol className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isRowEndAtLg = index % COLUMNS_AT_LG === COLUMNS_AT_LG - 1;
          return (
            <li key={step.title} className="relative flex gap-4 sm:flex-col">
              <div className="relative z-10 flex shrink-0 items-center gap-3 sm:w-full">
                <span
                  className={cn(
                    'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-warmwhite font-display text-small font-semibold tabular-nums',
                    badgeColor,
                    isDark && 'bg-charcoal',
                  )}
                >
                  {step.number ?? String(index + 1).padStart(2, '0')}
                </span>
                {!isLast && !isRowEndAtLg && <span className={cn('hidden h-px flex-1 lg:block', lineColor)} aria-hidden="true" />}
              </div>
              <div className="flex flex-col gap-1 pt-0.5 sm:pt-3">
                {step.eyebrow && <Eyebrow theme={resolvedTheme}>{step.eyebrow}</Eyebrow>}
                <Heading level="h4" theme={resolvedTheme}>
                  {step.title}
                </Heading>
                {step.description && (
                  <Text variant="small" theme={resolvedTheme} muted>
                    {step.description}
                  </Text>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
