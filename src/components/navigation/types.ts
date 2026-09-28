export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavColumn {
  heading: string;
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
  };
}
