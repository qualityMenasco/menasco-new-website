import { getDocumentProxy, extractTextItems, type StructuredTextItem } from 'unpdf';
import { HttpError } from '../http';

/**
 * Deterministic PDF -> raw per-page text extraction. `unpdf` wraps Mozilla's
 * pdf.js in a build made for serverless/edge runtimes (no native canvas
 * dependency on this text-only path, works inside a Vercel function) —
 * chosen over `pdf-parse` for that serverless-first design, and over
 * shelling out to a system binary (`pdftotext`/poppler) which Vercel's
 * Node runtime doesn't provide. This extracts real embedded text only —
 * no OCR. A scanned/image-only PDF will come back with little or no text;
 * `assertExtractableText` below turns that into a clean, explicit failure
 * rather than silently producing an empty article.
 *
 * Uses `extractTextItems` (per-item string + position + direction), NOT
 * `unpdf`'s own `extractText` helper — traced into `unpdf`'s source
 * (node_modules/unpdf/dist/index.mjs, `getPageText`) and confirmed it does
 * `items.map((item) => item.str + (item.hasEOL ? '\n' : '')).join('')`:
 * zero space is ever inserted between adjacent text items. PDF text layers
 * routinely split a single word across several small text-show operations
 * (kerning/ligature positioning — Arabic's contextual letter-shaping makes
 * this far more common than in Latin text, which is why English PDFs
 * mostly got away with it and Arabic ones didn't), so that helper silently
 * runs words together. This file reconstructs lines itself from item
 * position/width (`joinLineText` below) so a space is inserted exactly
 * where there's a real visual gap, not wherever `hasEOL` happens to fall.
 */

export interface ExtractedPdf {
  pageCount: number;
  pages: string[];
}

// Arabic script: main block, Supplement, Extended-A, and the Presentation
// Forms A/B blocks a PDF's ToUnicode CMap sometimes maps to directly
// instead of (or alongside) base-block codepoints.
const ARABIC_SCRIPT_RANGE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

function countScriptChars(str: string): { arabic: number; latin: number } {
  let arabic = 0;
  let latin = 0;
  for (const ch of str) {
    if (ARABIC_SCRIPT_RANGE.test(ch)) arabic++;
    else if (/[A-Za-z]/.test(ch)) latin++;
  }
  return { arabic, latin };
}

/**
 * A line's reading direction, decided from the Arabic-vs-Latin character
 * counts across every item on it — not `item.dir` alone (pdf.js derives
 * that per individual text run via its own heuristic, and runs on the same
 * visual line can legitimately disagree for mixed Arabic/English content,
 * e.g. an English product name inside an Arabic sentence; counting
 * characters directly gives one consistent, content-grounded answer per
 * line instead of trusting whichever run's `dir` happened to be checked).
 * Ties and script-free lines (pure digits/punctuation) default to 'ltr'.
 */
export function lineDirection(items: StructuredTextItem[]): 'rtl' | 'ltr' {
  let arabic = 0;
  let latin = 0;
  for (const item of items) {
    const counts = countScriptChars(item.str);
    arabic += counts.arabic;
    latin += counts.latin;
  }
  return arabic > latin ? 'rtl' : 'ltr';
}

/**
 * Groups one page's flat item list into visual lines. Primarily trusts
 * pdf.js's own `hasEOL` flag (it already does this analysis internally,
 * comparing successive items' baselines), with a same-page Y-proximity
 * check as a defensive fallback for the rare item where `hasEOL` is unset
 * but the next item is clearly on a new line (PDF's coordinate origin is
 * bottom-left, so page-content items normally arrive in descending-Y,
 * i.e. top-to-bottom, order — this only groups within that existing
 * stream order, it never re-sorts lines against each other).
 */
export function groupIntoLines(items: StructuredTextItem[]): StructuredTextItem[][] {
  const lines: StructuredTextItem[][] = [];
  let current: StructuredTextItem[] = [];
  let currentY: number | null = null;

  for (const item of items) {
    if (currentY !== null) {
      const tolerance = Math.max(item.height, item.fontSize, 1) * 0.6;
      if (Math.abs(item.y - currentY) > tolerance) {
        lines.push(current);
        current = [];
        currentY = null;
      }
    }
    current.push(item);
    currentY = item.y;
    if (item.hasEOL) {
      lines.push(current);
      current = [];
      currentY = null;
    }
  }
  if (current.length > 0) lines.push(current);

  return lines.filter((line) => line.some((item) => item.str.trim().length > 0));
}

/** The gap (0 if they overlap/touch) between two items' horizontal spans — direction-agnostic, so this works identically whether the pair is being read left-to-right or right-to-left. */
function spanGap(a: StructuredTextItem, b: StructuredTextItem): number {
  const aEnd = a.x + a.width;
  const bEnd = b.x + b.width;
  if (aEnd <= b.x) return b.x - aEnd;
  if (bEnd <= a.x) return a.x - bEnd;
  return 0;
}

/**
 * Below this fraction of the adjacent items' font size, a gap is treated as
 * intra-word (kerning/ligature positioning splitting one word into several
 * text-show items — common in general, routine for Arabic's contextual
 * letter shapes) rather than a real word boundary. A tuned heuristic, not a
 * guarantee — see this file's module comment and the regression tests
 * (pdfExtract.test.ts) for the gap sizes it was checked against.
 */
const WORD_GAP_FONT_SIZE_RATIO = 0.22;

/**
 * Reconstructs one visual line's text from its (unordered-by-reading-
 * direction) items: sorts them into actual reading order by physical X
 * position — ascending for LTR, descending for RTL — then joins them,
 * inserting a space only where the gap between adjacent items' spans is
 * wide enough to be a real word boundary.
 *
 * Sorting by physical position is applied for BOTH directions, not RTL
 * only: pdf.js's item array already usually matches a well-formed PDF's
 * logical reading order (items are normally emitted in content-stream
 * order, which normally matches how the text was authored), so re-sorting
 * by position is a no-op there — but some PDF generators, disproportion-
 * ately ones exporting Arabic content, emit glyphs in pure left-to-right
 * VISUAL drawing order regardless of the text's actual logical direction.
 * Sorting by position is the one strategy that's correct either way.
 */
export function joinLineText(items: StructuredTextItem[]): string {
  const nonEmpty = items.filter((item) => item.str.length > 0);
  if (nonEmpty.length === 0) return '';

  const direction = lineDirection(nonEmpty);
  const ordered = [...nonEmpty].sort((a, b) => (direction === 'rtl' ? b.x - a.x : a.x - b.x));

  let result = ordered[0].str;
  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1];
    const item = ordered[i];
    const threshold = Math.max(prev.fontSize, item.fontSize, 1) * WORD_GAP_FONT_SIZE_RATIO;
    if (spanGap(prev, item) > threshold && !/\s$/.test(result)) result += ' ';
    result += item.str;
  }
  return result.replace(/[ \t]+/g, ' ').trim();
}

export function reconstructPageText(items: StructuredTextItem[]): string {
  return groupIntoLines(items)
    .map(joinLineText)
    .filter((line) => line.length > 0)
    .join('\n');
}

export async function extractPdfText(pdfBytes: Buffer): Promise<ExtractedPdf> {
  let doc;
  try {
    doc = await getDocumentProxy(new Uint8Array(pdfBytes));
  } catch (err) {
    throw new HttpError(422, `Could not open PDF (corrupt, encrypted, or not a valid PDF): ${(err as Error).message}`);
  }

  const { totalPages, items } = await extractTextItems(doc);
  return { pageCount: totalPages, pages: items.map(reconstructPageText) };
}

const MIN_EXTRACTABLE_CHARS = 40;

/**
 * Digital PDFs with real text layers yield substantial extracted text even
 * from a single page; a scanned/image-only PDF yields next to nothing. This
 * is a deliberately coarse heuristic gate — Phase 2 scope excludes OCR, so
 * the correct behavior for a scanned PDF is an explicit `failed` status the
 * user can act on, not a best-effort guess.
 */
export function assertExtractableText(extracted: ExtractedPdf): void {
  const totalChars = extracted.pages.reduce((sum, page) => sum + page.trim().length, 0);
  if (totalChars < MIN_EXTRACTABLE_CHARS) {
    throw new HttpError(
      422,
      'PDF contains little or no extractable text. It may be a scanned/image-only document. OCR is not supported in Phase 2.',
    );
  }
}
