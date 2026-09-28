/**
 * JS-side design tokens.
 *
 * Color, typography, spacing, radius, shadow, container-width, and
 * transition-duration tokens live in `tailwind.config.js` as the source of
 * truth for styling. This file mirrors only the values components need as
 * plain JS/TS (framer-motion durations, matchMedia breakpoints, icon sizes).
 */

export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const durations = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
} as const;

export const easing = {
  engineered: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
};

export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type IconSize = keyof typeof iconSizes;
