/**
 * Photography for the Certification & Training page (/certification-training).
 *
 * All are real MENASCO photos reused from elsewhere on the site until
 * programme-specific photography exists. `initiative` in particular is a
 * stand-in: replace it with photos from the actual training initiative once
 * it is operational. Swap any `src` here; alt text lives in
 * about.json → certificationTrainingPage.*.imageAlt.
 */
export const certificationTrainingPhotos = {
  /** Wide documentary shot behind the hero headline. */
  hero: { src: '/safety/site-sunset-graded.jpg', focus: '70% 40%' },
  /** Workforce Development — people on site (portrait). */
  workforce: { src: '/safety/site-safety-team.jpg', focus: '50% 30%' },
  /** Global Training Initiative — STAND-IN until the initiative has its own photos. */
  initiative: { src: '/custom-mep-fabrication-inspection.webp', focus: '50% 50%' },
  /** University Internships — recognisable landmark project. */
  internships: { src: '/training/internships-landmark.jpg', focus: '50% 45%' },
  /** Closing statement — a young MENASCO engineer (portrait). */
  closing: { src: '/about/about-hero-film-poster.jpg', focus: '50% 8%' },
} as const;

/** In-page anchors: the programme tabs and the initiative's pathway. */
export const certificationTrainingAnchors = {
  programmes: 'programmes',
  pathway: 'training-pathway',
} as const;
