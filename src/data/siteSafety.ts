/**
 * Media and structure for the Quality, Health & Safety page, shared by the
 * desktop and mobile trees.
 *
 * The portraits are frames from MENASCO's site safety reel, cropped above
 * their burned-in captions and upscaled 2x. The landscape (Safety column) is hard hats
 * in yellow storage cages, supplied by the client 2026-11-24 and colour-matched to the
 * Quality portrait: lifted blacks, capped highlights, chroma reduced to ~63% and a cool
 * highlight tint, all measured from that photo.
 */
export interface FeaturedPhoto {
  src: string;
  alt: string;
}

export const qualitySafetyPhotos: { portraits: [FeaturedPhoto, FeaturedPhoto]; landscape: FeaturedPhoto } = {
  portraits: [
    { src: '/safety/Menasco_Site_Engineer_Full_PPE_Rebar_Deck.jpg', alt: 'A MENASCO site engineer in full PPE on a rebar deck' },
    { src: '/safety/Menasco_Site_Engineers_Reviewing_Work.jpg', alt: 'Two MENASCO safety team members in hard hats and high-visibility vests reviewing work on site' },
  ],
  landscape: { src: '/safety/Menasco_Safety_Hard_Hats_In_Storage_Cages.jpg', alt: 'Rows of safety hard hats stored in yellow mesh cages' },
};

/** Hero photo (753×1280, portrait), shown in black and white under the technical annotations. */
export const qhseHeroPhoto: FeaturedPhoto = {
  src: '/about/Menasco_QA_QC_Inspection_Completed_Building.jpg',
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
