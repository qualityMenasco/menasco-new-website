import { placeholderImages } from './images';

export interface CommunityImage {
  src: string;
  alt: string;
  /** CSS object-position for the crop; defaults to centre. */
  focus?: string;
}

/**
 * Media for the Community & People page, shared by the desktop and mobile
 * trees. The blood drive and Dubai Run photos are real and colour-graded,
 * and the Culture Day video and career fair photos are real; the
 * training-centre photo is a PLACEHOLDER (generic stock photography) until
 * supplied — swap the src/alt here and both layouts pick it up.
 */
export const communityMedia = {
  /** The group photo gets its own full-width card; the three donor photos sit beneath it. */
  bloodDriveGroup: { src: '/community/blood-drive-group.jpg', alt: 'MENASCO donors and hospital staff together at the blood drive' } satisfies CommunityImage,
  bloodDrive: [
    { src: '/community/blood-drive-donor.jpg', alt: 'A MENASCO colleague donating blood' },
    { src: '/community/blood-drive-stress-ball.jpg', alt: 'A donor squeezing a stress ball while giving blood' },
    { src: '/community/blood-drive-hse.jpg', alt: "MENASCO's HSE manager speaking with a hospital doctor" },
  ] satisfies CommunityImage[],
  /** Healthcare partnership: the signing photo (upscaled 2x, retouched, graded) and the partnership film. */
  healthcare: {
    image: { src: '/community/healthcare-signing.jpg', alt: 'MENASCO and Medcare Royal Hills Hospital representatives signing a healthcare partnership agreement' } satisfies CommunityImage,
    /**
     * Portrait MP4 (768×1116, ~7 MB): the Instagram reel's screen recording with the
     * app overlay cropped/painted out and upscaled 2x. Null falls back to a placeholder.
     */
    video: '/community/healthcare-partnership.mp4' as string | null,
    poster: '/community/healthcare-partnership-poster.jpg',
  },
  cultureDay: {
    /** Portrait 9:16 (720×1280, ~6 MB, compressed from the 1080×1920 original); poster is a frame from it. */
    video: '/community/culture-day.mp4' as string | null,
    poster: '/community/culture-day-poster.jpg',
    alt: 'MENASCO Culture Day celebration',
  },
  /** Three photos for the row (portrait, landscape, portrait), then the group photo full width beneath. */
  dubaiRun: [
    { src: '/community/dubai-run-1.jpg', alt: 'MENASCO runners holding the company flag in front of the Museum of the Future' },
    { src: '/community/dubai-run-2.jpg', alt: 'Runners on Sheikh Zayed Road during Dubai Run, with the Museum of the Future ahead' },
    { src: '/community/dubai-run-3.jpg', alt: 'A selfie of MENASCO colleagues in team shirts on the Dubai Run route' },
  ] satisfies CommunityImage[],
  dubaiRunGroup: { src: '/community/dubai-run-group.jpg', alt: 'MENASCO team members giving a thumbs-up together at Dubai Run' } satisfies CommunityImage,
  /**
   * Two tall portrait photos (~650–700×1280 sources), shown cropped to 4:5.
   * `focus` is each crop's object-position, keeping the subject (and the
   * first photo's burned-in title) in frame.
   */
  careerFairs: [
    { src: '/community/career-fair-uowd.jpg', alt: 'A MENASCO engineer speaking with students at the UOWD Career Fair 2026', focus: '50% 72%' },
    { src: '/community/career-fair.jpg', alt: 'MENASCO-branded gift boxes laid out on the company stand at a career fair', focus: '50% 60%' },
  ] satisfies CommunityImage[],
  training: {
    src: placeholderImages.fabrication,
    alt: 'Trainees at the MENASCO Training & Mentoring Centre',
  } satisfies CommunityImage,
};

export const CERTIFICATION_TRAINING_PATH = '/certification-training';
