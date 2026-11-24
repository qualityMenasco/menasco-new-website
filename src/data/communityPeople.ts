
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
 * training-centre photo is a STAND-IN (a public-domain training-workshop photo) until
 * the centre's own photos are supplied — swap the src/alt here and both layouts pick it up.
 */
export const communityMedia = {
  /** The group photo gets its own full-width card; the three donor photos sit beneath it. */
  bloodDriveGroup: { src: '/community/Menasco_Blood_Drive_Group.jpg', alt: 'MENASCO donors and hospital staff together at the blood drive' } satisfies CommunityImage,
  bloodDrive: [
    { src: '/community/Menasco_Blood_Drive_Donor.jpg', alt: 'A MENASCO colleague donating blood' },
    { src: '/community/Menasco_Blood_Drive_Stress_Ball.jpg', alt: 'A donor squeezing a stress ball while giving blood' },
    { src: '/community/Menasco_Blood_Drive_HSE_Manager_With_Doctor.jpg', alt: "MENASCO's HSE manager speaking with a hospital doctor" },
  ] satisfies CommunityImage[],
  /** Healthcare partnership: the signing photo (upscaled 2x, retouched, graded) and the partnership film. */
  healthcare: {
    /** Desktop: the original wide signing photo. */
    image: { src: '/community/Menasco_Medcare_Partnership_Signing.jpg', alt: 'MENASCO and Medcare Royal Hills Hospital representatives signing a healthcare partnership agreement' } satisfies CommunityImage,
    /** Phones and tablets only: square signing photo (client-supplied 2026-11-24), shown with the Watch the video button. */
    mobileImage: { src: '/community/Menasco_Medcare_Agreement_Signing.jpg', alt: 'A MENASCO representative signing the healthcare partnership agreement with Medcare Royal Hills Hospital' } satisfies CommunityImage,
    /**
     * Portrait MP4 (768×1116, ~7 MB): the Instagram reel's screen recording with the
     * app overlay cropped/painted out and upscaled 2x. Null falls back to a placeholder.
     */
    video: '/community/healthcare-partnership.mp4' as string | null,
    poster: '/community/Menasco_Healthcare_Partnership_Film_Poster.jpg',
  },
  cultureDay: {
    /** Portrait 9:16 (720×1280, ~6 MB, compressed from the 1080×1920 original); poster is a frame from it. */
    video: '/community/culture-day.mp4' as string | null,
    poster: '/community/Menasco_Culture_Day_Film_Poster.jpg',
    alt: 'MENASCO Culture Day celebration',
  },
  /** Three photos for the row (portrait, landscape, portrait), then the group photo full width beneath. */
  dubaiRun: [
    { src: '/community/Menasco_Dubai_Run_Team_With_Banner.jpg', alt: 'MENASCO runners holding the company flag in front of the Museum of the Future' },
    { src: '/community/Menasco_Dubai_Run_Runners_Downtown.jpg', alt: 'Runners on Sheikh Zayed Road during Dubai Run, with the Museum of the Future ahead' },
    { src: '/community/Menasco_Dubai_Run_Team_Selfie.jpg', alt: 'A selfie of MENASCO colleagues in team shirts on the Dubai Run route' },
  ] satisfies CommunityImage[],
  dubaiRunGroup: { src: '/community/Menasco_Dubai_Run_Team_Group.jpg', alt: 'MENASCO team members giving a thumbs-up together at Dubai Run' } satisfies CommunityImage,
  /**
   * Two tall portrait photos (~650–700×1280 sources), shown cropped to 4:5.
   * `focus` is each crop's object-position, keeping the subject (and the
   * first photo's burned-in title) in frame.
   */
  careerFairs: [
    { src: '/community/Menasco_UOWD_Career_Fair_Engineer_With_Students.jpg', alt: 'A MENASCO engineer speaking with students at the UOWD Career Fair 2026', focus: '50% 72%' },
    { src: '/community/Menasco_Career_Fair_Branded_Gift_Boxes.jpg', alt: 'MENASCO-branded gift boxes laid out on the company stand at a career fair', focus: '50% 60%' },
  ] satisfies CommunityImage[],
  /**
   * Training & Mentoring Centre: stand-in photo until the centre has its own. Reuses
   * the MENASCO Academy photo from Certification & Training (client request
   * 2026-11-24): "Mechanical engineering workshop at Arusha Technical College,
   * Tanzania" (Wikimedia Commons), CC0 public domain dedication.
   */
  training: {
    src: '/training/Menasco_Training_Engineering_Workshop_Lathes.jpg',
    alt: 'Students working at lathes in a mechanical engineering training workshop',
    focus: '42% 62%',
  } satisfies CommunityImage,
};

export const CERTIFICATION_TRAINING_PATH = '/certification-training';
