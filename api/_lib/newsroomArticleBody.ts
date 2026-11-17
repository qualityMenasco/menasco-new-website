/**
 * Renders a published Newsroom article's real body — category, publish
 * date, title, subtitle, structured-content sections, and a couple of
 * internal links — into plain, dependency-free HTML for
 * `api/newsroom-article-page.ts` to inject into its response.
 *
 * This is a DELIBERATE, hand-written duplicate of
 * `src/components/news/ArticleStructuredContent.tsx`'s rendering logic
 * (same block types, same linkify behavior for bare/markdown-style URLs),
 * not a reuse of that component — see `api/_lib/newsroomSeo.ts`'s module
 * comment for why: Vercel's Node function runtime resolves every relative
 * import with real Node ESM semantics (explicit `.js` extensions
 * required, including every transitive import), but the whole
 * `src/components` + `src/lib` tree is written in Vite/bundler-style
 * extensionless imports. Importing the real React component here would
 * require rewriting that entire import chain just to satisfy this one
 * function — a much larger, riskier change than duplicating this
 * rendering logic. If `ArticleStructuredContent.tsx`'s block types or
 * linkify behavior ever change, update both files together.
 *
 * This output is a crawler-visible static snapshot only — the live
 * `NewsDetailPage` still mounts over it and fetches/renders the real,
 * interactive article client-side (see that file and `ArticleImageGallery`
 * for the actual on-page experience, including video playback). A visitor
 * with JS enabled briefly sees this content replaced by the client's own
 * loading state before the real article renders — the same trade-off
 * `scripts/seo/prerender.ts` existed to remove for static routes, which
 * isn't available here because the client's `NewsDetailPage` fetches its
 * data asynchronously and can't deterministically hydrate against
 * pre-fetched markup without a larger architecture change. Documented as
 * a known limitation, not an oversight.
 */

export interface ArticleBodyImage {
  id: string;
  mediaType: 'image' | 'video';
  altText: string | null;
  caption: string | null;
  url: string;
}

export type ArticleBodyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level?: 2 | 3 }
  | { type: 'bullet_list'; items: string[] }
  | { type: 'numbered_list'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'image'; imageId: string; caption?: string };

export interface ArticleBodySection {
  heading?: string;
  blocks: ArticleBodyBlock[];
}

export interface ArticleBodyTag {
  name: string;
  slug: string;
}

export interface ArticleBodyInput {
  title: string;
  subtitle: string | null;
  category: string | null;
  publishedAt: string;
  tags: ArticleBodyTag[];
  structuredContent: { sections: ArticleBodySection[] };
  images: ArticleBodyImage[];
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Mirrors ArticleStructuredContent.tsx's LINK_PATTERN/TRAILING_PUNCTUATION exactly — bare or markdown-style (`[label](url)`) http(s) URLs become real `<a>` tags; nothing else (mailto:, javascript:, etc.) is ever linkified, and no raw HTML from the article text itself is ever passed through unescaped. */
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>"')\]]+)/g;
const TRAILING_PUNCTUATION = /[.,;:!?)\]]+$/;

function linkifyHtml(text: string): string {
  let html = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = LINK_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) html += escapeHtml(text.slice(lastIndex, match.index));

    if (match[1] && match[2]) {
      html += `<a href="${escapeHtml(match[2])}" target="_blank" rel="noopener noreferrer">${escapeHtml(match[1])}</a>`;
    } else if (match[3]) {
      const trailing = match[3].match(TRAILING_PUNCTUATION)?.[0] ?? '';
      const url = trailing ? match[3].slice(0, -trailing.length) : match[3];
      html += `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`;
      if (trailing) html += escapeHtml(trailing);
    }

    lastIndex = LINK_PATTERN.lastIndex;
  }
  if (lastIndex < text.length) html += escapeHtml(text.slice(lastIndex));
  return html;
}

function renderBlock(block: ArticleBodyBlock, images: ArticleBodyImage[]): string {
  switch (block.type) {
    case 'paragraph':
      return `<p>${linkifyHtml(block.text)}</p>`;
    case 'heading': {
      const tag = block.level === 2 ? 'h3' : 'h4';
      return `<${tag}>${linkifyHtml(block.text)}</${tag}>`;
    }
    case 'bullet_list':
      return `<ul>${block.items.map((item) => `<li>${linkifyHtml(item)}</li>`).join('')}</ul>`;
    case 'numbered_list':
      return `<ol>${block.items.map((item) => `<li>${linkifyHtml(item)}</li>`).join('')}</ol>`;
    case 'quote':
      return `<blockquote>${linkifyHtml(block.text)}</blockquote>`;
    case 'image': {
      const image = images.find((img) => img.id === block.imageId);
      if (!image || image.mediaType === 'video') return '';
      const caption = block.caption || image.caption;
      return `<figure><img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.altText ?? '')}" loading="lazy" />${
        caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''
      }</figure>`;
    }
  }
}

function renderSection(section: ArticleBodySection, images: ArticleBodyImage[]): string {
  const heading = section.heading ? `<h3>${escapeHtml(section.heading)}</h3>` : '';
  return `${heading}${section.blocks.map((block) => renderBlock(block, images)).join('')}`;
}

/** Same rule as src/seo/SEO.tsx / scripts/seo/routes.ts's humanizeCategory fallback — turns a raw category slug like "company-news" into "Company News". English only: there is no independent Arabic article content to localize this into (see buildArticleHtml's own documented /ar limitation). */
function humanizeCategory(category: string): string {
  return category.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Mirrors src/lib/formatDate.ts's formatNewsDate output format (e.g. "10 AUG 2026") for the English-only body shell — duplicated for the same Node-ESM-import reason documented at the top of this file. */
function formatPublishedDate(iso: string): string {
  const date = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).toUpperCase();
}

/**
 * Builds the crawlable `<body>` inner HTML for a published article —
 * category eyebrow + date, title, subtitle, the real structured-content
 * sections, and a "Related Topics" tag list, each as real visible text
 * and real `<a href>` internal links (`/newsroom`, `/newsroom?tag=<slug>`
 * — the same filter URL `ArticleTopics.tsx`/`NewsroomPage.tsx` use on the
 * live site).
 */
export function renderArticleBodyHtml(article: ArticleBodyInput): string {
  const dateLabel = formatPublishedDate(article.publishedAt);
  const categoryLabel = article.category ? humanizeCategory(article.category) : '';
  const sectionsHtml = article.structuredContent.sections.map((section) => renderSection(section, article.images)).join('');
  const tagsHtml =
    article.tags.length > 0
      ? `<nav aria-label="Related Topics"><p>Related Topics</p><ul>${article.tags
          .map((tag) => `<li><a href="/newsroom?tag=${escapeHtml(tag.slug)}">${escapeHtml(tag.name)}</a></li>`)
          .join('')}</ul></nav>`
      : '';

  return `<a href="/newsroom">Back to Newsroom</a>
<article>
  <header>
    ${categoryLabel ? `<p>${escapeHtml(categoryLabel)}</p>` : ''}
    ${dateLabel ? `<p><time>${escapeHtml(dateLabel)}</time></p>` : ''}
    <h1>${escapeHtml(article.title)}</h1>
    ${article.subtitle ? `<p>${escapeHtml(article.subtitle)}</p>` : ''}
  </header>
  ${sectionsHtml}
</article>
${tagsHtml}`;
}
