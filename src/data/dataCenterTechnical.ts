/**
 * Copy for the Data Center technical page (/services/data-centers).
 * ENGLISH ONLY for now: the Arabic translation is deferred (the Arabic route
 * shows the English copy with an Arabic notice). When translating, move this
 * into public/locales/{en,ar}/services.json. [[n]] = citation n in
 * TECHNICAL_SOURCES (src/data/dataCenterSources.ts). The FAQ is NOT here: it
 * stays in services:dataCenter.faq (EN + AR).
 */
export const dcTechnical = {
  tabs: { technical: 'Technical', sustainability: 'Sustainability' },
  /** Narrative chapter labels and the "MENASCO's role" thread (role lines marked NEW are new copy, pending approval). */
  chapter: 'Chapter',
  roleLabel: "MENASCO's role",
  hero: {
    eyebrow: 'Data Center MEP Contractor',
    title: 'Power, Cooling and Uptime, Engineered as One System',
    intro:
      'MENASCO engineers, installs, tests and commissions the mechanical, electrical and controls infrastructure behind mission-critical data centers, from greenfield hyperscale campuses to live brownfield upgrades, built to the redundancy each Uptime Tier requires.',
    diagramLabel: 'Illustrative single-line: power, cooling and data paths',
  },
  stats: { tier: 'Tier III & Tier IV', tierLabel: 'Redundancy topologies engineered' },
  tiers: {
    eyebrow: 'Uptime Tier Classification',
    heading: 'Tier III and Tier IV, translated into MEP design',
    intro:
      'The Uptime Institute Tier Classification System defines data center infrastructure by how it behaves during maintenance and failure [[1]]. For the MEP contractor, each Tier is a set of non-negotiable rules for capacity components and distribution paths.',
    items: [
      {
        id: 'tier-iii',
        name: 'Tier III',
        tagline: 'Concurrently maintainable',
        points: [
          'Every capacity component and distribution path can be removed for planned maintenance without shutting down IT equipment [[1]].',
          'Redundant capacity components, typically N+1, and at least two distribution paths, with one path active.',
          'Electrical and mechanical systems arranged so that isolating any single item never interrupts the critical load.',
        ],
        figure: 'N+1',
      },
      {
        id: 'tier-iv',
        name: 'Tier IV',
        tagline: 'Fault tolerant',
        points: [
          'Builds on Tier III and adds fault tolerance: the facility rides through a single unplanned failure or event without impact to IT [[1]].',
          'Independent, physically isolated systems with simultaneously active distribution paths, typically 2N for power.',
          'Compartmentalisation so a fire or failure in one path cannot reach its partner, plus continuous cooling through every transfer.',
        ],
        figure: '2N',
      },
    ],
    certificationNote:
      'Tier Certification of design documents and of constructed facilities is awarded exclusively by Uptime Institute, and only to facilities [[2]]. MENASCO engineers, installs and commissions MEP systems that deliver the Tier topology the design requires, so the constructed facility matches the certified design.',
    diagramLabel: 'Illustrative Tier topology',
    pathA: 'Path A',
    pathB: 'Path B',
  },
  sites: {
    // NEW copy
    role: 'On greenfield campuses MENASCO secures utility capacity and prefabricates plant early; on live sites it protects the critical load with rehearsed cut-overs and temporary plant.',
    eyebrow: 'Greenfield and brownfield',
    heading: 'New campuses and live facilities demand different engineering',
    items: [
      {
        id: 'greenfield',
        title: 'Greenfield: new-build campuses',
        points: [
          'Utility capacity, substation timing and connection agreements secured from the earliest design stage.',
          'Phased white space: MEP backbone built ahead so each data hall energises as IT demand ramps up.',
          'Prefabricated plant skids, modular electrical rooms and pipe spools to compress the programme.',
          'Integrated systems testing under simulated IT load before the first server arrives.',
        ],
      },
      {
        id: 'brownfield',
        title: 'Brownfield: live upgrades and expansions',
        points: [
          'Works planned around live IT load with method statements, permits to work and rehearsed cut-overs.',
          'Temporary power and cooling that preserve redundancy throughout every switchover.',
          'Surveys of existing capacity, spare ways and plant condition before a single change is designed.',
          'Densification for AI workloads, including liquid-cooling retrofits inside operating halls.',
        ],
      },
    ],
  },
  cooling: {
    eyebrow: 'Precision cooling',
    heading: 'CRAC vs CRAH: how the white space rejects heat',
    intro:
      'Both are precision air units serving the data hall. The difference is where the refrigeration happens, which shapes efficiency, plant layout and how far a facility can scale.',
    toggleCrac: 'CRAC',
    toggleCrah: 'CRAH',
    items: [
      {
        id: 'crac',
        name: 'CRAC: Computer Room Air Conditioner',
        description:
          'A self-contained direct-expansion (DX) unit with its own compressor and refrigerant circuit, rejecting heat to an outdoor condenser. It suits smaller rooms, edge sites and facilities without a central chilled-water plant.',
        strengths: ['Independent per unit, with no central plant', 'Quick to deploy and scale in small steps'],
        considerations: ['A compressor in every unit lowers efficiency at scale', 'Refrigerant pipe runs limit layout distances'],
      },
      {
        id: 'crah',
        name: 'CRAH: Computer Room Air Handler',
        description:
          'A fan and chilled-water coil served by a central chiller plant, with no compressor inside the unit. It is the standard for large and hyperscale data halls.',
        strengths: ['Higher efficiency at scale with variable-speed fans', 'Enables free cooling and higher chilled-water temperatures'],
        considerations: ['Requires a redundant chilled-water plant and piping', 'Water near the white space needs leak detection and containment'],
      },
    ],
    ashrae:
      'Both are typically controlled to keep server inlet air within ASHRAE\'s recommended envelope of 18–27 °C [[3]]. Hot- or cold-aisle containment lets supply air run near the top of that range, cutting cooling energy.',
    liquid:
      'As AI racks densify, air cooling gives way to direct-to-chip liquid cooling and rear-door heat exchangers. MENASCO designs chilled-water and coolant distribution around these loads from the outset.',
    figure: { value: '18–27 °C', label: "ASHRAE's recommended server inlet air range [[3]]" },
    labels: { supply: 'Cold supply air', return: 'Hot return air', condenser: 'Outdoor condenser', chiller: 'Chiller plant', racks: 'IT racks', unit: 'Air unit' },
  },
  power: {
    eyebrow: 'Electrical resilience',
    heading: 'Power that never drops',
    intro:
      'From medium-voltage intake to the rack, every stage is engineered so a utility failure becomes a non-event for the IT load.',
    points: [
      'Medium-voltage intake, switchgear and transformers sized for the full campus and staged growth.',
      'UPS systems that carry the critical load through the seconds before generators take over.',
      'Standby generators with automatic transfer switching, fuel storage and load-bank testing.',
      'A and B distribution paths to dual-corded IT, with static transfer switches for single-corded loads.',
    ],
    simulate: 'Simulate a utility failure',
    restore: 'Restore utility power',
    // NEW copy
    role: 'MENASCO installs and commissions the complete electrical chain, from medium-voltage intake to the rack, and tests each transfer before handover.',
    states: {
      normal: 'Normal operation: utility supplying the load through the UPS.',
      failed: 'Utility lost: the UPS carries the load while generators start and the transfer switch closes.',
    },
    labels: { utility: 'Utility', mv: 'MV switchgear', tx: 'Transformer', ats: 'ATS', gen: 'Generator', ups: 'UPS', pdu: 'PDU', it: 'IT load' },
  },
  energy: {
    eyebrow: 'Local energy markets',
    heading: 'Understanding local energy infrastructure is part of the engineering',
    intro:
      'Power availability is increasingly the constraint on new capacity. The IEA reports that the Texas large-load connection queue, around three-quarters of it data centres, passed 230 GW by January 2026, against an all-time peak demand of 85 GW [[4]].',
    markets: [
      {
        id: 'uae',
        name: 'United Arab Emirates',
        body: 'Abu Dhabi is building dedicated generation and transmission for data centres, with power investment for the sector expected to exceed AED 37 billion [[5]]. Early alignment with the utility on connection capacity, substation timing and tariffs de-risks the programme.',
      },
      {
        id: 'ksa',
        name: 'Saudi Arabia',
        body: 'Fast-growing demand from giga-projects and new digital infrastructure makes early capacity agreements and phased energisation essential for data center schedules.',
      },
      {
        id: 'usa',
        name: 'United States',
        body: 'Data centers used about 4.4% of US electricity in 2023 and could reach 6.7–12% by 2028 [[6]], making phased energisation and on-site generation planning critical.',
      },
      {
        id: 'europe',
        name: 'Europe',
        body: 'EU data centres of 500 kW and above report energy and water KPIs annually [[7]], and Germany sets efficiency and heat-reuse requirements for new facilities [[8]].',
      },
    ],
    helpHeading: 'How MENASCO uses this',
    figure: { value: '230 GW', label: 'Texas large-load connection queue in January 2026, against an all-time peak demand of 85 GW [[4]]' },
    help: [
      'Load profiling and staged energisation matched to the IT ramp-up.',
      'Medium-voltage substation and switchgear interfaces coordinated with the utility from design stage.',
      'On-site generation, storage and fuel strategies for resilience and grid support.',
      'Metering at every level for PUE reporting and tariff optimisation.',
    ],
  },
  delivery: {
    eyebrow: 'How we deliver',
    heading: 'From coordinated design to integrated systems testing',
    steps: [
      { title: 'Design coordination & BIM', body: 'Clash-free plant rooms, risers and white space, coordinated in a federated model.' },
      { title: 'Prefabrication', body: 'Plant skids, electrical rooms and pipe spools built and tested off site.' },
      { title: 'Installation', body: 'Sequenced, quality-tracked installation with documented inspections at every stage.' },
      {
        title: 'Commissioning L1–L5',
        body: 'Factory witness testing, site acceptance, pre-functional checks, functional performance tests, then integrated systems testing under simulated IT load.',
      },
      { title: 'Handover', body: 'As-built records, O&M manuals, operator training and a metered performance baseline.' },
    ],
  },
  // NEW copy (role)
  projects: { eyebrow: 'Data center portfolio', heading: 'Mission-critical projects', viewAll: 'View all projects', role: "Data centers from MENASCO's project portfolio across the UAE." },
  sustainabilityTeaser: {
    eyebrow: 'Sustainability',
    heading: 'Built to achieve LEED Gold and Estidama Pearl',
    body: 'Efficient chilled-water plants, metering, water-efficient heat rejection and rigorous commissioning carry many of the credits behind LEED Gold and Estidama Pearl ratings. Explore how MENASCO approaches data center sustainability in the GCC, the USA and Europe.',
    cta: 'Explore data center sustainability',
  },
  faq: { eyebrow: 'FAQ', heading: 'Data center questions, answered' },
  sources: { heading: 'Sources', intro: 'Facts and figures on this page are drawn from the following publications.' },
  arabicNotice: 'تم تأجيل الترجمة العربية',
};
