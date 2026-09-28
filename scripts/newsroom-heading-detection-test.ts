/**
 * Regression coverage for the heading-vs-wrapped-paragraph defect found
 * during the first live controlled Newsroom ingestion test: the plain-text
 * normalizer (`normalizeToSections` in `api/_lib/newsroom/normalize.ts`)
 * misread the first physical line of a multi-line body paragraph as a
 * section heading, because no font-size/weight metadata survives this
 * extraction path (`pdfExtract.ts` uses `unpdf`'s plain-text mode) — the
 * only signal available to tell a real heading apart from a short wrapped
 * sentence fragment is capitalization pattern (Title Case vs. sentence
 * case), which is what the fix adds.
 *
 * Cases A–H are pure-unit tests directly against `normalizeToSections`
 * (its input is already-cleaned lines, so no PDF is needed to exercise
 * the heading heuristic itself). Case I confirms the heuristic is
 * unaffected by a heading landing at a page boundary. Case J runs the
 * REAL end-to-end pipeline (`extractPdfText` -> `cleanExtractedPages` ->
 * `normalizeToSections`) against a synthetic PDF reproducing the exact
 * structure of the controlled article that surfaced this defect in
 * Production.
 *
 * Run: npx tsx scripts/newsroom-heading-detection-test.ts
 */
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { normalizeToSections } from '../api/_lib/newsroom/normalize';
import { cleanExtractedPages } from '../api/_lib/newsroom/textClean';
import { extractPdfText, assertExtractableText } from '../api/_lib/newsroom/pdfExtract';
import type { CleanedPage } from '../api/_lib/newsroom/textClean';

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

function page(lines: string[], pageNumber = 1): CleanedPage {
  return { pageNumber, lines };
}

console.log('=== Newsroom heading-detection regression tests ===\n');

check('A. real heading followed by an ordinary paragraph', () => {
  const sections = normalizeToSections([page(['Project Update', 'MENASCO continues to develop digital systems for delivery.'])]);
  assert(sections.length === 1, `expected 1 section, got ${sections.length}`);
  assert(sections[0].heading === 'Project Update', `expected heading, got ${JSON.stringify(sections[0])}`);
});

check('B. the exact original defect: first wrapped line of a body paragraph is NOT read as a heading', () => {
  const sections = normalizeToSections([
    page([
      'MENASCO Newsroom Controlled Pipeline Test',
      'MENASCO Mechanical Contracting LLC is testing its new pipeline.',
      'This controlled document is being used to verify PDF',
      'upload, secure storage, and structured content generation.',
      'Project Update',
      'MENASCO continues to develop digital systems for delivery.',
    ]),
  ]);
  const headings = sections.map((s) => s.heading);
  assert(!headings.includes('This controlled document is being used to verify PDF'), `false heading resurfaced: ${JSON.stringify(headings)}`);
  const allText = JSON.stringify(sections);
  assert(allText.includes('This controlled document is being used to verify PDF upload, secure storage, and structured content generation.'), `expected the two wrapped lines merged into one body paragraph, got: ${allText}`);
});

check('C. an ordinary body paragraph split across several short wrapped lines reconstructs as one paragraph', () => {
  const sections = normalizeToSections([
    page([
      'Engineering & Technology',
      'The company continues to explore digital tools,',
      'engineering coordination, BIM workflows and',
      'technology-enabled project delivery.',
    ]),
  ]);
  assert(sections.length === 1, `expected 1 section, got ${sections.length}`);
  assert(sections[0].blocks.length === 1, `expected the 3 wrapped lines merged into 1 paragraph block, got ${sections[0].blocks.length}`);
  const block = sections[0].blocks[0];
  assert(block.type === 'paragraph' && block.text === 'The company continues to explore digital tools, engineering coordination, BIM workflows and technology-enabled project delivery.', `unexpected merge result: ${JSON.stringify(block)}`);
});

check('D. a heading containing "&" is still detected as a heading', () => {
  const sections = normalizeToSections([page(['Engineering & Technology', 'Body text follows the heading here.'])]);
  assert(sections[0].heading === 'Engineering & Technology', `expected heading with "&" preserved, got ${JSON.stringify(sections[0])}`);
});

check('E. a longer legitimate heading with lowercase connector words is still detected', () => {
  const sections = normalizeToSections([page(['Summary of the Third Quarter Results', 'Revenue grew across every business unit this quarter.'])]);
  assert(sections[0].heading === 'Summary of the Third Quarter Results', `expected the long heading preserved, got ${JSON.stringify(sections[0])}`);
});

check('F. a short ordinary sentence fragment in sentence case is NOT treated as a heading', () => {
  const sections = normalizeToSections([
    page(['The team met again this week', 'to review the updated project schedule and timeline.']),
  ]);
  assert(sections.length === 1 && !sections[0].heading, `expected a single headless section, got ${JSON.stringify(sections)}`);
  const text = (sections[0].blocks[0] as { text: string }).text;
  assert(text === 'The team met again this week to review the updated project schedule and timeline.', `expected the fragment merged into body text, got: ${text}`);
});

check('G. the document title occupies the leading section heading exactly like any other heading', () => {
  const sections = normalizeToSections([
    page(['MENASCO Newsroom Controlled Pipeline Test', 'Opening paragraph under the title.', 'Project Update', 'Body under the second heading.']),
  ]);
  assert(sections.length === 2, `expected 2 sections, got ${sections.length}`);
  assert(sections[0].heading === 'MENASCO Newsroom Controlled Pipeline Test', `expected the title as the first section's heading, got ${JSON.stringify(sections[0])}`);
  assert(sections[1].heading === 'Project Update', `expected the second real heading preserved, got ${JSON.stringify(sections[1])}`);
});

check('H. multiple consecutive paragraphs stay under the same heading (no false heading in between)', () => {
  const sections = normalizeToSections([
    page([
      'Project Update',
      'MENASCO continues to develop digital systems that support delivery.',
      'This second paragraph also begins with a short wrapped line',
      'before completing its sentence on the next line.',
      'Engineering & Technology',
      'A different section starts here.',
    ]),
  ]);
  assert(sections.length === 2, `expected exactly 2 sections (no spurious 3rd from the false heading), got ${sections.length}: ${JSON.stringify(sections.map((s) => s.heading))}`);
  assert(sections[0].heading === 'Project Update', `expected first heading preserved, got ${JSON.stringify(sections[0].heading)}`);
  assert(sections[0].blocks.length === 2, `expected 2 paragraph blocks under the first heading, got ${sections[0].blocks.length}`);
  assert(sections[1].heading === 'Engineering & Technology', `expected second heading preserved, got ${JSON.stringify(sections[1].heading)}`);
});

check('I. a heading is detected correctly even when it lands on a page boundary', () => {
  const sections = normalizeToSections([
    page(['Body text finishing the previous section.'], 1),
    page(['Closing', 'This document is a controlled technical test.'], 2),
  ]);
  assert(sections.length === 2, `expected 2 sections, got ${sections.length}`);
  assert(sections[1].heading === 'Closing', `expected the page-2 heading preserved, got ${JSON.stringify(sections[1])}`);
  assert(sections[1].sourcePages.includes(2), 'expected the heading section to record page 2');
});

// --- J. full end-to-end pipeline against a synthetic PDF reproducing the ---
// --- exact structure of the controlled article that surfaced the defect ---
async function buildControlledPdf(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const p = doc.addPage([595, 842]);
  let y = 780;
  p.drawText('MENASCO Newsroom Controlled Pipeline Test', { x: 50, y, size: 18, font: boldFont });
  y -= 40;
  const blocks: { lines: string[]; heading?: boolean }[] = [
    { lines: ['MENASCO Mechanical Contracting LLC is testing its new', 'Newsroom publishing pipeline.'] },
    { lines: ['This controlled document is being used to verify PDF', 'upload, secure storage, text extraction, structured', 'content generation and editorial review before', 'publication.'] },
    { lines: ['Project Update'], heading: true },
    { lines: ['MENASCO continues to develop digital systems that', 'support engineering, project delivery and corporate', 'communications.'] },
    { lines: ['Engineering & Technology'], heading: true },
    { lines: ['The company continues to explore digital tools,', 'engineering coordination, BIM workflows and', 'technology-enabled project delivery.'] },
    { lines: ['Closing'], heading: true },
    { lines: ['This document is a controlled technical test and is', 'not intended for public publication.'] },
  ];
  for (const block of blocks) {
    for (const line of block.lines) {
      p.drawText(line, { x: 50, y, size: block.heading ? 13 : 11, font: block.heading ? boldFont : font });
      y -= 18;
    }
    y -= 12;
  }
  return Buffer.from(await doc.save());
}

let controlledHierarchy: { heading?: string; firstBlockText?: string }[] = [];

await checkAsync('J. full pipeline against the real controlled-PDF structure produces the corrected hierarchy', async () => {
  const pdfBytes = await buildControlledPdf();
  const extracted = await extractPdfText(pdfBytes);
  assertExtractableText(extracted);
  const cleaned = cleanExtractedPages(extracted.pages);
  const sections = normalizeToSections(cleaned);

  controlledHierarchy = sections.map((s) => ({
    heading: s.heading,
    firstBlockText: s.blocks[0] && 'text' in s.blocks[0] ? s.blocks[0].text : undefined,
  }));

  const headings = sections.map((s) => s.heading).filter(Boolean);
  assert(
    JSON.stringify(headings) === JSON.stringify(['MENASCO Newsroom Controlled Pipeline Test', 'Project Update', 'Engineering & Technology', 'Closing']),
    `expected exactly 4 real headings in order, got: ${JSON.stringify(headings)}`,
  );

  const allText = JSON.stringify(sections);
  assert(allText.includes('This controlled document is being used to verify PDF upload, secure storage, text extraction, structured content generation and editorial review before publication.'), `expected the opening body paragraph fully merged and preserved verbatim, got: ${allText}`);
  assert(allText.includes('MENASCO continues to develop digital systems that support engineering, project delivery and corporate communications.'), 'expected the Project Update body preserved verbatim');
  assert(allText.includes('The company continues to explore digital tools, engineering coordination, BIM workflows and technology-enabled project delivery.'), 'expected the Engineering & Technology body preserved verbatim');
  assert(allText.includes('This document is a controlled technical test and is not intended for public publication.'), 'expected the Closing body preserved verbatim');
});

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);

console.log('\nFinal corrected hierarchy (case J, the real controlled-PDF structure):\n');
for (const s of controlledHierarchy) {
  console.log(`- ${s.heading ?? '(headless)'}${s.firstBlockText ? `\n    "${s.firstBlockText}"` : ''}`);
}
