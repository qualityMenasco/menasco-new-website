/**
 * Featured photos for the Quality & Safety page, shared by the desktop and
 * mobile trees: the two portraits side by side, the landscape beneath them.
 * The portraits are frames from MENASCO's site safety reel — cropped above
 * their burned-in captions and upscaled 2x. The landscape is the
 * Manufacturing page's sunset site photo, colour-matched to the portraits
 * (softer, cooler, lifted shadows) as its own file so that page keeps the original.
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
