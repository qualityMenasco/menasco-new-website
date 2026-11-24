/**
 * Copy for the Data Center sustainability page
 * (/services/data-centers/sustainability). ENGLISH ONLY for now: the Arabic
 * translation is deferred. [[n]] = citation n in SUSTAINABILITY_SOURCES
 * (src/data/dataCenterSources.ts).
 */

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
    readMore: 'Read more',
    readLess: 'Show less',
    items: [
      {
        title: "Advanced Cooling & Water Efficiency",
        lead: "Cooling efficiency starts with removing heat at the source.",
        body: [
          "Direct-to-chip liquid cooling, warm-water loops, optimized chilled-water plants, and air-side or water-side economizers can reduce the energy required to remove heat from high-density IT equipment. Cooling technologies should be selected according to rack density, ambient conditions, supply temperatures, and heat rejection requirements.",
          "Dry coolers, hybrid systems, reclaimed water, and closed-loop circulation can reduce potable water consumption. The optimal configuration must balance electricity use, water demand, capital expenditure, and annual operating costs rather than minimizing PUE alone.",
        ],
        impact: ["Lower cooling electricity consumption and PUE", "Reduced potable water demand and WUE", "Lower operating costs per MW of IT capacity"],
      },
      {
        title: "Low-Carbon Electricity Procurement",
        lead: "The carbon intensity of purchased electricity matters as much as the amount consumed.",
        body: [
          "Data centers can reduce operational emissions by sourcing electricity from solar, wind, nuclear, geothermal, and other low-carbon generation through utility contracts, power purchase agreements, or on-site generation. Procurement strategies should consider hourly carbon intensity, generation availability, transmission constraints, and the actual deliverability of contracted power.",
          "Annual renewable-energy matching does not guarantee carbon-free electricity during every operating hour. Hourly energy matching, supported by storage and flexible demand, provides a more accurate basis for evaluating emissions reductions, although it may involve higher procurement costs.",
        ],
        impact: ["Reduced electricity-related carbon emissions", "Improved exposure management to future energy and carbon costs", "Greater transparency through hourly carbon accounting"],
      },
      {
        title: "Waste Heat Recovery",
        lead: "Nearly all electricity consumed by IT equipment eventually becomes heat that must be removed.",
        body: [
          "Instead of rejecting this thermal energy directly to the atmosphere, data centers can recover it through liquid cooling circuits, heat exchangers, and heat pumps. Recovered heat can supply district heating networks, industrial processes, domestic hot water, or nearby facilities with suitable thermal demand.",
          "Financial viability depends on heat temperature, the proximity of consumers, seasonal demand, and the electricity required to upgrade or transport the heat. Higher-temperature liquid cooling can improve recovery economics by reducing the temperature lift required.",
        ],
        impact: ["Reduced waste heat rejection", "Lower heating energy consumption for connected facilities", "Potential revenue from exported thermal energy"],
      },
      {
        title: "Low-Carbon Construction & Prefabrication",
        lead: "The carbon footprint of a data center begins before the first server is installed.",
        body: [
          "Low-clinker concrete, recycled-content steel, optimized structural designs, and lifecycle-based equipment procurement can reduce embodied emissions during construction. Environmental product declarations and whole-life carbon assessments should inform material selection rather than relying exclusively on recycled-content claims.",
          "Off-site fabrication of MEP modules, pipework assemblies, and modular white spaces can reduce material waste, installation rework, and site labor requirements. The financial and environmental benefits should be assessed against factory energy use, transportation distances, lifting requirements, and module utilization.",
        ],
        impact: ["Lower embodied carbon per MW of installed capacity", "Reduced construction waste and rework", "Potential reductions in site labor and construction duration"],
      },
      {
        title: "Intelligent Operations & Computing Efficiency",
        lead: "The most efficient megawatt is the one that does not need to be consumed.",
        body: [
          "DCIM platforms, building management systems, predictive controls, and continuous equipment monitoring can identify inefficient cooling operation, excessive redundancy losses, and unnecessary equipment runtime. Server consolidation, power management, and improved workload utilization reduce electricity demand at the IT level rather than only improving facility overhead.",
          "Flexible workloads, including selected AI training and batch-processing tasks, can be scheduled around electricity prices, available computing capacity, and grid carbon intensity. These changes must respect service-level commitments, thermal limits, and the operational requirements of critical applications.",
        ],
        impact: ["Lower kWh consumed per unit of useful computing work", "Reduced cooling and auxiliary equipment consumption", "Lower electricity costs through improved utilization and scheduling"],
      },
      {
        title: "Recovering Surplus Grid Electricity",
        lead: "Electricity that would otherwise be curtailed is an underused resource.",
        body: [
          "The electricity grid's duck curve [[1]] describes how high solar generation reduces net grid demand around midday, followed by a steep increase in demand for dispatchable generation as solar output declines. In renewable-heavy grids, this can create periods of excess generation, low or negative wholesale prices, and renewable curtailment. These conditions are location and time-dependent; they do not mean that electricity is surplus for most of the day.",
          "Data centers can absorb otherwise curtailed electricity by scheduling flexible computing workloads, charging battery energy storage systems, or operating thermal storage and pre-cooling systems during verified surplus periods. Where tariffs and grid arrangements permit, this can reduce energy procurement costs while increasing renewable-energy utilization without compromising critical computing workloads.",
        ],
        impact: ["Increased use of otherwise curtailed renewable electricity", "Reduced electricity costs during low-price periods", "Lower peak grid demand through storage and workload shifting"],
      },
      {
        title: "Autonomous Vehicles as Distributed Energy Storage",
        lead: "Autonomous electric vehicles could become mobile batteries serving both transportation and electricity infrastructure.",
        body: [
          "Electric vehicles equipped with bidirectional charging can store electricity during periods of low demand or renewable surplus and discharge it through vehicle-to-grid (V2G) or vehicle-to-building (V2B) infrastructure. Autonomous fleets could extend this model by transporting stored energy between distribution areas, charging where electricity is abundant and discharging near data centers experiencing localized grid constraints.",
          "For data centers, participating vehicles could provide supplementary peak-shaving capacity or short-duration energy support through approved bidirectional charging infrastructure. Viability depends on available fleet capacity, charging power, transport energy losses, battery degradation, electricity price differences, grid permissions, and coordination with facility microgrids. This remains an emerging application, it doesn't replace dedicated UPS systems or guaranteed backup generation.",
        ],
        impact: ["Additional short-duration energy capacity at constrained sites", "Potential revenue from grid services and energy arbitrage", "Better utilization of fleet batteries when vehicles are not providing transport services"],
      },
    ],
  },
  metrics: {
    eyebrow: 'Measuring what matters',
    heading: 'Beyond electricity: the metrics that define sustainability',
    intro: 'A sustainable data center cannot be evaluated using electricity consumption alone.',
    columns: { metric: 'Metric', measures: 'What it measures', direction: 'Desired direction' },
    rows: [
      { metric: 'PUE', measures: 'Total facility energy ÷ IT energy [[3]]', direction: 'Closer to 1.0', better: 'down' },
      { metric: 'WUE', measures: 'Water consumed per unit of IT energy [[4]]', direction: 'Lower', better: 'down' },
      { metric: 'CUE', measures: 'Operational carbon emissions per unit of IT energy [[4]]', direction: 'Lower', better: 'down' },
      { metric: 'Embodied carbon', measures: 'Emissions from materials and construction', direction: 'Lower', better: 'down' },
      { metric: 'IT efficiency', measures: 'Useful computing output per kWh', direction: 'Higher', better: 'up' },
      { metric: 'Renewable / clean energy matching', measures: 'How closely electricity use aligns with low-carbon supply', direction: 'Higher', better: 'up' },
    ],
    euLabel:
      "The EU's new data centre rating scheme grades PUE and WUE from A to G: A requires a PUE of 1.15 or lower and a WUE of 0.10 l/kWh or lower, while G covers a PUE above 1.90 or a WUE above 1.00 l/kWh [[2]].",
  },
  regional: {
    // Label for the section switcher (the RegionalPriorities component shows the same eyebrow).
    eyebrow: 'Regional priorities',
    intro:
      "Data center sustainability strategies must respond to regional climate, resource availability, and energy infrastructure. For MENASCO's hyperscale developments, different regional conditions demand a different set of engineering priorities.",
  },
  gcc: {
    eyebrow: 'GCC priorities',
    heading: 'What to prioritise in the GCC',
    rows: [
      { intervention: "High-Temperature Liquid Cooling", why: "Reduce compressor demand by using warm-water direct-to-chip cooling suited to high-density AI workloads." },
      { intervention: "Water-Efficient Heat Rejection", why: "Minimize freshwater consumption through dry cooling, hybrid systems, and reclaimed water in water-scarce markets." },
      { intervention: "High-Ambient Cooling Efficiency", why: "Optimize chillers, pumps, and controls for prolonged summer temperatures exceeding 40°C." },
      { intervention: "Low-Carbon Power Procurement", why: "Leverage regional solar generation and low-carbon electricity agreements to reduce operational emissions." },
      { intervention: "Low-Loss Electrical Distribution", why: "Reduce continuous electrical losses through efficient transformers, UPS systems, and optimized power distribution." },
      { intervention: "Modular MEP Construction", why: "Reduce material waste, site labor, and rework through controlled off-site fabrication and assembly." },
      { intervention: "Targeted Waste Heat Recovery", why: "Reuse rejected heat for industrial processes or domestic hot water where suitable thermal demand exists." },
    ],
  },
  usa: {
    eyebrow: 'USA priorities',
    heading: 'What to prioritise in the US market',
    rows: [
      { intervention: "Phased Grid Energization", why: "Align electrical infrastructure and construction phases with constrained utility interconnection schedules." },
      { intervention: "Liquid Cooling for AI Density", why: "Support increasingly dense AI racks while reducing energy-intensive air circulation and mechanical cooling." },
      { intervention: "Water-Efficient Cooling in Arid States", why: "Prioritize dry, hybrid, and reclaimed-water systems in water-stressed markets such as Arizona and Nevada." },
      { intervention: "Hourly Clean-Energy Matching", why: "Match electricity consumption with regional low-carbon generation to reduce actual grid-related emissions." },
      { intervention: "On-Site Generation & Battery Storage", why: "Use storage and appropriately selected generation to manage peak loads and supplement constrained grid capacity." },
      { intervention: "High-Efficiency Electrical Distribution", why: "Minimize transformer, UPS, and conversion losses across large-scale hyperscale campuses." },
      { intervention: "Low-Carbon Materials & LEED Compliance", why: "Reduce embodied emissions through verified low-carbon materials, modular construction, and lifecycle assessments." },
    ],
  },
  europe: {
    eyebrow: 'Europe priorities',
    heading: 'What to prioritise in the European market',
    rows: [
      { intervention: "Regulatory PUE Compliance", why: "Design cooling and power systems around applicable national efficiency thresholds and EU reporting obligations." },
      { intervention: "District Heating Integration", why: "Recover server waste heat for nearby district heating networks, supporting applicable national heat-reuse requirements." },
      { intervention: "Ambient Free Cooling", why: "Exploit cooler Northern European temperatures to reduce compressor operation through air-side and water-side economizers." },
      { intervention: "Renewable Electricity Matching", why: "Align consumption with hourly carbon-free electricity supply and operator renewable-energy commitments." },
      { intervention: "Water-Efficient Cooling", why: "Reduce freshwater withdrawal through closed-loop cooling, dry heat rejection, and reclaimed water." },
      { intervention: "Whole-Life Carbon Reduction", why: "Lower construction emissions using low-carbon concrete, recycled steel, and lifecycle-based procurement." },
      { intervention: "Auditable Energy & Water Metering", why: "Integrate sub-metering from the outset to support EU reporting of PUE, WUE, energy consumption, and recovered heat." },
    ],
  },
  priorityColumns: { priority: 'Priority', intervention: 'Intervention', why: 'Why it matters' },
  contractor: {
    eyebrow: 'Sustainability Through Technical Design',
    heading: 'Sustainability that is delivered, not just designed',
    intro:
      'For MENASCO, sustainability is about helping clients meaningfully reduce energy consumption, water use, and carbon emissions - delivering lasting environmental benefits while preserving the reliability, performance, and operational standards their facilities demand',
    mepLink: 'See our MEP technical disciplines',
  },
  cooling: {
    eyebrow: 'Cooling configurations compared',
    heading: 'Chilled water, hybrid or direct-to-chip?',
    configs: [
      { id: 'chw', name: 'Conventional chilled water', sub: 'Air-cooled racks, CRAH units, central chillers' },
      { id: 'hybrid', name: 'Hybrid air / liquid', sub: 'Liquid to dense racks, air for the rest' },
      { id: 'dlc', name: 'Predominantly direct-to-chip', sub: 'Warm-water liquid cooling to most IT' },
    ],
    criteria: [
      { label: 'Cooling energy', levels: [3, 2, 1], words: ['Higher', 'Medium', 'Lower'], better: 'low', plain: ['dlc'] }, // plain = shown grey (no blue highlight) for these configurations
      { label: 'Water use (with evaporative heat rejection)', levels: [3, 2, 1], words: ['Higher', 'Medium', 'Lower'], better: 'low' },
      { label: 'Rack density supported', levels: [1, 2, 3], words: ['Low to moderate', 'Moderate to high', 'High'], better: 'high' },
      {
        label: 'Delivery complexity',
        levels: [1, 1, 1],
        words: ['Familiar', 'Familiar', 'Familiar'],
        better: 'low',
        // Info bubble; {type} is the configuration's short name.
        info: "MENASCO's skilled engineers have vast experience delivering {type} systems.",
      },
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
        body: "The US Green Building Council's LEED system includes a Data Centers adaptation (LEED BD+C: Data Centers). Gold requires 60 to 79 points [[5]].",
        credits: ['Energy performance and optimised plant efficiency', 'Advanced energy metering', 'Enhanced and monitoring-based commissioning', 'Refrigerant management', 'Indoor and outdoor water use reduction'],
      },
      {
        id: 'estidama',
        name: 'Estidama Pearl',
        body: "Abu Dhabi's Pearl Rating System requires every new building to achieve at least 1 Pearl, and government-funded buildings at least 2 Pearls [[6]].",
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
      "The International Energy Agency's 2026 analysis projects data centre electricity consumption roughly doubling from 485 TWh in 2025 to 950 TWh in 2030, around 3% of global electricity demand [[7]].",
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
        question: "What PUE does MENASCO design data centers to achieve?",
        answer:
          "As low as the site allows. MENASCO designs to each project's PUE target, defined in ISO/IEC 30134-2 as total facility energy divided by IT energy, where 1.0 is the theoretical ideal. Benchmarks guide that target: new European facilities under the Climate Neutral Data Centre Pact aim for 1.3 in cooler climates and 1.4 in warmer ones, and the EU rating scheme awards an A grade at 1.15 or lower.",
      },
      {
        question: "How does MENASCO reduce water use in data centers?",
        answer:
          "By designing cooling around water, not just energy. MENASCO prioritises dry and hybrid heat rejection, closed-loop circulation and reclaimed water over evaporative cooling, and uses warm-water liquid cooling so more heat can be rejected without water. Each option is balanced against its electricity demand, which matters most in hot, water-stressed regions such as the GCC and the southwestern USA.",
      },
      {
        question: "Can MENASCO cut water use in GCC data centers despite the heat?",
        answer:
          "Yes. High ambient temperatures limit free cooling, so MENASCO combines efficient chillers, pumps and controls with dry or hybrid heat rejection and higher coolant temperatures. The result lowers freshwater consumption while keeping cooling reliable through long summers above 40°C.",
      },
      {
        question: "Does MENASCO deliver direct-to-chip liquid cooling?",
        answer:
          "Yes. MENASCO delivers direct-to-chip, hybrid, and conventional chilled-water systems. For dense AI workloads, direct-to-chip cooling typically lowers cooling energy, supports higher rack densities and produces warmer water that is easier to reject or reuse; the right mix depends on the IT load, climate and site.",
      },
      {
        question: "Can MENASCO recover waste heat from data centers in hot climates?",
        answer:
          "Where there is demand for it. Space heating is rarely needed in the GCC, so MENASCO evaluates heat recovery against year-round thermal users such as industrial processes, absorption cooling and domestic hot water, and designs it in where the economics work.",
      },
      {
        question: "How does MENASCO reduce a data center's embodied carbon?",
        answer:
          "From the materials up. MENASCO reduces the emissions locked into concrete, steel, cabling and plant through low-carbon materials, efficient quantities, lifecycle-based procurement and prefabricated MEP modules that cut waste and site rework.",
      },
      {
        question: "Can MENASCO deliver data centers to LEED Gold or Estidama Pearl?",
        answer:
          "Yes. MEP systems drive many of the energy, water and commissioning credits behind both ratings. LEED includes a Data Centers adaptation in which Gold requires 60 to 79 points, and in Abu Dhabi every new building must achieve at least 1 Pearl under Estidama, with government-funded buildings at least 2 Pearls.",
      },
      {
        question: "How does MENASCO make a data center more sustainable in practice?",
        answer:
          "Through delivered performance, not design intent alone. MENASCO optimises chilled-water delta-T and variable-speed pumping, reduces UPS and transformer losses, installs detailed metering, integrates BMS and DCIM, prefabricates MEP assemblies and commissions energy performance at partial and full IT loads.",
      },
    ],
  },
  technicalTeaser: { heading: 'Data center technical capability', body: 'Tier III and Tier IV topologies, CRAC vs CRAH, power resilience and local energy markets.', cta: 'Back to technical capability' },
  sources: { heading: 'Sources', intro: 'Facts and figures on this page are drawn from the following publications.' },
};
