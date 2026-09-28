import type { VelaTimelineStage } from './velaTimeline';

/**
 * Editorial narrative for the Saudi F1 Track cinematic scroll sequence.
 * No approved project-specific narrative (scope, client, statistics) has
 * been supplied for this project yet (see src/data/projects.ts), so these
 * captions describe only what the frame sequence itself visibly shows — a
 * night aerial of the circuit progressively revealing its engineering
 * infrastructure overlay — without asserting unverified technical claims.
 */
export const saudiF1Timeline: VelaTimelineStage[] = [
  {
    id: 'circuit-at-night',
    title: 'Saudi F1 Track',
    description:
      'A landmark motorsport circuit set against a dramatic desert escarpment, captured in a sweeping aerial night view.',
    startProgress: 0,
    headerTheme: 'dark',
  },
  {
    id: 'infrastructure-reveal',
    title: 'Engineering Infrastructure',
    description:
      'Layers of the circuit’s mechanical, electrical and utility infrastructure begin to surface beneath the track.',
    startProgress: 0.25,
    headerTheme: 'dark',
  },
  {
    id: 'utility-systems',
    title: 'Utility & Plant Systems',
    description:
      'A dedicated services plaza reveals the coordinated network of pipework and plant equipment running throughout the venue.',
    startProgress: 0.45,
    headerTheme: 'dark',
  },
  {
    id: 'paddock-infrastructure',
    title: 'Paddock Infrastructure',
    description:
      'Additional utility buildings and distribution networks emerge alongside the paddock and pit facilities.',
    startProgress: 0.6,
    headerTheme: 'dark',
  },
  {
    id: 'landmark-structures',
    title: 'Landmark Structures',
    description:
      'Signature architectural elements, including the circuit’s control tower, take shape against the mountain backdrop.',
    startProgress: 0.78,
    headerTheme: 'dark',
  },
  {
    id: 'complete-vision',
    title: 'A Landmark Entertainment Destination',
    description:
      'The fully realized circuit stands as one of the region’s landmark motorsport and entertainment destinations.',
    startProgress: 0.92,
    headerTheme: 'dark',
  },
];
