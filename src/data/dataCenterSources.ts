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

export const TECHNICAL_SOURCES: SourceEntry[] = [S.uptimeTiers, S.uptimeCert, S.ashrae, S.iea, S.taqa, S.lbnl, S.euReporting, S.enefg];

export const SUSTAINABILITY_SOURCES: SourceEntry[] = [
  S.iea, //            1
  S.isoPue, //         2
  S.greenGrid, //      3
  S.euReporting, //    4
  S.euLabel, //        5
  S.enefg, //          6
  S.enefgAmendment, // 7
  S.cndcp, //          8
  S.lbnl, //           9
  S.leed, //           10
  S.estidama, //       11
  S.ashrae, //         12
];
