/**
 * One-time migration tool: `src/data/news.ts`'s static articles -> real
 * published RDS rows. NOT run automatically as part of Phase 4 — see the
 * Phase 4 report for why (the static articles' images are explicitly
 * documented placeholder Unsplash stock photos, "pending real MENASCO
 * photography" per src/data/images.ts's own header comment; publishing
 * placeholder photography as real published content is a decision for a
 * human to make deliberately, not something this script decides for you).
 *
 * Dry-run by default — prints a full mapping summary and slug-conflict
 * report, writes nothing. Pass --confirm to actually insert rows.
 * Idempotent: re-running (even with --confirm) skips any slug that already
 * exists in RDS rather than creating a duplicate or overwriting newer DB
 * content — a static article is only ever inserted once, and a real DB
 * article manually edited since then is never clobbered.
 *
 * KNOWN LIMITATION (see Phase 4 report): does NOT migrate images. The
 * static articles' images are external Unsplash placeholder URLs, not
 * private-S3-backed uploads — migrating them would mean downloading
 * third-party stock photos and re-uploading them into the real production
 * bucket as if they were real MENASCO assets. Migrated articles will have
 * zero images until someone uploads real photography through the Phase 3
 * editor. `pullQuote`/`secondaryImage` fields are mapped as a `quote`
 * block and skipped (respectively) for the same reason.
 *
 * Run (dry run):  npx tsx --env-file=.env.local scripts/newsroom-migrate-static-articles.ts
 * Run (write):    npx tsx --env-file=.env.local scripts/newsroom-migrate-static-articles.ts --confirm
 */
import { randomUUID } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import { newsArticles } from '../src/data/news';
import { getPool } from '../api/_lib/db';
import { validateStructuredContent, STRUCTURED_CONTENT_VERSION } from '../api/_lib/newsroom/structuredContent';
import type { ArticleSection } from '../api/_lib/newsroom/structuredContent';

interface SlugRow extends RowDataPacket {
  slug: string;
}

const confirm = process.argv.includes('--confirm');

function articleToStructuredContent(article: (typeof newsArticles)[number]) {
  const sections: ArticleSection[] = [];

  if (article.body.length > 0) {
    sections.push({ blocks: article.body.map((text) => ({ type: 'paragraph' as const, text })) });
  }

  article.sections.forEach((section, index) => {
    const blocks: ArticleSection['blocks'] = section.paragraphs.map((text) => ({ type: 'paragraph' as const, text }));
    // pullQuote had no real positional home in the old model either (hardcoded to render inside sections[1]) — same placement here, now as a real typed block instead of an index-based render hack.
    if (index === 1 && article.pullQuote) blocks.push({ type: 'quote', text: article.pullQuote });
    sections.push({ heading: section.heading, blocks });
  });

  if (article.closing.length > 0) {
    sections.push({ blocks: article.closing.map((text) => ({ type: 'paragraph' as const, text })) });
  }

  return validateStructuredContent({
    version: STRUCTURED_CONTENT_VERSION,
    source: {
      extractor: 'newsroom-migrate-static-articles (one-time src/data/news.ts import, no source PDF)',
      extractedAt: new Date().toISOString(),
      sourcePdfKey: `migrated-static/${article.slug}`, // no real PDF exists for these — a clearly-fake key, never a real S3 object
    },
    sections,
  });
}

async function main() {
  console.log(`=== Newsroom static-article migration (${confirm ? 'WRITE MODE' : 'DRY RUN'}) ===\n`);
  console.log(`${newsArticles.length} static article(s) found in src/data/news.ts.\n`);

  const [existingRows] = await getPool().query<SlugRow[]>(`SELECT slug FROM news_articles WHERE slug IS NOT NULL`);
  const existingSlugs = new Set(existingRows.map((r) => r.slug));

  let toInsert = 0;
  let skippedExisting = 0;

  for (const article of newsArticles) {
    const conflict = existingSlugs.has(article.slug);
    const structuredContent = articleToStructuredContent(article);
    const blockCount = structuredContent.sections.reduce((sum, s) => sum + s.blocks.length, 0);

    console.log(`- ${article.slug}`);
    console.log(`    title: ${article.title}`);
    console.log(`    category: ${article.category} | featured: ${article.featured} | tags: ${article.tags.map((t) => t.slug).join(', ') || '(none)'}`);
    console.log(`    structured_content: ${structuredContent.sections.length} section(s), ${blockCount} block(s)`);
    console.log(`    images: 0 migrated (${article.images.length} placeholder Unsplash image(s) in static data, intentionally skipped — see script header)`);
    console.log(`    status: ${conflict ? 'SKIP — slug already exists in RDS' : confirm ? 'INSERTING' : 'would insert'}`);

    if (conflict) {
      skippedExisting++;
      continue;
    }
    toInsert++;

    if (confirm) {
      const id = randomUUID();
      await getPool().query(
        `INSERT INTO news_articles (id, slug, title, subtitle, category, tags, featured, status, structured_content, published_at)
         VALUES (:id, :slug, :title, :subtitle, :category, CAST(:tags AS JSON), :featured, 'published', CAST(:structuredContent AS JSON), :publishedAt)`,
        {
          id,
          slug: article.slug,
          title: article.title,
          subtitle: article.subtitle,
          category: article.category,
          tags: JSON.stringify(article.tags),
          featured: article.featured ? 1 : 0,
          structuredContent: JSON.stringify(structuredContent),
          publishedAt: `${article.date} 00:00:00`,
        },
      );
    }
  }

  console.log(`\n=== Summary: ${toInsert} to insert, ${skippedExisting} skipped (slug already exists) ===`);
  if (!confirm) {
    console.log('\nDry run only — nothing was written. Re-run with --confirm to actually insert these rows.');
  } else {
    console.log(`\n${toInsert} row(s) inserted as status='published'. Images were NOT migrated — upload real photography via the Phase 3 editor.`);
  }

  await getPool().end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exitCode = 1;
});
