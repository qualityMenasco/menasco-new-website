// Real portraits supplied directly by the user (2026-07-27).
const HELMI_PHOTO = '/helmi-badawiyeh.png';
const BAHAA_PHOTO = '/bahaa-badawiyeh.png';
const HANI_PHOTO = '/hani-badawiyeh.png';
const REFAD_PHOTO = '/refad-al-dwairi.png';
const IHAB_PHOTO = '/ihab-saadi.png';
const MOHAMED_PHOTO = '/mohamed-youssef.png';
const MOTAZ_PHOTO = '/motaz-abu-fada.png';
const SURA_PHOTO = '/sura-mustafa.png';
const VICTOR_PHOTO = '/victor-eze.png';
const IBRAHIM_PHOTO = '/ibrahim-rahmah.png';
const ZAKARIA_PHOTO = '/zakaria-motawe.png';
const ED_PHOTO = '/ed-smith.png';
const RAKAN_PHOTO = '/rakan-abdullah.png';
const AHMED_PHOTO = '/ahmed-abbas.png';
const AMMAR_PHOTO = '/ammar-theeb.png';
const BASIM_PHOTO = '/basim-al-farouki.png';

// Supplied directly by the user (2026-07-24) — not sourced from published
// material.
export interface LeadershipProfile {
  slug: string;
  /** Name as shown on the compact About-page card. */
  cardName: string;
  /** Full formal name used on the dedicated profile page. */
  fullName: string;
  /** Short role used on the compact card. */
  role: string;
  /** Full title used on the profile page hero. */
  fullRole: string;
  photo: string;
  /** Alt text for the compact About-page card image. */
  cardPhotoAlt: string;
  linkedinHref?: string;
  /** Eyebrow label shared by the dedicated profile page hero and the Team page's featured editorial section. */
  messageEyebrow: string;
  /** Full message/bio text, in order — the single source both the dedicated profile page and the Team page read from, so it's never duplicated. */
  messageParagraphs: string[];
  /** Bahaa's page ends on a standalone emphasis line; Helmi's does not use one. */
  closingLine?: string;
}

export const leadershipProfiles: LeadershipProfile[] = [
  {
    slug: 'helmi-badawiyeh',
    cardName: 'Eng. Helmi Badawiyeh',
    fullName: 'Eng. Helmi Badawiyeh',
    role: 'Founder',
    fullRole: 'Founder & General Manager',
    photo: HELMI_PHOTO,
    cardPhotoAlt: 'Eng. Helmi Badawiyeh, Founder of MENASCO',
    messageEyebrow: "Founder's Message",
    messageParagraphs: [
      'Since founding MENASCO Mechanical Contracting L.L.C. in 1994, our ambition has remained clear: to build a trusted engineering company founded on technical excellence, integrity & unwavering commitment to our clients.',
      'Drawing on more than five decades of experience in engineering & construction I have witnessed the industry evolve through periods of rapid growth, technological advancement & increasing project complexity. Throughout this journey MENASCO, has continued to adapt strengthen its capabilities & uphold the principles on which it was established.',
      'Over more than three decades, MENASCO has grown into a respected name in the electromechanical contracting sector, delivering integrated MEP solutions across the UAE and key regional markets. Our expertise spans HVAC, electrical, plumbing & drainage, fire protection, BIM & digital engineering, prefabrication & specialized solutions for complex & mission-critical projects.',
      'Our achievements have been made possible by the dedication of our people, the confidence of our clients & the enduring relationships we have built with consultants, developers, contractors, suppliers & strategic partners. Together, they have played an essential role in every milestone we have reached.',
      'As we look to the future, we remain committed to sustainable growth, continuous improvement & the adoption of innovative engineering solutions that create lasting value, guided by our values of Innovation, Integrity, Excellence, we will continue to strengthen our capabilities, exceed our clients\' expectations & contribute to building resilient communities & cities for future generations.',
      'We look forward to creating new success stories, building enduring partnerships & continuing to transform innovation into reality.',
    ],
  },
  {
    slug: 'bahaa-badawiyeh',
    cardName: 'Eng. Bahaa Badawiyeh',
    fullName: 'Eng. Bahaa H. Badawiyeh',
    role: 'Chief Executive Officer',
    fullRole: 'Chief Executive Officer',
    photo: BAHAA_PHOTO,
    cardPhotoAlt: 'Eng. Bahaa Badawiyeh, Chief Executive Officer of MENASCO',
    linkedinHref: 'https://www.linkedin.com/in/bahaa-h-badawiyeh-84142620/',
    messageEyebrow: 'Executive Leadership',
    messageParagraphs: [
      'Bahaa Badawiyeh is the Chief Executive Officer of MENASCO Group, leading the organization with a philosophy that combines engineering expertise, strategic vision, operational discipline & a deep understanding of people.',
      'Throughout his journey with MENASCO, he has played a central role in transforming the company from a growing MEP contractor into MENASCO Group, an integrated engineering organization with expanding operations across the UAE, Saudi Arabia, Egypt, & the United Kingdom.',
      "Under his leadership, MENASCO Group has strengthened its capabilities in integrated MEP solutions, digital engineering, prefabrication, infrastructure & complex mission-critical projects. He has driven innovation-led growth, enhanced operational performance & reinforced the Group's ability to deliver reliable, precise & high-value engineering solutions.",
      'His leadership approach is founded on the belief that engineering excellence begins with people. He promotes collaboration, accountability, knowledge-sharing & continuous development across multidisciplinary teams, empowering the Group\'s engineers, specialists & project leaders to perform with a shared sense of purpose.',
      'Bahaa places strong emphasis on sustainability, ethical business practices, transparency & social responsibility. He continues to support initiatives that improve environmental performance, promote an inclusive workplace & create lasting value for clients, communities, employees & partners.',
      'Under his direction, MENASCO Group continues to expand its regional & international capabilities while remaining firmly guided by its core values of Innovation, Integrity, Excellence.',
      'For Bahaa, leadership is not defined by individual achievement but by the ability to unite people behind a shared vision: to build with integrity, innovate with purpose & create a legacy of engineering excellence that endures for generations.',
    ],
    closingLine:
      'To build with integrity, innovate with purpose, and create a legacy of excellence that endures for generations.',
  },
];

export function getLeadershipProfile(slug: string | undefined): LeadershipProfile | undefined {
  return leadershipProfiles.find((profile) => profile.slug === slug);
}

// ---------------------------------------------------------------------------
// Full executive team roster (Team page) — names/titles supplied directly by
// the user (2026-07-24). No bios, qualifications or tenure are invented.
// ---------------------------------------------------------------------------

export interface ExecutiveTeamMember {
  name: string;
  title: string;
  photo: string;
  photoAlt: string;
  linkedinHref?: string;
  /** Only set for executives with a dedicated profile page (see leadershipProfiles). */
  profileHref?: string;
  /** Optional bio paragraphs for modal-based executive bios. */
  bio?: string[];
  /** Drives which Team-page section this member renders in — array order within a group is the display order. */
  group: 'executive' | 'engineering-support';
}

// Helmi and Bahaa are deliberately not repeated here — their full profiles
// live only in leadershipProfiles above (Team page's Featured Leadership
// section reads from there), so there's a single source per person rather
// than the same name/title/photo duplicated across two arrays.
export const executiveTeam: ExecutiveTeamMember[] = [
  {
    name: 'Mr. Hani Badawiyeh',
    title: 'Chief Financial Officer',
    photo: HANI_PHOTO,
    photoAlt: 'Mr. Hani Badawiyeh, Chief Financial Officer of MENASCO',
    linkedinHref: 'https://www.linkedin.com/in/hany-badawieh-81941140/',
    bio: [
      'Mr. Hani Badawiyeh is a seasoned financial leader with over 22 years of experience in financial management, accounting, and strategic analysis. He holds a Bachelor\'s Degree in Financial Management and Accounting from the University of Jordan and has been a cornerstone in MENASCO\'s administrative and financial framework.',
      'Throughout his distinguished career, Mr. Badawiyeh has demonstrated exceptional expertise in budget planning, financial reporting, and contract oversight, ensuring fiscal discipline and sustainable growth across all business operations.',
      'His analytical precision and strategic approach have been instrumental in implementing effective financial governance, enhancing transparency, and optimizing performance efficiency, key pillars that uphold MENASCO\'s values of Integrity, Innovation, and Excellence.',
    ],
    group: 'executive',
  },
  {
    name: 'Eng. Refad Al-Dwairi',
    title: 'Chief Operating Officer',
    photo: REFAD_PHOTO,
    photoAlt: 'Eng. Refad Al-Dwairi, Chief Operating Officer of MENASCO',
    linkedinHref: 'https://www.linkedin.com/in/refad-al-dwairi-01b55045/',
    bio: [
      'Eng. Refad Al-Dwairi is a seasoned engineering and project management professional with over 20 years of experience delivering large-scale construction projects across regional and international markets. He holds a Bachelor of Science in Mechanical Engineering from the Jordan University of Science and Technology and an MBA from the University of Manchester, UK.',
      'Recognized for blending technical precision with strategic leadership, Eng. Refad has successfully led numerous high-profile projects to completion, consistently achieving exceptional results in time, cost, and quality performance while ensuring full compliance with contractual, safety, and international standards.',
      'As Chief Operating Officer of MENASCO, he plays a pivotal role in strengthening the company\'s operational capabilities and reinforcing its enduring commitment to Innovation, Integrity, and Excellence.',
    ],
    group: 'executive',
  },
  {
    name: 'Eng. Ihab Saadi',
    title: 'Manpower & Resourcing Division Manager',
    photo: IHAB_PHOTO,
    photoAlt: 'Eng. Ihab Saadi, Manpower & Resourcing Division Manager of MENASCO',
    linkedinHref: 'https://www.linkedin.com/in/ihabsaadikhudhair/',
    bio: [
      'Eng. Ihab Saadi is a seasoned construction and workforce management leader with over 25 years of experience in large-scale project execution, resource planning, and operational leadership. He oversees strategic workforce initiatives, ensuring seamless coordination across diverse teams.',
      'Renowned for balancing strategic planning with on-the-ground execution, Eng. Saadi has successfully managed numerous high-profile and complex projects, demonstrating exceptional skill in resource optimization, budget control, and performance enhancement.',
      'His leadership philosophy centers on empowerment, precision, and teamwork, driving innovation and fostering collaboration across all departments.',
    ],
    group: 'executive',
  },
  {
    name: 'Eng. Mohamed Youssef',
    title: 'Commercial Director',
    photo: MOHAMED_PHOTO,
    photoAlt: 'Eng. Mohamed Youssef, Commercial Director of MENASCO',
    linkedinHref: 'https://www.linkedin.com/in/mohamed-youssef-a3053925/',
    bio: [
      'Eng. Mohamed Youssef brings over 15 years of extensive experience in contract management, commercial operations, and project administration across major construction and infrastructure developments. He holds a Bachelor\'s Degree in Mechanical Engineering from Alexandria University.',
      'His credentials include membership of FIDIC (International Federation of Consulting Engineers), a Six Sigma certification in Leadership, Analysis & Project Management, and APC MRICS Certified Cost Specialist status.',
      'With a rare blend of engineering expertise and commercial acumen, he has demonstrated exceptional capability in leading complex negotiations and maximizing project value.',
    ],
    group: 'executive',
  },
  {
    name: 'Eng. Zakaria Motawe',
    title: 'Engineering Head – Electrical',
    photo: ZAKARIA_PHOTO,
    photoAlt: 'Eng. Zakaria Motawe, Engineering Head – Electrical of MENASCO',
    linkedinHref: 'https://www.linkedin.com/in/zakaria-motawe-92b02b43/',
    bio: [
      'Eng. Zakaria Motawe is a seasoned Electrical Engineer with extensive experience in designing, managing, and executing large-scale electromechanical projects across commercial, residential, and industrial developments.',
      'He possesses deep technical expertise in electrical power distribution, ELV systems, and sustainable energy solutions, ensuring compliance with the highest engineering and safety standards.',
      'As Engineering Lead – Electrical at MENASCO, he oversees electrical engineering operations, mentors project teams, and drives technical excellence from design through commissioning.',
    ],
    group: 'executive',
  },
  {
    name: 'Mr. Ed Smith',
    title: 'Professional Services Manager',
    photo: ED_PHOTO,
    photoAlt: 'Mr. Ed Smith, Professional Services Manager of MENASCO',
    bio: [
      'With over two decades of international experience across the United States, India, and the Middle East, Ed Smith brings extensive leadership in quality assurance, infrastructure engineering, and project governance. Since joining MENASCO in 2017, he has led QA/QC operations across the UAE and KSA.',
      'Ed is responsible for establishing and maintaining MENASCO\'s corporate Quality Management Systems (QMS), inspection protocols, and audit frameworks, ensuring full compliance with ISO 9001 standards.',
      'A LEED Accredited Professional and Harvard Business School alumnus, Ed combines technical depth with strategic insight, fostering a culture of sustainability, accountability, and performance.',
    ],
    group: 'executive',
  },
  {
    name: 'Eng. Rakan Abdullah',
    title: 'BIM Manager',
    photo: RAKAN_PHOTO,
    photoAlt: 'Eng. Rakan Abdullah, BIM Manager of MENASCO',
    linkedinHref: 'https://www.linkedin.com/in/rakan-alhusanaya-83977212a/',
    bio: [
      'With over a decade of experience managing large-scale construction projects, Eng. Rakan combines strong technical engineering expertise with advanced leadership in digital project management, dedicated to advancing Building Information Modelling (BIM).',
      'Starting his career as an Electrical Site Engineer, he built a solid foundation in design, installation, and execution before progressing into BIM Management, leading cross-functional teams and standardizing digital processes.',
      'He holds RICS-accredited certifications and ISO 19650 qualifications, reinforcing his pursuit of global best practices in BIM management and integrated engineering solutions.',
    ],
    group: 'executive',
  },
  {
    name: 'Eng. Motaz Abu Fada',
    title: 'Planning & Control Manager',
    photo: MOTAZ_PHOTO,
    photoAlt: 'Eng. Motaz Abu Fada, Planning & Control Manager of MENASCO',
    linkedinHref: 'https://www.linkedin.com/in/moataz-abufaddah-83101553/',
    group: 'executive',
  },
  {
    name: 'Eng. Sura Mustafa',
    title: 'Estimation & Procurement Manager',
    photo: SURA_PHOTO,
    photoAlt: 'Eng. Sura Mustafa, Estimation & Procurement Manager of MENASCO',
    group: 'engineering-support',
  },
  {
    name: 'Eng. Victor Eze',
    title: 'HSE Manager',
    photo: VICTOR_PHOTO,
    photoAlt: 'Eng. Victor Eze, HSE Manager of MENASCO',
    linkedinHref: 'https://www.linkedin.com/in/victor-eze-profgusto/',
    group: 'engineering-support',
  },
  {
    name: 'Eng. Ahmed Abbas',
    title: 'IT Manager',
    photo: AHMED_PHOTO,
    photoAlt: 'Eng. Ahmed Abbas, IT Manager of MENASCO',
    linkedinHref: 'https://www.linkedin.com/in/ahmad-abbas-sy/',
    group: 'engineering-support',
  },
  {
    name: 'Mr. Ammar Theeb',
    title: 'HR Manager',
    photo: AMMAR_PHOTO,
    photoAlt: 'Mr. Ammar Theeb, HR Manager of MENASCO',
    linkedinHref: 'https://www.linkedin.com/in/ammar-deeb-7583b86b/',
    group: 'engineering-support',
  },
  {
    name: 'Eng. Ibrahim Rahmah',
    title: 'Design & Engineering Section Head',
    photo: IBRAHIM_PHOTO,
    photoAlt: 'Eng. Ibrahim Rahmah, Design & Engineering Section Head of MENASCO',
    group: 'engineering-support',
  },
  {
    name: 'Eng. Basim Al Farouki',
    title: 'Chief Executive Officer (KSA)',
    photo: BASIM_PHOTO,
    photoAlt: 'Eng. Basim Al Farouki, Chief Executive Officer (KSA) of MENASCO',
    group: 'engineering-support',
  },
];
