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
 * Portrait film (768×1376) of MENASCO at the Quality & Institutional
 * Excellence Conference: the Instagram reel's screen recording, app overlay cropped
 * out, upscaled 2x. Starts on the first shot after the MENASCO logo card (the logo
 * intro, frames 0-54 of the source, was cut 2026-11-22; ~9.2 MB, 54.1 s).
 */
export const innovationHeroFilm = {
  src: '/innovation/innovation-film.mp4',
  poster: '/innovation/innovation-film-poster.jpg',
};

export const innovationHeroPhotos: InnovationPhoto[] = [
  { src: '/innovation/robot-sponsor.jpg', alt: 'A humanoid robot waving beside the MENASCO Silver Sponsor logo at a technology event', focus: '50% 0%' },
  { src: '/innovation/robot-closeup.jpg', alt: 'A humanoid robot with a glowing blue visor on display at a technology event' },
];
