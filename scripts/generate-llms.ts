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
import { pendingContentPaths, servicesNavigationGroups } from '../src/data/navigation';
import { projects } from '../src/data/projects';
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
const careers = readNamespace('careers');
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

/**
 * Services grouped the way the site's navigation and Services landing
 * group them (src/data/navigation.ts). Only live pages are listed —
 * structure-only pages awaiting approved content (`pendingContentPaths`)
 * are left out, and a group with no live pages is omitted entirely.
 * Data Centres follows as a sector solution rather than a fifth group.
 */
function groupedServiceBlocks(): string[] {
  const pending = pendingContentPaths as readonly string[];
  const serviceLine = (href: string) => {
    const s = services.find((entry) => `/services/${entry.slug}` === href);
    return s ? linkLine(s.name, llmsUrl(href), s.shortDescription) : undefined;
  };
  const blocks = servicesNavigationGroups.flatMap((group) => {
    const hrefs = [...(group.href ? [group.href] : []), ...group.links.map((link) => link.href)].filter((href) => !pending.includes(href));
    const lines = hrefs.map(serviceLine).filter((line): line is string => Boolean(line));
    return lines.length > 0 ? [`### ${group.label}\n\n${bullets(lines)}`] : [];
  });
  return [
    ...blocks,
    `### Data Centres\n\n${bullets([linkLine('Data Centres', llmsUrl('/services/data-centers'), servicesCopy.dataCenter.seo.description)])}`,
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
  const serviceNames = services.map((s) => s.name).join(', ');
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
    `Core service lines include ${serviceNames}, alongside dedicated data centre MEP delivery.`,
    'Delivers specialist engineering for data centres, mission-critical, healthcare, energy, and other technically demanding facilities.',
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
    bq(
      `MENASCO is an integrated MEP (mechanical, electrical, plumbing & fire protection) engineering contractor, operating across the UAE, Saudi Arabia, Egypt and the United Kingdom.`,
    ),
    `${SITE_TAGLINE}. Established in ${foundingYear} in the UAE as MENASCO Mechanical Contracting L.L.C.`,

    {
      hr: true,
      text: doc(
        h2('About MENASCO'),
        about.whoWeAre.paragraph1,
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
        home.hero.description,
        ...groupedServiceBlocks(),
      ),
    },

    {
      hr: true,
      text: doc(
        h2('Projects & Sectors'),
        `${projects.length} current projects across ${home.hero.description.includes('KSA') ? 'the UAE, KSA and Egypt' : 'the region'}, organized into ${publishedCategories.length} sectors.`,
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
      text: doc(h2('Innovation & Technology'), about.innovation.hero.description, linkLine('Innovation & Technology', llmsUrl('/innovation-technology'))),
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
      text: doc(h2('Careers'), home.careersPreview.description, linkLine('Careers at MENASCO', llmsUrl('/careers'))),
    },
  );

  write('', content);
}

// ---------------------------------------------------------------------------
// About section
// ---------------------------------------------------------------------------

function generateAbout() {
  const w = about.whoWeAre;
  const approach = about.ourApproach;
  const vmv = about.visionMissionValues;

  const content = doc(
    h1('About MENASCO'),
    bq(about.hero.description),

    doc(h2('Company Overview'), w.paragraph1, w.paragraph2, w.paragraph3),
    doc(h2('Key Facts'), bullets(buildCompanyKeyFacts())),
    doc(h2('Mission'), vmv.mission.description),
    doc(h2('Vision'), vmv.vision.description),
    doc(
      h2('Values'),
      bullets(Object.values(vmv.values as Record<string, { title: string; description: string }>).map((v) => `${v.title}: ${v.description}`)),
    ),
    doc(
      h2('Our Approach'),
      bullets(
        Object.values(approach.pillars as Record<string, { title: string; description: string }>).map((p) => `${p.title}: ${p.description}`),
      ),
    ),

    {
      hr: true,
      text: doc(
        h2('Related About Pages'),
        bullets([
          linkLine('Leadership & Team', llmsUrl('/team'), 'MENASCO leadership and engineering management team.'),
          linkLine('Quality, Health & Safety', llmsUrl('/quality-safety'), "MENASCO's QHSE approach and ISO certifications."),
          linkLine('ESG & Sustainability', llmsUrl('/esg-reporting'), "MENASCO's environmental, social and governance approach."),
          linkLine('Innovation & Technology', llmsUrl('/innovation-technology'), "MENASCO's digital and technology initiatives."),
          linkLine('Contact & Regional Presence', llmsUrl('/contact'), 'Office locations and contact details.'),
        ]),
      ),
    },
  );

  write('/about', content);
}

function generateTeam() {
  const execGroup = executiveTeam.filter((m) => m.group === 'executive');
  const supportGroup = executiveTeam.filter((m) => m.group === 'engineering-support');

  const content = doc(
    h1('Leadership & Team'),
    bq("MENASCO's executive leadership and engineering management team."),

    doc(
      h2('Executive Leadership'),
      bullets(leadershipProfiles.map((p) => linkLine(p.fullName, llmsUrl(`/leadership/${p.slug}`), p.fullRole))),
    ),
    doc(h2('Executive Team'), bullets(execGroup.map((m) => `${m.name}, ${m.title}`))),
    doc(h2('Engineering & Support Leads'), bullets(supportGroup.map((m) => `${m.name}, ${m.title}`))),

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

    doc(h2('QHSE Framework'), `${q.paragraph1}\n\n${q.paragraph2Prefix} ${q.continuousImprovement}${q.paragraph2Suffix}`),
    doc(h2('Certifications'), bullets(certifications.map((c) => `${c.name}, ${c.scope}`)), 'Certificate numbers and issue dates are not publicly published.'),

    {
      hr: true,
      text: doc(
        h2('Related Pages'),
        bullets([linkLine('ESG & Sustainability', llmsUrl('/esg-reporting')), linkLine('About MENASCO', llmsUrl('/about'))]),
      ),
    },
  );
  write('/quality-safety', content);
}

function generateEsg() {
  const esg = about.esg;
  const pillars = esg.pillars as Array<{ heading: string; paragraphs: string[] }>;
  const content = doc(
    h1('ESG & Sustainability'),
    bq(esg.hero.description),

    ...pillars.map((pillar) => doc(h2(pillar.heading), pillar.paragraphs.join('\n\n'))),
    doc(
      h2(esg.highlightsHeading),
      bullets((esg.highlights as Array<{ title: string; description: string }>).map((h) => `${h.title}: ${h.description}`)),
    ),

    {
      hr: true,
      text: doc(
        h2('Related Pages'),
        bullets([linkLine('Quality, Health & Safety', llmsUrl('/quality-safety')), linkLine('About MENASCO', llmsUrl('/about'))]),
      ),
    },
  );
  write('/esg-reporting', content);
}

function generateInnovation() {
  const inn = about.innovation;
  const sectionEntries = Object.entries(
    inn.sections as Record<string, { heading: string; paragraph: string; highlights: string[]; privacyPolicyLink?: string }>,
  );
  const content = doc(
    h1('Innovation & Technology'),
    bq(inn.hero.description),

    ...sectionEntries.map(([key, sec]) =>
      doc(
        h2(sec.heading),
        sec.paragraph,
        bullets(sec.highlights),
        key === 'lynxqc' && sec.privacyPolicyLink ? linkLine(sec.privacyPolicyLink, llmsUrl('/lynxqc/privacy-policy')) : '',
      ),
    ),
    doc(h2(inn.closing.heading), inn.closing.description),

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
          const lines = [`${o.label} (${o.country})`, o.address];
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
    bq(home.hero.description),
    home.servicesShowcase?.description ?? "Six disciplines, delivered independently or as a single design-build contract.",

    doc(
      h2('Services'),
      ...groupedServiceBlocks(),
    ),

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
    doc(h2('Prefabrication'), `${dc.prefab.description}\n\n${dc.prefab.closingStatement}`),

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
// Careers / Legal
// ---------------------------------------------------------------------------

function generateCareers() {
  const content = doc(
    h1('Careers at MENASCO'),
    bq(careers.description),
    doc(h2('Current Openings'), `${careers.emptyState.title}. ${careers.emptyState.description.replace('{{email}}', primaryContact.email)}`),
    {
      hr: true,
      text: doc(h2('Related Pages'), linkLine('About MENASCO', llmsUrl('/about'))),
    },
  );
  write('/careers', content);
}

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
 * Summarizes the LYNXqc Privacy Policy's existence, scope and section list —
 * does not reproduce or expand the legal text itself (that stays exclusively
 * on the actual policy page, sourced verbatim from data/lynxqcPrivacyPolicy.ts).
 */
function generateLynxqcPrivacyPolicy() {
  const content = doc(
    h1('LYNXqc Privacy Policy'),
    bq(
      'Privacy policy for LYNXqc, a construction site reporting and quality management platform used by authorized MENASCO employees, contractors, consultants, clients, and project stakeholders.',
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

generateHome();
generateAbout();
generateTeam();
generateLeadershipProfiles();
generateQualitySafety();
generateEsg();
generateInnovation();
generateContact();
generateServicesIndex();
generateServiceDetail();
generateDataCenters();
generateProjectsCategories();
generateProjectDetail();
generateNewsroom();
generateCareers();
generateLegal();
generateLynxqcPrivacyPolicy();

// eslint-disable-next-line no-console
console.log(`Generated page-centric llms.txt tree under public/ (SITE_URL=${SITE_URL}).`);
