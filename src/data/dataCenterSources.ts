import type { SourceEntry } from '../components/services/datacenter/primitives';

/**
 * Reputable sources cited on the Data Center pages, verified 2026-11-20.
 * Copy references them as [[n]], where n is the 1-based position in that
 * page's list (TECHNICAL_SOURCES / SUSTAINABILITY_SOURCES).
 */
const S = {
  uptimeTiers: {
    id: 'uptime-tiers',
    title: "Explaining the Uptime Institute's Tier Classification System",
    publisher: 'Uptime Institute Journal',
    year: '2021',
    url: 'https://journal.uptimeinstitute.com/?p=3737',
  },
  uptimeCert: {
    id: 'uptime-cert',
    title: 'Tier Certification Overview',
    publisher: 'Uptime Institute',
    year: '2026',
    url: 'https://uptimeinstitute.com/tier-certification',
  },
  ashrae: {
    id: 'ashrae',
    title: 'Thermal Guidelines for Data Processing Environments (5th ed.) and TC 9.9 resources',
    publisher: 'ASHRAE',
    year: '2021',
    url: 'https://www.ashrae.org/datacenters',
  },
  iea: {
    id: 'iea-2026',
    title: 'Key Questions on Energy and AI (World Energy Outlook Special Report)',
    publisher: 'International Energy Agency',
    year: '2026',
    url: 'https://iea.blob.core.windows.net/assets/3179f7f8-01f6-4dd6-bffa-c9f7b73f1dc9/KeyQuestionsonEnergyandAI.pdf',
  },
  ieaEnergyAi: {
    id: 'iea-energy-ai',
    title: 'Energy and AI (World Energy Outlook Special Report): press release, 10 April 2025',
    publisher: 'International Energy Agency',
    year: '2025',
    url: 'https://www.iea.org/news/ai-is-set-to-drive-surging-electricity-demand-from-data-centres-while-offering-the-potential-to-transform-how-the-energy-sector-works',
  },
  woodmacUae: {
    id: 'woodmac-uae',
    title: 'UAE data centre power demand to double by 2030 as regulatory gaps constrain clean energy procurement',
    publisher: 'Wood Mackenzie',
    year: '2026',
    url: 'https://www.woodmac.com/press-releases/uae-data-centre-power-demand-to-double-by-2030-as-regulatory-gaps-constrain-clean-energy-procurement/',
  },
  dewaGuidelines: {
    id: 'dewa-guidelines',
    title: 'Power Supply Guidelines for Major Projects',
    publisher: 'Dubai Electricity and Water Authority (DEWA)',
    year: '2025',
    url: 'https://dewa.gov.ae/-/media/Files/Major-Project-Guidelines-July-2025.ashx',
  },
  spglobalKsa: {
    id: 'spglobal-ksa',
    title: 'Data Center Frontiers: Saudi Arabia data center market',
    publisher: 'S&P Global',
    year: '2026',
    url: 'https://www.spglobal.com/en/research-insights/special-reports/look-forward/data-center-frontiers/saudi-arabia-data-center-market',
  },
  cstDataCenter: {
    id: 'cst-data-center',
    title: 'Data Center Services Regulation',
    publisher: 'Communications, Space and Technology Commission (CST), Saudi Arabia',
    year: '2026',
    url: 'https://www.cst.gov.sa/en/knowledge-center/digital-knowledge/data-center',
  },
  ebrdEgypt: {
    id: 'ebrd-egypt',
    title: 'Egypt Data Centre Investment Framework',
    publisher: 'European Bank for Reconstruction and Development (EBRD)',
    year: '2026',
    url: 'https://www.ebrd.com/home/work-with-us/projects/tcpsd/data-centre-investment-framework.html',
  },
  mcitEgypt: {
    id: 'mcit-egypt',
    title: 'Data Center Development Strategy (press release)',
    publisher: 'Ministry of Communications and Information Technology (MCIT), Egypt',
    year: '2026',
    url: 'https://mcit.gov.eg/en/Media_Center/Press_Room/Press_Releases/112250',
  },
  ecDataCentres: {
    id: 'ec-data-centres-2026',
    title: 'Communication on data centre energy policy, COM(2026) 501',
    publisher: 'European Commission (EUR-Lex)',
    year: '2026',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A52026DC0501',
  },
  eibInvestment: {
    id: 'eib-investment-2025',
    title: 'Investment Report 2025/2026, Chapter 6',
    publisher: 'European Investment Bank',
    year: '2026',
    url: 'https://www.eib.org/files/publications/20250379-030326-investment-report-2025-chapter6-en.pdf',
  },
  reutersEquipment: {
    id: 'reuters-equipment-2026',
    title: 'US power companies scramble to secure equipment as surging data center demand strains supply',
    publisher: 'Reuters',
    year: '2026',
    url: 'https://www.reuters.com/business/energy/us-power-companies-scramble-secure-equipment-surging-data-center-demand-strains-2026-07-09/',
  },
  usQueues: {
    id: 'us-queues-2026',
    title: 'US Interconnection Queues Analysis 2026',
    publisher: 'Florida Municipal Electric Association (FMEA)',
    year: '2026',
    url: 'https://assets.noviams.com/novi-file-uploads/fmea/pdf/HLN/20260914_US_Interconnection_Queues_Analysis_2026__2_-compressed.pdf',
  },
  taqa: {
    id: 'taqa',
    title: "Abu Dhabi's data centre industry power investments to exceed AED37 bn: TAQA CEO",
    publisher: 'WAM (Emirates News Agency)',
    year: '2026',
    url: 'https://www.wam.ae/en/article/bjx2tuq-abu-dhabis-data-centre-industry-power-investments',
  },
  lbnl: {
    id: 'lbnl-2024',
    title: '2024 United States Data Center Energy Usage Report',
    publisher: 'Lawrence Berkeley National Laboratory / US Department of Energy',
    year: '2024',
    url: 'https://eta-publications.lbl.gov/publications/2024-lbnl-data-center-energy-usage-report',
  },
  euReporting: {
    id: 'eu-2024-1364',
    title: 'Commission Delegated Regulation (EU) 2024/1364 on the first phase of a common rating scheme for data centres',
    publisher: 'EUR-Lex, European Union',
    year: '2024',
    url: 'https://eur-lex.europa.eu/eli/reg_del/2024/1364',
  },
  euLabel: {
    id: 'eu-label',
    title: 'EU Commission adopts data centre sustainability rating scheme',
    publisher: 'Linklaters Sustainable Futures',
    year: '2026',
    url: 'https://sustainablefutures.linklaters.com/post/102o5fr/eu-commission-adopts-data-centre-sustainability-rating-scheme',
  },
  enefg: {
    id: 'enefg',
    title: 'Data center requirements under the new German Energy Efficiency Act',
    publisher: 'White & Case',
    year: '2023',
    url: 'https://www.whitecase.com/insight-alert/data-center-requirements-under-new-german-energy-efficiency-act',
  },
  enefgAmendment: {
    id: 'enefg-2026',
    title: 'EnEfG amendment 2026: overview',
    publisher: 'Taylor Wessing',
    year: '2026',
    url: 'https://www.taylorwessing.com/en/insights-and-events/insights/2026/04/enefg-novelle-ueberblick',
  },
  cndcp: {
    id: 'cndcp',
    title: 'Climate Neutral Data Centre Pact: Self-Regulatory Initiative',
    publisher: 'Climate Neutral Data Centre Pact',
    year: '2025',
    url: 'https://www.climateneutraldatacentre.net/',
  },
  isoPue: {
    id: 'iso-30134-2',
    title: 'ISO/IEC 30134-2: Data centres key performance indicators, Power usage effectiveness (PUE)',
    publisher: 'ISO / IEC',
    year: '2026',
    url: 'https://www.iso.org/standard/85172.html',
  },
  greenGrid: {
    id: 'green-grid',
    title: 'PUE, WUE and CUE metrics',
    publisher: 'The Green Grid',
    year: '2010–2012',
    url: 'https://www.thegreengrid.org/',
  },
  doeDuckCurve: {
    id: 'doe-duck-curve',
    title: 'Confronting the Duck Curve: How to Address Over-Generation of Solar Energy',
    publisher: 'U.S. Department of Energy',
    year: '2017',
    url: 'https://www.energy.gov/cmei/solar/articles/confronting-duck-curve-how-address-over-generation-solar-energy',
  },
  leed: {
    id: 'leed',
    title: 'LEED rating system (including LEED BD+C: Data Centers)',
    publisher: 'US Green Building Council',
    year: '2026',
    url: 'https://www.usgbc.org/leed',
  },
  estidama: {
    id: 'estidama',
    title: 'The Pearl Rating System for Estidama',
    publisher: 'Department of Municipalities and Transport, Abu Dhabi',
    year: '2026',
    url: 'https://pages.dmt.gov.ae/en/Urban-Planning/The-Pearl-Rating-System-for-Estidama',
  },
} satisfies Record<string, SourceEntry>;

/** Ordered by first appearance on the technical page, so citations read [1], [2], [3]… top to bottom. */
export const TECHNICAL_SOURCES: SourceEntry[] = [
  S.ieaEnergyAi, //       1  energy intro
  S.woodmacUae, //        2  UAE
  S.dewaGuidelines, //    3  UAE
  S.spglobalKsa, //       4  Saudi Arabia
  S.cstDataCenter, //     5  Saudi Arabia
  S.ebrdEgypt, //         6  Egypt
  S.mcitEgypt, //         7  Egypt
  S.ecDataCentres, //     8  Europe
  S.eibInvestment, //     9  Europe
  S.reutersEquipment, // 10  United States
  S.usQueues, //         11  United States
  S.uptimeTiers, //      12  Tiers
  S.uptimeCert, //       13  Tiers
  S.ashrae, //           14  Cooling
];

// Numbered in the order each source is first cited on the page (top to bottom); only cited sources.
export const SUSTAINABILITY_SOURCES: SourceEntry[] = [
  S.doeDuckCurve, // 1  Seven opportunities (duck curve)
  S.euLabel, //      2  Metrics
  S.isoPue, //       3  Metrics
  S.greenGrid, //    4  Metrics
  S.leed, //         5  LEED and Estidama
  S.estidama, //     6  LEED and Estidama
  S.iea, //          7  Outlook
];
