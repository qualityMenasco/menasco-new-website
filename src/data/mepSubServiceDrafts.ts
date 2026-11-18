import type { ServiceDefinition } from './services';

/**
 * DRAFT COPY — not rendered anywhere and not routed.
 *
 * The Mechanical, Electrical and Plumbing sub-service pages were removed on
 * 2026-11-19: sub-services are now sections of their umbrella page (MEP).
 * Their copy is kept here (and under services:items.mechanical / electrical /
 * plumbing in the locale files, EN + AR) so those MEP sections can be built
 * from it. When a section ships, give its id to the matching subService(...)
 * entry in src/data/navigation.ts so the footer links point at it.
 */
export const mepSubServiceDrafts: ServiceDefinition[] = [
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
];
