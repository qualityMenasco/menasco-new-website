import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type StackSpace = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around';

const spaceClasses: Record<StackSpace, string> = {
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12',
};

const alignClasses: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses: Record<StackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

interface SharedProps extends HTMLAttributes<HTMLElement> {
  space?: StackSpace;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  as?: ElementType;
  children: ReactNode;
}

export interface StackProps extends SharedProps {}

/** Vertical layout primitive. */
export function Stack({
  space = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  as: Tag = 'div',
  className,
  children,
  ...rest
}: StackProps) {
  return (
    <Tag
      className={cn('flex flex-col', spaceClasses[space], alignClasses[align], justifyClasses[justify], wrap && 'flex-wrap', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export interface RowProps extends SharedProps {
  /** Stacks vertically below the `sm` breakpoint, then becomes a row. Defaults to on. */
  responsive?: boolean;
}

/** Horizontal grouping primitive. */
export function Row({
  space = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  responsive = true,
  as: Tag = 'div',
  className,
  children,
  ...rest
}: RowProps) {
  return (
    <Tag
      className={cn(
        'flex',
        responsive ? 'flex-col sm:flex-row' : 'flex-row',
        spaceClasses[space],
        alignClasses[align],
        justifyClasses[justify],
        wrap && 'flex-wrap',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
