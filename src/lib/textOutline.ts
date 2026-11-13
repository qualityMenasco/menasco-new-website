import type { CSSProperties } from 'react';

/**
 * Outlined lettering for display type: the glyph edge in the current text
 * colour (set it with a text-* class), with only the fill made transparent.
 */
export function textOutline(width = 1.5): CSSProperties {
  return { WebkitTextStroke: `${width}px currentColor`, WebkitTextFillColor: 'transparent' };
}

/**
 * Splits a heading like "Automatic Tendering Logic Assessment System (ATLAS)"
 * into its short name and the full meaning, so the name can be set large and
 * the meaning small. Returns null when the heading has no "(…)" suffix.
 */
export function splitAcronym(heading: string): { name: string; meaning: string } | null {
  const match = heading.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return match ? { name: match[2], meaning: match[1] } : null;
}
