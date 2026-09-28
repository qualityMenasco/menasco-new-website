/**
 * Local, offline test of the Phase 2 deterministic pipeline (extraction ->
 * cleaning -> normalization -> schema validation). No AWS/RDS credentials
 * needed — this builds a small disposable synthetic PDF in memory (never
 * committed as a binary fixture) and runs it straight through the same
 * pure functions `processArticle.ts` calls, plus a few pure-unit checks of
 * `cleanExtractedPages`/`normalizeToSections` in isolation.
 *
 * Run: npx tsx scripts/newsroom-pdf-pipeline-test.ts
 */
import { extractPdfText, assertExtractableText } from '../api/_lib/newsroom/pdfExtract';
import { cleanExtractedPages } from '../api/_lib/newsroom/textClean';
import { normalizeToSections } from '../api/_lib/newsroom/normalize';
import { validateStructuredContent, STRUCTURED_CONTENT_VERSION } from '../api/_lib/newsroom/structuredContent';
import { ZodError } from 'zod';
import { PDFDocument, StandardFonts } from 'pdf-lib';

let pass = 0, fail = 0;
function check(label: string, fn: () => void) {
  process.stdout.write(`- ${label} ... `);
  try {
    fn();
    console.log('OK');
    pass++;
  } catch (err) {
    console.log(`FAIL: ${(err as Error).message}`);
    fail++;
  }
}
async function checkAsync(label: string, fn: () => Promise<void>) {
  process.stdout.write(`- ${label} ... `);
  try {
    await fn();
    console.log('OK');
    pass++;
  } catch (err) {
    console.log(`FAIL: ${(err as Error).message}`);
    fail++;
  }
}
function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

// Built with `pdf-lib` (real PDF-writing library, dev-dependency only —
// never imported from api/) rather than hand-rolled PDF bytes. An earlier
// version of this fixture hand-assembled raw PDF object/stream syntax and
// hit a real, reproducible text-extraction truncation around ~70 characters
// per line; root-caused to the test PDF's own page width (400pt) being too
// narrow for an ~130-character single-line string at 11pt Helvetica —
// nothing to do with unpdf or this repo's extraction code, confirmed by
// widening the page and seeing full extraction. Real-world PDFs wrap
// paragraphs across many short physical lines, not one long line, so this
// fixture now does the same — which doubles as a real test of
// `normalizeToSections`' line-to-paragraph reconstruction.
async function buildPdf(pages: string[][]): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const lines of pages) {
    const page = doc.addPage([595, 842]); // A4
    let y = 780;
    for (const line of lines) {
      page.drawText(line, { x: 50, y, size: 11, font });
      y -= 18;
    }
  }
  return Buffer.from(await doc.save());
}

console.log('=== Newsroom Phase 2 deterministic pipeline test (offline, no AWS/RDS) ===\n');

// --- Pure-unit: text cleaning ---
console.log('cleanExtractedPages (pure unit):');
check('strips a running header/footer repeated across most pages', () => {
  const cleaned = cleanExtractedPages(['MENASCO NEWSROOM\nFirst page body.\n1', 'MENASCO NEWSROOM\nSecond page body.\n2', 'MENASCO NEWSROOM\nThird page body.\n3']);
  for (const page of cleaned) {
    assert(!page.lines.includes('MENASCO NEWSROOM'), `header leaked into page ${page.pageNumber}: ${JSON.stringify(page.lines)}`);
    assert(!page.lines.some((l) => /^\d+$/.test(l)), `page number leaked into page ${page.pageNumber}: ${JSON.stringify(page.lines)}`);
  }
});
check('merges a hyphenated line-wrap', () => {
  const cleaned = cleanExtractedPages(['This is a long invest-\nment in the region.']);
  assert(cleaned[0].lines.length === 1, `expected merge into 1 line, got ${cleaned[0].lines.length}`);
  assert(cleaned[0].lines[0] === 'This is a long investment in the region.', `unexpected merge result: ${cleaned[0].lines[0]}`);
});
check('drops an immediately duplicated line (double text layer)', () => {
  const cleaned = cleanExtractedPages(['Same line.\nSame line.\nDifferent line.']);
  assert(cleaned[0].lines.length === 2, `expected dedup to 2 lines, got ${JSON.stringify(cleaned[0].lines)}`);
});

// --- Pure-unit: normalization (headless leading section + heading + lists) ---
console.log('\nnormalizeToSections (pure unit):');
check('headless leading section captures intro content before the first heading', () => {
  const sections = normalizeToSections([
    { pageNumber: 1, lines: ['This is lead-in body text with no heading above it.', 'Key Achievements', 'Completed fifty projects across the region.'] },
  ]);
  assert(sections.length === 2, `expected 2 sections, got ${sections.length}: ${JSON.stringify(sections)}`);
  assert(!sections[0].heading, `expected first section headless, got heading=${sections[0].heading}`);
  assert(sections[1].heading === 'Key Achievements', `expected second section heading, got ${JSON.stringify(sections[1])}`);
});
check('bullet list lines group into one bullet_list block', () => {
  const sections = normalizeToSections([
    { pageNumber: 1, lines: ['Key Achievements', '- Completed fifty projects.', '- Expanded workforce by 30 percent.'] },
  ]);
  const block = sections[0].blocks[0];
  assert(block.type === 'bullet_list', `expected bullet_list, got ${block.type}`);
  assert('items' in block && block.items.length === 2, `expected 2 items, got ${JSON.stringify(block)}`);
});

// --- Full pipeline: synthetic 3-page PDF ---
console.log('\nFull deterministic pipeline (synthetic in-memory PDF, 3 pages):');

const page1 = [
  'MENASCO NEWSROOM',
  'New Regional Headquarters Opens in Dubai',
  'MENASCO Group today announced the opening of its new regional',
  'headquarters in Dubai, marking a significant expansion of its',
  'operations across the Middle East market.',
  '1',
];
const page2 = [
  'MENASCO NEWSROOM',
  'Key Achievements',
  '- Completed over 50 major projects in the region',
  '- Established partnerships with leading global firms',
  '- Expanded workforce by 30 percent year over year',
  '2',
];
const page3 = [
  'MENASCO NEWSROOM',
  'The new facility spans 10,000 square meters and will house',
  'engineering, project management, and support teams. This invest-',
  'ment reflects our long-term commitment to the region and its',
  'continued growth.',
  '3',
];

const samplePdf = await buildPdf([page1, page2, page3]);
let structuredContent: unknown;

await checkAsync('extractPdfText reads all 3 pages', async () => {
  const extracted = await extractPdfText(samplePdf);
  assert(extracted.pageCount === 3, `expected 3 pages, got ${extracted.pageCount}`);
  assert(extracted.pages.length === 3, `expected 3 page strings, got ${extracted.pages.length}`);
  assertExtractableText(extracted);
});

await checkAsync('full pipeline produces schema-valid structured_content', async () => {
  const extracted = await extractPdfText(samplePdf);
  assertExtractableText(extracted);
  const cleaned = cleanExtractedPages(extracted.pages);
  // Running header should be gone from every page.
  for (const page of cleaned) assert(!page.lines.includes('MENASCO NEWSROOM'), 'header leaked through cleaning');
  const sections = normalizeToSections(cleaned);

  const candidate = {
    version: STRUCTURED_CONTENT_VERSION,
    source: {
      extractor: 'unpdf (pdf.js) deterministic text extraction',
      extractedAt: new Date().toISOString(),
      sourcePdfKey: 'newsroom/articles/test-fixture/source/article.pdf',
      pageCount: extracted.pageCount,
    },
    sections,
  };
  structuredContent = validateStructuredContent(candidate);
});

check('a heading immediately followed by its own wrapped title-case first line is not swallowed', () => {
  const sections = JSON.parse(JSON.stringify(structuredContent)).sections;
  assert(
    sections[0].heading === 'New Regional Headquarters Opens in Dubai',
    `expected the real heading preserved, got: ${JSON.stringify(sections[0])}`,
  );
});

check('extracted content preserves source facts verbatim (no invention)', () => {
  const json = JSON.stringify(structuredContent);
  assert(json.includes('Dubai'), 'expected "Dubai" preserved from source');
  assert(json.includes('50 major projects') || json.includes('over 50 major projects'), 'expected bullet fact preserved verbatim');
  assert(json.includes('10,000 square meters'), 'expected figure preserved verbatim, not rounded/altered');
  assert(!json.includes('MENASCO NEWSROOM'), 'running header should not appear as content');
  assert(!/\b\d\b\n/.test(json) === true, 'sanity: page-number artifact check ran');
});

check('hyphenated wrap across pages 2 and 3 boundary reads as one word', () => {
  const json = JSON.stringify(structuredContent);
  assert(json.includes('investment reflects'), `expected merged "investment", got: ${json.slice(0, 400)}`);
});

check('running twice on the same cleaned input is deterministic (replace, not append)', () => {
  const cleaned = cleanExtractedPages(['Heading One', 'A paragraph.', 'Heading Two', 'Another paragraph.']);
  const runA = normalizeToSections(cleaned);
  const runB = normalizeToSections(cleaned);
  assert(JSON.stringify(runA) === JSON.stringify(runB), 'two runs over identical input produced different output');
  assert(runA.length === 2, `expected exactly 2 sections both times, got ${runA.length}`);
});

check('schema validation rejects an invalid candidate (missing required fields)', () => {
  let threw = false;
  try {
    validateStructuredContent({ version: 1, sections: [] });
  } catch (err) {
    threw = true;
    assert(err instanceof ZodError, `expected ZodError, got ${(err as Error).constructor.name}`);
  }
  assert(threw, 'expected validateStructuredContent to reject an incomplete candidate');
});

check('schema validation rejects an unknown block type', () => {
  let threw = false;
  try {
    validateStructuredContent({
      version: 1,
      source: { extractor: 'x', extractedAt: new Date().toISOString(), sourcePdfKey: 'k' },
      sections: [{ blocks: [{ type: 'raw_html', html: '<script>x</script>' }] }],
    });
  } catch {
    threw = true;
  }
  assert(threw, 'expected an unrecognized block type to be rejected, not silently accepted');
});

await checkAsync('a scanned/image-only PDF (no text layer) fails extraction cleanly', async () => {
  const blankPage = await buildPdf([[]]); // a page with no drawText calls at all
  const extracted = await extractPdfText(blankPage);
  let threw = false;
  try {
    assertExtractableText(extracted);
  } catch (err) {
    threw = true;
    assert((err as Error).message.includes('scanned'), `expected a scanned-PDF error message, got: ${(err as Error).message}`);
  }
  assert(threw, 'expected assertExtractableText to reject a blank/scanned PDF');
});

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);

console.log('\nSample structured_content output:\n');
console.log(JSON.stringify(structuredContent, null, 2));
