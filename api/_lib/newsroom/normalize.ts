import type { CleanedPage } from './textClean';
import type { ArticleSection, ContentBlock } from './structuredContent';

/**
 * Deterministic cleaned-text -> `sections[]` structuring. No model call, no
 * invention: every word in the output comes from the source PDF, this only
 * decides where paragraph/heading/list boundaries fall.
 *
 * Deliberately does NOT attempt to detect pull quotes: nothing in a plain
 * text layer reliably distinguishes a pull quote from ordinary body text
 * (no font-size/style signal survives this extraction path), and guessing
 * would risk misclassifying real body text. The `quote` block type stays in
 * the schema for a future style-aware pass; this normalizer never emits one.
 *
 * The old static content model's fixed "intro / sections / closing" slots
 * are a UI artifact, not a structural requirement — this instead treats
 * every heading-delimited run of content as one section, where only the
 * leading section (before the first detected heading, if any) can be
 * headless. That headless leading section is exactly the frontend's
 * existing `body[]` "intro paragraphs" slot.
 */

interface RawLine {
  text: string;
  page: number;
}

const BULLET_MARKER = /^[•●▪○\-*]\s+(.*)$/;
const NUMBERED_MARKER = /^(\d{1,3})[.)]\s+(.*)$/;
const TERMINAL_PUNCTUATION = /[.!?][")”]?$/;

/**
 * Lowercase connector words that stay lowercase in real Title Case
 * headings ("Summary of Findings", "Engineering & Technology") — excluded
 * from the title-case check below so they don't count against a real
 * heading, without being able to argue FOR one either.
 */
const TITLE_CASE_STOPWORDS = new Set([
  'of', 'and', 'or', 'the', 'a', 'an', 'to', 'in', 'on', 'at', 'for',
  'with', 'from', 'as', 'nor', 'per', 'via', 'by',
]);

/**
 * The one signal that survives this extraction path (no font-size/weight
 * metadata is retained — see pdfExtract.ts) which reliably tells a real
 * heading apart from an ordinary sentence that merely occupies one short
 * physical line because of PDF line-wrapping: real headings are
 * conventionally rendered in Title Case (every significant word
 * capitalized — "Project Update", "Engineering & Technology"), while a
 * wrapped sentence fragment is in normal sentence case (only its first
 * word capitalized by ordinary English orthography — "This controlled
 * document is being used to verify PDF"). The sentence-initial word is
 * excluded from the check on both sides of that comparison, since regular
 * sentence-initial capitalization makes it uninformative either way.
 */
function isTitleCaseLike(line: string): boolean {
  const words = line.split(/\s+/).filter((word) => /[A-Za-z]/.test(word));
  const significant = words.slice(1).filter((word) => !TITLE_CASE_STOPWORDS.has(word.toLowerCase()));
  if (significant.length === 0) return true; // nothing left that could disprove it (e.g. a single-word heading)
  return significant.every((word) => /^[A-Z0-9À-Ü]/.test(word));
}

function isHeadingCandidate(line: string): boolean {
  if (line.length < 3 || line.length > 80) return false;
  if (TERMINAL_PUNCTUATION.test(line)) return false;
  if (BULLET_MARKER.test(line) || NUMBERED_MARKER.test(line)) return false;
  if (!/^[A-Z0-9À-Ü]/.test(line)) return false;
  const wordCount = line.split(/\s+/).length;
  if (wordCount > 12) return false;
  return isTitleCaseLike(line);
}

function sortedPages(pages: Set<number>): number[] {
  return Array.from(pages).sort((a, b) => a - b);
}

interface SectionBuilder {
  heading?: string;
  blocks: ContentBlock[];
  pages: Set<number>;
}

function finalizeSection(builder: SectionBuilder): ArticleSection | null {
  if (builder.blocks.length === 0) return null;
  const section: ArticleSection = { blocks: builder.blocks, sourcePages: sortedPages(builder.pages) };
  if (builder.heading) section.heading = builder.heading;
  return section;
}

export function normalizeToSections(pages: CleanedPage[]): ArticleSection[] {
  const flat: RawLine[] = [];
  for (const page of pages) {
    for (const line of page.lines) flat.push({ text: line, page: page.pageNumber });
  }

  const sections: ArticleSection[] = [];
  let current: SectionBuilder = { blocks: [], pages: new Set() };

  let paragraphBuffer: string[] = [];
  let paragraphPages = new Set<number>();
  let listItems: string[] = [];
  let listType: 'bullet_list' | 'numbered_list' | null = null;
  let listPages = new Set<number>();

  function flushParagraph() {
    if (paragraphBuffer.length === 0) return;
    current.blocks.push({
      type: 'paragraph',
      text: paragraphBuffer.join(' '),
      sourcePages: sortedPages(paragraphPages),
    });
    for (const p of paragraphPages) current.pages.add(p);
    paragraphBuffer = [];
    paragraphPages = new Set();
  }

  function flushList() {
    if (listItems.length === 0 || !listType) return;
    current.blocks.push({ type: listType, items: listItems, sourcePages: sortedPages(listPages) });
    for (const p of listPages) current.pages.add(p);
    listItems = [];
    listType = null;
    listPages = new Set();
  }

  function flushSection() {
    flushParagraph();
    flushList();
    const finalized = finalizeSection(current);
    if (finalized) sections.push(finalized);
    current = { blocks: [], pages: new Set() };
  }

  for (const line of flat) {
    const bulletMatch = line.text.match(BULLET_MARKER);
    const numberedMatch = line.text.match(NUMBERED_MARKER);

    if (bulletMatch || numberedMatch) {
      flushParagraph();
      const itemType = bulletMatch ? 'bullet_list' : 'numbered_list';
      if (listType && listType !== itemType) flushList();
      listType = itemType;
      listItems.push((bulletMatch ?? numberedMatch)![bulletMatch ? 1 : 2]);
      listPages.add(line.page);
      continue;
    }

    // A heading only starts a new section when it's not interrupting an
    // in-progress paragraph or list (a short standalone line mid-sentence
    // isn't a heading — it just happens to look like one in isolation), AND
    // not when the current section already has a heading with zero content
    // under it yet. Without that second guard, a wrapped title/lead-in line
    // that happens to itself look heading-like (short, no terminal
    // punctuation, title case — common for the first physical line of a
    // multi-line paragraph) would silently discard the real heading: since
    // finalizeSection() drops any section with zero blocks, the real
    // heading would be flushed away with nothing under it. Falling through
    // to the paragraph branch instead reconstructs it as the start of the
    // section's body text, which is what it actually is.
    const hasPendingEmptyHeading = current.heading !== undefined && current.blocks.length === 0;
    if (paragraphBuffer.length === 0 && listItems.length === 0 && isHeadingCandidate(line.text) && !hasPendingEmptyHeading) {
      flushSection();
      current.heading = line.text;
      continue;
    }

    flushList();
    paragraphBuffer.push(line.text);
    paragraphPages.add(line.page);
    if (TERMINAL_PUNCTUATION.test(line.text)) flushParagraph();
  }

  flushSection();
  return sections;
}
