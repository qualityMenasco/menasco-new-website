/**
 * Fallback meta description for a project that has no editorial
 * `seoDescription` set in src/data/projects.ts. Built only from fields that
 * already exist on the record (location, country, category) — never
 * invented. Pure/no React, no Node APIs — importable from both
 * ProjectDetailPage.tsx (client) and scripts/generate-seo-html.ts (the
 * postbuild prerender script), so the client-rendered and crawler-visible
 * descriptions can never drift apart.
 */

/** "Dubai Marina, UAE" plus a `country` of "UAE" would otherwise render as "Dubai Marina, UAE, UAE" — only appends `country` when it isn't already present in `location`. */
export function formatProjectLocation(location: string, country: string): string {
  const parts = [location].filter(Boolean);
  if (country && !location.toLowerCase().includes(country.toLowerCase())) parts.push(country);
  return parts.filter(Boolean).join(', ');
}

export function buildProjectFallbackDescription(input: {
  title: string;
  location: string;
  country: string;
  categoryTitle?: string;
  /** e.g. "12 MW IT" — several project records share a short title (e.g. "Data Centre III") that only becomes distinct with its capacity, which is why it's folded into the title here when present. */
  capacity?: string;
}): string {
  const where = formatProjectLocation(input.location, input.country);
  const scope = input.categoryTitle ? `${input.categoryTitle.toLowerCase()} project` : 'project';
  const whereClause = where ? ` in ${where}` : '';
  const titleWithCapacity = input.capacity ? `${input.title} (${input.capacity})` : input.title;
  return `${titleWithCapacity}: discover MENASCO's MEP engineering scope for this ${scope}${whereClause}.`;
}

/** Cuts at the last word boundary before `maxLength` rather than mid-word. */
export function truncateDescription(text: string, maxLength = 155): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

/**
 * `data/projects.ts`'s `seoDescription` is English-only — there is no
 * dedicated Arabic meta-description field per project. On an Arabic route,
 * prefer the project's already-Arabic-overlaid long-form `description`
 * (public/locales/ar/projects.json's `items.<slug>.description`, same
 * overlay pattern used for the visible page content) truncated to a sane
 * meta-description length, rather than showing the English seoDescription.
 * If no Arabic translation exists for this project at all (translated ===
 * raw English), there is genuinely no Arabic content to draw from — the
 * English fallback is used, same allowance already made for project names.
 */
export function pickProjectSeoDescription(input: {
  locale: 'en' | 'ar';
  seoDescription: string;
  translatedDescription: string;
  rawEnglishDescription: string;
  fallback: string;
}): string {
  const englishBase = input.seoDescription || input.fallback;
  if (input.locale !== 'ar') return englishBase;
  const hasArabicTranslation = input.translatedDescription !== input.rawEnglishDescription;
  return hasArabicTranslation ? truncateDescription(input.translatedDescription) : englishBase;
}
