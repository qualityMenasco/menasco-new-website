import { slugify } from '../lib/utils';
import type { VerificationStatus } from '../types/content';

export interface ProjectRecord {
  id: string;
  slug: string;
  title: string;
  location: string;
  country: string;
  sector: string;
  status: string;
  year: string;
  client: string;
  developer: string;
  consultant: string;
  mainContractor: string;
  menascoScope: string;
  services: string[];
  description: string;
  featured: boolean;
  heroImage: string;
  gallery: string[];
  seoTitle: string;
  seoDescription: string;
  /** Applies to every field below `title` — the name itself is confirmed, the rest is not. */
  verificationStatus: VerificationStatus;
  /**
   * Editorial browsing category (see src/data/projectCategories.ts) — a site
   * organization choice, not a verified fact about the project. Left
   * undefined where the project type isn't unambiguous from its own
   * (confirmed) title, rather than guessed.
   */
  category?: string;
  /**
   * NOT YET CONFIRMED CONSUMED BY ANY COMPONENT — added 2026-08-05 because
   * the source HTML pages publish these stats and it seemed wasteful to
   * drop verified data on the floor. No ProjectCard / FeaturedProjectPanel
   * prop currently reads either field. Wire them into a detail-page
   * template, or remove them, once that component exists.
   */
  workforceHours?: string;
  safetyRecord?: string;
  /** IT capacity (e.g. "12 MW IT") — shown as a small badge on the project card visual, not baked into the title. */
  capacity?: string;
}

/**
 * MENASCO is the main contractor on every project in this portfolio by
 * default — every current record's own `mainContractor` field is empty (see
 * the dataset note below), so this fallback is what actually renders today.
 * A future project where MENASCO held a different role (e.g. a joint
 * venture, or a trade-only scope under someone else's main contract) can
 * still override this by setting `mainContractor` explicitly on its own
 * record — this helper only fills in the default, it never overwrites a
 * populated value.
 */
export const getMainContractor = (project: Pick<ProjectRecord, 'mainContractor'>): string => project.mainContractor || 'MENASCO';

function draftProject(title: string, overrides: Partial<ProjectRecord> = {}): ProjectRecord {
  return {
    id: slugify(title),
    slug: slugify(title),
    title,
    location: '',
    country: '',
    sector: '',
    status: '',
    year: '',
    client: '',
    developer: '',
    consultant: '',
    mainContractor: '',
    menascoScope: '',
    services: [],
    description: '',
    featured: false,
    heroImage: '',
    gallery: [],
    seoTitle: '',
    seoDescription: '',
    verificationStatus: 'pending',
    ...overrides,
  };
}

/**
 * Project names confirmed against menascouae.com/projects on 2026-07-20
 * (10 titles visible on the portfolio's first page — pagination prevented
 * confirming the rest independently, though they were named in the brief).
 *
 * UPDATE 2026-08-05: location, sector, status, year, MEP scope, description,
 * services, hero image, workforce hours and safety record for the projects
 * below are now sourced directly from the site's own individual project
 * pages (the .html files in this project's static-site source), not
 * assumed. `client` / `developer` / `consultant` / `mainContractor` stay
 * empty and 'pending' — none of the project pages disclose a client name,
 * so there is still nothing to confirm those fields against.
 *
 * `category` is only set where the project type is unambiguous from its own
 * confirmed title/sector — never guessed from general knowledge of a
 * name/brand. Projects whose sector doesn't cleanly fit one of the three
 * defined categories (see src/data/projectCategories.ts) are left
 * uncategorized rather than force-fit — see inline notes on PCFC and DMCC
 * Uptown below.
 *
 * "Saudi F1 Track" was supplied directly (2026-07-23) as a confirmed project
 * name — same "title only, everything else pending" treatment as the rest.
 * No source page has been provided for it, so it is untouched below.
 */
export const projects: ProjectRecord[] = [
  draftProject('Casa Cavalli', {
    location: 'Dubai Marina, UAE',
    country: 'UAE',
    sector: 'Residential',
    status: 'On-Going',
    year: '2026',
    menascoScope:
      'Full MEP delivery, Shell & Core and high-end fit-out, including HVAC, electrical, plumbing and fire protection.',
    services: [
      'High-end MEP engineering built for premium waterfront living',
      'Smart-building automation with intelligent energy controls',
      'Comprehensive fire & life safety systems to UAE Fire Code',
      'Marine-grade mechanical & electrical works for coastal durability',
      'High-performance HVAC for comfort, air quality and efficiency',
    ],
    description:
      'Casa Cavalli is a signature residential tower on Dubai Marina, pairing Cavalli-inspired interiors with a high-performance building services backbone. MENASCO is delivering the full MEP scope, from Shell & Core through to high-end fit-out.',
    featured: true,
    category: 'residential-commercial',
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/12/Casa-Cavalli-scaled.png',
    seoTitle: 'Casa Cavalli | MENASCO Projects',
    seoDescription: "A Cavalli-inspired waterfront residential landmark on Dubai Marina.",
    workforceHours: '1,661,538 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  draftProject('DAMAC Bay', {
    location: 'Dubai Marina, UAE',
    country: 'UAE',
    sector: 'Residential',
    status: 'On-Going',
    year: '2028',
    menascoScope:
      'Engineering, supply, installation, testing & commissioning of complete MEP systems: HVAC, electrical, plumbing and firefighting.',
    services: [
      'Complete HVAC, electrical, plumbing and firefighting systems',
      'Smart-building technologies for automation and energy performance',
      'Marine-grade systems engineered for waterfront conditions',
      'Life-safety infrastructure built for long-term regulatory compliance',
      'High-performance HVAC tuned for comfort and air quality',
    ],
    description:
      'DAMAC Bay is a landmark residential development overlooking Dubai Marina, pairing premium architecture with an advanced building services infrastructure engineered for comfort and long-term sustainability. MENASCO holds the complete MEP scope for the tower, spanning HVAC, electrical, plumbing and firefighting, along with smart-building technology, marine-grade engineering and life-safety systems built to global standards.',
    category: 'residential-commercial',
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/12/Damac-Bay-1-scaled.png',
    seoTitle: 'DAMAC Bay | MENASCO Projects',
    seoDescription: 'A landmark waterfront residential tower overlooking Dubai Marina.',
    workforceHours: '3,215,385 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  draftProject('VELA by Omniyat', {
    featured: true,
    category: 'residential-commercial',
    location: 'Dubai, UAE',
    country: 'UAE',
    sector: 'Luxury Residential / Hospitality',
    status: 'On-Going',
    year: '2028',
    menascoScope:
      'Engineering, supply, installation, testing & commissioning of complete MEP systems: HVAC, electrical, plumbing and firefighting.',
    services: [
      'Full MEP scope for a luxury residential & hospitality landmark',
      'Smart-living technology for comfort and automation',
      'Environmentally conscious, energy-efficient engineering',
      'Premium HVAC, electrical, plumbing & life-safety systems',
      'Engineering built for long-term reliability and resilience',
    ],
    // Narrative supplied directly by the user (2026-07-28) — MENASCO's own
    // account of its role on this project. Kept in preference to the
    // project page's generic boilerplate description text. Location, year,
    // sector, scope, workforce hours and safety record above are now
    // sourced from vela-by-omniyat.html (2026-08-05) — client/developer
    // remain unverified and stay empty.
    description:
      'One of Dubai’s most prestigious ultra-luxury waterfront residential developments, Vela by Omniyat redefines contemporary living through exceptional architecture, refined interiors, and world-class engineering. MENASCO delivered the complete Mechanical, Electrical and Plumbing scope for this landmark development.',
    seoDescription:
      'Vela by Omniyat is an ultra-luxury waterfront residential development in Dubai. MENASCO delivered the complete MEP scope for this landmark Omniyat project.',
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/12/Vela-Omniyat-scaled.png',
    workforceHours: '936,000 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  draftProject('Vanguard', {
    location: 'Dubai, UAE',
    country: 'UAE',
    sector: 'Luxury Residential',
    status: 'On-Going',
    year: '2028',
    menascoScope:
      'Engineering, supply, installation, testing & commissioning of complete MEP systems: HVAC, electrical, plumbing and firefighting.',
    services: [
      'Advanced MEP infrastructure for high-end residential living',
      'Full HVAC, electrical, plumbing and firefighting systems',
      'Smart-living technology for comfort and automation',
      'Energy-efficient engineering for long-term reliability',
      'Life-safety systems built for premium residential environments',
    ],
    description:
      "Vanguard is a high-end residential development aiming to set new standards in contemporary living within Dubai's premium real estate market. MENASCO is delivering the full MEP scope: HVAC, electrical, plumbing and firefighting, tailored to the demands of high-end residences, with smart-living technology and energy-efficient, world-class life-safety infrastructure.",
    category: 'residential-commercial',
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/12/Vanguard-scaled.png',
    seoTitle: 'Vanguard | MENASCO Projects',
    seoDescription: "A contemporary luxury residential development in Dubai's premium market.",
    workforceHours: '1,359,000 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  draftProject('Bloom Residences', {
    category: 'residential-commercial',
    location: 'Dubai Marina, UAE',
    country: 'UAE',
    sector: 'Mixed Use / Residential',
    status: 'Executed',
    year: '2021',
    menascoScope:
      'Engineering, supply, installation, testing & commissioning of complete MEP systems: HVAC, electrical, plumbing and firefighting.',
    services: [
      'Versatile MEP infrastructure for mixed residential/commercial use',
      'Complete HVAC, electrical, plumbing & firefighting systems',
      'Smart-building technology for automation and comfort',
      'Energy-efficient engineering supporting sustainability',
      'Fire & life-safety systems ensuring regulatory compliance',
    ],
    description:
      'Bloom Residences is a premium mixed-use development in Dubai Marina, calling for a versatile MEP infrastructure able to support both residential and commercial components. MENASCO executed the complete MEP scope, integrating smart-building systems, energy-efficient engineering and robust fire & life-safety measures for long-term comfort and sustainability.',
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/12/Bloom-residences-scaled.png',
    seoTitle: 'Bloom Residences | MENASCO Projects',
    seoDescription: 'A premium mixed-use residential development in Dubai Marina.',
    workforceHours: '1,232,193 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  draftProject('PCFC Headquarters Building', {
    location: 'Dubai Marina, UAE',
    country: 'UAE',
    sector: 'Commercial',
    status: 'Completed',
    year: '2024',
    menascoScope: 'HVAC, Shell & Core works, and fit-out works for commercial office spaces.',
    services: [
      'Flexible MEP infrastructure spanning Shell & Core and fit-out',
      'Comprehensive electromechanical, plumbing and fire protection systems',
      'Smart building management with advanced energy efficiency',
      'Structural and essential services works',
      'Built to optimize efficiency, sustainability and safety',
    ],
    description:
      'The PCFC building is a distinguished commercial project in Dubai, providing state-of-the-art office space for modern business needs, requiring a flexible MEP infrastructure combining Shell & Core work with fit-out finishing. MENASCO executed the full scope of electromechanical, plumbing and fire protection systems, plus structural, essential services and specialized finishing, including smart building management and energy efficiency solutions.',
    // "Commercial" didn't fit any of the original three project categories
    // and was left uncategorized; the four-category taxonomy (2026-08-06)
    // added "Residential / Commercial" specifically to cover office/
    // commercial buildings like this one.
    category: 'residential-commercial',
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/12/Project-PCFC-scaled.png',
    seoTitle: 'PCFC Headquarters Building | MENASCO Projects',
    seoDescription: 'A flagship commercial headquarters delivering modern, high-performance office space.',
    workforceHours: '798,393 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  draftProject('Sparkle Tower', {
    location: 'Dubai Marina, UAE',
    country: 'UAE',
    sector: 'Luxury Residential / Hospitality',
    status: 'Executed',
    year: '2018',
    menascoScope:
      'Engineering, supply, installation, testing & commissioning of complete MEP systems: HVAC, electrical, plumbing and firefighting.',
    services: [
      'High-performance MEP infrastructure for luxury amenities',
      'Complete HVAC, electrical, plumbing & firefighting systems',
      'Smart-building technology for automation and efficiency',
      'Marine-grade installations for coastal durability',
      'Safety systems built for long-term reliability',
    ],
    description:
      'Sparkle Tower is a landmark residential development in Dubai Marina, requiring a high-performance MEP infrastructure to support luxury amenities and long-term operational efficiency. MENASCO executed the full MEP scope, integrating smart-building technology, marine-grade installations and robust safety systems for comfort, sustainability and reliability.',
    category: 'residential-commercial',
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/12/Sparkle-Tower-scaled.png',
    seoTitle: 'Sparkle Tower | MENASCO Projects',
    seoDescription: 'A landmark residential tower with a premium waterfront lifestyle in Dubai Marina.',
    workforceHours: '993,462 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  draftProject('Vida Hotel', {
    category: 'hospitality-landmark-entertainment',
    location: 'Sharjah, UAE',
    country: 'UAE',
    sector: 'Luxury Residential / Hospitality',
    status: 'On-Going',
    year: '2026',
    menascoScope:
      'Engineering, supply, installation, testing & commissioning of complete MEP systems: HVAC, electrical, plumbing and firefighting.',
    services: [
      'High-efficiency HVAC for guest and service areas',
      'Smart electrical distribution & lighting to hospitality standards',
      'Water-saving plumbing systems supporting sustainability',
      'Advanced firefighting and life-safety systems',
      'Centralized BMS/automation for real-time monitoring',
    ],
    description:
      "The Vida Hotel project covers the full delivery of mechanical, electrical and plumbing systems supporting a modern, energy-efficient hospitality environment. MENASCO's scope integrates advanced MEP solutions aligned with hotel operating standards, sustainability targets and seamless day-to-day performance.",
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/12/Vida-Hotel-scaled.png',
    seoTitle: 'Vida Hotel | MENASCO Projects',
    seoDescription: 'A modern, energy-efficient hospitality development in Sharjah.',
    workforceHours: '1,400,000 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  draftProject('DMCC Uptown Dubai T3–T4', {
    location: 'Dubai, UAE',
    country: 'UAE',
    sector: 'Mixed Use',
    status: 'On-Going',
    year: '2028',
    menascoScope:
      "Engineering, supply, installation, testing & commissioning of complete MEP systems across the district's towers, retail and hospitality components.",
    services: [
      'Over 8,000 sqm of advanced MEP installations',
      'Integrated building automation & smart controls',
      'Sustainable, energy-efficient engineering design',
      'High-performance systems for mixed-use operations',
      'Fire & life safety systems to international standards',
    ],
    description:
      "Uptown Dubai is a landmark mixed-use district developed by DMCC in the heart of the city. MENASCO holds the full MEP scope, delivering mechanical, electrical and plumbing systems across the district's high-rise towers, retail spaces and hospitality components, built for seamless functionality and energy efficiency.",
    // "Mixed Use" (towers + retail + hospitality) spanned more than the old
    // hotel-residential bucket covered and was left uncategorized; the
    // four-category taxonomy's "Residential / Commercial" bucket explicitly
    // covers mixed-use developments, so this now fits cleanly.
    category: 'residential-commercial',
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/11/Project-Dmcc-1.jpg',
    seoTitle: 'DMCC Uptown Dubai T3-T4 | MENASCO Projects',
    seoDescription: 'A landmark mixed-use district under the Dubai Multi Commodities Centre.',
    workforceHours: '3,125,675 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  draftProject('Madinat Jumeirah Living Phase 3B', {
    category: 'residential-commercial',
    location: 'Dubai, UAE',
    country: 'UAE',
    sector: 'Residential',
    status: 'Completed',
    year: '2025',
    menascoScope: 'Engineering, supply, installation, testing & commissioning of complete MEP systems.',
    services: [
      'Fully integrated MEP systems for a premium residential community',
      'Centralized high-efficiency cooling for indoor comfort',
      'Smart building automation for energy optimization',
      'Fire & life safety infrastructure to UAE Fire Code',
      'Sustainable engineering supporting long-term reliability',
    ],
    description:
      'Madinat Jumeirah Living – Phase 3B is part of a prestigious residential master community near the Burj Al Arab, built to a premium lifestyle standard. MENASCO delivered the complete MEP scope: HVAC, electrical, plumbing and firefighting, along with centralized cooling, smart building automation and robust safety systems for long-term comfort and reliability.',
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/10/MADINAT.jpg',
    seoTitle: 'Madinat Jumeirah Living – Phase 3B | MENASCO Projects',
    seoDescription: 'A premium residential community near the iconic Burj Al Arab.',
    workforceHours: '590,146 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  draftProject('Volante II Tower', {
    location: 'Business Bay, Dubai',
    country: 'UAE',
    sector: 'High-End Residential Tower',
    status: 'Completed',
    year: '2024',
    menascoScope: 'Engineering, supply, installation, testing & commissioning of complete MEP systems.',
    services: [
      'High-end mechanical & electrical systems for ultra-luxury living',
      'Advanced chilled-water & ventilation design',
      'Integrated low-current & automation systems for smart-home functionality',
      'Fire & life safety systems to UAE Fire Code',
      'High-precision installation and finishing standards',
    ],
    description:
      'Volante II Tower is an ultra-luxury residential development in Business Bay, built around high-end engineering and architectural refinement. MENASCO executed the full MEP scope: HVAC, electrical, plumbing, firefighting and low-current systems, with advanced chilled-water technology, smart-building controls and integrated safety solutions.',
    category: 'residential-commercial',
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/10/VOLANTE.jpg',
    seoTitle: 'Volante II Tower | MENASCO Projects',
    seoDescription: 'An ultra-luxury residential tower in Business Bay with panoramic skyline views.',
    workforceHours: '684,616 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  draftProject('ORLA Infinity Residential Development', {
    category: 'residential-commercial',
    location: 'Palm Jumeirah, Dubai',
    country: 'UAE',
    sector: 'Luxury Residential',
    status: 'On-Going',
    year: '2026',
    menascoScope: 'Engineering, supply, installation, testing & commissioning of complete MEP systems.',
    services: [
      'Ultra-luxury MEP engineering for exclusive residences',
      'Smart-home automation with advanced energy optimization',
      'Fire & life safety systems to global residential standards',
      'Marine-grade mechanical systems for coastal durability',
      'High-performance HVAC for comfort and air quality',
    ],
    description:
      'Orla Infinity is a signature luxury residential development on Palm Jumeirah, built around sophisticated architecture and world-class amenities. MENASCO is responsible for the complete MEP works: HVAC, electrical, plumbing and firefighting, alongside Shell & Core and high-end fit-out, with smart-home capability and marine-grade engineering suited to coastal conditions.',
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/11/Project-Orla.jpg',
    seoTitle: 'Orla Infinity Residential Development | MENASCO Projects',
    seoDescription: 'A signature luxury residential development on Palm Jumeirah.',
    workforceHours: '611,711 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  draftProject('Seven Hotel', {
    category: 'hospitality-landmark-entertainment',
    location: 'Palm Jumeirah, UAE',
    country: 'UAE',
    sector: 'Luxury Residential / Hospitality',
    status: 'Executed',
    year: '2022',
    menascoScope:
      'Design, supply, installation, testing & commissioning of complete MEP systems: HVAC, electrical, plumbing and firefighting.',
    services: [
      'High-end MEP engineering for luxury waterfront hospitality',
      'Smart-building systems with advanced energy optimization',
      'Fire & life safety infrastructure to UAE and international standards',
      'Marine-grade mechanical installations for coastal resilience',
      'High-efficiency cooling & ventilation for hotel performance',
    ],
    description:
      'Seven Hotel is an exclusive beachfront development on Palm Jumeirah, combining modern elegance with resort-style luxury living and ocean views. MENASCO delivered the full MEP scope, with marine-grade mechanical installations and high-efficiency cooling and ventilation systems designed for hotel operations and high-rise performance.',
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/10/seven-rotated.jpg',
    seoTitle: 'Seven Hotel | MENASCO Projects',
    seoDescription: 'An exclusive beachfront hospitality development on Palm Jumeirah.',
    workforceHours: '1,502,861 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  draftProject('Town Square Development', {
    category: 'residential-commercial',
    location: 'Dubai, UAE',
    country: 'UAE',
    sector: 'Residential',
    status: 'Completed',
    year: '2020',
    menascoScope:
      'Engineering, supply, installation, testing & commissioning of complete MEP systems: HVAC, electrical, plumbing and firefighting.',
    services: [
      'Efficient MEP design for large-scale residential communities',
      'Energy-optimized systems supporting sustainable living',
      'Fire & life safety systems to UAE and international codes',
      'High-quality mechanical & electrical installations',
      'Built for long-term operational reliability',
    ],
    description:
      'Town Square is one of Dubai\'s largest residential community developments, built for modern family living with high-quality infrastructure and community amenities. MENASCO executed the complete MEP scope across the community, with a strong emphasis on energy efficiency, safety compliance and long-term operational reliability.',
    heroImage: 'https://menascouae.com/wp-content/uploads/2025/10/Town1-rotated.jpg',
    seoTitle: 'Town Square Development | MENASCO Projects',
    seoDescription: "One of Dubai's largest master-planned residential communities.",
    workforceHours: '2,320,500 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),
  // Merged 2026-08-05 at the user's request: the standalone "Qiddiya City"
  // entry below has been folded into this project and the project renamed
  // "Qiddiya" — Qiddiya City's own confirmed description names its Speed
  // Park Track as one of its attractions, so the cinematic F1-circuit scroll
  // sequence (see CINEMATIC_PROJECTS in ProjectDetailPage.tsx, key
  // 'qiddiya') and the wider Qiddiya City project data now describe the
  // same giga-project. All fields below are carried over unchanged from the
  // former "Qiddiya City" entry (sourced from qiddiya-city.html).
  draftProject('Qiddiya', {
    featured: true,
    location: 'Qiddiya City',
    country: 'Saudi Arabia',
    sector: 'Commercial, Sports, and Entertainment',
    status: 'On-Going',
    year: '2027',
    menascoScope: 'Engineering, Supply, Installation, Testing & Commissioning Of MEP Systems (HVAC, Plumbing & Electrical)',
    description:
      "Qiddiya City is one of Saudi Arabia's flagship giga-projects under Saudi Vision 2030, a 360 km² entertainment, sports, and residential destination near Riyadh built around the \"Power of Play.\" MENASCO is delivering specialized MEP engineering solutions in support of the development.",
    category: 'hospitality-landmark-entertainment',
    // Supplied directly by the user (2026-08-05) — aerial render of the
    // Speed Park Track and surrounding districts at night. Replaces the
    // broken '../images/qiddiya-city-six-flags.jpg' reference that never
    // resolved to a real file.
    heroImage: '/assets/projects/qiddiya/qiddiya-speed-park-aerial.jpg',
    seoTitle: 'Qiddiya | MENASCO Projects',
    seoDescription:
      "MENASCO delivers specialized MEP engineering solutions for Qiddiya, one of Saudi Arabia's flagship Vision 2030 giga-projects.",
    workforceHours: '2,059,650 hours',
    safetyRecord: 'Zero LTI',
    verificationStatus: 'verified',
  }),

  // Added 2026-08-05 — sourced from alamein-towers.html. This project was
  // not previously in this file at all (not even as a 'pending' draft).
  draftProject('Alamein Towers', {
    location: 'New Alamein, Alamein Towers, Egypt',
    country: 'Egypt',
    sector: 'Residential',
    status: 'On-Going',
    year: '2028',
    menascoScope:
      'Engineering, supply, installation, testing & commissioning of complete MEP systems: HVAC, electrical, plumbing and firefighting.',
    services: [
      'Advanced MEP infrastructure for a multi-tower residential community',
      'Full HVAC, electrical, plumbing and firefighting systems',
      'Engineering tailored to a coastal environment',
      'Energy-efficient engineering for long-term reliability',
      'Life-safety systems built for premium residential towers',
    ],
    description:
      "Alamein Towers is a landmark residential development in New Alamein, comprising a cluster of striking curvilinear towers set to redefine the skyline of Egypt's north coast. MENASCO is delivering the full MEP scope: HVAC, electrical, plumbing and firefighting, engineered to the standards of a premium coastal residential community.",
    category: 'residential-commercial',
    heroImage: '/alamein-towers.jpg',
    seoTitle: 'Alamein Towers | MENASCO Projects',
    seoDescription:
      "A landmark residential development in New Alamein, Egypt, delivering integrated MEP solutions on the north coast.",
    // No workforce-hours / safety-record stat block on this page — left
    // undefined rather than assumed to match the other projects' figures.
    verificationStatus: 'verified',
  }),

  // Migrated from the Data Centre Infrastructure page's own "Featured Data
  // Center Projects" section (previously a separate src/data/dataCenterProjects.ts
  // array) so Mission-Critical has one shared source instead of a duplicate
  // list. Title, location and description were already published there as
  // MENASCO's own account of each project, marked 'verified' on that basis,
  // unlike the 'pending' drafts above. Nothing else (client, year, consultant,
  // imagery, etc.) was published alongside them, so those fields stay empty.
  // Display names use sequential "Data Centre <Roman numeral>" for
  // confidentiality, with the original MW/KW IT capacity figure kept after
  // the new name (2026-08-05) rather than dropped.
  // Titles below pass the original "Data Centre N (X MW IT)" string as the
  // first argument (draftProject derives id/slug from it, so routes/slugs
  // are unchanged) but override `title` to the clean display name — the
  // capacity now surfaces as its own `capacity` field / card badge instead.
  draftProject('Data Centre I (12 MW IT)', {
    // Was: 'Retrofit (12 MW IT)'
    title: 'Data Centre I',
    capacity: '12 MW IT',
    category: 'advanced-technical-facilities',
    location: 'Abu Dhabi, UAE',
    country: 'UAE',
    description:
      'Design, construction & commissioning of a 12MW hyperscale data center. Certified from UPTIME as tier III, & with full compliance with local authority and client requirements.',
    verificationStatus: 'verified',
  }),
  draftProject('Data Centre II (24 MW IT)', {
    // Was: 'Turnkey (24 MW IT)'
    title: 'Data Centre II',
    capacity: '24 MW IT',
    category: 'advanced-technical-facilities',
    location: 'Abu Dhabi, UAE',
    country: 'UAE',
    description: 'Turnkey solution for a 24MW modular data center, including design, build & operational handover (RFS).',
    verificationStatus: 'verified',
  }),
  draftProject('Data Centre III (2.4 MW IT)', {
    // Was: 'Upgrade Work (2.4 MW IT)'
    title: 'Data Centre III',
    capacity: '2.4 MW IT',
    category: 'advanced-technical-facilities',
    location: 'Dubai, UAE',
    country: 'UAE',
    description:
      'Maintenance for the smart busway, RTOB & Replacement of the rPDUs for the full IT racks without interrupting the critical load.',
    verificationStatus: 'verified',
  }),
  draftProject('Data Centre IV (6 MW IT)', {
    // Was: 'Confidential (6 MW IT)'
    title: 'Data Centre IV',
    capacity: '6 MW IT',
    category: 'advanced-technical-facilities',
    location: 'Abu Dhabi, UAE',
    country: 'UAE',
    description:
      'Design, construction & commissioning of a hyperscale data center. Certified from UPTIME as tier III, and with full compliance with local authority and client requirements.',
    verificationStatus: 'verified',
  }),
  draftProject('Data Centre V (800 KW IT)', {
    // Was: 'Upgrade Work (800 KW IT)'
    title: 'Data Centre V',
    capacity: '800 KW IT',
    category: 'advanced-technical-facilities',
    location: 'Dubai, UAE',
    country: 'UAE',
    description:
      'Maintenance for the smart busway, RTOB, & Replacement of the rPDUs for the full IT racks without interrupting the critical load.',
    verificationStatus: 'verified',
  }),
  draftProject('Data Centre VI (12 MW IT)', {
    // Was: 'Confidential (12 MW IT)'
    title: 'Data Centre VI',
    capacity: '12 MW IT',
    category: 'advanced-technical-facilities',
    location: 'Abu Dhabi, UAE',
    country: 'UAE',
    description:
      'Design, construction & commissioning of a hyperscale data center. Certified from UPTIME as tier III, and with full compliance with local authority and client requirements.',
    verificationStatus: 'verified',
  }),
  draftProject('Data Centre VII', {
    // Was: 'Upgrade Work' (NVIDIA NVL72 GB300 cluster) — no MW/KW figure was
    // ever part of this one's original title, so no capacity badge either.
    category: 'advanced-technical-facilities',
    location: 'Abu Dhabi, UAE',
    country: 'UAE',
    description:
      "Led the design & implementation coordination for the region's first NVIDIA NVL72 GB300 cluster, working closely with all project stakeholders to ensure successful technical integration & delivery.",
    verificationStatus: 'verified',
  }),
];