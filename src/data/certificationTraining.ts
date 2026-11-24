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
  /**
   * Hero: MENASCO-branded gift boxes on the career-fair stand (client request
   * 2026-11-24; also used on Community & People). Portrait 650 x 1280 source, so the
   * focus keeps the MENASCO box centred in the 16:10 / 4:5 / square frames.
   */
  hero: { src: '/community/Menasco_Career_Fair_Branded_Gift_Boxes.jpg', focus: '50% 62%' },
  /** Workforce Development — people on site (portrait). */
  workforce: { src: '/safety/Menasco_Site_Engineers_Reviewing_Work.jpg', focus: '50% 30%' },
  /**
   * MENASCO Academy — STAND-IN until the initiative has its own photos:
   * "Mechanical engineering workshop at Arusha Technical College, Tanzania"
   * (Wikimedia Commons), CC0 public domain dedication. Client request 2026-11-24.
   */
  initiative: { src: '/training/Menasco_Training_Engineering_Workshop_Lathes.jpg', focus: '42% 62%' },
  /**
   * University Internships: an intern in a high-visibility vest working on equipment at
   * the base of a network cabinet, supplied by the client (2026-11-24). 2:3 portrait,
   * framed on the intern and his hands.
   */
  internships: { src: '/training/Menasco_Internship_Program.jpg', focus: '38% 58%' },
  /** Closing statement — a young MENASCO engineer (portrait). */
  closing: { src: '/about/Menasco_Engineer_Hard_Hat_On_Site_Film_Poster.jpg', focus: '50% 8%' },
} as const;

/** In-page anchors: the programme tabs and the initiative's pathway. */
export const certificationTrainingAnchors = {
  programmes: 'programmes',
  pathway: 'training-pathway',
} as const;
