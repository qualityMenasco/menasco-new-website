import { describe, it, expect } from 'vitest';
import type { StructuredTextItem } from 'unpdf';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import {
  lineDirection,
  groupIntoLines,
  joinLineText,
  reconstructPageText,
  extractPdfText,
  assertExtractableText,
  type ExtractedPdf,
} from './pdfExtract';

/**
 * Builds a fake pdf.js/unpdf `StructuredTextItem` — the exact shape
 * `extractTextItems` returns per text run (see pdfExtract.ts's import).
 * Testing the line/direction/spacing reconstruction logic against
 * constructed items like this (rather than only through real PDF bytes)
 * is deliberate: it's the actual new logic this file adds, and pdf-lib
 * (used for the one true-PDF integration test below) has no Arabic
 * contextual-shaping/bidi engine, so a pdf-lib-authored "Arabic PDF" would
 * not represent how a real RTL-aware PDF generator (Word, InDesign, a
 * browser's print-to-PDF, …) actually lays out glyphs — testing the
 * reconstruction algorithm directly, against items positioned the way a
 * real RTL PDF's text layer would be, is more representative than
 * routing through a fixture that can't produce that layout at all. See
 * this file's own module comment and the PR/task report for this
 * limitation stated plainly.
 */
function item(overrides: Partial<StructuredTextItem> & Pick<StructuredTextItem, 'str' | 'x' | 'y'>): StructuredTextItem {
  return {
    width: overrides.str.length * 6,
    height: 12,
    fontSize: 12,
    fontFamily: '',
    dir: 'ltr',
    hasEOL: false,
    ...overrides,
  };
}

describe('lineDirection', () => {
  it('reads an English-only line as ltr', () => {
    expect(lineDirection([item({ str: 'Project Update', x: 0, y: 0 })])).toBe('ltr');
  });

  it('reads an Arabic-only line as rtl', () => {
    expect(lineDirection([item({ str: 'تقرير المشروع', x: 0, y: 0 })])).toBe('rtl');
  });

  it('decides by majority script when a line mixes Arabic and English (an English brand name inside an Arabic sentence)', () => {
    const items = [item({ str: 'تقرير', x: 100, y: 0 }), item({ str: 'MENASCO', x: 50, y: 0 }), item({ str: 'لعام 2026', x: 0, y: 0 })];
    expect(lineDirection(items)).toBe('rtl');
  });

  it('decides by majority script the other way (an Arabic word inside an English sentence)', () => {
    const items = [item({ str: 'The project is called', x: 0, y: 0 }), item({ str: 'مرحبا', x: 100, y: 0 }), item({ str: 'in Arabic', x: 150, y: 0 })];
    expect(lineDirection(items)).toBe('ltr');
  });
});

describe('groupIntoLines', () => {
  it('starts a new line whenever hasEOL is set', () => {
    const items = [
      item({ str: 'First line.', x: 0, y: 800, hasEOL: true }),
      item({ str: 'Second line.', x: 0, y: 788, hasEOL: true }),
    ];
    const lines = groupIntoLines(items);
    expect(lines).toHaveLength(2);
    expect(lines[0].map((i) => i.str)).toEqual(['First line.']);
    expect(lines[1].map((i) => i.str)).toEqual(['Second line.']);
  });

  it('keeps items with near-identical Y on the same line even without hasEOL', () => {
    const items = [item({ str: 'Hello', x: 0, y: 800 }), item({ str: 'world', x: 40, y: 800.2 })];
    const lines = groupIntoLines(items);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toHaveLength(2);
  });

  it('falls back to a Y-proximity break when hasEOL is missing but the next item is clearly on a new line', () => {
    const items = [item({ str: 'Line one', x: 0, y: 800 }), item({ str: 'Line two', x: 0, y: 760 })];
    const lines = groupIntoLines(items);
    expect(lines).toHaveLength(2);
  });

  it('drops a line that ends up with only whitespace-only items', () => {
    const items = [item({ str: '  ', x: 0, y: 800, hasEOL: true }), item({ str: 'Real line', x: 0, y: 788 })];
    const lines = groupIntoLines(items);
    expect(lines).toHaveLength(1);
    expect(lines[0].map((i) => i.str)).toEqual(['Real line']);
  });
});

describe('joinLineText — the actual production bug (unpdf/pdf.js items concatenated with no space)', () => {
  it('inserts a space between two items with a real visual gap between them (separate English words)', () => {
    // "Hello" ends at x=30 (5 chars * 6), "world" starts at x=60 — a real word-gap.
    const items = [item({ str: 'Hello', x: 0, y: 0, width: 30 }), item({ str: 'world', x: 60, y: 0, width: 30 })];
    expect(joinLineText(items)).toBe('Hello world');
  });

  it('does NOT insert a space between two items with only a tiny gap (a word split across text-show operations for kerning/ligature reasons)', () => {
    // "wor" ends at x=18, "ld" starts at x=18.5 — essentially touching, well under the font-size-relative threshold.
    const items = [item({ str: 'wor', x: 0, y: 0, width: 18 }), item({ str: 'ld', x: 18.5, y: 0, width: 12 })];
    expect(joinLineText(items)).toBe('world');
  });

  it('inserts a space between two Arabic words with a real gap — the exact "words appearing joined together" bug report, for Arabic specifically', () => {
    // RTL: the first logical word ("مرحبا", hello) sits at the HIGHER x (rightmost),
    // matching how a real RTL-authored PDF places glyphs.
    const items = [item({ str: 'بكم', x: 0, y: 0, width: 25 }), item({ str: 'مرحبا', x: 55, y: 0, width: 40 })];
    expect(joinLineText(items)).toBe('مرحبا بكم');
  });

  it('reconstructs correct Arabic reading order when items are positioned right-to-left (first logical word at the highest x, as a real RTL-authored PDF lays glyphs out) even if the array itself is NOT already in logical order', () => {
    // Logical order: "هذا" (this) "تقرير" (report) "المشروع" (project) — a real RTL PDF places
    // the FIRST logical word at the HIGHEST x. The items array here is deliberately given in
    // the opposite (ascending-x / purely-visual) order to prove reconstruction doesn't just
    // trust array order — it sorts by physical position per the line's own direction.
    const items = [
      item({ str: 'المشروع', x: 0, y: 0, width: 50 }),
      item({ str: 'تقرير', x: 60, y: 0, width: 40 }),
      item({ str: 'هذا', x: 110, y: 0, width: 20 }),
    ];
    expect(joinLineText(items)).toBe('هذا تقرير المشروع');
  });

  it('keeps an embedded number/date intact and correctly spaced within an Arabic line (not reversed, not joined to its neighbor)', () => {
    // Logical order: "لعام" (for year) then "2026" — placed right-to-left as a real PDF would.
    const items = [item({ str: '2026', x: 0, y: 0, width: 30 }), item({ str: 'لعام', x: 60, y: 0, width: 30 })];
    expect(joinLineText(items)).toBe('لعام 2026');
  });

  it('does not reverse the characters within an Arabic item\'s own string — only item order/spacing changes, never string content', () => {
    const original = 'مرحبا';
    const items = [item({ str: original, x: 0, y: 0 })];
    expect(joinLineText(items)).toContain(original);
  });

  it('returns an empty string for a line with no non-empty items', () => {
    expect(joinLineText([item({ str: '', x: 0, y: 0 })])).toBe('');
  });
});

describe('reconstructPageText', () => {
  it('joins lines with newlines and drops lines that end up empty', () => {
    const items = [
      item({ str: 'First line.', x: 0, y: 800, hasEOL: true }),
      item({ str: '  ', x: 0, y: 788, hasEOL: true }),
      item({ str: 'Second line.', x: 0, y: 776, hasEOL: true }),
    ];
    expect(reconstructPageText(items)).toBe('First line.\nSecond line.');
  });
});

describe('extractPdfText — integration via a real PDF (pdf-lib, English — see the module comment on why Arabic isn\'t round-tripped through a real PDF here)', () => {
  it('preserves the existing {pageCount, pages: string[]} shape and extracts real multi-page English text', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page1 = doc.addPage([595, 842]);
    page1.drawText('First page body text.', { x: 50, y: 780, size: 12, font });
    const page2 = doc.addPage([595, 842]);
    page2.drawText('Second page body text.', { x: 50, y: 780, size: 12, font });
    const bytes = Buffer.from(await doc.save());

    const extracted = await extractPdfText(bytes);
    expect(extracted.pageCount).toBe(2);
    expect(extracted.pages).toHaveLength(2);
    expect(extracted.pages[0]).toContain('First page body text.');
    expect(extracted.pages[1]).toContain('Second page body text.');
  });
});

describe('assertExtractableText', () => {
  it('throws for a page set with little/no text (the scanned/image-only PDF case)', () => {
    const extracted: ExtractedPdf = { pageCount: 1, pages: [''] };
    expect(() => assertExtractableText(extracted)).toThrow(/little or no extractable text/);
  });

  it('does not throw once there is enough real text', () => {
    const extracted: ExtractedPdf = { pageCount: 1, pages: ['A'.repeat(50)] };
    expect(() => assertExtractableText(extracted)).not.toThrow();
  });
});
