export interface Sector {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: 'building' | 'hotel' | 'briefcase' | 'route' | 'server' | 'factory' | 'layers' | 'ticket';
}

/**
 * Aligned with the four project categories in src/data/projectCategories.ts
 * (same names, same descriptions) so the Sectors section and the Projects
 * category system speak with one voice.
 */
export const sectors: Sector[] = [
  {
    id: 'residential-commercial',
    slug: 'residential-commercial',
    name: 'RESIDENTIAL / COMMERCIAL DEVELOPMENTS',
    description: 'Integrated MEP solutions for residential towers, offices, retail destinations, mixed-use developments & large-scale commercial properties.',
    icon: 'building',
  },
  {
    id: 'hotels',
    slug: 'hotels',
    name: 'HOSPITALITY & LEISURE',
    description: 'High-performance MEP systems for luxury hotels, resorts, serviced residences, restaurants & leisure destinations designed to enhance comfort, efficiency & guest experience.',
    icon: 'hotel',
  },
  {
    id: 'landmark-entertainment',
    slug: 'landmark-entertainment',
    name: 'LANDMARK & ENTERTAINMENT DESTINATIONS',
    description: 'Complex engineering solutions for cultural landmarks, entertainment venues, visitor attractions & iconic destination developments requiring seamless system integration.',
    icon: 'ticket',
  },
  {
    id: 'advanced-technical-facilities',
    slug: 'advanced-technical-facilities',
    name: 'MISSION-CRITICAL & TECHNICAL FACILITIES',
    description: 'Resilient, high-availability engineering solutions for data centers, healthcare facilities, energy projects, control centers & other technically demanding environments.',
    icon: 'server',
  },
];
