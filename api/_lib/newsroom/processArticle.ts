import { ZodError } from 'zod';
import { getArticleOrThrow, markArticleFailed, markArticleProcessing, markArticleReady } from '../articles';
import { getObjectBuffer } from '../s3';
import { HttpError } from '../http';
import { extractPdfText, assertExtractableText } from './pdfExtract';
import { cleanExtractedPages } from './textClean';
import { normalizeToSections } from './normalize';
import { validateStructuredContent, STRUCTURED_CONTENT_VERSION, type StructuredContent } from './structuredContent';

export interface ProcessArticleResult {
  structuredContent: StructuredContent;
}

/** Never leak AWS/DB internals or raw stack traces into `processing_error` or the API response. Zod validation-failure messages are safe (field paths + constraint descriptions, no secrets) and genuinely useful for debugging the normalizer, so those pass through; everything else is reduced to a generic message with the real error only logged server-side. */
function toSafeErrorMessage(err: unknown): string {
  if (err instanceof HttpError) return err.message;
  if (err instanceof ZodError) {
    const issues = err.issues
      .slice(0, 5)
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    return `Structured content failed schema validation: ${issues}`;
  }
  // eslint-disable-next-line no-console
  console.error('[newsroom-process] processing failed', err);
  return 'PDF processing failed due to an internal error';
}

/**
 * PDF -> validated `structured_content`, transaction-safe against partial
 * corruption. Status flips to `processing` first (a fast, cheap write);
 * everything fallible after that — download, extraction, cleaning,
 * normalization, schema validation — happens entirely in memory with no DB
 * writes, and only a fully-validated result is ever persisted, via
 * `markArticleReady`, one atomic UPDATE. If anything fails at any point,
 * `markArticleFailed` is the only other write: whatever `structured_content`
 * already existed from an earlier successful run is never touched, so a
 * failed reprocess attempt cannot corrupt previously-valid content.
 *
 * Idempotent by construction: rerunning against the same source PDF
 * repeats the same deterministic pipeline and REPLACEs `structured_content`
 * wholesale (never appends/merges), so reprocessing never duplicates
 * sections.
 */
export async function processArticle(id: string): Promise<ProcessArticleResult> {
  const article = await getArticleOrThrow(id);
  if (!article.source_pdf_s3_key) {
    throw new HttpError(409, 'Article has no source PDF uploaded yet');
  }
  const sourcePdfKey = article.source_pdf_s3_key;

  await markArticleProcessing(id);

  try {
    const pdfBytes = await getObjectBuffer(sourcePdfKey);
    const extracted = await extractPdfText(pdfBytes);
    assertExtractableText(extracted);

    const cleanedPages = cleanExtractedPages(extracted.pages);
    const sections = normalizeToSections(cleanedPages);
    if (sections.length === 0) {
      throw new HttpError(422, 'No structurable content found after cleaning and normalization');
    }

    const candidate = {
      version: STRUCTURED_CONTENT_VERSION,
      source: {
        extractor: 'unpdf (pdf.js) deterministic text extraction',
        extractedAt: new Date().toISOString(),
        sourcePdfKey,
        pageCount: extracted.pageCount,
      },
      sections,
    };

    const structuredContent = validateStructuredContent(candidate);
    await markArticleReady(id, structuredContent);
    return { structuredContent };
  } catch (err) {
    const message = toSafeErrorMessage(err);
    await markArticleFailed(id, message);
    if (err instanceof HttpError) throw err;
    throw new HttpError(500, message);
  }
}
