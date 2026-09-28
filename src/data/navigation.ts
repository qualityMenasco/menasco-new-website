export interface NavLinkEntry {
  label: string;
  href: string;
}

export const primaryNavigation: NavLinkEntry[] = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects / Sectors', href: '/projects/categories' },
  { label: 'Newsroom', href: '/newsroom' },
  { label: 'Careers', href: '/careers' },
];

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
  { label: 'Services', sectionId: 'services', routePrefix: '/services' },
  // Single combined entry point for both project browsing and sector
  // filtering — Project Categories is the hub for both, so this always
  // navigates straight there rather than scrolling to a homepage section.
  { label: 'Projects / Sectors', sectionId: 'projects', routePrefix: '/projects', directHref: '/projects/categories' },
  // No homepage section anymore (the News teaser was removed from the
  // homepage) — this is a direct link to its own page only.
  { label: 'Newsroom', sectionId: 'newsroom', routePrefix: '/newsroom', directHref: '/newsroom' },
  { label: 'Careers', sectionId: 'careers', routePrefix: '/careers' },
];

export const servicesNavigation: NavLinkEntry[] = [
  { label: 'Mechanical Systems', href: '/services/mechanical' },
  { label: 'Electrical & ELV Systems', href: '/services/electrical' },
  { label: 'Plumbing, Water & Drainage Systems', href: '/services/plumbing' },
  { label: 'Fire Protection & Life Safety Systems', href: '/services/fire-protection' },
  { label: 'BIM & Digital Engineering', href: '/services/bim-digital-engineering' },
  { label: 'Manufacturing & MEP Prefabrication', href: '/services/manufacturing-prefabrication' },
];

/** "About" dropdown — mirrors servicesNavigation's shape/rendering via the same DropdownPanel. */
export const aboutNavigation: NavLinkEntry[] = [
  { label: 'About MENASCO', href: '/about' },
  { label: 'Leadership Team', href: '/team' },
  { label: 'Quality & Safety', href: '/quality-safety' },
  { label: 'ESG Reporting', href: '/esg-reporting' },
  { label: 'Innovation & Technology', href: '/innovation-technology' },
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
  { label: 'Hospitality & Leisure', href: '/projects/categories?category=hotels' },
  { label: 'Landmark & Entertainment', href: '/projects/categories?category=landmark-entertainment' },
  { label: 'Mission-Critical Facilities', href: '/projects/categories?category=advanced-technical-facilities' },
  { label: 'Infrastructure & Utilities', href: '/projects/categories' },
];

export const footerLegalLinks: NavLinkEntry[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms', href: '/terms' },
  { label: 'LYNXqc Privacy Policy', href: '/lynxqc/privacy-policy' },
];
