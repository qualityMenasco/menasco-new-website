import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { SectionThemeContext } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Container, type ContainerWidth } from './Container';

export type SectionBackground = 'warmwhite' | 'stone' | 'charcoal' | 'graphite' | 'ink' | 'transparent';
export type SectionSpacing = 'sm' | 'md' | 'lg';
export type SectionBorder = 'none' | 'top' | 'bottom' | 'both';

const backgroundClasses: Record<SectionBackground, string> = {
  warmwhite: 'bg-warmwhite',
  stone: 'bg-stone',
  charcoal: 'bg-charcoal',
  graphite: 'bg-graphite',
  ink: 'bg-ink',
  transparent: 'bg-transparent',
};

const darkBackgrounds: SectionBackground[] = ['charcoal', 'graphite', 'ink'];

const spacingClasses: Record<SectionSpacing, string> = {
  sm: 'py-10 md:py-14',
  md: 'py-14 md:py-20',
  lg: 'py-16 md:py-24',
};

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  background?: SectionBackground;
  /** Content theme. Defaults to a value inferred from `background`. */
  theme?: Theme;
  spacing?: SectionSpacing;
  border?: SectionBorder;
  containerWidth?: ContainerWidth;
  /** Render children without wrapping them in a Container (for custom inner layout). */
  disableContainer?: boolean;
  /**
   * Adds a very soft gradient at the section's top and bottom edges so it
   * blends into its neighbours instead of cutting sharply. Off by default —
   * every existing page keeps its current hard edges unless this is set.
   */
  edgeFade?: boolean;
  children: ReactNode;
}

export function Section({
  background = 'warmwhite',
  theme,
  spacing = 'md',
  border = 'none',
  containerWidth = 'standard',
  disableContainer = false,
  edgeFade = false,
  id,
  className,
  children,
  ...rest
}: SectionProps) {
  const resolvedTheme: Theme = theme ?? (darkBackgrounds.includes(background) ? 'dark' : 'light');
  const borderColor = resolvedTheme === 'dark' ? 'border-white/10' : 'border-gray-200';
  // Dark sections deepen slightly toward black at their edges; light sections
  // soften toward a faint ink tint — both read as a gentle seam regardless of
  // what the neighbouring section actually is, at a low enough intensity
  // (~5-8%) that it never looks like a hard vignette.
  const fadeTint = resolvedTheme === 'dark' ? 'rgba(0, 0, 0, 0.16)' : 'rgba(10, 11, 13, 0.05)';

  return (
    <SectionThemeContext.Provider value={resolvedTheme}>
      <section
        id={id}
        className={cn(
          'relative',
          backgroundClasses[background],
          spacingClasses[spacing],
          border === 'top' || border === 'both' ? cn('border-t', borderColor) : undefined,
          border === 'bottom' || border === 'both' ? cn('border-b', borderColor) : undefined,
          className,
        )}
        {...rest}
      >
        {edgeFade && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-20"
              style={{ background: `linear-gradient(to bottom, ${fadeTint}, transparent)` }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
              style={{ background: `linear-gradient(to top, ${fadeTint}, transparent)` }}
            />
          </>
        )}
        {disableContainer ? children : <Container width={containerWidth}>{children}</Container>}
      </section>
    </SectionThemeContext.Provider>
  );
}
