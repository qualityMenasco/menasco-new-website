import {
  Boxes,
  Cpu,
  Droplets,
  Facebook,
  Factory,
  Instagram,
  Leaf,
  Linkedin,
  MapPin,
  ShieldAlert,
  Youtube,
  Zap,
} from 'lucide-react';
import type { NavItem } from '../components/navigation/types';
import type { AccordionItemData } from '../components/ui/Accordion';
import type { TabData } from '../components/ui/Tabs';
import type { StatItemData } from '../components/content/Statistic';
import type { TimelineItemData } from '../components/content/Timeline';
import type { ProcessStepData } from '../components/content/ProcessSteps';
import type { ListItemData, KeyValueItem } from '../components/content/ProfessionalList';
import type { SocialLink } from '../components/navigation/SocialLinks';
import { placeholderImages } from './images';

export const images = placeholderImages;

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export const services = [
  {
    icon: Cpu,
    title: 'Mechanical Engineering',
    description: 'HVAC, chilled water, and building systems engineered for UAE climate loads and long-term operability.',
    link: { label: 'Explore mechanical', href: '#' },
  },
  {
    icon: Zap,
    title: 'Electrical Engineering',
    description: 'Power distribution, low-current systems, and lighting design built to code and future load growth.',
    link: { label: 'Explore electrical', href: '#' },
  },
  {
    icon: Droplets,
    title: 'Plumbing Systems',
    description: 'Water supply, drainage, and greywater recovery systems designed for efficiency and compliance.',
    link: { label: 'Explore plumbing', href: '#' },
  },
  {
    icon: ShieldAlert,
    title: 'Fire & Life Safety',
    description: 'Detection, suppression, and life-safety systems certified to NFPA and Dubai Civil Defence codes.',
    link: { label: 'Explore fire safety', href: '#' },
  },
  {
    icon: Boxes,
    title: 'BIM & Digital Engineering',
    description: 'Coordinated LOD 400 models and clash detection that remove rework before it reaches site.',
    link: { label: 'Explore digital engineering', href: '#' },
    featured: true,
  },
  {
    icon: Factory,
    title: 'Manufacturing & Prefabrication',
    description: 'Off-site ductwork, piping skids, and modular assemblies fabricated to tolerance in our UAE facility.',
    link: { label: 'Explore manufacturing', href: '#' },
  },
];

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const projects = [
  {
    image: images.towerFacade,
    name: 'Dubai South Logistics Hub',
    location: 'Dubai South, UAE',
    sector: 'Industrial',
    scope: 'Full MEP design and installation across a 1.2M sq ft distribution and logistics facility.',
    status: 'Completed 2023',
    metric: { value: '1.2M', label: 'sq ft delivered' },
    link: { label: 'View project', href: '#' },
  },
  {
    image: images.dubaiSkylineDay,
    name: 'Abu Dhabi Corniche Tower',
    location: 'Abu Dhabi, UAE',
    sector: 'Commercial',
    scope: 'Fire and life safety retrofit across 42 occupied floors, phased for zero downtime.',
    status: 'Completed 2022',
    metric: { value: '42', label: 'floors retrofitted' },
    link: { label: 'View project', href: '#' },
  },
  {
    image: images.factoryFloor,
    name: 'Expo City Innovation Pavilion',
    location: 'Dubai, UAE',
    sector: 'Institutional',
    scope: 'Mechanical and electrical installation for a landmark exhibition and innovation venue.',
    status: 'Completed 2021',
    metric: { value: '18', label: 'months on programme' },
    link: { label: 'View project', href: '#' },
  },
  {
    image: images.constructionSite,
    name: 'Sharjah Waterfront Residences',
    location: 'Sharjah, UAE',
    sector: 'Residential',
    scope: 'Electrical infrastructure and low-current systems across a six-tower residential masterplan.',
    status: 'Ongoing',
    metric: { value: '2,400', label: 'residential units' },
    link: { label: 'View project', href: '#' },
  },
  {
    image: images.siteTeam,
    name: 'Al Ain Regional Hospital Expansion',
    location: 'Al Ain, UAE',
    sector: 'Healthcare',
    scope: 'Plumbing, medical gas, and fire suppression systems for a critical-care expansion wing.',
    status: 'Completed 2023',
    metric: { value: '210', label: 'new beds supported' },
    link: { label: 'View project', href: '#' },
  },
  {
    image: images.fabrication,
    name: 'Ras Al Khaimah Manufacturing Campus',
    location: 'Ras Al Khaimah, UAE',
    sector: 'Industrial',
    scope: 'Design-build of process piping and ventilation for a precision manufacturing campus.',
    status: 'Completed 2022',
    metric: { value: '340', label: 'tonnes fabricated' },
    link: { label: 'View project', href: '#' },
  },
];

export const featuredProject = projects[0];

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

export const companyStats: StatItemData[] = [
  { value: '35+', label: 'Years in the UAE', description: 'Engineering and delivering since 1988.' },
  { value: '1,200+', label: 'Projects Delivered', description: 'Across seven emirates and the wider GCC.', animate: true },
  { value: '4,500', label: 'Engineers & Technicians', description: 'Employed directly across our operations.', animate: true },
  { value: '98%', label: 'Client Retention', description: 'Repeat and referred engagements.' },
];

export const singleStat: StatItemData[] = [{ value: '1,200+', label: 'Projects Delivered', description: 'Across the UAE and wider GCC since 1988.', animate: true }];

// ---------------------------------------------------------------------------
// Timeline — company milestones
// ---------------------------------------------------------------------------

export const companyMilestones: TimelineItemData[] = [
  { date: '1988', title: 'MENASCO founded in Dubai', description: 'Established as a specialist mechanical contracting firm serving the UAE.' },
  { date: '1996', title: 'First design-build EPC contract', description: 'Expanded into full engineering, procurement, and construction delivery.' },
  { date: '2005', title: 'ISO 9001 certification achieved', description: 'Formalised quality management across all project delivery teams.' },
  { date: '2012', title: 'Manufacturing facility opened', description: 'Brought ductwork and piping fabrication in-house for tighter tolerances.' },
  { date: '2018', title: 'BIM-first delivery adopted', description: 'Moved all major projects to coordinated LOD 400 digital models.' },
  { date: '2023', title: 'Sustainability roadmap launched', description: 'Committed to measurable emissions and waste-reduction targets by 2030.' },
];

// ---------------------------------------------------------------------------
// Process steps
// ---------------------------------------------------------------------------

export const deliveryProcess: ProcessStepData[] = [
  { title: 'Design', description: 'Engineering concepts developed against code, load, and client brief.' },
  { title: 'Coordination', description: 'BIM clash detection resolves conflicts before site mobilisation.' },
  { title: 'Procurement', description: 'Materials and equipment sourced against a qualified vendor base.' },
  { title: 'Manufacturing', description: 'Ductwork and piping prefabricated off-site to tolerance.' },
  { title: 'Installation', description: 'Site teams execute against a sequenced, trade-coordinated programme.' },
  { title: 'Testing', description: 'Systems pressure-tested and validated against design intent.' },
  { title: 'Commissioning', description: 'Full systems commissioning with performance verification.' },
  { title: 'Handover', description: 'As-built documentation and O&M training delivered to the client.' },
];

// ---------------------------------------------------------------------------
// Accordion — FAQ
// ---------------------------------------------------------------------------

export const faqItems: AccordionItemData[] = [
  {
    id: 'services',
    title: 'What MEP services does MENASCO provide?',
    content: 'We deliver mechanical, electrical, plumbing, fire and life safety, BIM coordination, and in-house manufacturing, as standalone packages or a single design-build contract.',
  },
  {
    id: 'design-build',
    title: 'Do you take on design-build contracts?',
    content: 'Yes. Our engineering, procurement, and construction teams work under one contract, which keeps design intent, cost, and programme aligned through handover.',
  },
  {
    id: 'sectors',
    title: 'Which sectors do you work across?',
    content: 'Commercial, residential, healthcare, industrial, and institutional projects across all seven emirates, with active work in the wider GCC.',
  },
  {
    id: 'quality',
    title: 'How is quality and compliance assured?',
    content: 'Every project runs under ISO 9001 quality management, with third-party testing and Civil Defence certification built into the delivery programme.',
  },
  {
    id: 'sustainability',
    title: 'What sustainability practices are in place?',
    content: 'We design for measured energy performance, specify low-GWP refrigerants where viable, and track site waste diversion against our 2030 roadmap.',
  },
];

// ---------------------------------------------------------------------------
// Tabs — capability overview
// ---------------------------------------------------------------------------

export const capabilityTabLabels = ['Mechanical', 'Electrical', 'Plumbing', 'Fire & Life Safety'] as const;

export const capabilitySummaries: Record<(typeof capabilityTabLabels)[number], string> = {
  Mechanical: 'Chilled water plants, VRF systems, and air handling engineered for UAE ambient and occupancy loads.',
  Electrical: 'Medium and low voltage distribution, standby power, and lighting design coordinated end to end.',
  Plumbing: 'Domestic water, drainage, and greywater recovery systems sized for long-term efficiency.',
  'Fire & Life Safety': 'Detection, suppression, and evacuation systems certified to NFPA and local Civil Defence codes.',
};

// ---------------------------------------------------------------------------
// Feature blocks
// ---------------------------------------------------------------------------

export const featureBlocks = [
  {
    icon: Boxes,
    eyebrow: 'Digital Engineering',
    heading: 'Coordinated models before a single pipe is cut',
    description: 'Every discipline is federated into one LOD 400 model, so clashes are resolved on screen, not on site.',
    list: [
      { title: 'Federated BIM coordination', description: 'Mechanical, electrical, and structural models merged weekly.' },
      { title: 'Clash detection reporting', description: 'Issues tracked to resolution before fabrication release.' },
      { title: '4D programme simulation', description: 'Sequencing validated against the construction schedule.' },
    ] as ListItemData[],
    cta: { label: 'See our digital process', href: '#' },
  },
  {
    icon: Factory,
    eyebrow: 'Manufacturing',
    heading: 'Off-site fabrication, on-site precision',
    description: 'Our UAE manufacturing facility prefabricates ductwork, piping skids, and modular racks to tight tolerance.',
    list: [
      { title: 'In-house ductwork fabrication', description: 'CNC-cut and sealed to SMACNA standard.' },
      { title: 'Modular piping skids', description: 'Pressure-tested off-site before delivery.' },
      { title: 'Reduced site congestion', description: 'Less on-site labour, fewer safety exposures.' },
    ] as ListItemData[],
    cta: { label: 'Tour the facility', href: '#' },
  },
  {
    icon: Leaf,
    eyebrow: 'Sustainability',
    heading: 'Engineering toward measurable efficiency',
    description: 'From refrigerant selection to waste diversion, sustainability is tracked as a delivery metric, not an afterthought.',
    list: [
      { title: 'Low-GWP refrigerant specification', description: 'Applied wherever system design allows.' },
      { title: 'Site waste diversion tracking', description: 'Reported against our 2030 roadmap.' },
      { title: 'Energy performance modelling', description: 'Validated at design and post-occupancy stages.' },
    ] as ListItemData[],
    cta: { label: 'Read our roadmap', href: '#' },
  },
  {
    icon: MapPin,
    eyebrow: 'Regional Capabilities',
    heading: 'Delivery teams across every emirate',
    description: 'Site and engineering teams based in Dubai, Abu Dhabi, and Ras Al Khaimah keep mobilisation fast.',
    list: [
      { title: 'Dubai headquarters', description: 'Engineering, procurement, and project controls.' },
      { title: 'Abu Dhabi branch', description: 'Dedicated site management for the capital region.' },
      { title: 'Ras Al Khaimah facility', description: 'Manufacturing and northern emirates coverage.' },
    ] as ListItemData[],
    cta: { label: 'View our locations', href: '#' },
  },
  {
    icon: ShieldAlert,
    eyebrow: 'Safety',
    heading: 'A site safety record built over 35 years',
    description: 'Every project runs under a documented HSE plan, audited against ISO 45001 across all active sites.',
    list: [
      { title: 'ISO 45001 certified', description: 'Occupational health and safety management system.' },
      { title: 'Daily toolbox briefings', description: 'Mandatory across every active site.' },
      { title: 'Independent HSE audits', description: 'Conducted quarterly by a third party.' },
    ] as ListItemData[],
    cta: { label: 'Read our HSE policy', href: '#' },
  },
  {
    icon: Cpu,
    eyebrow: 'Technology',
    heading: 'Field data connected to project controls',
    description: 'Site progress, testing records, and punch lists are logged digitally and visible to clients in real time.',
    list: [
      { title: 'Digital punch-list tracking', description: 'Issues logged and closed from site tablets.' },
      { title: 'Live progress dashboards', description: 'Shared with clients throughout delivery.' },
      { title: 'Centralised document control', description: 'Single source of truth for drawings and submittals.' },
    ] as ListItemData[],
    cta: { label: 'See our platform', href: '#' },
  },
];

// ---------------------------------------------------------------------------
// Professional list samples
// ---------------------------------------------------------------------------

export const capabilityChecklist: ListItemData[] = [
  { title: 'Design-build and EPC contracting' },
  { title: 'In-house BIM and digital coordination' },
  { title: 'Off-site ductwork and piping fabrication' },
  { title: 'NFPA and Civil Defence certified fire systems' },
  { title: 'ISO 9001, 14001, and 45001 certified operations' },
];

export const deliveryStandards: ListItemData[] = [
  { title: 'Fixed-price contracting', description: 'Cost certainty from award through handover.' },
  { title: 'Dedicated project controls', description: 'Weekly programme and cost reporting to the client.' },
  { title: 'Third-party commissioning', description: 'Independent verification before systems handover.' },
];

export const projectSpecSheet: KeyValueItem[] = [
  { key: 'Contract value', value: 'AED 45.2M' },
  { key: 'Contract type', value: 'Design & Build' },
  { key: 'Duration', value: '18 months' },
  { key: 'Facility area', value: '1.2M sq ft' },
  { key: 'Completion', value: 'Q4 2023' },
];

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export const primaryNav: NavItem[] = [
  {
    label: 'Services',
    megaMenu: {
      columns: [
        {
          heading: 'Engineering',
          links: [
            { label: 'Mechanical Engineering', href: '#' },
            { label: 'Electrical Engineering', href: '#' },
            { label: 'Plumbing Systems', href: '#' },
          ],
        },
        {
          heading: 'Delivery',
          links: [
            { label: 'Fire & Life Safety', href: '#' },
            { label: 'BIM & Digital Engineering', href: '#' },
            { label: 'Manufacturing & Prefabrication', href: '#' },
          ],
        },
      ],
      featured: {
        title: 'Digital Engineering',
        description: 'How federated BIM models remove rework before it reaches site.',
        href: '#',
        image: images.controlRoom,
      },
    },
  },
  {
    label: 'Projects',
    dropdown: [
      { label: 'Commercial', href: '#', description: 'Towers, offices, and mixed-use developments.' },
      { label: 'Industrial', href: '#', description: 'Logistics, manufacturing, and process facilities.' },
      { label: 'Healthcare', href: '#', description: 'Hospitals and critical-care environments.' },
      { label: 'Residential', href: '#', description: 'Masterplans and high-rise residential towers.' },
    ],
  },
  {
    label: 'Company',
    dropdown: [
      { label: 'About MENASCO', href: '#' },
      { label: 'Leadership', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Sustainability', href: '#' },
    ],
  },
  { label: 'Insights', href: '#' },
  { label: 'Contact', href: '#' },
];

export const footerLinkGroups = [
  {
    heading: 'Company',
    links: [
      { label: 'About MENASCO', href: '#' },
      { label: 'Leadership', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'News & Insights', href: '#' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Mechanical Engineering', href: '#' },
      { label: 'Electrical Engineering', href: '#' },
      { label: 'Fire & Life Safety', href: '#' },
      { label: 'BIM & Digital Engineering', href: '#' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Projects', href: '#' },
      { label: 'Certifications', href: '#' },
      { label: 'Sustainability', href: '#' },
      { label: 'Contact Us', href: '#' },
    ],
  },
];

export const certifications = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'NFPA Certified'];

export const officeLocations = [
  { name: 'Dubai, Head Office', address: 'Al Quoz Industrial Area 3, Dubai, UAE', phone: '+971 4 000 0000' },
  { name: 'Abu Dhabi, Branch Office', address: 'Mussafah Industrial, Abu Dhabi, UAE', phone: '+971 2 000 0000' },
  { name: 'Ras Al Khaimah, Manufacturing', address: 'Al Hamra Industrial Zone, RAK, UAE', phone: '+971 7 000 0000' },
];

export const socialLinks: SocialLink[] = [
  { platform: 'LinkedIn', href: '#', icon: Linkedin },
  { platform: 'Instagram', href: '#', icon: Instagram },
  { platform: 'Facebook', href: '#', icon: Facebook },
  { platform: 'YouTube', href: '#', icon: Youtube },
];

export const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Use', href: '#' },
  { label: 'Modern Slavery Statement', href: '#' },
];

export const serviceInterestOptions = [
  { label: 'Mechanical Engineering', value: 'mechanical' },
  { label: 'Electrical Engineering', value: 'electrical' },
  { label: 'Plumbing Systems', value: 'plumbing' },
  { label: 'Fire & Life Safety', value: 'fire-safety' },
  { label: 'BIM & Digital Engineering', value: 'bim' },
  { label: 'Manufacturing & Prefabrication', value: 'manufacturing' },
  { label: 'General Inquiry', value: 'general' },
];
