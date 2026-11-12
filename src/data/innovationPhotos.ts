/**
 * Photo grid that opens the Innovation & Technology page (in place of the
 * old dark cover image), shared by the desktop and mobile trees. Both are
 * portrait frames from the Legend Robotics event MENASCO sponsored, cropped
 * to 4:5 and upscaled 2x.
 */
export interface InnovationPhoto {
  src: string;
  alt: string;
  /** CSS object-position for landscape crops (desktop stacks them); defaults to centre. */
  focus?: string;
}

/**
 * Portrait film (768×1376, ~9.5 MB) of MENASCO at the Quality & Institutional
 * Excellence Conference: the Instagram reel's screen recording, trimmed to start
 * on the logo card, app overlay cropped out, upscaled 2x.
 */
export const innovationHeroFilm = {
  src: '/innovation/innovation-film.mp4',
  poster: '/innovation/innovation-film-poster.jpg',
};

export const innovationHeroPhotos: InnovationPhoto[] = [
  { src: '/innovation/robot-sponsor.jpg', alt: 'A humanoid robot waving beside the MENASCO Silver Sponsor logo at a technology event', focus: '50% 0%' },
  { src: '/innovation/robot-closeup.jpg', alt: 'A humanoid robot with a glowing blue visor on display at a technology event' },
];
