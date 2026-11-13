/**
 * Media and structure for the Quality, Health & Safety page, shared by the
 * desktop and mobile trees.
 *
 * The portraits are frames from MENASCO's site safety reel, cropped above
 * their burned-in captions and upscaled 2x. The landscape is the
 * Manufacturing page's sunset site photo, colour-matched to the portraits
 * as its own file so that page keeps the original.
 */
export interface FeaturedPhoto {
  src: string;
  alt: string;
}

export const qualitySafetyPhotos: { portraits: [FeaturedPhoto, FeaturedPhoto]; landscape: FeaturedPhoto } = {
  portraits: [
    { src: '/safety/site-safety-engineer.jpg', alt: 'A MENASCO site engineer in full PPE on a rebar deck' },
    { src: '/safety/site-safety-team.jpg', alt: 'Two MENASCO safety team members in hard hats and high-visibility vests reviewing work on site' },
  ],
  landscape: { src: '/safety/site-sunset-graded.jpg', alt: 'A MENASCO site engineer overlooking an active construction site at sunset' },
};

/** Hero photo (753×1280, portrait), shown in black and white under the technical annotations. */
export const qhseHeroPhoto: FeaturedPhoto = {
  src: '/about/quality-site.jpg',
  alt: "MENASCO's QA/QC manager and an engineer in high-visibility vests inspecting a completed building",
};

export type AnnotationKind = 'quality' | 'risk';

/**
 * Callouts on the hero photo. x/y are percentages of the photo (its frame
 * keeps the native aspect ratio, so they line up at any size). `risk` callouts
 * render in safety amber; everything else in brand blue.
 */
export const qhseAnnotations: { key: 'facade' | 'lead' | 'ppe' | 'zone'; x: number; y: number; kind: AnnotationKind }[] = [
  { key: 'facade', x: 69, y: 27, kind: 'quality' },
  { key: 'ppe', x: 68, y: 55, kind: 'quality' },
  { key: 'lead', x: 77, y: 71, kind: 'quality' },
  { key: 'zone', x: 40, y: 93, kind: 'risk' },
];

/** Performance figures — PLACEHOLDERS: set `value` once verified figures are supplied. */
export const qhseMetrics: { key: 'safeHours' | 'ltifr' | 'inspections' | 'ncr'; value: string | null }[] = [
  { key: 'safeHours', value: null },
  { key: 'ltifr', value: null },
  { key: 'inspections', value: null },
  { key: 'ncr', value: null },
];

/** Quality award ceremony film — null until the file is supplied (a placeholder frame shows meanwhile). */
export const qhseAwardVideo: string | null = null;
