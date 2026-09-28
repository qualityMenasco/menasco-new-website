import type { Theme } from '../types';

export interface VelaTimelineStage {
  id: string;
  title: string;
  description: string;
  /** Scroll progress (0–1) at which this stage becomes the active one. */
  startProgress: number;
  /**
   * Site-header theme to show while this stage is active, so the transparent
   * header stays readable. This sequence carries a permanent dark gradient
   * overlay across its top band throughout (see ScrollFrameAnimation), so
   * every stage stays 'dark' (white header text) regardless of the frame's
   * own content.
   */
  headerTheme: Theme;
  /** Short custom eyebrow shown instead of the default "Stage X of Y" label. */
  eyebrow?: string;
}

/**
 * Narrative beats for the VELA scroll-frame sequence — played in reverse
 * (see `reverse` on ScrollFrameAnimation's config in ProjectDetailPage.tsx):
 * the completed building is the first thing scrolled into, progressively
 * revealing the MEP engineering behind it. Editorial copy supplied directly
 * by the user (2026-09-09) for the native-16:9 sequence.
 */
export const velaTimeline: VelaTimelineStage[] = [
  {
    id: 'engineering-excellence',
    eyebrow: 'VELA BY OMNIYAT',
    title: 'Engineering Excellence',
    description: "MENASCO's MEP expertise behind one of Dubai's landmark developments.",
    startProgress: 0,
    headerTheme: 'dark',
  },
  {
    id: 'behind-the-architecture',
    eyebrow: 'BEHIND THE ARCHITECTURE',
    title: 'Engineering Revealed',
    description: 'Mechanical, electrical and plumbing systems coordinated and integrated throughout the development.',
    startProgress: 0.25,
    headerTheme: 'dark',
  },
  {
    id: 'mep-integration',
    eyebrow: 'MEP INTEGRATION',
    title: 'Built Into Every Detail',
    description: 'Complex services integrated seamlessly within the architecture.',
    startProgress: 0.6,
    headerTheme: 'dark',
  },
  {
    id: 'mep-engineering',
    eyebrow: 'MEP ENGINEERING',
    title: 'The Systems Behind VELA',
    description: 'Integrated building systems engineered before they disappear behind the finished environment.',
    startProgress: 0.85,
    headerTheme: 'dark',
  },
];
