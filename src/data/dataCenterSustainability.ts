/**
 * Copy for the Data Center sustainability page
 * (/services/data-centers/sustainability). ENGLISH ONLY for now: the Arabic
 * translation is deferred. [[n]] = citation n in SUSTAINABILITY_SOURCES
 * (src/data/dataCenterSources.ts).
 */
export type OpportunityIcon = 'cooling' | 'clean-power' | 'electrical' | 'water' | 'heat' | 'construction' | 'operations';

export const dcSustainability = {
  hero: {
    eyebrow: 'Data Center Sustainability',
    title: 'Reducing Data Center Energy, Water and Carbon',
    intro:
      "A sustainable data center is engineered, not claimed. This guide sets out MENASCO's strategies to cut energy, water and carbon, how we measure, and what we prioritise in the GCC vs the USA and Europe.",
    diagramLabel: 'Illustrative: energy in, useful computing out, losses reduced',
  },
  opportunities: {
    eyebrow: 'Seven opportunities',
    heading: 'The seven biggest levers for a more sustainable data center',
    impactLabel: 'Impact',
    items: [
      {
        icon: 'cooling' as OpportunityIcon,
        title: 'Advanced cooling systems',
        body: 'Replace or supplement conventional air cooling with direct-to-chip liquid cooling, optimised chilled-water systems, and free cooling where climate conditions permit.',
        impact: 'Lower cooling energy consumption, especially for high-density AI workloads.',
      },
      {
        icon: 'clean-power' as OpportunityIcon,
        title: 'Low-carbon electricity',
        body: 'Source electricity from solar, wind, nuclear or other low-carbon generation through grid procurement, power purchase agreements and on-site generation.',
        impact: "Reduce operational carbon emissions, often the largest component of a data center's footprint.",
      },
      {
        icon: 'electrical' as OpportunityIcon,
        title: 'Efficient electrical infrastructure',
        body: 'Use high-efficiency UPS systems, optimised transformers, appropriately sized distribution systems and intelligent power management.',
        impact: 'Reduce electrical losses between the utility connection and IT equipment.',
      },
      {
        icon: 'water' as OpportunityIcon,
        title: 'Water-efficient cooling',
        body: 'Evaluate dry cooling, hybrid cooling, reclaimed water and closed-loop systems instead of relying exclusively on evaporative cooling.',
        impact: 'Reduce freshwater consumption, particularly important in water-stressed regions.',
      },
      {
        icon: 'heat' as OpportunityIcon,
        title: 'Waste-heat recovery',
        body: 'Capture heat from cooling systems and reuse it for district heating, industrial processes or other nearby thermal demands.',
        impact: 'Turn rejected heat into useful energy where suitable consumers exist.',
      },
      {
        icon: 'construction' as OpportunityIcon,
        title: 'Low-carbon construction',
        body: 'Use low-carbon concrete, recycled steel, prefabricated MEP modules, efficient material quantities and lifecycle-based procurement.',
        impact: 'Reduce embodied carbon before the facility becomes operational.',
      },
      {
        icon: 'operations' as OpportunityIcon,
        title: 'Intelligent operations and IT utilisation',
        body: 'Use DCIM, building management systems, predictive controls, server consolidation and workload scheduling to minimise wasted capacity.',
        impact: 'Reduce the electricity consumed per unit of useful computing work.',
      },
    ],
  },
  metrics: {
    eyebrow: 'Measuring what matters',
    heading: 'Beyond electricity: the metrics that define sustainability',
    intro: 'A sustainable data center cannot be evaluated using electricity consumption alone.',
    columns: { metric: 'Metric', measures: 'What it measures', direction: 'Desired direction' },
    rows: [
      { metric: 'PUE', measures: 'Total facility energy ÷ IT energy [[2]]', direction: 'Closer to 1.0', better: 'down' },
      { metric: 'WUE', measures: 'Water consumed per unit of IT energy [[3]]', direction: 'Lower', better: 'down' },
      { metric: 'CUE', measures: 'Operational carbon emissions per unit of IT energy [[3]]', direction: 'Lower', better: 'down' },
      { metric: 'Embodied carbon', measures: 'Emissions from materials and construction', direction: 'Lower', better: 'down' },
      { metric: 'IT efficiency', measures: 'Useful computing output per kWh', direction: 'Higher', better: 'up' },
      { metric: 'Renewable / clean energy matching', measures: 'How closely electricity use aligns with low-carbon supply', direction: 'Higher', better: 'up' },
    ],
    euLabel:
      "The EU's new data centre rating scheme grades PUE and WUE from A to G: A requires a PUE of 1.15 or lower and a WUE of 0.10 l/kWh or lower, while G covers a PUE above 1.90 or a WUE above 1.00 l/kWh [[5]].",
  },
  gcc: {
    eyebrow: 'GCC priorities',
    heading: 'What to prioritise in the GCC',
    intro:
      'The GCC presents a different engineering challenge from Northern Europe, where cooler weather enables extensive free cooling and district heating creates opportunities for heat recovery. For a new hyperscale facility in Abu Dhabi, Dubai or Saudi Arabia, MENASCO would prioritise the following.',
    rows: [
      { intervention: 'High-temperature liquid cooling', why: 'Can reduce compressor dependence and accommodate dense AI racks' },
      { intervention: 'Dry / hybrid heat rejection', why: 'Addresses water scarcity while balancing electricity demand' },
      { intervention: 'Efficient chillers, pumps and controls', why: 'Important for long periods of high ambient temperatures' },
      { intervention: 'Low-carbon electricity procurement', why: "Directly addresses the facility's operational emissions" },
      { intervention: 'High-efficiency UPS and transformers', why: 'Reduces continuous electrical distribution losses' },
      { intervention: 'Modular MEP construction', why: 'Reduces material waste and improves installation consistency' },
      { intervention: 'Heat recovery', why: 'Worth evaluating where year-round thermal demand exists' },
    ],
  },
  usa: {
    eyebrow: 'USA priorities',
    heading: 'What to prioritise in the US market',
    intro:
      'US data centers used about 4.4% of national electricity in 2023 and could reach 6.7–12% by 2028 [[9]]. Grid capacity, water and clean-energy procurement shape the priorities.',
    rows: [
      {
        intervention: 'Power availability and phased energisation',
        why: 'Connection queues are the binding constraint in many markets: the Texas large-load queue passed 230 GW by January 2026 against an 85 GW peak [[1]]',
      },
      { intervention: 'Liquid cooling for AI density', why: 'Electricity use by AI-focused data centres more than triples by 2030 in the IEA Base Case [[1]]' },
      { intervention: 'Water-efficient heat rejection in arid states', why: 'Dry and closed-loop systems avoid evaporative losses where water is scarce' },
      { intervention: 'Clean-energy procurement and hourly matching', why: 'Aligns consumption with low-carbon supply hour by hour, not just annually' },
      { intervention: 'On-site generation and storage', why: 'Supports resilience and grid flexibility while connections are pending' },
      { intervention: 'High-efficiency electrical distribution', why: 'Cuts continuous losses across UPS, transformers and distribution' },
      { intervention: 'Embodied carbon and LEED', why: 'LEED BD+C: Data Centers rewards material, water and energy performance [[10]]' },
    ],
  },
  europe: {
    eyebrow: 'Europe priorities',
    heading: 'What to prioritise in the European market',
    intro:
      'Europe combines cooler climates and district heating networks with the most developed data centre regulation, so compliance and heat reuse lead the agenda.',
    rows: [
      {
        intervention: 'Efficiency to regulatory thresholds',
        why: 'EU sites of 500 kW+ report annual KPIs [[4]]; Germany requires a PUE of 1.2 or lower for new facilities from July 2026 [[6]], with an amendment pending [[7]]',
      },
      { intervention: 'Waste-heat recovery to district heating', why: "Germany's energy reuse requirement for new sites rises from 10% to 20% between 2026 and 2028 [[6]]" },
      { intervention: 'Free cooling', why: 'Cooler climates allow many economiser hours each year' },
      { intervention: 'Renewable energy matching', why: 'Pact signatories target 75% renewable or hourly carbon-free energy by end-2025 and 100% by 2030 [[8]]' },
      { intervention: 'Water stewardship', why: 'WUE is graded A to G under the EU rating scheme [[5]]' },
      { intervention: 'Low-carbon construction and lifecycle', why: 'Embodied carbon is increasingly assessed alongside operational emissions' },
      { intervention: 'Metering and data quality', why: 'Reporting obligations require sub-metered, auditable data from day one' },
    ],
  },
  priorityColumns: { priority: 'Priority', intervention: 'Intervention', why: 'Why it matters' },
  contractor: {
    eyebrow: 'Where MEP contractors make the biggest difference',
    heading: 'Sustainability that is delivered, not just designed',
    intro:
      'For a contractor such as MENASCO, the opportunity is to integrate sustainability into engineering, procurement, installation, commissioning and operational handover.',
    items: [
      { area: 'Mechanical', body: 'Optimise chilled-water delta-T, reduce pipe pressure losses, implement variable-speed pumping and support liquid-cooling infrastructure.' },
      { area: 'Electrical', body: 'Reduce transformer and UPS losses, optimise cable sizing and distribution architecture, and provide detailed power metering.' },
      { area: 'Controls', body: 'Integrate cooling equipment with BMS and DCIM platforms to support demand-based operation and continuous optimisation.' },
      { area: 'Construction', body: 'Prefabricate mechanical and electrical assemblies, measure installation waste and evaluate lower-carbon materials.' },
      { area: 'Commissioning', body: 'Verify energy performance at partial and full IT loads, not just equipment functionality.' },
    ],
    closing:
      'These are particularly valuable because the contractor can influence actual delivered performance, not just the sustainability claims made during design.',
    mepLink: 'See our MEP technical disciplines',
  },
  cooling: {
    eyebrow: 'Cooling configurations compared',
    heading: 'Chilled water, hybrid or direct-to-chip?',
    intro:
      'A qualitative comparison of three configurations under the same IT load, redundancy requirements, hourly weather data, and electricity and water assumptions.',
    note: 'Qualitative and indicative only. Project decisions require hourly energy and water modelling for the specific site and IT load.',
    configs: [
      { id: 'chw', name: 'Conventional chilled water', sub: 'Air-cooled racks, CRAH units, central chillers' },
      { id: 'hybrid', name: 'Hybrid air / liquid', sub: 'Liquid to dense racks, air for the rest' },
      { id: 'dlc', name: 'Predominantly direct-to-chip', sub: 'Warm-water liquid cooling to most IT' },
    ],
    criteria: [
      { label: 'Cooling energy', levels: [3, 2, 1], words: ['Higher', 'Medium', 'Lower'], better: 'low' },
      { label: 'Water use (with evaporative heat rejection)', levels: [3, 2, 1], words: ['Higher', 'Medium', 'Lower'], better: 'low' },
      { label: 'Rack density supported', levels: [1, 2, 3], words: ['Low to moderate', 'Moderate to high', 'High'], better: 'high' },
      { label: 'Delivery complexity', levels: [1, 2, 3], words: ['Familiar', 'Moderate', 'Higher'], better: 'low' },
      { label: 'Heat-recovery potential', levels: [1, 2, 3], words: ['Low-grade heat', 'Medium', 'Higher-grade heat'], better: 'high' },
    ],
    climateHeading: 'How climate shifts the picture',
    climates: [
      { region: 'GCC', body: 'High ambient temperatures limit free cooling, so warm-water liquid cooling and efficient chillers deliver the largest gains.' },
      { region: 'Southwest USA', body: 'Dry heat favours dry or hybrid heat rejection to protect scarce water supplies.' },
      { region: 'Northern Europe', body: 'Long free-cooling hours and district heating make heat recovery from liquid-cooled systems attractive.' },
    ],
  },
  certifications: {
    eyebrow: 'Green building ratings',
    heading: 'Achieving LEED Gold and Estidama Pearl',
    intro: "Ratings turn sustainability intent into verified performance. MEP systems carry many of the credits behind both.",
    items: [
      {
        id: 'leed',
        name: 'LEED Gold',
        body: "The US Green Building Council's LEED system includes a Data Centers adaptation (LEED BD+C: Data Centers). Gold requires 60 to 79 points [[10]].",
        credits: ['Energy performance and optimised plant efficiency', 'Advanced energy metering', 'Enhanced and monitoring-based commissioning', 'Refrigerant management', 'Indoor and outdoor water use reduction'],
      },
      {
        id: 'estidama',
        name: 'Estidama Pearl',
        body: "Abu Dhabi's Pearl Rating System requires every new building to achieve at least 1 Pearl, and government-funded buildings at least 2 Pearls [[11]].",
        credits: ['Resourceful Energy: efficient systems and metering', 'Precious Water: reduced and reclaimed water use', 'Stewarding Materials: prefabrication and waste reduction', 'Integrated Development Process: commissioning and handover'],
      },
    ],
    contributionHeading: 'How MENASCO contributes',
    contributions: [
      'MEP inputs to energy and water modelling from early design.',
      'Metering and sub-metering design for verification and reporting.',
      'Commissioning records that evidence delivered performance.',
      'Prefabrication and waste tracking that support material credits.',
    ],
  },
  outlook: {
    eyebrow: 'Outlook',
    heading: 'The next frontier: sustainable AI infrastructure',
    intro:
      "The International Energy Agency's 2026 analysis projects data centre electricity consumption roughly doubling from 485 TWh in 2025 to 950 TWh in 2030, around 3% of global electricity demand [[1]].",
    chart: { y2025: '2025', y2030: '2030 (projected)', unit: 'TWh', caption: 'Global data centre electricity consumption, IEA central projection [[1]]' },
    challengesHeading: 'Three challenges, at the same time',
    challenges: ['Greater computing density', 'Tighter electricity supply', 'Reduced environmental impact'],
    developmentsHeading: 'Promising developments',
    developments: ['Warm-water liquid cooling', 'Carbon-aware workload scheduling', 'Long-duration energy storage', 'Integrated power-and-cooling optimisation'],
  },
  faq: {
    eyebrow: 'FAQ',
    heading: 'Data center sustainability questions',
    items: [
      {
        question: 'What is a good PUE for a data center?',
        answer:
          'Power Usage Effectiveness is total facility energy divided by IT energy, defined in ISO/IEC 30134-2; 1.0 is the theoretical ideal. The Climate Neutral Data Centre Pact targets 1.3 in cooler climates and 1.4 in warmer ones for new European facilities, and the EU rating scheme awards an A grade at 1.15 or lower.',
      },
      {
        question: 'What is WUE and why does it matter?',
        answer:
          'Water Usage Effectiveness measures the water a data center consumes per unit of IT energy. It matters most in water-stressed regions such as the GCC and the southwestern USA, where dry, hybrid and closed-loop heat rejection can sharply reduce freshwater use.',
      },
      {
        question: 'How can data centers in the GCC reduce water use?',
        answer:
          'By prioritising dry or hybrid heat rejection, closed-loop systems and reclaimed water over evaporative cooling, and by raising coolant temperatures with liquid cooling so that more heat can be rejected without water. Each option is balanced against its electricity demand in high ambient temperatures.',
      },
      {
        question: 'Is liquid cooling more sustainable than air cooling?',
        answer:
          'For dense AI workloads, direct-to-chip liquid cooling typically lowers cooling energy, supports higher rack densities and produces warmer water that is easier to reject or reuse. The right mix depends on the IT load, climate and site, which is why configurations should be modelled under the same assumptions.',
      },
      {
        question: 'Can data center waste heat be reused in hot climates?',
        answer:
          'It is harder than in Northern Europe because there is little demand for space heating, but it is worth evaluating where year-round thermal demand exists, such as industrial processes, absorption cooling or domestic hot water.',
      },
      {
        question: 'What is embodied carbon in a data center?',
        answer:
          'The emissions from manufacturing, transporting and installing materials and equipment, such as concrete, steel, cabling and plant, before the facility operates. Low-carbon materials, prefabricated MEP modules and efficient quantities reduce it.',
      },
      {
        question: 'Can a data center achieve LEED Gold or Estidama Pearl?',
        answer:
          'Yes. LEED includes a Data Centers adaptation in which Gold requires 60 to 79 points, and in Abu Dhabi every new building must achieve at least 1 Pearl under Estidama, with government-funded buildings at least 2 Pearls. MEP systems drive many of the energy, water and commissioning credits.',
      },
      {
        question: 'How do MEP contractors influence data center sustainability?',
        answer:
          'Through delivered performance: optimised chilled-water delta-T, variable-speed pumping, lower UPS and transformer losses, detailed metering, BMS and DCIM integration, prefabrication, and commissioning that verifies energy performance at partial and full IT loads.',
      },
    ],
  },
  technicalTeaser: { heading: 'Data center technical capability', body: 'Tier III and Tier IV topologies, CRAC vs CRAH, power resilience and local energy markets.', cta: 'Back to technical capability' },
  sources: { heading: 'Sources', intro: 'Facts and figures on this page are drawn from the following publications.' },
};
