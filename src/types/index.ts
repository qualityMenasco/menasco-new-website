import type { LucideIcon } from 'lucide-react';

/** Shared prop types used across the component library. */

export type Theme = 'light' | 'dark';

export type Align = 'left' | 'center';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type Size = 'sm' | 'md' | 'lg';

export type Accent = 'brand' | 'sand' | 'gray';

export type IconComponent = LucideIcon;

export interface LinkProps {
  label: string;
  href: string;
}
