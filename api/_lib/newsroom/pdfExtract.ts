import { getDocumentProxy, extractText } from 'unpdf';
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
 */

export interface ExtractedPdf {
  pageCount: number;
  pages: string[];
}

export async function extractPdfText(pdfBytes: Buffer): Promise<ExtractedPdf> {
  let doc;
  try {
    doc = await getDocumentProxy(new Uint8Array(pdfBytes));
  } catch (err) {
    throw new HttpError(422, `Could not open PDF (corrupt, encrypted, or not a valid PDF): ${(err as Error).message}`);
  }

  const { totalPages, text } = await extractText(doc, { mergePages: false });
  return { pageCount: totalPages, pages: text };
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
