/**
 * Deterministic cleanup of raw per-page PDF text before it's normalized
 * into structured content. Every step here is a pure function of its
 * input — no model calls, no guessing at meaning — so the same PDF always
 * produces the same cleaned text and this stays unit-testable without a
 * live PDF.
 */

const PAGE_NUMBER_LINE = /^(page\s+)?\d{1,4}(\s+of\s+\d{1,4})?$/i;

function isPageNumberLine(line: string): boolean {
  return PAGE_NUMBER_LINE.test(line.trim());
}

/**
 * A line repeated verbatim on most pages of a multi-page document is a
 * running header/footer (letterhead, document title, "Confidential", etc.),
 * not article content. Single-page documents have nothing to compare
 * against, so this is a no-op for them.
 */
function findRepeatedHeaderFooterLines(pages: string[][]): Set<string> {
  if (pages.length < 3) return new Set();
  const counts = new Map<string, number>();
  for (const lines of pages) {
    const uniqueOnPage = new Set(lines.map((l) => l.trim()).filter(Boolean));
    for (const line of uniqueOnPage) {
      counts.set(line, (counts.get(line) ?? 0) + 1);
    }
  }
  const threshold = Math.ceil(pages.length * 0.6);
  const repeated = new Set<string>();
  for (const [line, count] of counts) {
    // Short lines only — a genuinely repeated long sentence is very unlikely
    // to be a header/footer and more likely a real recurring pull quote.
    if (count >= threshold && line.length <= 80) repeated.add(line);
  }
  return repeated;
}

/** `word-\nwrap` (hyphenated line-wrap) -> `wordwrap`; a real end-of-clause hyphen ("well-\nknown" is ambiguous, so this only merges when the following line starts lowercase, the common case for mid-word wraps). */
function mergeHyphenatedWraps(lines: string[]): string[] {
  const merged: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1];
    if (line.endsWith('-') && next && /^[a-z]/.test(next)) {
      merged.push(line.slice(0, -1) + next);
      i++;
    } else {
      merged.push(line);
    }
  }
  return merged;
}

/** Some PDFs render a text layer twice (e.g. a visible layer plus an invisible OCR/searchable duplicate) — collapse an exact line immediately repeating itself. */
function dropImmediateDuplicateLines(lines: string[]): string[] {
  const result: string[] = [];
  for (const line of lines) {
    if (result.length > 0 && result[result.length - 1] === line) continue;
    result.push(line);
  }
  return result;
}

export interface CleanedPage {
  pageNumber: number;
  lines: string[];
}

export function cleanExtractedPages(rawPages: string[]): CleanedPage[] {
  const splitPages = rawPages.map((page) =>
    page
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .filter((line) => line.length > 0),
  );

  const headerFooterLines = findRepeatedHeaderFooterLines(splitPages);

  return splitPages.map((lines, index) => {
    const withoutBoilerplate = lines.filter((line) => !headerFooterLines.has(line) && !isPageNumberLine(line));
    const deduped = dropImmediateDuplicateLines(withoutBoilerplate);
    const unwrapped = mergeHyphenatedWraps(deduped);
    return { pageNumber: index + 1, lines: unwrapped };
  });
}
