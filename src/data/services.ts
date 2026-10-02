import { placeholderImages } from './images';
import { servicesNavigationGroups, pendingContentPaths, dataCentreServiceLink } from './navigation';

export interface ServiceDefinition {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  introduction: string;
  capabilities: string[];
  relatedSectors: string[];
  /** Representative photo for this discipline — used consistently across the homepage, services grid, and service detail hero. */
  image: string;
}

export const services: ServiceDefinition[] = [
  {
    id: 'mechanical',
    slug: 'mechanical',
    name: 'Mechanical',
    shortDescription: 'HVAC, chilled-water and plant systems engineered for regional climate loads.',
    introduction:
      "MENASCO delivers integrated mechanical, ventilation & air-conditioning (HVAC) solutions engineered for energy efficiency, operational reliability & high performance in the region's demanding climate, our capabilities extend from central cooling & mechanical plant systems to specialised installations & off-site modular solutions.",
    capabilities: [
      'HVAC & Ventilation Systems',
      'Chilled-Water & District Cooling Systems',
      'Air-Cooled & Water-Cooled Chiller Systems',
      'Mechanical Plant Rooms',
      'Pumps, Heat Exchangers & Cooling Towers',
      'Air Distribution & Ductwork Systems',
      'Smoke Extraction & Staircase Pressurisation Systems',
      'Building Management & HVAC Control Systems',
      'Off-Site Prefabricated Modular MEP Solutions',
      'Refrigeration & Cold-Room Systems',
      'Compressed-Air Systems',
      'Industrial, LPG & Medical Gas Systems',
      'Cleanroom & Controlled-Environment Systems',
      'Wastewater & Water-Treatment Systems',
      'Steam & Boiler Systems',
      'Testing, Adjusting & Balancing (TAB)',
      'Testing and Commissioning',
    ],
    relatedSectors: ['residential-commercial', 'hospitality-landmark-entertainment', 'advanced-technical-facilities'],
    image: '/mechanical.jpg',
  },
  {
    id: 'electrical',
    slug: 'electrical',
    name: 'Electrical',
    shortDescription: 'Power distribution, building management and low-current systems, coordinated end to end.',
    introduction:
      "MENASCO delivers integrated electrical & Extra-Low Voltage (ELV) solutions for residential, commercial, hospitality, infrastructure, industrial & mission-critical developments, our capabilities cover medium- & low-voltage power distribution, substations, emergency & backup power, lighting, building management, security, communication & intelligent control systems. From engineering design & BIM coordination to installation, testing, commissioning & handover, we deliver safe, energy-efficient, code-compliant systems engineered for reliable long-term performance.",
    capabilities: [
      'Medium-Voltage & Low-Voltage Electrical Systems',
      'Electrical Substations & Transformer Systems',
      'MV and LV Switchgear & Distribution Panels',
      'Main & Sub-Main Distribution Boards',
      'Power Distribution & Containment Systems',
      'Busbar & Busduct Systems',
      'Standby Generators & Emergency Power Systems',
      'Uninterruptible Power Supply (UPS) Systems',
      'Automatic Transfer Switch (ATS) Systems',
      'Lighting & Lighting-Control Systems',
      'Emergency & Specialist Lighting Systems',
      'Earthing, Grounding & Lightning Protection Systems',
      'Power-Factor Correction & Harmonic-Filtration Systems',
      'Energy Metering, Monitoring & Management Systems',
      'Building Management Systems (BMS)',
      'Structured Cabling and ICT Infrastructure',
      'CCTV and Video-Surveillance Systems',
      'Access-Control & Intrusion-Detection Systems',
      'Public Address & Voice-Alarm Systems (PAVA)',
      'Voice-Evacuation Systems',
      'Audio-Visual (AV) Systems',
      'Intercom & Master-Clock Systems',
      'Instrumentation & Control Systems',
      'Testing, Commissioning & System Integration',
    ],
    relatedSectors: ['residential-commercial', 'hospitality-landmark-entertainment', 'advanced-technical-facilities'],
    image: '/electrical.jpg',
  },
  {
    id: 'plumbing',
    slug: 'plumbing',
    name: 'Plumbing',
    shortDescription: 'Water supply, drainage and sanitary systems built for long-term reliability.',
    introduction:
      'MENASCO delivers integrated plumbing, water supply, drainage, and water-treatment solutions for residential, commercial, hospitality, industrial, infrastructure, and mission-critical projects. Our systems are engineered to ensure hygiene, water efficiency, operational reliability, and full compliance with local regulations and international standards. From engineering design and BIM coordination to installation, testing, commissioning, and handover, we provide efficient and sustainable plumbing solutions tailored to the technical and operational requirements of every project.',
    capabilities: [
      'Domestic Cold & Hot Water Supply Systems',
      'Water Storage & Distribution Systems',
      'Water-Pressure Booster Pump Systems',
      'Sanitary Drainage & Wastewater Systems',
      'Soil, Waste & Vent Systems',
      'Stormwater & Rainwater Drainage Systems',
      'Sewage-Lifting & Transfer Pumping Stations',
      'Sanitary Fixtures & Accessories Installation',
      'PVC, PPR, HDPE, Copper & Stainless-Steel Pipework',
      'Irrigation & Landscape Water Systems',
      'Greywater & Blackwater Treatment Systems',
      'Greywater Recycling & Reuse Systems',
      'Reverse Osmosis (RO) Water-Treatment Systems',
      'Water Filtration & Purification Systems',
      'Sewage Treatment Plants (STP)',
      'Grease, Oil & Sand Interceptor Systems',
      'Hot-Water Generation & Circulation Systems',
      'Solar Water-Heating Systems',
      'Water Metering & Leak-Detection Systems',
      'Swimming Pool, Fountain & Water-Feature Systems',
      'Testing, Flushing, Disinfection & Commissioning',
    ],
    relatedSectors: ['residential-commercial', 'hospitality-landmark-entertainment', 'advanced-technical-facilities'],
    image: '/plumbing.jpg',
  },
  {
    id: 'fire-protection',
    slug: 'fire-protection',
    name: 'Fire Protection',
    shortDescription:
      'MENASCO delivers integrated fire protection, firefighting, fire detection, and life safety systems for residential, commercial, hospitality, industrial, infrastructure & mission-critical projects across the UAE and the region.',
    introduction: `MENASCO delivers integrated fire protection, firefighting, fire detection, and life safety systems for residential, commercial, hospitality, industrial, infrastructure & mission-critical projects across the UAE and the region.

Our solutions are engineered and installed in compliance with the UAE Fire and Life Safety Code, Civil Defence requirements, NFPA standards, and applicable international regulations. From engineering design and BIM coordination to installation, testing, commissioning, and system integration, we provide reliable solutions designed to protect people, property, and critical assets.`,
    capabilities: [
      'Automatic Fire Sprinkler Systems',
      'Fire Hydrant & External Firefighting Systems',
      'Fire Hose Reel & Landing-Valve Systems',
      'Wet-Riser & Dry-Riser Systems',
      'Firefighting Pump Rooms & Pump Sets',
      'Fire-Water Storage & Distribution Systems',
      'Fire Detection & Alarm Systems',
      'Addressable and Conventional Fire Alarm Systems',
      'Public Address & Voice-Alarm Systems (PAVA)',
      'Emergency Voice-Evacuation Systems',
      'Smoke Detection and Aspiration Systems',
      'Gas and Flame Detection Systems',
      'Clean-Agent Fire-Suppression Systems',
      'CO₂ Fire-Suppression Systems',
      'Foam & Water-Mist Fire-Suppression Systems',
      'Kitchen-Hood & Wet-Chemical Suppression Systems',
      'Fire Extinguishers & First-Aid Firefighting Equipment',
      'Smoke-Control & Staircase-Pressurisation Systems',
      'Fireman Intercom & Emergency Communication Systems',
      'Fire Alarm Cause & Effect Programming',
      'Testing, Commissioning, Integration & Handover',
    ],
    relatedSectors: ['residential-commercial', 'hospitality-landmark-entertainment', 'advanced-technical-facilities'],
    image: '/fire.jpg',
  },
  {
    id: 'bim-digital-engineering',
    slug: 'bim-digital-engineering',
    name: 'BIM & Digital Engineering',
    shortDescription: 'Federated coordination and clash detection that de-risk delivery before site works begin.',
    introduction:
      'MENASCO uses BIM-driven coordination to resolve multidisciplinary clashes, validate constructability, and keep delivery data-driven from design through handover.',
    capabilities: [
      'BIM-driven coordination',
      'Digital engineering',
      'Clash detection',
      'Constructability review',
      'Multidisciplinary coordination',
      'Data-driven project delivery',
    ],
    relatedSectors: ['hospitality-landmark-entertainment', 'advanced-technical-facilities'],
    image: '/bim-digital-engineering-hero.jpg',  },
  {
    id: 'manufacturing-prefabrication',
    slug: 'manufacturing-prefabrication',
    name: 'Manufacturing & Prefabrication',
    shortDescription: 'Off-site production for faster, more consistent on-site installation.',
    introduction:
      'Through established manufacturing partners, MENASCO integrates prefabricated MEP components into project delivery, reducing site congestion and installation time while improving consistency across large-scale projects.',
    capabilities: [
      'Partner-led manufacturing capability',
      'Off-site production',
      'Quality inspection',
      'Faster installation',
      'Reduced site congestion',
      'Improved consistency',
      'Modular MEP solutions',
    ],
    relatedSectors: ['hospitality-landmark-entertainment', 'advanced-technical-facilities'],
    image: '/manufacturing-prefab-service-hero.jpg',  },
];

/**
 * Maps a `ServiceDefinition.slug` to its i18n key under `services:items.*` —
 * shared by every surface that renders a service's name/description/
 * capabilities from locale JSON (previously duplicated verbatim in
 * ServicesPage.tsx, ServicesShowcase.tsx, and the mobile homepage).
 */
export const serviceI18nKeys: Record<string, string> = {
  mechanical: 'mechanical',
  electrical: 'electrical',
  plumbing: 'plumbing',
  'fire-protection': 'fireProtection',
  'bim-digital-engineering': 'bimDigitalEngineering',
  'manufacturing-prefabrication': 'manufacturingPrefabrication',
};

export interface ServiceShowcaseLeaf {
  href: string;
  i18nKey: string;
  /** null when this leaf has no rich content yet (a pending page, or a child like Modular/Custom with no ServiceDefinition) — render a title+link only, never fabricated copy. */
  service: ServiceDefinition | null;
}

export interface ServiceShowcaseGroup {
  key: string;
  i18nKey: string;
  href?: string;
  leaves: ServiceShowcaseLeaf[];
}

const isPendingHref = (href: string) => (pendingContentPaths as readonly string[]).includes(href);
const serviceByHref = (href: string): ServiceDefinition | null =>
  services.find((service) => `/services/${service.slug}` === href) ?? null;

const toShowcaseLeaf = (href: string, i18nKey: string): ServiceShowcaseLeaf => ({
  href,
  i18nKey,
  service: serviceByHref(href),
});

/**
 * The homepage "What We Deliver" section's data — a presentation-specific
 * view derived from the canonical taxonomy (`servicesNavigationGroups`) and
 * this file's own rich content, not a third hardcoded taxonomy. A group's
 * own page is folded in as a leaf alongside its children exactly when
 * `src/pages/ServicesPage.tsx` would also show it as a destination card (a
 * real, non-pending page, or a group with no children at all) — see that
 * file's `includeLeadDestination` for the precedent this mirrors. Data
 * Centres isn't part of `servicesNavigationGroups` (it has its own
 * `services:dataCenter.hero.*` content, not a `ServiceDefinition`) and is
 * handled separately by each consuming component, the same way
 * ServicesPage.tsx renders it as its own trailing section.
 */
export const serviceShowcaseGroups: ServiceShowcaseGroup[] = servicesNavigationGroups.map((group) => {
  const includeLeadDestination = Boolean(group.href) && (group.links.length === 0 || !isPendingHref(group.href!));
  return {
    key: group.i18nKey,
    i18nKey: group.i18nKey,
    href: group.href,
    leaves: [
      ...(includeLeadDestination ? [toShowcaseLeaf(group.href!, group.i18nKey)] : []),
      ...group.links.map((link) => toShowcaseLeaf(link.href, link.i18nKey)),
    ],
  };
});

/** Data Centres isn't part of servicesNavigationGroups (no ServiceDefinition — its own services:dataCenter.hero.* content), so it's appended as its own single-leaf, childless group everywhere this data is consumed. */
export const dataCentresShowcaseLeaf: ServiceShowcaseLeaf = { href: dataCentreServiceLink.href, i18nKey: dataCentreServiceLink.i18nKey, service: null };
export const isDataCentresLeaf = (leaf: ServiceShowcaseLeaf) => leaf.href === dataCentresShowcaseLeaf.href;

/** The full set of groups the homepage/other showcase surfaces render, in taxonomy order — MEP/Civil/Manufacturing & Prefabrication/Turnkey Developments plus Data Centres appended. One source for any surface that needs this grouping (currently the desktop and mobile homepage sections), so a new surface — or a future subservice added to Turnkey/Data Centres — doesn't require per-surface hardcoding. */
export const showcaseDisplayGroups: ServiceShowcaseGroup[] = [
  ...serviceShowcaseGroups,
  { key: 'dataCentres', i18nKey: dataCentreServiceLink.i18nKey, href: dataCentreServiceLink.href, leaves: [dataCentresShowcaseLeaf] },
];

/**
 * A leaf whose href equals its own group's href is the group's own page
 * shown as a leaf (Manufacturing & Prefabrication, Turnkey Developments,
 * Data Centres) — real subservices are every other leaf. Whether a group
 * gets an expand/collapse control derives purely from whether this list is
 * non-empty, per service, never hardcoded per category.
 */
export const showcaseGroupChildren = (group: ServiceShowcaseGroup): ServiceShowcaseLeaf[] =>
  group.leaves.filter((leaf) => leaf.href !== group.href);