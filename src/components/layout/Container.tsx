import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type ContainerWidth = 'narrow' | 'standard' | 'wide' | 'full';

const widthClasses: Record<ContainerWidth, string> = {
  narrow: 'max-w-narrow',
  standard: 'max-w-container',
  wide: 'max-w-wide',
  full: 'max-w-none',
};

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  width?: ContainerWidth;
  /** Applies the standard responsive horizontal gutter. Disable for edge-to-edge content. */
  gutter?: boolean;
  as?: ElementType;
  children: ReactNode;
}

export function Container({
  width = 'standard',
  gutter = true,
  as: Tag = 'div',
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <Tag
      className={cn('mx-auto w-full', widthClasses[width], gutter && 'px-6 md:px-10 lg:px-16', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
