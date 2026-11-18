export interface NavLinkEntry {
  label: string;
  href: string;
}

export interface HomeSectionNavItem {
  label: string;
  /** Anchor id of the matching <ScrollReveal id="..."> section on HomePage — also drives scroll-spy highlighting while on the homepage. */
  sectionId: string;
  /** Dedicated route for this topic — used to highlight this nav item when visiting that page directly (not the homepage). */
  routePrefix: string;
  /** When set, the nav link always navigates straight here instead of scrolling to `sectionId` — used when the on-page section isn't this item's real destination. */
  directHref?: string;
}

/**
 * The primary header nav: on the homepage these scroll to the matching
 * section; from any other route they navigate home and then scroll. See
 * src/lib/SmartLink.tsx for the mechanics — this file only owns the data.
 */
export const homeSectionNavigation: HomeSectionNavItem[] = [
  // No "Home" entry — the MENASCO logo itself is the homepage link (see
  // SiteHeader.tsx / MobileHeader.tsx), so the primary nav starts at About.
  { label: 'About', sectionId: 'about', routePrefix: '/about', directHref: '/about' },
  // Opens the Services landing directly (the mega menu covers every
  // individual service).
  { label: 'Services', sectionId: 'services', routePrefix: '/services', directHref: '/services' },
  // Single combined entry point for both project browsing and sector
  // filtering — Project Categories is the hub for both, so this always
  // navigates straight there rather than scrolling to a homepage section.
  { label: 'Projects / Sectors', sectionId: 'projects', routePrefix: '/projects', directHref: '/projects/categories' },
  // No homepage section anymore (the News teaser was removed from the
  // homepage) — this is a direct link to its own page only.
  { label: 'Newsroom', sectionId: 'newsroom', routePrefix: '/newsroom', directHref: '/newsroom' },
  // Always the real /careers route (never a homepage #careers scroll) — that
  // route redirects to the external careers app at CAREERS_URL.
  { label: 'Careers', sectionId: 'careers', routePrefix: '/careers', directHref: '/careers' },
];

/**
 * The external careers app. Every Careers link on the site points at the
 * internal `/careers` route, which redirects here (client-side in
 * src/app/router.tsx, server-side in vercel.json) — so changing this URL
 * means updating it in those two places only.
 */
export const CAREERS_URL = 'https://main.d5ycnj71qvqrf.amplifyapp.com/';

/** A child link inside a navigation group — `i18nKey` is its key in the `nav` namespace. */
export interface NavGroupLinkEntry extends NavLinkEntry {
  i18nKey: string;
}

/**
 * A sub-service listed under an umbrella. Sub-services no longer have their
 * own pages (removed 2026-11-19) — they're sections of their umbrella page.
 * `sectionId` is the anchor id of that section once it exists; until then
 * the link resolves to the umbrella page itself (see `subServiceHref`).
 */
export interface SubServiceEntry extends NavGroupLinkEntry {
  sectionId?: string;
}

/**
 * An umbrella service (its own page) and the sub-services it covers.
 */
export interface NavGroupEntry {
  label: string;
  i18nKey: string;
  href: string;
  links: SubServiceEntry[];
}

/** Where a sub-service link points: its umbrella-page section if one exists, else the umbrella page. */
export const subServiceHref = (umbrellaHref: string, sectionId?: string) => (sectionId ? `${umbrellaHref}#${sectionId}` : umbrellaHref);

const subService = (umbrellaHref: string, label: string, i18nKey: string, sectionId?: string): SubServiceEntry => ({
  label,
  i18nKey,
  sectionId,
  href: subServiceHref(umbrellaHref, sectionId),
});

/**
 * MENASCO's service structure — the single source for every Services surface.
 * The header (desktop dropdown + mobile drawer) shows only the umbrellas
 * (`headerServiceLinks`); the footer lists every sub-service too
 * (`footerServiceLinks`). To point a sub-service at its new section, add the
 * section's id as the 4th argument of its `subService(...)` call.
 */
export const servicesNavigationGroups: NavGroupEntry[] = [
  {
    label: 'MEP',
    i18nKey: 'servicesGroups.mep',
    href: '/services/mep',
    links: [
      subService('/services/mep', 'Mechanical Systems', 'servicesList.mechanical'),
      subService('/services/mep', 'Electrical & ELV Systems', 'servicesList.electrical'),
      subService('/services/mep', 'Plumbing, Water & Drainage Systems', 'servicesList.plumbing'),
      subService('/services/mep', 'Fire Protection & Life Safety Systems', 'servicesList.firesProtection'),
    ],
  },
  {
    label: 'Civil',
    i18nKey: 'servicesGroups.civil',
    href: '/services/civil',
    links: [subService('/services/civil', 'BIM & Digital Engineering', 'servicesList.bimDigitalEngineering')],
  },
  {
    label: 'Manufacturing & Prefabrication',
    i18nKey: 'servicesGroups.manufacturingPrefabrication',
    href: '/services/manufacturing-prefabrication',
    links: [
      subService('/services/manufacturing-prefabrication', 'Modular', 'servicesList.modular'),
      subService('/services/manufacturing-prefabrication', 'Custom', 'servicesList.custom'),
    ],
  },
  {
    label: 'EPC',
    i18nKey: 'servicesGroups.turnkeyDevelopments',
    href: '/services/turnkey-developments',
    links: [],
  },
];

/** Structure-only routes awaiting approved content — rendered noindex and kept out of the sitemap and llms.txt. (Empty since Certification & Training got its own page.) */
export const pendingContentPaths: readonly string[] = [];

/** Data center MEP capability — not one of the four service groups, surfaced alongside them as its own umbrella page. */
export const dataCentreServiceLink: NavGroupLinkEntry = {
  label: 'Data Centers',
  href: '/services/data-centers',
  i18nKey: 'dataCentres',
};

/** Every umbrella service page, in menu order (MEP, Civil, Manufacturing & Prefabrication, EPC, Data Centers). */
export const umbrellaServiceLinks: NavGroupLinkEntry[] = [
  ...servicesNavigationGroups.map((group) => ({ label: group.label, href: group.href, i18nKey: group.i18nKey })),
  dataCentreServiceLink,
];

/** Header Services menu (desktop dropdown + mobile drawer): All Services, then the umbrella pages only. */
export const headerServiceLinks: NavGroupLinkEntry[] = [{ label: 'All Services', href: '/services', i18nKey: 'allServices' }, ...umbrellaServiceLinks];

/** Footer Services column — each umbrella followed by its sub-services (which link to the umbrella page or its section), then Data Centers. Hrefs can repeat, so key by label. */
export const footerServiceLinks: NavGroupLinkEntry[] = [
  ...servicesNavigationGroups.flatMap((group) => [{ label: group.label, href: group.href, i18nKey: group.i18nKey }, ...group.links]),
  dataCentreServiceLink,
];

/** "About" dropdown — every entry carries its own `nav` translation key. */
export const aboutNavigation: NavGroupLinkEntry[] = [
  { label: 'About MENASCO', href: '/about', i18nKey: 'aboutMenasco' },
  { label: 'Leadership Team', href: '/team', i18nKey: 'leadershipTeam' },
  { label: 'Quality & Safety', href: '/quality-safety', i18nKey: 'qualitySafety' },
  { label: 'Community & People', href: '/community-people', i18nKey: 'communityPeople' },
  { label: 'Innovation & Technology', href: '/innovation-technology', i18nKey: 'innovationTechnology' },
  { label: 'MENASCO Certification & Training', href: '/certification-training', i18nKey: 'certificationTraining' },
];

export const footerCompanyLinks: NavLinkEntry[] = [
  { label: 'About MENASCO', href: '/about' },
  { label: 'Quality & Safety', href: '/quality-safety' },
  { label: 'Community & People', href: '/community-people' },
  { label: 'Innovation & Technology', href: '/innovation-technology' },
  { label: 'Team', href: '/team' },
  { label: 'Newsroom', href: '/newsroom' },
  { label: 'Careers', href: '/careers' },
];

export const footerProjectLinks: NavLinkEntry[] = [
  { label: 'Projects & Sectors', href: '/projects/categories' },
  { label: 'Residential & Commercial', href: '/projects/categories?category=residential-commercial' },
  { label: 'Hospitality & Landmark Entertainment', href: '/projects/categories?category=hospitality-landmark-entertainment' },
  { label: 'Mission-Critical Facilities', href: '/projects/categories?category=advanced-technical-facilities' },
  { label: 'Infrastructure & Utilities', href: '/projects/categories?category=infrastructure-utilities' },
];

export const footerLegalLinks: NavLinkEntry[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms', href: '/terms' },
  { label: 'LYNX Privacy Policy', href: '/lynxqc/privacy-policy' },
];
