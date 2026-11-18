import { placeholderImages } from './images';

export interface ServiceDefinition {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  introduction: string;
  capabilities: string[];
  relatedSectors: string[];
  /** Representative photo for this service. */
  image: string;
}

/**
 * Services with a typed record (used by the llms.txt generator and SEO
 * routes). Sub-services no longer have pages — see mepSubServiceDrafts.ts for
 * the Mechanical / Electrical / Plumbing copy kept for future MEP sections.
 */
export const services: ServiceDefinition[] = [
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
  // Default/placeholder content (2026-10-29, image updated) — the user
  // explicitly asked for draft text here, to be replaced once real EPC copy
  // and project-specific photography are approved. This entry now only
  // drives the services-listing card/thumbnail — the live page itself
  // (src/pages/EPCPage.tsx) is a dedicated bespoke component with its own
  // locale content, routed ahead of the services/:slug catch-all. Route
  // preserved as 'turnkey-developments' per the earlier "Turnkey
  // Developments" → "EPC" rename (the URL was deliberately kept unchanged
  // at that time; `name` here is the current approved "EPC" label).
  {
    id: 'turnkey-developments',
    slug: 'turnkey-developments',
    name: 'EPC',
    shortDescription: 'Single-point engineering, procurement and construction delivery, coordinated end to end by MENASCO.',
    introduction:
      "MENASCO delivers integrated Engineering, Procurement and Construction (EPC) solutions, providing a single point of responsibility from early-stage design through procurement, installation and handover. Our EPC capability combines in-house MEP engineering, coordinated procurement and on-site execution, so a project's building services are delivered as one accountable scope rather than a series of separate contracts to coordinate.",
    capabilities: [
      'Engineering Design & BIM Coordination',
      'Procurement & Supply-Chain Coordination',
      'Site Mobilisation & Construction Management',
      'Single-Point MEP Delivery',
      'Installation, Testing & Commissioning',
      'Project Scheduling & Progress Reporting',
      'Quality Assurance & HSE Compliance',
      'Handover & Close-Out Documentation',
    ],
    relatedSectors: ['residential-commercial', 'hospitality-landmark-entertainment', 'advanced-technical-facilities'],
    image: '/Mechanical_Floor_Volante-2-2-3.jpg',
  },
];

/**
 * Photos used ONLY on the /services listing page — the intro photo and one
 * photo per umbrella tile in the bento grid (ServicesBento). Deliberately
 * separate from each service's own `image` / servicePagePreviews so every
 * individual service page (and the homepage) keeps its original photo.
 * Tile photos keep their natural colour (only the intro photo is brand-graded)
 * so the five tiles read as distinct images (public/services-listing/).
 *
 * NOTE: several are AI-generated stand-ins or third-party photos pending
 * rights confirmation — replace with MENASCO project photography when
 * available. Unused sub-service photos (mechanical/electrical/fire/custom)
 * are kept in public/services-listing/ for later use.
 */
export const servicesListingHeroImage = '/services-listing/hero.webp';
/** Desktop /services hero (portrait 4:5). The mobile hero keeps the landscape image above. */
export const servicesListingHeroPortraitImage = '/about-hero-fire-suppression.jpg';
export const servicesListingUmbrellaImages: Record<string, string> = {
  '/services/mep': '/services-listing/plumbing.webp',
  '/services/civil': '/services-listing/bim.webp',
  '/services/manufacturing-prefabrication': '/services-listing/modular.webp',
  '/services/turnkey-developments': '/services-listing/epc.webp',
  '/services/data-centers': '/services-listing/data-centers.webp',
};
