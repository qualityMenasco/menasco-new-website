/**
 * Shared two-column grid split for the standard (non-cinematic) project
 * detail template's desktop layout — the hero/metrics row and the
 * tabs/gallery row below it both use this exact same `1.9fr / 1fr` column
 * split so the right-hand column (metrics panel, then gallery) stays
 * pixel-identical in width between the two rows. Defined once here and
 * imported by both rows instead of restating the fraction twice (see the
 * Ratio+Format spec this implements).
 *
 * Desktop-only — `ProjectDetailPage.tsx`'s default branch only ever renders
 * at `useIsDesktop()` (>=1025px), so this has no responsive breakpoints of
 * its own; the mobile tree (`src/mobile/pages/ProjectDetailPage.tsx`)
 * implements its own independent single-column stacked order.
 */
export const PROJECT_DETAIL_GRID = 'grid grid-cols-[1.9fr_1fr] gap-6';
