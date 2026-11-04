/**
 * Translates a project's raw `location` field (data/projects.ts stays the
 * English source of truth) via the `projects:locations.<raw>` map — same
 * overlay pattern as getProjectField (ProjectDetailPage.tsx), just keyed by
 * the location string itself rather than a project slug, since location
 * values repeat across projects (e.g. "Dubai, UAE").
 */
export function translateProjectLocation(t: (key: string, options?: Record<string, unknown>) => string, location: string | undefined): string | undefined {
  if (!location) return undefined;
  // `defaultValue` (not a `translated === key` comparison) — i18next's own
  // missing-key handling can rewrite an unmatched key into something that
  // no longer equals it (see getProjectField in ProjectDetailPage.tsx for
  // the full explanation), which would silently break that comparison.
  return t(`projects:locations.${location}`, { defaultValue: location });
}
