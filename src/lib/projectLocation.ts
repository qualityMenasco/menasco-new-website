/**
 * Translates a project's raw `location` field (data/projects.ts stays the
 * English source of truth) via the `projects:locations.<raw>` map — same
 * overlay pattern as getProjectField (ProjectDetailPage.tsx), just keyed by
 * the location string itself rather than a project slug, since location
 * values repeat across projects (e.g. "Dubai, UAE").
 */
export function translateProjectLocation(t: (key: string) => string, location: string | undefined): string | undefined {
  if (!location) return undefined;
  const key = `projects:locations.${location}`;
  const translated = t(key);
  return translated === key ? location : translated;
}
