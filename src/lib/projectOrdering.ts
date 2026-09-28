/**
 * Pure, framework-agnostic project ordering helpers for the Projects /
 * Sectors category system. Shared between the desktop app (imported
 * directly) and the mobile app (via shared/lib/projectOrdering.ts, a thin
 * re-export — same pattern as shared/data/*.ts) so category
 * prioritization/shuffling is implemented exactly once.
 */

interface CategorizedItem {
  id: string;
  category?: string;
}

/** Deterministic string hash, used to seed the shuffle so it's stable for a given category. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/** Mulberry32 — small, fast, deterministic PRNG. Same seed always produces the same sequence. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle using a seeded RNG — the same seed always yields the same order. */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = items.slice();
  const random = seededRandom(seed);
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Returns the curated default order — the project array exactly as
 * authored in the shared data source, unmodified. Used for "All Projects".
 */
export function getCuratedAllProjectsOrder<T>(projects: T[]): T[] {
  return projects.slice();
}

/**
 * Seeded, stable shuffle for a set of "remaining" (non-prioritized)
 * projects. Buckets items by category, shuffles the bucket order and each
 * bucket's contents (both seeded), then round-robins across buckets so
 * consecutive cards avoid repeating the same category where the mix of
 * categories allows it. Deterministic for a given seed — call again with
 * the same seed and you get the same order back, so this only needs to be
 * recomputed when the seed (the selected category) actually changes.
 */
export function shuffleRemainingProjects<T extends CategorizedItem>(projects: T[], seed: number): T[] {
  const buckets = new Map<string, T[]>();
  projects.forEach((project) => {
    const key = project.category ?? '';
    const bucket = buckets.get(key);
    if (bucket) bucket.push(project);
    else buckets.set(key, [project]);
  });

  const bucketKeys = seededShuffle(Array.from(buckets.keys()), seed);
  bucketKeys.forEach((key, index) => {
    buckets.set(key, seededShuffle(buckets.get(key)!, seed + index + 1));
  });

  const result: T[] = [];
  let remaining = projects.length;
  while (remaining > 0) {
    for (const key of bucketKeys) {
      const bucket = buckets.get(key)!;
      const next = bucket.shift();
      if (next) {
        result.push(next);
        remaining -= 1;
      }
    }
  }
  return result;
}

/**
 * The core selection behavior for the Projects / Sectors gallery: with no
 * category selected, returns the curated default order untouched. With a
 * category selected, moves that category's projects to the front (keeping
 * their existing relative order — no shuffling the selected group). The
 * remaining projects are split into two independent groups — `keepSeparate`
 * (e.g. data centers) and everything else — each shuffled on its own and
 * appended as its own contiguous block, so the two never get interleaved
 * with each other. Nothing is ever removed.
 */
export function prioritizeProjectsByCategory<T extends CategorizedItem>(
  projects: T[],
  selectedCategory: string | null,
  keepSeparate?: string,
): T[] {
  if (!selectedCategory) return getCuratedAllProjectsOrder(projects);

  const matching = projects.filter((project) => project.category === selectedCategory);
  const remaining = projects.filter((project) => project.category !== selectedCategory);

  if (keepSeparate && keepSeparate !== selectedCategory) {
    const separate = remaining.filter((project) => project.category === keepSeparate);
    const rest = remaining.filter((project) => project.category !== keepSeparate);
    return [
      ...matching,
      ...shuffleRemainingProjects(rest, hashString(selectedCategory)),
      ...shuffleRemainingProjects(separate, hashString(`${selectedCategory}:${keepSeparate}`)),
    ];
  }

  return [...matching, ...shuffleRemainingProjects(remaining, hashString(selectedCategory))];
}

/**
 * Simple stable partition by an arbitrary field (e.g. country): items
 * matching `selectedValue` move to the front, everything else follows —
 * both groups keep their existing relative order from `projects`, and
 * nothing is shuffled. This is the country sidebar's own prioritization
 * (unchanged from its original behavior), applied on top of whatever order
 * `projects` is already in (e.g. after category prioritization), so the
 * two controls compose predictably instead of fighting each other.
 */
export function prioritizeByField<T>(projects: T[], selectedValue: string | null, getField: (item: T) => string | undefined): T[] {
  if (!selectedValue) return projects.slice();
  const matching = projects.filter((project) => getField(project) === selectedValue);
  const rest = projects.filter((project) => getField(project) !== selectedValue);
  return [...matching, ...rest];
}
