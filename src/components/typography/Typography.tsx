import { forwardRef } from 'react';
import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { HeadingLevel, Theme } from '../../types';

interface ThemedProps {
  theme?: Theme;
  className?: string;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Heading — visual scale (`level`) is independent from the semantic tag
// rendered (`as`), so hierarchy can be styled without breaking document
// outline correctness.
// ---------------------------------------------------------------------------

export type HeadingLevelStyle = 'display' | 'h1' | 'h2' | 'h3' | 'h4';

const headingStyles: Record<HeadingLevelStyle, string> = {
  display: 'text-display font-display font-semibold tracking-tight',
  h1: 'text-h1 font-display font-semibold tracking-tight',
  h2: 'text-h2 font-display font-semibold tracking-tight',
  h3: 'text-h3 font-display font-semibold',
  h4: 'text-h4 font-display font-semibold',
};

const defaultTag: Record<HeadingLevelStyle, HeadingLevel> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
};

export interface HeadingProps extends ThemedProps, Omit<HTMLAttributes<HTMLHeadingElement>, 'children' | 'className'> {
  level?: HeadingLevelStyle;
  /** Semantic tag to render — set explicitly when visual scale and document outline diverge. */
  as?: HeadingLevel;
}

export function Heading({ level = 'h2', as, theme, className, children, ...rest }: HeadingProps) {
  const resolvedTheme = useSectionTheme(theme);
  const Tag = as ?? defaultTag[level];
  return (
    <Tag
      className={cn(headingStyles[level], resolvedTheme === 'dark' ? 'text-warmwhite' : 'text-ink', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Text — body copy scale.
// ---------------------------------------------------------------------------

export type TextVariant = 'body-lg' | 'body' | 'small' | 'caption';

const textStyles: Record<TextVariant, string> = {
  'body-lg': 'text-body-lg',
  body: 'text-body',
  small: 'text-small',
  caption: 'text-caption',
};

export interface TextProps extends ThemedProps, Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'> {
  variant?: TextVariant;
  as?: ElementType;
  /** Muted tone for secondary copy (captions, meta text, helper text). */
  muted?: boolean;
}

export function Text({ variant = 'body', as: Tag = 'p', theme, muted = false, className, children, ...rest }: TextProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isCaption = variant === 'caption';
  const color =
    resolvedTheme === 'dark'
      ? muted || isCaption
        ? 'text-gray-400'
        : 'text-gray-300'
      : muted || isCaption
        ? 'text-gray-500'
        : 'text-gray-700';

  return (
    <Tag className={cn('font-sans', textStyles[variant], color, className)} {...rest}>
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Eyebrow — small uppercase label used above headings.
// ---------------------------------------------------------------------------

export interface EyebrowProps extends ThemedProps, Omit<HTMLAttributes<HTMLParagraphElement>, 'children' | 'className'> {
  as?: ElementType;
}

export function Eyebrow({ as: Tag = 'p', theme, className, children, ...rest }: EyebrowProps) {
  const resolvedTheme = useSectionTheme(theme);
  return (
    <Tag
      className={cn(
        'text-eyebrow font-sans font-semibold uppercase',
        resolvedTheme === 'dark' ? 'text-brand-400' : 'text-brand-600',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// StatText — large numeric display used for statistics.
// ---------------------------------------------------------------------------

export interface StatTextProps extends ThemedProps, Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'> {
  as?: ElementType;
}

export const StatText = forwardRef<HTMLElement, StatTextProps>(function StatText(
  { as: Tag = 'span', theme, className, children, ...rest },
  ref,
) {
  const resolvedTheme = useSectionTheme(theme);
  return (
    <Tag
      ref={ref}
      className={cn(
        'text-stat font-display font-semibold tabular-nums tracking-tight',
        resolvedTheme === 'dark' ? 'text-warmwhite' : 'text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
});
