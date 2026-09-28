import type { StructuredContent } from './structuredContent';

export interface LlmNormalizeInput {
  /** Cleaned, page-joined source text — never raw/uncleaned PDF text. */
  extractedText: string;
  pageCount: number;
  sourcePdfKey: string;
}

/**
 * Optional LLM-assisted structuring seam. NOT wired into the active Phase 2
 * pipeline: no LLM provider or API key is configured anywhere in this repo
 * (checked `.env.example` and `package.json` — neither references an LLM
 * provider). `processArticle.ts` calls only the deterministic normalizer in
 * `normalize.ts`.
 *
 * This function exists so that if deterministic normalization ever proves
 * insufficient for a real source PDF's structure, exactly one place needs a
 * real provider call — never scattered across handler code. Whatever
 * implementation lands here must: receive only the extracted source text
 * (never outside/world knowledge), be explicitly instructed not to invent
 * facts and to preserve source meaning, and have its output pass through
 * `validateStructuredContent` — the same as the deterministic path — before
 * ever being treated as trustworthy. Nothing this returns may be written to
 * RDS without that validation step.
 */
export async function structureArticleContent(_input: LlmNormalizeInput): Promise<StructuredContent> {
  throw new Error(
    'LLM normalization is not configured for this project. Phase 2 processing uses the deterministic ' +
      'normalizer (normalize.ts) only. This function is an unused seam for a future provider integration.',
  );
}
