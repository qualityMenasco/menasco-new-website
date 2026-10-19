/**
 * One-time migration: reads the live `projects` array straight out of
 * src/data/projects.ts (the actual TS module, not a re-typed copy) and
 * writes content/projects.json — the new canonical, CMS-managed data file.
 *
 * Why read the module instead of hand-authoring the JSON: this guarantees
 * byte-perfect fidelity with the 23 existing project records (no manual
 * transcription risk) while adding exactly three new fields per record:
 *   - keyMetrics: derived from the existing workforceHours/safetyRecord/
 *     capacity fields (preserves the same verified values, just restructured
 *     into the label/value shape the new CMS and page template need).
 *   - publishState: 'published' for every existing record (preserves current
 *     live behavior — nothing that's live today becomes unindexed).
 *   - protected: true only for 'vela-by-omniyat' and 'qiddiya' (confirmed
 *     against the literal keys in ProjectDetailPage.tsx's CINEMATIC_PROJECTS
 *     map) — the CMS must refuse to overwrite/delete these without an
 *     explicit override.
 *
 * Run once via: npx tsx scripts/cms/migrate-projects-to-content-json.ts
 * Safe to re-run — it's a pure function of projects.ts's current contents.
 *
 * Output lives at src/data/projects.json (inside the TS project boundary,
 * same directory as the projects.ts module that now reads it) rather than a
 * repo-root content/ folder, so `resolveJsonModule` + tsconfig's existing
 * `include: ["src"]` resolve it with zero config changes. The CMS's GitHub
 * Contents API calls address it by this same repo-relative path string, so
 * the location is equally "canonical" regardless of which directory it's in.
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from '../../src/data/projects';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROTECTED_SLUGS = new Set(['vela-by-omniyat', 'qiddiya']);

const migrated = projects.map((project) => {
  const keyMetrics: { label: string; value: string }[] = [];
  if (project.workforceHours) keyMetrics.push({ label: 'Workforce Hours', value: project.workforceHours });
  if (project.safetyRecord) keyMetrics.push({ label: 'Safety Record', value: project.safetyRecord });
  if (project.capacity) keyMetrics.push({ label: 'IT Capacity', value: project.capacity });

  return {
    ...project,
    keyMetrics,
    publishState: 'published' as const,
    protected: PROTECTED_SLUGS.has(project.slug),
  };
});

const outPath = resolve(__dirname, '../../src/data/projects.json');
writeFileSync(outPath, JSON.stringify(migrated, null, 2) + '\n', 'utf-8');

console.log(`Wrote ${migrated.length} projects to ${outPath}`);
console.log(`Protected: ${migrated.filter((p) => p.protected).map((p) => p.slug).join(', ')}`);
