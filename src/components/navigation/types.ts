export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavColumn {
  heading: string;
  /** Set when the group itself has a landing page — the heading renders as a link. */
  href?: string;
  links: NavLink[];
}

export interface NavFeatured {
  title: string;
  description: string;
  href: string;
  image?: string;
}

export interface NavItem {
  label: string;
  href?: string;
  dropdown?: NavLink[];
  megaMenu?: {
    columns: NavColumn[];
    featured?: NavFeatured;
    /** Full-width row of secondary links beneath the columns (e.g. "All services"). */
    footerLinks?: NavLink[];
  };
}
