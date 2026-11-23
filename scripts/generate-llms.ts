/**
 * Generates MENASCO's page-centric llms.txt tree — every public navigable
 * page gets its own `llms.txt` at PAGE_PATH/llms.txt (root page `/` is the
 * one exception: its file is public/llms.txt directly). Format follows
 * Cloudflare's llms.txt (https://www.cloudflare.com/llms.txt) as a
 * structural reference only — H1, blockquote summary, H2 content groups,
 * descriptive markdown links, `---` separators between major groups. All
 * MENASCO content below is generated from the same typed data modules and
 * English i18n JSON the live React pages read — one source of truth, no
 * hand-duplicated content.
 *
 * Run via `npm run generate:llms` (also wired as a `prebuild` step so
 * `npm run build` always regenerates before Vite copies public/ into
 * dist/).
 *
 * Decisions this implements (see conversation history for the reviewed
 * audit/migration plan):
 * - Redirect-only routes (/projects, /sectors, legacy category redirects,
 *   /services/data-centres alt spelling) get no llms.txt — they render no
 *   unique content of their own.
 * - Newsroom articles are withheld: data/news.ts is explicitly fictional
 *   placeholder content per its own file comment. Only an honest empty
 *   newsroom index is generated.
 * - Regional Presence has no dedicated route (it's a Home page section) —
 *   its content lives on the Home page and the /contact page (which reads
 *   the same office data), not as a standalone resource.
 * - The old /public/llms/**\/*.md mirror tree and section-index files at
 *   the previous architecture's paths are deleted by this script — this
 *   page-centric tree is the only architecture, not a second one running
 *   in parallel.
 */
import { mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL, SITE_TAGLINE } from '../src/seo/constants';
import { services } from '../src/data/services';
import { CAREERS_URL, pendingContentPaths, servicesNavigationGroups, umbrellaServiceLinks } from '../src/data/navigation';
import { projects } from '../src/data/projects';
import { dcTechnical } from '../src/data/dataCenterTechnical';
import { TECHNICAL_SOURCES } from '../src/data/dataCenterSources';
import { projectCategoryList } from '../src/data/projectCategories';
import { leadershipProfiles, executiveTeam } from '../src/data/leadership';
import { officeLocations, primaryContact, regionalCountries } from '../src/data/locations';
import { certifications } from '../src/data/certifications';
import { companyStats, foundingYear } from '../src/data/companyStats';
import { lynxqcPrivacyPolicySections, lynxqcPrivacyPolicyLastUpdated, lynxqcPrivacyPolicyContactEmail } from '../src/data/lynxqcPrivacyPolicy';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_DIR = join(ROOT, 'public');
const LOCALES_EN = join(PUBLIC_DIR, 'locales', 'en');

function readNamespace(name: string): any {
  return JSON.parse(readFileSync(join(LOCALES_EN, `${name}.json`), 'utf8'));
}

const about = readNamespace('about');
const legal = readNamespace('legal');
const servicesCopy = readNamespace('services');
const home = readNamespace('home');
const projectsCopy = readNamespace('projects');

// ---------------------------------------------------------------------------
// Formatting primitives — Cloudflare-style: H1, blockquote, H2 groups,
// descriptive links, bullets, `---` between major groups. No metadata
// header block (Source:/Type:/Language: lines) — the page's canonical URL
// is already implied by PAGE_PATH/llms.txt itself.
// ---------------------------------------------------------------------------

function h1(title: string) {
  return `# ${title}`;
}

function bq(text: string) {
  return `> ${text}`;
}

function h2(title: string) {
  return `## ${title}`;
}

const HR = '---';

/** Page copy cites sources as [[n]]; in llms.txt they read as plain [n] references to the Sources list. */
function citeRefs(text: string) {
  return text.replace(/\s*\[\[(\d+)\]\]/g, ' [$1]');
}

/** Canonical HTML page URL for a route (e.g. "/services/mechanical"), or the homepage if routePath is "". */
function pageUrl(routePath: string) {
  return routePath ? `${SITE_URL}${routePath}` : SITE_URL;
}

/** Another MENASCO page's own llms.txt — links continue the AI-readable graph (Home → Section → Detail) rather than pointing at the raw HTML page. */
function llmsUrl(routePath: string) {
  return routePath ? `${SITE_URL}${routePath}/llms.txt` : `${SITE_URL}/llms.txt`;
}

/** `- [Label](url): description` — omit the colon/description when there's nothing to add. */
function linkLine(label: string, url: string, description?: string) {
  return description ? `- [${label}](${url}): ${description}` : `- [${label}](${url})`;
}

/** Idempotent — an item that's already a bullet line (e.g. from linkLine()) isn't given a second "- " prefix. */
function bullets(items: string[]) {
  return items.map((item) => (item.startsWith('- ') ? item : `- ${item}`)).join('\n');
}

/** Live service pages described by their own page copy rather than a services.ts record. */
const umbrellaPages: Record<string, { seo: { title: string; description: string }; hero: { description: string }; projects?: { eyebrow: string; intro: string; items: Record<string, { summary: string; fact: string }> }; faq?: { items: { question: string; answer: string }[] } }> = {
  '/services/mep': servicesCopy.mepPage,
  '/services/civil': servicesCopy.civilPage,
  '/services/turnkey-developments': servicesCopy.epcPage,
  '/services/manufacturing-prefabrication': servicesCopy.manufacturingPage,
};

/**
 * Services grouped the way the site's navigation groups them
 * (src/data/navigation.ts): one line per umbrella page, followed by the
 * sub-services it covers (sub-services are sections of the umbrella page,
 * not pages of their own). Pages awaiting approved content
 * (`pendingContentPaths`) are left out. Data Centers closes the list.
 */
function groupedServiceBlocks(): string[] {
  const pending = pendingContentPaths as readonly string[];
  const serviceLine = (href: string) => {
    const umbrella = umbrellaPages[href];
    if (umbrella) return linkLine(umbrella.seo.title, llmsUrl(href), umbrella.seo.description);
    const s = services.find((entry) => `/services/${entry.slug}` === href);
    return s ? linkLine(s.name, llmsUrl(href), s.shortDescription) : undefined;
  };
  const blocks = servicesNavigationGroups.flatMap((group) => {
    if (pending.includes(group.href)) return [];
    const line = serviceLine(group.href);
    if (!line) return [];
    const covers = group.links.length > 0 ? `\n\nCovers: ${group.links.map((link) => link.label).join(', ')}.` : '';
    return [`### ${group.label}\n\n${bullets([line])}${covers}`];
  });
  return [
    ...blocks,
    `### Data Centers\n\n${bullets([linkLine('Data Centers', llmsUrl('/services/data-centers'), servicesCopy.dataCenter.seo.description)])}`,
  ];
}

/** Joins page sections with blank lines; `hr: true` sections are preceded by a `---` separator (used between major content groups, not every subsection). */
function doc(...parts: Array<string | { text: string; hr?: boolean } | undefined | false>) {
  const blocks: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (typeof part === 'string') {
      blocks.push(part);
    } else {
      if (part.hr) blocks.push(HR);
      blocks.push(part.text);
    }
  }
  return blocks.join('\n\n');
}

function write(routePath: string, content: string) {
  const fullPath = routePath ? join(PUBLIC_DIR, ...routePath.split('/').filter(Boolean), 'llms.txt') : join(PUBLIC_DIR, 'llms.txt');
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content.trimEnd() + '\n', 'utf8');
}

/**
 * "Dubai Marina, UAE" plus a `country` of "UAE" would otherwise render as
 * "Dubai Marina, UAE, UAE" — `location` often already ends with the country.
 * Only appends `country` when it isn't already present in `location`.
 */
function formatLocation(p: { location: string; country: string }) {
  const parts = [p.location];
  if (p.country && !p.location.toLowerCase().includes(p.country.toLowerCase())) parts.push(p.country);
  return parts.filter(Boolean).join(', ');
}

function relatedServicesForCategory(categorySlug: string | undefined) {
  if (!categorySlug) return [];
  return services.filter((s) => s.relatedSectors.includes(categorySlug));
}

// ---------------------------------------------------------------------------
// Shared company-level Key Facts — used identically by both the Home page
// and the About page so the two never drift into two slightly different
// versions of the same facts. Every line here is sourced directly from
// existing typed data/i18n content (companyStats, locations, services,
// projectCategories, certifications, about.json's Innovation & Technology
// section) — nothing here is estimated or invented. Durable facts (founding
// year, head office, regions, sectors, services) are static; company-age
// ("32+ years") stays as the dynamically-computed companyStats value so it
// never goes stale, while "Established in 1994" is also included as the
// durable anchor fact per the source data's own foundingYear constant.
// ---------------------------------------------------------------------------

/**
 * Sectors with at least one published project — a category can exist in the
 * taxonomy (see src/data/projectCategories.ts) before any project has been
 * assigned to it, and this site's llms.txt is meant to represent verified,
 * evidenced capability, not the taxonomy's aspirational shape. Excluding an
 * empty category here means its (deliberately neutral, "reserved for future
 * projects") description never has to be relied on to stay capability-free
 * forever — it simply isn't published until real projects justify it.
 */
const publishedCategories = projectCategoryList.filter((c) => projects.some((p) => p.category === c.slug));

function buildCompanyKeyFacts(): string[] {
  const statLabels: Record<string, string> = home.stats;
  const serviceNames = umbrellaServiceLinks.map((link) => link.label).join(', ');
  const sectorNames = publishedCategories.map((c) => c.title).join(', ');
  const innovationHeadings = Object.values(about.innovation.sections as Record<string, { heading: string }>).map((s) => s.heading);
  const certNames = certifications.map((c) => c.name).join(', ');
  const regionalOffices = officeLocations
    .filter((o) => !o.isHeadquarters)
    .map((o) => `${o.city} (${o.label.includes(',') ? o.label.split(',')[1].trim() : o.country})`)
    .join(', ');

  return [
    `Established in ${foundingYear} in the UAE as MENASCO Mechanical Contracting L.L.C.`,
    'Operates as an integrated MEP (mechanical, electrical, plumbing and fire protection) engineering and contracting company.',
    ...companyStats.map((stat) => {
      const label = stat.id === 'countries' ? `Countries of Operation (${regionalCountries.join(', ')})` : statLabels[stat.id] ?? stat.label;
      return `${stat.value} ${label}`;
    }),
    'Dubai, UAE is MENASCO’s Head Office.',
    `Regional offices in ${regionalOffices}.`,
    `Serves sectors including ${sectorNames}.`,
    `Core service lines include ${serviceNames}, alongside dedicated data center MEP delivery.`,
    'Delivers specialist engineering for data centers, mission-critical, healthcare, energy, and other technically demanding facilities.',
    'Project-delivery approach incorporates early project engagement, BIM-driven coordination, and disciplined execution.',
    `Maintains a dedicated Innovation & Technology ecosystem spanning ${innovationHeadings.join(', ')}.`,
    `Maintains an integrated QHSE system certified to ${certNames}.`,
  ];
}

// ---------------------------------------------------------------------------
// Home — https://menascogroup.com/  →  public/llms.txt
// ---------------------------------------------------------------------------


function generateHome() {
  const featured = projects.filter((p) => p.featured);

  const content = doc(
    h1('MENASCO'),
    bq(home.seo.description),
    `Established in ${foundingYear} in the UAE as MENASCO Mechanical Contracting L.L.C.`,

    {
      hr: true,
      text: doc(
        h2('About MENASCO'),
        about.hero.description,
        linkLine('About MENASCO', llmsUrl('/about'), 'Company overview, approach, vision, mission and values.'),
      ),
    },

    {
      hr: true,
      text: doc(h2('Key Facts'), bullets(buildCompanyKeyFacts())),
    },

    {
      hr: true,
      text: doc(
        h2('Services'),
        servicesCopy.seo.description,
        ...groupedServiceBlocks(),
      ),
    },

    {
      hr: true,
      text: doc(
        h2('Projects & Sectors'),
        `MENASCO delivers projects across all ${regionalCountries.length} of its countries of operation: ${regionalCountries.join(', ')}. The website features a selection of ${projects.length} of these projects, organized into ${publishedCategories.length} sectors.`,
        bullets(publishedCategories.map((c) => `${c.title}: ${c.description}`)),
        linkLine('All Projects & Sectors', llmsUrl('/projects/categories'), 'Full project portfolio, browsable by sector.'),
      ),
    },

    featured.length > 0 && {
      hr: true,
      text: doc(
        h2('Featured Projects'),
        bullets(featured.map((p) => linkLine(p.title, llmsUrl(`/projects/${p.slug}`), p.seoDescription || p.description))),
      ),
    },

    {
      hr: true,
      text: doc(h2('Innovation & Technology'), bullets(innovationPlatformLines()), linkLine('Innovation & Technology', llmsUrl('/innovation-technology'))),
    },

    {
      hr: true,
      text: doc(h2('Quality, Health, Safety & Environment'), about.qualitySafetyPage.description, linkLine('Quality, Health & Safety', llmsUrl('/quality-safety'))),
    },

    {
      hr: true,
      text: doc(
        h2('Regional Presence'),
        home.regionalPresence.description,
        linkLine('Offices & Contact', llmsUrl('/contact'), `${officeLocations.length} offices across ${regionalCountries.join(', ')}.`),
      ),
    },

    {
      hr: true,
      text: doc(h2('Newsroom'), linkLine('Newsroom', llmsUrl('/newsroom'), 'MENASCO news and announcements.')),
    },

    {
      hr: true,
      text: doc(h2('Careers'), 'Career, internship and graduate opportunities at MENASCO.', linkLine('Careers at MENASCO', CAREERS_URL)),
    },
  );

  write('', content);
}

// ---------------------------------------------------------------------------
// About section
// ---------------------------------------------------------------------------

function generateAbout() {
  const w = about.whoWeAre;
  const vmv = about.visionMissionValues;

  const content = doc(
    h1('About MENASCO'),
    bq(about.hero.description),

    doc(h2('Company Overview'), w.paragraph3),
    doc(h2('Key Facts'), bullets(buildCompanyKeyFacts())),
    doc(h2('Mission'), vmv.mission.description),
    doc(h2('Vision'), vmv.vision.description),
    doc(
      h2('Values'),
      bullets(Object.values(vmv.values as Record<string, { title: string; description: string }>).map((v) => `${v.title}: ${v.description}`)),
    ),

    {
      hr: true,
      text: doc(
        h2('Related About Pages'),
        bullets([
          linkLine('Leadership & Team', llmsUrl('/team'), 'MENASCO leadership and engineering management team.'),
          linkLine('Quality, Health & Safety', llmsUrl('/quality-safety'), "MENASCO's QHSE approach and ISO certifications."),
          linkLine('Community & People', llmsUrl('/community-people'), 'MENASCO blood drive, Culture Day and Training & Mentoring Centre.'),
          linkLine('Certification & Training', llmsUrl('/certification-training'), 'MENASCO Connect (internal workforce development), MENASCO Academy (a free engineering education programme in development, for external applicants) and internships for students.'),
          linkLine('Innovation & Technology', llmsUrl('/innovation-technology'), "MENASCO's digital and technology initiatives."),
          linkLine('Contact & Regional Presence', llmsUrl('/contact'), 'Office locations and contact details.'),
        ]),
      ),
    },
  );

  write('/about', content);
}

/** A team member as a sub-section with their bio when the page has one, else a single line. */
function memberBlock(m: { name: string; title: string; bio?: string[] }): string {
  return m.bio?.length ? `### ${m.name}, ${m.title}\n\n${m.bio.join('\n\n')}` : `- ${m.name}, ${m.title}`;
}

function generateTeam() {
  const execGroup = executiveTeam.filter((m) => m.group === 'executive');
  const supportGroup = executiveTeam.filter((m) => m.group === 'engineering-support');

  const content = doc(
    h1('Leadership & Team'),
    bq(`MENASCO's leadership: ${leadershipProfiles.length} executive leaders, ${execGroup.length} corporate leaders and ${supportGroup.length} technical leaders.`),

    doc(
      h2('Executive Leadership'),
      bullets(leadershipProfiles.map((p) => linkLine(p.fullName, llmsUrl(`/leadership/${p.slug}`), p.fullRole))),
    ),
    doc(h2('Corporate Leadership'), ...execGroup.map(memberBlock)),
    doc(h2('Technical Leadership'), ...supportGroup.map(memberBlock)),

    {
      hr: true,
      text: doc(h2('Related Pages'), linkLine('About MENASCO', llmsUrl('/about'))),
    },
  );

  write('/team', content);
}

function generateLeadershipProfiles() {
  for (const profile of leadershipProfiles) {
    const content = doc(
      h1(profile.fullName),
      bq(`${profile.fullRole} at MENASCO.`),

      doc(h2('Biography'), profile.messageParagraphs.join('\n\n')),
      profile.closingLine && doc(h2('Statement'), profile.closingLine),
      profile.linkedinHref && doc(h2('Public Profile'), linkLine('LinkedIn', profile.linkedinHref, 'Public professional profile.')),

      {
        hr: true,
        text: doc(h2('Related Pages'), bullets([linkLine('Leadership & Team', llmsUrl('/team')), linkLine('About MENASCO', llmsUrl('/about'))])),
      },
    );
    write(`/leadership/${profile.slug}`, content);
  }
}

function generateQualitySafety() {
  const q = about.qualitySafetyPage;
  const content = doc(
    h1('Quality, Health & Safety'),
    bq(q.description),

    doc(
      h2(q.commitment.heading),
      (q.commitment.paragraphs as string[]).slice(1).join('\n\n'),
      ...(q.commitment.topics as { title: string; body: string[] }[]).map((topic) => `### ${topic.title}\n\n${topic.body.join('\n\n')}`),
    ),
    doc(
      h2(q.results.heading),
      bullets(
        [...q.results.safety.stats, ...q.results.quality.stats].map(
          (s: { value: string; label: string }) => `${s.value} ${s.label.charAt(0).toLowerCase()}${s.label.slice(1)} over three years (2022–2025, all projects)`,
        ),
      ),
      `${q.results.safety.text} ${q.results.quality.text}`,
    ),
    doc(h2('Certifications'), bullets(certifications.map((c) => `${c.name}, ${c.scope}`)), 'Certificate numbers and issue dates are not publicly published.'),

    {
      hr: true,
      text: doc(
        h2('Related Pages'),
        bullets([linkLine('Community & People', llmsUrl('/community-people')), linkLine('About MENASCO', llmsUrl('/about'))]),
      ),
    },
  );
  write('/quality-safety', content);
}

function generateCertificationTraining() {
  const c = about.certificationTrainingPage;
  const content = doc(
    h1('Certification & Training'),
    bq(c.hero.description),

    doc(h2(`${c.workforce.eyebrow} (active)`), `${c.workforce.heading}`, (c.workforce.paragraphs as string[]).join('\n\n')),
    doc(
      h2(`${c.initiative.eyebrow} (${c.initiative.status.toLowerCase()})`),
      c.initiative.heading,
      [c.initiative.lead, ...(c.initiative.paragraphs as string[])].join('\n\n'),
      `### ${c.initiative.pathwayTitle}\n\n${bullets((c.initiative.steps as { title: string; body: string; detail: string }[]).map((step) => `${step.title}: ${step.body}. ${step.detail}`))}`,
      `${c.initiative.disclaimer} Placement through industry partners is an intended pathway, not a guaranteed outcome. Enrolment is not yet open.`,
    ),
    doc(h2(`${c.internships.eyebrow} (active)`), c.internships.heading, (c.internships.paragraphs as string[]).join('\n\n'), linkLine('Careers', CAREERS_URL)),
    doc(h2('Frequently Asked Questions'), ...(c.faq.items as { question: string; answer: string }[]).map((item) => `### ${item.question}

${item.answer}`)),

    {
      hr: true,
      text: doc(
        h2('Related Pages'),
        bullets([linkLine('Innovation & Technology', llmsUrl('/innovation-technology'), 'MENASCO Connect and internal digital platforms.'), linkLine('Community & People', llmsUrl('/community-people')), linkLine('About MENASCO', llmsUrl('/about'))]),
      ),
    },
  );
  write('/certification-training', content);
}

function generateCommunity() {
  const community = about.community;
  const chapters = [community.bloodDrive, community.healthcare, community.cultureDay, community.dubaiRun, community.careerFairs, community.training] as Array<{ eyebrow: string; heading: string; caption: string }>;
  const content = doc(
    h1('Community & People'),
    bq(community.seo.description),

    ...chapters.map((chapter) => doc(h2(chapter.eyebrow), `${chapter.heading}. ${chapter.caption}`)),

    {
      hr: true,
      text: doc(
        h2('Related Pages'),
        bullets([linkLine('Quality, Health & Safety', llmsUrl('/quality-safety')), linkLine('About MENASCO', llmsUrl('/about'))]),
      ),
    },
  );
  write('/community-people', content);
}

/** One line per technology platform: its name and the first sentence of its page description. */
function innovationPlatformLines(): string[] {
  const sections = Object.values(about.innovation.sections as Record<string, { heading: string; paragraph: string }>);
  return sections.map((sec) => `${sec.heading}: ${sec.paragraph.split(/(?<=\.)\s/)[0]}`);
}

function generateInnovation() {
  const inn = about.innovation;
  const sectionEntries = Object.entries(
    inn.sections as Record<string, { heading: string; paragraph: string; privacyPolicyLink?: string }>,
  );
  const content = doc(
    h1('Innovation & Technology'),
    bq(`MENASCO's in-house construction technology: ${sectionEntries.map(([, sec]) => sec.heading).join(', ')}.`),

    ...sectionEntries.map(([key, sec]) =>
      doc(
        h2(sec.heading),
        sec.paragraph,
        key === 'lynxqc' && sec.privacyPolicyLink ? linkLine(sec.privacyPolicyLink, llmsUrl('/lynxqc/privacy-policy')) : '',
      ),
    ),

    {
      hr: true,
      text: doc(h2('Related Pages'), linkLine('About MENASCO', llmsUrl('/about'))),
    },
  );
  write('/innovation-technology', content);
}

function generateContact() {
  const content = doc(
    h1('Contact MENASCO'),
    bq("MENASCO's regional office locations, contact details, and enquiry form."),

    doc(
      h2('Enquiry Form'),
      'The contact page offers a single enquiry form with three types, selected by the visitor:',
      bullets([
        'General: personal details plus a subject and message.',
        'Career: personal details plus a job code and CV upload.',
        'Project: personal details, company name, and project details (optional project type and estimated value).',
      ]),
    ),

    doc(
      h2('Offices'),
      officeLocations
        .map((o) => {
          const lines = [`${o.label} (${o.country})`];
          if (o.address) lines.push(o.address);
          if (o.phone) lines.push(`Phone: ${o.phone}`);
          if (o.isHeadquarters) lines.push('Head Office');
          return lines.join(' | ');
        })
        .join('\n\n'),
    ),
    doc(h2('General Contact'), `Email: ${primaryContact.email}`),

    {
      hr: true,
      text: doc(h2('Related Pages'), linkLine('About MENASCO', llmsUrl('/about'))),
    },
  );
  write('/contact', content);
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

function generateServicesIndex() {
  const content = doc(
    h1('MENASCO Services'),
    bq(servicesCopy.seo.description),
    servicesCopy.listing.description,

    doc(h2('Services'), ...serviceAreaBlocks()),
    doc(
      h2(servicesCopy.listing.delivery.eyebrow),
      servicesCopy.listing.delivery.heading,
      bullets((servicesCopy.listing.delivery.steps as { title: string; body: string }[]).map((step) => `${step.title}: ${step.body}`)),
    ),
    doc(h2('Frequently Asked Questions'), ...(servicesCopy.listing.faq.items as { question: string; answer: string }[]).map((item) => `### ${item.question}\n\n${item.answer}`)),

    {
      hr: true,
      text: doc(
        h2('Related Pages'),
        bullets([linkLine('Projects & Sectors', llmsUrl('/projects/categories')), linkLine('About MENASCO', llmsUrl('/about'))]),
      ),
    },
  );
  write('/services', content);
}

function generateServiceDetail() {
  for (const svc of services) {
    const relatedProjects = projects.filter((p) => p.category && svc.relatedSectors.includes(p.category));

    const content = doc(
      h1(svc.name),
      bq(svc.shortDescription),

      doc(h2('Overview'), svc.introduction),
      doc(h2('Capabilities'), bullets(svc.capabilities)),
      doc(h2('Related Sectors'), bullets(svc.relatedSectors.map((slug) => projectCategoryList.find((c) => c.slug === slug)?.title ?? slug))),

      relatedProjects.length > 0 && {
        hr: true,
        text: doc(
          h2('Relevant Projects'),
          bullets(relatedProjects.slice(0, 8).map((p) => linkLine(p.title, llmsUrl(`/projects/${p.slug}`), formatLocation(p)))),
        ),
      },

      {
        hr: true,
        text: doc(h2('Related Pages'), linkLine('All Services', llmsUrl('/services'))),
      },
    );
    write(`/services/${svc.slug}`, content);
  }
}

/** The four MEP technical disciplines: introduction and full scope of works, at the given heading depth. */
function mepDisciplineBlocks(depth: '###' | '####'): string[] {
  const mep = servicesCopy.mepPage;
  const items = servicesCopy.items as Record<string, { introduction: string; capabilities: string[] }>;
  const disciplines = mep.disciplinesSection.items as { id: string; title: string }[];
  return disciplines.map(
    (d) => `${depth} ${d.title}\n\n${items[d.id].introduction}\n\n${mep.disciplinesSection.scopeLabel}:\n\n${bullets(items[d.id].capabilities)}`,
  );
}

/** A service area's capability list as "Title: description" bullets. */
function capabilityBullets(list: { title: string; description: string }[]): string {
  return bullets(list.map((c) => `${c.title}: ${c.description}`));
}

/**
 * Every service area with its real scope, in MENASCO's priority order
 * (MEP, EPC, Data Centers, Civil & BIM, Manufacturing & Prefabrication).
 */
function serviceAreaBlocks(): string[] {
  const sc = servicesCopy;
  return [
    doc(`### MEP`, linkLine(sc.mepPage.seo.title, llmsUrl('/services/mep'), sc.mepPage.seo.description), ...mepDisciplineBlocks('####')),
    doc(
      `### EPC`,
      linkLine(sc.epcPage.seo.title, llmsUrl('/services/turnkey-developments'), sc.epcPage.seo.description),
      bullets((sc.epcPage.capabilities.items as { title: string; subtitle: string; body: string }[]).map((c) => `${c.title} (${c.subtitle}): ${c.body}`)),
    ),
    doc(`### Data Centers`, linkLine(sc.dataCenter.seo.title, llmsUrl('/services/data-centers'), sc.dataCenter.seo.description), capabilityBullets(sc.dataCenter.capabilities)),
    doc(
      `### Civil & BIM`,
      linkLine(sc.civilPage.seo.title, llmsUrl('/services/civil'), sc.civilPage.seo.description),
      bullets((sc.civilPage.capabilities.tabs as { title: string; paragraphs: string[] }[]).map((c) => `${c.title}: ${c.paragraphs[0]}`)),
    ),
    doc(
      `### Manufacturing & Prefabrication`,
      linkLine(sc.manufacturingPage.seo.title, llmsUrl('/services/manufacturing-prefabrication'), sc.manufacturingPage.seo.description),
      mfgScopeBullets(),
    ),
  ];
}

/** Manufacturing & Prefabrication scope: the two featured lines, then each product range group. */
function mfgScopeBullets(): string {
  const m = servicesCopy.manufacturingPage;
  return bullets([
    `${m.whiteSpaces.eyebrow}: ${(m.whiteSpaces.items as { title: string }[]).map((i) => i.title).join(', ')}`,
    `${m.eHouses.eyebrow}: ${m.eHouses.body[0]}`,
    ...(m.range.topics as { title: string; items: string[] }[]).map((topic) => `${topic.title}: ${topic.items.join('; ')}`),
  ]);
}

/** EPC-only sections, mirroring the page. */
function epcPageSections(): string[] {
  const e = servicesCopy.epcPage;
  const titled = (items: { title: string; body: string }[]) => bullets(items.map((i) => `${i.title}: ${i.body}`));
  return [
    doc(h2(e.approach.heading), (e.approach.paragraphs as string[]).join('\n\n')),
    doc(
      h2(e.capabilities.heading),
      e.capabilities.intro,
      ...(e.capabilities.items as { title: string; subtitle: string; body: string; activities: string[] }[]).map((c) => doc(`### ${c.title}: ${c.subtitle}`, c.body, bullets(c.activities))),
    ),
    doc(
      h2(e.advantage.heading),
      e.advantage.intro,
      ...(e.advantage.tabs as { heading: string; paragraphs: string[]; items: { title: string; body: string }[] }[]).map((tab) => doc(`### ${tab.heading}`, tab.paragraphs.join('\n\n'), titled(tab.items))),
    ),
    doc(h2(e.controls.heading), (e.controls.paragraphs as string[]).join('\n\n'), titled(e.controls.items)),
    doc(h2(e.industries.heading), e.industries.intro, titled(e.industries.items)),
  ];
}

/** Civil-only sections, mirroring the page. */
function civilPageSections(): string[] {
  const c = servicesCopy.civilPage;
  const titled = (items: { title: string; body: string }[]) => bullets(items.map((i) => `${i.title}: ${i.body}`));
  return [
    doc(h2(c.approach.heading), (c.approach.paragraphs as string[]).join('\n\n'), titled(c.approach.items)),
    doc(
      h2(c.capabilities.heading),
      c.capabilities.intro,
      ...(c.capabilities.tabs as { heading: string; paragraphs: string[]; activities: string[] }[]).map((tab) => doc(`### ${tab.heading}`, tab.paragraphs.join('\n\n'), bullets(tab.activities))),
    ),
    doc(h2(c.integration.heading), (c.integration.paragraphs as string[]).join('\n\n'), titled(c.integration.points)),
    doc(h2(c.bim.heading), (c.bim.paragraphs as string[]).join('\n\n'), titled(c.bim.items)),
    doc(h2(c.missionCritical.heading), (c.missionCritical.paragraphs as string[]).join('\n\n'), titled(c.missionCritical.items)),
    doc(
      h2(c.delivery.heading),
      c.delivery.intro,
      ...(c.delivery.rows as { title: string; body: string; items: string[] }[]).map((row) => doc(`### ${row.title}`, row.body, bullets(row.items))),
    ),
  ];
}

/** Manufacturing-only sections, mirroring the page. */
function mfgPageSections(): string[] {
  const m = servicesCopy.manufacturingPage;
  const titled = (items: { title: string; body: string }[]) => bullets(items.map((i) => `${i.title}: ${i.body}`));
  return [
    doc(h2(m.whyOffsite.heading), m.whyOffsite.intro, titled(m.whyOffsite.items)),
    doc(h2(m.whiteSpaces.heading), (m.whiteSpaces.body as string[]).join('\n\n'), titled(m.whiteSpaces.items)),
    doc(h2(m.eHouses.heading), (m.eHouses.body as string[]).join('\n\n'), titled(m.eHouses.items), m.eHouses.note),
    doc(h2(m.range.heading), m.range.intro, ...(m.range.topics as { title: string; body: string; items: string[] }[]).map((topic) => doc(`### ${topic.title}`, topic.body, bullets(topic.items)))),
    doc(h2(m.testing.heading), m.testing.intro, titled(m.testing.items), bullets((m.testing.standards as { code: string; label: string }[]).map((s) => `${s.code} (${s.label})`))),
    doc(h2(m.factories.heading), m.factories.intro, bullets((m.factories.countries as { name: string; body: string }[]).map((c) => `${c.name}: ${c.body}`))),
    doc(h2(m.sectors.heading), titled(m.sectors.items)),
  ];
}

/** MEP-only sections, mirroring the page: coordination, key figures and the technical disciplines (intro + full scope). */
function mepPageSections(): string[] {
  const mep = servicesCopy.mepPage;
  return [
    doc(h2(mep.integration.heading), (mep.integration.paragraphs as string[]).join('\n\n')),
    doc(h2('Key Figures'), bullets([`350+ ${mep.stats.projects}`, `140 ${mep.stats.bimEngineers}`, `6,000 ${mep.stats.workforce}`])),
    doc(h2(mep.disciplinesSection.heading), ...mepDisciplineBlocks('###')),
  ];
}

function generateUmbrellaPages() {
  for (const [path, page] of Object.entries(umbrellaPages)) {
    const content = doc(
      h1(page.seo.title),
      bq(page.hero.description),
      ...(path === '/services/mep' ? mepPageSections() : []),
      ...(path === '/services/manufacturing-prefabrication' ? mfgPageSections() : []),
      ...(path === '/services/turnkey-developments' ? epcPageSections() : []),
      ...(path === '/services/civil' ? civilPageSections() : []),
      ...(page.projects
        ? [
            doc(
              h2(page.projects.eyebrow),
              path === '/services/mep' ? '' : page.projects.intro,
              bullets(
                Object.entries(page.projects.items).map(([slug, item]) => {
                  const project = projects.find((p) => p.slug === slug);
                  return linkLine(project?.title ?? slug, llmsUrl(`/projects/${slug}`), `${item.summary} (${item.fact})`);
                }),
              ),
            ),
          ]
        : []),
      ...(page.faq ? [doc(h2('Frequently Asked Questions'), ...page.faq.items.map((item) => `### ${item.question}

${item.answer}`))] : []),
      {
        hr: true,
        text: doc(h2('Related Pages'), linkLine('All Services', llmsUrl('/services'))),
      },
    );
    write(path, content);
  }
}

function generateDataCenters() {
  const dc = servicesCopy.dataCenter;
  const dcProjects = projects.filter((p) => p.category === 'advanced-technical-facilities');

  const content = doc(
    h1(dc.seo.title),
    bq(dc.hero.description),

    doc(h2('Overview'), (dc.introParagraphs as string[]).join('\n\n')),
    doc(
      h2('Capabilities'),
      bullets((dc.capabilities as Array<{ title: string; description: string }>).map((c) => `${c.title}: ${c.description}`)),
    ),
    doc(
      h2(dc.prefab.heading),
      dc.prefab.snippet,
      ...(dc.prefab.groups as { label: string; items: string[] }[]).map((g) => `### ${g.label}\n\n${bullets(g.items)}`),
    ),
    // Local energy markets (the page's region tabs): every region's market context,
    // constraints, how MENASCO helps and its competitive advantage, with sources.
    doc(
      h2(`${dcTechnical.energy.eyebrow}: ${dcTechnical.energy.heading}`),
      citeRefs(dcTechnical.energy.intro),
      ...dcTechnical.energy.markets.map((m) =>
        doc(
          `### ${dcTechnical.energy.frontTitlePrefix} ${m.inName}`,
          citeRefs(m.body),
          `**${dcTechnical.energy.constraintsLabel}:**\n\n${bullets(m.constraints)}`,
          `#### ${dcTechnical.energy.backTitlePrefix} ${m.inName}`,
          m.help,
          `**${dcTechnical.energy.advantageLabel}:**\n\n${bullets(m.advantage)}`,
          `Link: ${pageUrl('/services/data-centers')}#${m.slug}`,
        ),
      ),
      `**Sources:**\n\n${TECHNICAL_SOURCES.map((src, i) => `${i + 1}. [${src.title}](${src.url}), ${src.publisher}, ${src.year}`).join('\n')}`,
    ),
    doc(h2('Frequently Asked Questions'), ...(dc.faq as { title: string; content: string }[]).map((item) => `### ${item.title}\n\n${item.content}`)),

    dcProjects.length > 0 && {
      hr: true,
      text: doc(
        h2('Relevant Projects'),
        bullets(dcProjects.map((p) => linkLine(p.title, llmsUrl(`/projects/${p.slug}`), [formatLocation(p), p.capacity].filter(Boolean).join(' | ')))),
      ),
    },

    {
      hr: true,
      text: doc(h2('Related Pages'), linkLine('All Services', llmsUrl('/services'))),
    },
  );
  write('/services/data-centers', content);
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

function generateProjectsCategories() {
  const cp = projectsCopy.categoriesPage;
  const content = doc(
    h1('MENASCO Projects'),
    bq(cp.description),

    doc(
      h2('Sectors'),
      bullets(
        publishedCategories.map((c) => {
          const count = projects.filter((p) => p.category === c.slug).length;
          return `${c.title} (${count}): ${c.description}`;
        }),
      ),
    ),

    {
      hr: true,
      text: doc(
        h2('All Projects'),
        bullets(projects.map((p) => linkLine(p.title, llmsUrl(`/projects/${p.slug}`), formatLocation(p)))),
      ),
    },

    {
      hr: true,
      text: doc(h2('Related Pages'), linkLine('All Services', llmsUrl('/services'))),
    },
  );
  write('/projects/categories', content);
}

function generateProjectDetail() {
  for (const p of projects) {
    const overviewFacts: string[] = [];
    if (p.sector) overviewFacts.push(`Sector: ${p.sector}`);
    if (p.category) overviewFacts.push(`Category: ${projectCategoryList.find((c) => c.slug === p.category)?.title ?? p.category}`);
    overviewFacts.push(`Location: ${formatLocation(p)}`);
    if (p.status) overviewFacts.push(`Status: ${p.status}`);
    if (p.year) overviewFacts.push(`Year: ${p.year}`);
    if (p.capacity) overviewFacts.push(`Capacity: ${p.capacity}`);

    const relatedServices = relatedServicesForCategory(p.category);
    const otherInCategory = projects.filter((other) => other.category && other.category === p.category && other.slug !== p.slug);

    const content = doc(
      h1(p.title),
      p.description ? bq(p.description) : undefined,

      doc(h2('Project Overview'), bullets(overviewFacts)),
      p.menascoScope && doc(h2('MENASCO Scope'), p.menascoScope),
      p.services.length > 0 && doc(h2('Technical Highlights'), bullets(p.services)),
      (p.workforceHours || p.safetyRecord) &&
        doc(
          h2('Safety & Delivery'),
          bullets([p.workforceHours && `Workforce hours: ${p.workforceHours}`, p.safetyRecord && `Safety record: ${p.safetyRecord}`].filter(Boolean) as string[]),
        ),

      relatedServices.length > 0 && {
        hr: true,
        text: doc(h2('Related Services'), bullets(relatedServices.map((s) => linkLine(s.name, llmsUrl(`/services/${s.slug}`))))),
      },

      otherInCategory.length > 0 && {
        hr: true,
        text: doc(
          h2('Related Projects'),
          bullets(otherInCategory.slice(0, 6).map((other) => linkLine(other.title, llmsUrl(`/projects/${other.slug}`), formatLocation(other)))),
        ),
      },

      {
        hr: true,
        text: doc(h2('Related Pages'), linkLine('All Projects', llmsUrl('/projects/categories'))),
      },
    );
    write(`/projects/${p.slug}`, content);
  }
}

// ---------------------------------------------------------------------------
// Newsroom — withheld per Phase 0 decision: data/news.ts is explicitly
// fictional placeholder content (see that file's own header comment). Ship
// an honest empty index; generate zero per-article files until real
// articles exist.
// ---------------------------------------------------------------------------

function generateNewsroom() {
  const content = doc(
    h1('Newsroom'),
    bq('No published newsroom articles are available yet.'),
    {
      hr: true,
      text: doc(h2('Related Pages'), linkLine('About MENASCO', llmsUrl('/about'))),
    },
  );
  write('/newsroom', content);
}

// ---------------------------------------------------------------------------
// Legal (Careers is an external app — see CAREERS_URL — so it has no llms.txt here)
// ---------------------------------------------------------------------------

function generateLegal() {
  for (const [key, path, title] of [
    ['privacy', '/privacy-policy', 'Privacy Policy'],
    ['terms', '/terms', 'Terms of Use'],
  ] as const) {
    const entry = legal[key];
    const content = doc(
      h1(title),
      bq(entry.body),
      entry.contactNote && entry.contactNote.replace('{{email}}', primaryContact.email),
      {
        hr: true,
        text: doc(h2('Related Pages'), linkLine('About MENASCO', llmsUrl('/about'))),
      },
    );
    write(path, content);
  }
}

/**
 * Summarizes the LYNX Privacy Policy's existence, scope and section list —
 * does not reproduce or expand the legal text itself (that stays exclusively
 * on the actual policy page, sourced verbatim from data/lynxqcPrivacyPolicy.ts).
 */
function generateLynxqcPrivacyPolicy() {
  const content = doc(
    h1('LYNX Privacy Policy'),
    bq(
      'Privacy policy for LYNX, a construction site reporting and quality management platform used by authorized MENASCO employees, contractors, consultants, clients, and project stakeholders.',
    ),
    `Last updated: ${lynxqcPrivacyPolicyLastUpdated}. Available in English only.`,
    doc(h2('Sections'), bullets(lynxqcPrivacyPolicySections.map((s) => s.heading))),
    doc(h2('Contact'), `Privacy-related questions or requests: ${lynxqcPrivacyPolicyContactEmail}`),
    {
      hr: true,
      text: doc(
        h2('Related Pages'),
        bullets([linkLine('Innovation & Technology', llmsUrl('/innovation-technology')), linkLine('About MENASCO', llmsUrl('/about'))]),
      ),
    },
  );
  write('/lynxqc/privacy-policy', content);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

// Remove the old architecture entirely — this page-centric tree replaces it,
// not runs alongside it.
rmSync(join(PUBLIC_DIR, 'llms'), { recursive: true, force: true });
if (existsSync(join(PUBLIC_DIR, 'projects', 'llms.txt'))) rmSync(join(PUBLIC_DIR, 'projects', 'llms.txt'), { force: true });
rmSync(join(PUBLIC_DIR, 'careers'), { recursive: true, force: true });

generateHome();
generateAbout();
generateTeam();
generateLeadershipProfiles();
generateQualitySafety();
generateCommunity();
generateCertificationTraining();
generateInnovation();
generateContact();
generateServicesIndex();
generateServiceDetail();
generateUmbrellaPages();
generateDataCenters();
generateProjectsCategories();
generateProjectDetail();
generateNewsroom();
generateLegal();
generateLynxqcPrivacyPolicy();

// eslint-disable-next-line no-console
console.log(`Generated page-centric llms.txt tree under public/ (SITE_URL=${SITE_URL}).`);
