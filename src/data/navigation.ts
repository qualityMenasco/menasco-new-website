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
  { label: 'Careers', sectionId: 'careers', routePrefix: '/careers' },
];

/** A child link inside a navigation group — `i18nKey` is its key in the `nav` namespace. */
export interface NavGroupLinkEntry extends NavLinkEntry {
  i18nKey: string;
}

/**
 * A labelled group of links (the Services mega menu columns, the grouped
 * mobile Services accordion, the Services landing page). `href` is set only
 * when the group itself has a real page to land on.
 */
export interface NavGroupEntry {
  label: string;
  i18nKey: string;
  href?: string;
  links: NavGroupLinkEntry[];
}

/**
 * MENASCO's service structure — the single source for every grouped
 * Services surface (desktop mega menu, mobile menu, Services landing,
 * footer). Existing service URLs are deliberately unchanged; only the
 * grouping is new. Entries marked in `pendingContentPaths` exist as
 * structure-only pages (noindex, excluded from sitemap/llms.txt) until
 * approved content is supplied.
 */
export const servicesNavigationGroups: NavGroupEntry[] = [
  {
    label: 'MEP',
    i18nKey: 'servicesGroups.mep',
    href: '/services/mep',
    links: [
      { label: 'Mechanical Systems', href: '/services/mechanical', i18nKey: 'servicesList.mechanical' },
      { label: 'Electrical & ELV Systems', href: '/services/electrical', i18nKey: 'servicesList.electrical' },
      { label: 'Plumbing, Water & Drainage Systems', href: '/services/plumbing', i18nKey: 'servicesList.plumbing' },
      { label: 'Fire Protection & Life Safety Systems', href: '/services/fire-protection', i18nKey: 'servicesList.firesProtection' },
    ],
  },
  {
    label: 'Civil',
    i18nKey: 'servicesGroups.civil',
    href: '/services/civil',
    links: [{ label: 'BIM & Digital Engineering', href: '/services/bim-digital-engineering', i18nKey: 'servicesList.bimDigitalEngineering' }],
  },
  {
    label: 'Manufacturing & Prefabrication',
    i18nKey: 'servicesGroups.manufacturingPrefabrication',
    href: '/services/manufacturing-prefabrication',
    links: [
      { label: 'Modular', href: '/services/manufacturing-prefabrication/modular', i18nKey: 'servicesList.modular' },
      { label: 'Custom', href: '/services/manufacturing-prefabrication/custom', i18nKey: 'servicesList.custom' },
    ],
  },
  {
    label: 'Turnkey Developments',
    i18nKey: 'servicesGroups.turnkeyDevelopments',
    href: '/services/turnkey-developments',
    links: [],
  },
];

/** Structure-only routes awaiting approved content — rendered noindex and kept out of the sitemap and llms.txt. */
export const pendingContentPaths = [
  '/services/mep',
  '/services/civil',
  '/services/manufacturing-prefabrication/modular',
  '/services/manufacturing-prefabrication/custom',
  '/services/turnkey-developments',
  '/certification-training',
] as const;

/** Every Services destination (groups with their own page + their links), flattened in menu order — footer and active-state matching. */
export const servicesNavigation: NavGroupLinkEntry[] = servicesNavigationGroups.flatMap((group) => [
  ...(group.href ? [{ label: group.label, href: group.href, i18nKey: group.i18nKey }] : []),
  ...group.links,
]);

/** Data centre MEP capability — not one of the four service groups, surfaced alongside them as a sector solution. */
export const dataCentreServiceLink: NavGroupLinkEntry = {
  label: 'Data Centres',
  href: '/services/data-centers',
  i18nKey: 'dataCentres',
};

/** Footer Services column — live service pages only (structure-only pages join once they have approved content), plus Data Centres. */
export const footerServiceLinks: NavGroupLinkEntry[] = [
  ...servicesNavigation.filter((link) => !(pendingContentPaths as readonly string[]).includes(link.href)),
  dataCentreServiceLink,
];

/** "About" dropdown — every entry carries its own `nav` translation key. */
export const aboutNavigation: NavGroupLinkEntry[] = [
  { label: 'About MENASCO', href: '/about', i18nKey: 'aboutMenasco' },
  { label: 'Leadership Team', href: '/team', i18nKey: 'leadershipTeam' },
  { label: 'Quality & Safety', href: '/quality-safety', i18nKey: 'qualitySafety' },
  { label: 'MENASCO Certification & Training', href: '/certification-training', i18nKey: 'certificationTraining' },
  { label: 'ESG Reporting', href: '/esg-reporting', i18nKey: 'esgReporting' },
  { label: 'Innovation & Technology', href: '/innovation-technology', i18nKey: 'innovationTechnology' },
];

export const footerCompanyLinks: NavLinkEntry[] = [
  { label: 'About MENASCO', href: '/about' },
  { label: 'Quality & Safety', href: '/quality-safety' },
  { label: 'ESG Reporting', href: '/esg-reporting' },
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
  { label: 'LYNXqc Privacy Policy', href: '/lynxqc/privacy-policy' },
];
