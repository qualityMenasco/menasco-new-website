/**
 * Splits a heading like "Automatic Tendering Logic Assessment System (ATLAS)"
 * into its short name and the full meaning, so a page can show the short
 * name alone. Returns null when the heading has no "(…)" suffix.
 */
export function splitAcronym(heading: string): { name: string; meaning: string } | null {
  const match = heading.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return match ? { name: match[2], meaning: match[1] } : null;
}
