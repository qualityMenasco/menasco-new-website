/**
 * Copy for the Data Center technical page (/services/data-centers).
 * ENGLISH ONLY for now: the Arabic translation is deferred (the Arabic route
 * shows the English copy with an Arabic notice). When translating, move this
 * into public/locales/{en,ar}/services.json. [[n]] = citation n in
 * TECHNICAL_SOURCES (src/data/dataCenterSources.ts). The FAQ is NOT here: it
 * stays in services:dataCenter.faq (EN + AR).
 */
export const dcTechnical = {
  tabs: { section: 'Data Centers', technical: 'Technical', sustainability: 'Sustainability', onThisPage: 'On this page', sections: 'Section', previous: 'Previous', next: 'Next' },
  /** Narrative chapter labels and the "MENASCO's role" thread (role lines marked NEW are new copy, pending approval). */
  /** "MENASCO in data centers" section below the hero. Heading, intro, capabilities and
   *  prefab copy come from services:dataCenter (EN + AR). */
  capability: {
    eyebrow: 'MENASCO in data centers',
  },

  roleLabel: "MENASCO's role",
  hero: {
    eyebrow: 'Data Center MEP Contractor',
    title: 'Power, Cooling and Uptime, Engineered as One System',
    intro:
      "With experience serving the world's leading hyperscale operators, our capabilities include greenfield and brownfield developments, Tier III and Tier IV redundant infrastructure, and projects targeting LEED Gold and Estidama Pearl sustainability ratings.",
    diagramLabel: 'Illustrative single-line: power, cooling and data paths',
    cta: 'Explore Portfolio',
  },
  stats: { tier: 'Tier III–IV', tierLabel: 'Redundancy we build to', ratings: 'LEED & Estidama', ratingsLabel: 'Gold & Pearl alignment' },
  tiers: {
    eyebrow: 'Uptime Tier Classification',
    heading: 'Tier III and Tier IV, translated into MEP design',
    intro:
      "The Uptime Institute Tier Classification System defines data center infrastructure by how it behaves during maintenance and failure [[11]]. For MENASCO's work, each Tier is a set of non-negotiable rules for capacity components and distribution paths.",
    items: [
      {
        id: 'tier-iii',
        name: 'Tier III',
        tagline: 'Concurrently maintainable',
        points: [
          'Every capacity component and distribution path can be removed for planned maintenance without shutting down IT equipment [[11]].',
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
          'Builds on Tier III and adds fault tolerance: the facility rides through a single unplanned failure or event without impact to IT [[11]].',
          'Independent, physically isolated systems with simultaneously active distribution paths, typically 2N for power.',
          'Compartmentalisation so a fire or failure in one path cannot reach its partner, plus continuous cooling through every transfer.',
        ],
        figure: '2N',
      },
    ],
    certificationNote:
      'Tier Certification of design documents and of constructed facilities is awarded exclusively by Uptime Institute, and only to facilities [[12]]. MENASCO engineers, installs and commissions MEP systems that deliver the Tier topology the design requires, so the constructed facility matches the certified design.',
    diagramLabel: 'Illustrative Tier topology',
    pathA: 'Path A',
    pathB: 'Path B',
  },
  sites: {
    // NEW copy
    role: 'On greenfield campuses, early utility coordination and off-site fabrication helps accelerate construction. For live-facility upgrades, planned cutovers and temporary infrastructure protect operational continuity.',
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
    heading: 'CRAC vs CRAH, and air vs direct-to-chip',
    intro:
      'Two decisions shape how the white space rejects heat: which precision air units serve the hall, and whether high-density racks move to liquid cooling at the chip.',
    // Comparison toggle (both comparisons stay in the HTML).
    comparisons: [
      {
        id: 'units',
        label: 'CRAC vs CRAH',
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
      },
      {
        id: 'approach',
        label: 'Air vs direct-to-chip',
        items: [
          {
            id: 'air',
            name: 'Traditional air cooling',
            description:
              'Room-level cooling from CRAC or CRAH units, with hot- or cold-aisle containment, moves conditioned air through the racks to carry heat away from every server component.',
            strengths: ['Proven, familiar to operators and compatible with any server', 'Simpler fit-out, with no liquid inside the rack'],
            considerations: ['Fan and air-handling energy rise steeply as rack density grows', 'Struggles to remove heat from high-density AI and HPC racks'],
          },
          {
            id: 'dtc',
            name: 'Direct-to-chip liquid cooling',
            description:
              'Cold plates on CPUs and GPUs carry a coolant loop, fed by coolant distribution units (CDUs) from the facility water system, removing most of the server heat at the chip before it reaches the room.',
            strengths: ['Supports high-density AI and HPC racks', 'Warmer water temperatures extend free cooling and enable heat reuse'],
            considerations: ['Needs CDUs, secondary loops and liquid-ready racks and servers', 'Residual heat still needs air cooling, plus leak detection and water quality control'],
          },
        ],
      },
    ],
    strengthsLabel: 'Strengths',
    considerationsLabel: 'Considerations',
    ashrae:
      "Air-cooled equipment is typically controlled to keep server inlet air within ASHRAE's recommended envelope of 18–27 °C [[13]]. Hot or cold-aisle containment lets supply air run near the top of that range, cutting cooling energy.",
    figure: { value: '18–27 °C', label: "ASHRAE's recommended server inlet air range [[13]]" },
  },
  power: {
    eyebrow: 'Electrical resilience',
    heading: 'Power that never drops',
    intro:
      'From medium-voltage intake to the rack, every stage is engineered so a utility failure becomes a non-event for the IT load.',
    points: [
      'MV intake, switchgear and transformers for staged growth.',
      'UPS systems carry the critical load until generators take over.',
      'Generators with ATS, fuel storage and load-bank testing.',
      'A/B paths to dual-corded IT, with STS for single-corded loads.',
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
    // Power chain diagram (PowerChainDiagram): panel title, header chip and per-node status chips.
    diagramTitle: 'Single-line diagram',
    legend: { energised: 'Energised conductor', deenergised: 'Lost supply', standby: 'Standby path' },
    headerStatus: { normal: 'Utility supply', failed: 'Utility failure' },
    status: {
      online: 'Online',
      lost: 'Lost',
      energised: 'Energised',
      deenergised: 'De-energised',
      standby: 'Standby',
      running: 'Running',
      onUtility: 'On utility',
      onGenerator: 'On generator',
      onBattery: 'On battery',
      uninterrupted: 'Uninterrupted',
    },
  },
  energy: {
    eyebrow: 'Local energy markets',
    heading: 'Understanding local energy infrastructure is part of the engineering',
    constraintsLabel: 'Key market constraints',
    // Comparison layout (2026-11-24).
    marketLabel: 'Market',
    detailLabel: 'Market detail',
    contextLabel: 'Market context',
    helpLabel: 'How we help',
    /** Card headings (SEO: one unique, keyword-rich heading per face). */
    frontTitlePrefix: 'Data centers in',
    backTitlePrefix: "MENASCO's Data Center Advantage in",
    backLabel: 'Market constraints',
    advantageLabel: "MENASCO's Competitive Advantage",
    // Phones: the How MENASCO helps paragraph is clamped to 4 lines behind this toggle.
    readMore: 'Read more',
    readLess: 'Show less',
    markets: [
      {
        id: 'uae',
        slug: 'united-arab-emirates',
        name: 'United Arab Emirates',
        inName: 'the United Arab Emirates',
        body: 'Rapid hyperscale expansion in Abu Dhabi and Dubai is placing new demands on power generation, transmission capacity, and utility infrastructure. Grid connection schedules, substation delivery, high ambient temperatures, and cooling efficiency must be addressed early, with electricity procurement and generation arrangements differing between the emirates [[1]] [[2]].',
        constraints: [
          'Utility capacity, substation approvals, and energization schedules',
          'Cooling performance during extreme summer temperatures',
          'Emirate-specific power procurement and self-generation arrangements',
        ],
        help: "With our international engineering, procurement, and project management teams headquartered in Dubai, MENASCO can coordinate utility requirements, electrical infrastructure design, and long-lead equipment sourcing from a single operational hub. Direct UAE construction capabilities, in-country manufacturing and established supplier relationships allow substation works, cooling infrastructure, and off-site modular prefabrication to progress in parallel, reducing dependencies between utility readiness, equipment delivery, and construction milestones.",
        advantage: [
          'Engineering, procurement, fabrication and construction management in one UAE headquarters',
          'Faster technical coordination from a single operational hub',
          'Tighter control of the procurement and delivery interfaces that delay projects',
        ],
      },
      {
        id: 'ksa',
        slug: 'saudi-arabia',
        name: 'Saudi Arabia',
        inName: 'Saudi Arabia',
        body: "Saudi Arabia's expanding data center market must balance large-scale AI infrastructure demand with extreme heat, water scarcity, and evolving regulatory requirements. Cooling architecture, electricity supply, and equipment procurement require early planning, while data center service providers must address registration and classification requirements under the Communications, Space and Technology Commission (CST) [[3]] [[4]].",
        constraints: [
          'Water-efficient cooling and high-temperature system performance',
          'CST registration and applicable facility classification requirements',
          'Utility planning and long-lead electrical equipment procurement',
        ],
        help: "Saudi Arabia's extreme temperatures and water scarcity demand cooling systems optimized for local conditions, while rapid data center expansion places pressure on specialist equipment supply chains. MENASCO is skilled in delivering closed loop direct-to-chip liquid cooling, as well as traditional configurations against project-specific PUE and WUE targets. Drawing on international suppliers and in-country fabrication to source equipment, dedicated construction teams adapt solutions to local codes, utility requirements, and minimize reliance on external delivery partners.",
        advantage: [
          'Direct-to-chip liquid cooling expertise',
          'In-country fabrication and a global sourcing network',
          'Directly managed Saudi construction teams',
        ],
      },
      {
        id: 'egypt',
        slug: 'egypt',
        name: 'Egypt',
        inName: 'Egypt',
        body: "Egypt's position as a regional connectivity hub offers opportunities for data center development, but investors face challenges involving land allocation, construction permits, telecom licensing, and infrastructure readiness. Coordinating power availability, fiber connectivity, regulatory approvals, and imported equipment procurement early is essential to establishing realistic construction and commissioning schedules [[5]] [[6]].",
        constraints: [
          'Land allocation, development permits, and telecom licensing',
          'Power infrastructure and reliable carrier connectivity',
          'Imported equipment procurement and customs coordination',
        ],
        help: "Egypt's reliance on imported specialist equipment and variable infrastructure readiness can delay data center construction. MENASCO addresses these constraints through Egyptian manufacturing facilities capable of producing modular data center white spaces, E-Houses and prefabricated MEP assemblies locally, reducing the need to import completed modules. International procurement teams source specialized components while local construction teams coordinate utility connections and civil works, allowing manufacturing and site development to progress in parallel.",
        advantage: [
          'Local manufacturing of modular MEP units',
          'International sourcing of specialist components',
          'Less reliance on imported finished systems, with scope to shorten schedules',
        ],
      },
      {
        id: 'europe',
        slug: 'europe',
        name: 'Europe',
        inName: 'Europe',
        body: 'European data center development faces increasing grid connection delays, limited available power capacity, and tightening energy-efficiency requirements. Site selection must account for utility connection timelines, electricity costs, and national permitting rules, while cooling efficiency, waste heat recovery, and energy performance reporting play an increasingly important role in facility design [[7]] [[8]].',
        constraints: [
          'Grid connection queues and transmission capacity',
          'EU energy-efficiency reporting and country-specific requirements',
          'Waste heat recovery and low-carbon electricity sourcing',
        ],
        help: "Grid connection delays and increasingly demanding energy-efficiency regulations can limit the feasibility and timing of European data center developments. MENASCO's scale of international engineering resources support early assessment of electrical capacity, phased infrastructure requirements, and cooling configurations incorporating heat recovery where viable. UK-based teams coordinate technical development and global equipment sourcing, while qualified local partners address country-specific regulations and utility interfaces, allowing procurement and construction planning to respond to confirmed power availability.",
        advantage: [
          'Centralized technical resources and international procurement capacity',
          'Flexibility to adapt to constrained grid access',
          'UK-led coordination with local regulatory support',
        ],
      },
      {
        id: 'usa',
        slug: 'united-states',
        name: 'United States',
        inName: 'the United States',
        body: "US data center development is increasingly constrained by electrical equipment supply and a growing shortage of skilled construction tradespeople. Availability of electricians, pipefitters, HVAC technicians, and other specialized workers place pressure on labor costs and schedules. With large power transformers facing multi-year lead times, early procurement, workforce planning, off-site prefabrication, and phased energization are essential for hyperscale and AI infrastructure projects [[9]] [[10]].",
        constraints: [
          'Grid interconnection and utility service agreements',
          'Long-lead transformers, switchgear, and electrical equipment',
          'State and local permitting, with phased power availability',
          'Skilled trade labor shortages and construction workforce staffing',
        ],
        help: "MENASCO's international procurement network expands access to qualified manufacturers beyond domestic suppliers, while centralized engineering teams coordinate alternative equipment specifications and modular fabrication opportunities. Direct US contracting partnerships enable civil works, prefabricated MEP installation, and phased electrical infrastructure to be aligned with equipment deliveries and utility energization milestones. Established relationships with staffing agencies across the United States also provide access to skilled construction tradespeople, helping address regional labor shortages, scale site workforces, and maintain construction schedules on large-scale data center developments.",
        advantage: [
          'Global procurement networks to manage equipment shortages',
          'Centralized engineering expertise',
          'US construction capabilities that adapt to utility delays',
          'Nationwide staffing relationships for skilled construction trades',
        ],
      },
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
  projects: { eyebrow: 'Data center portfolio', heading: 'Mission-critical projects', viewAll: 'View all projects', role: "Data centers from MENASCO's project portfolio" },
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
