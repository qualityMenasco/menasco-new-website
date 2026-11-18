/**
 * Stale-build recovery. After a deploy, a tab (or cached HTML) loaded from the
 * previous build still references that build's hashed chunks, which no longer
 * exist — the first navigation that needs one fails ("Importing a module script
 * failed" in Safari, "Failed to fetch dynamically imported module" in Chrome)
 * and the router would show its error screen. Reloading once picks up the
 * current build. A timestamp guard prevents a reload loop if the failure has
 * another cause (e.g. the network is down).
 */

const RELOAD_KEY = 'menasco:stale-build-reload';
const RELOAD_GUARD_MS = 10_000;

/** Reloads the page once per guard window. Returns true if a reload was triggered. */
export function reloadForStaleBuild(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_GUARD_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable (private mode quirks) — still try once.
  }
  window.location.reload();
  return true;
}

const CHUNK_ERROR_PATTERN = /Importing a module script failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Unable to preload CSS|ChunkLoadError|Loading chunk [\w-]+ failed/i;

/** True for the errors browsers raise when a lazily imported chunk is missing. */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return CHUNK_ERROR_PATTERN.test(message);
}

/**
 * Wraps a dynamic `import()` for React.lazy: if the chunk is missing because
 * the build changed, reload onto the current build instead of erroring. The
 * returned promise never settles while the reload is in flight, so no error
 * screen flashes first.
 */
export function withStaleBuildRecovery<T>(importer: () => Promise<T>): () => Promise<T> {
  return () =>
    importer().catch((error: unknown) => {
      if (typeof window !== 'undefined' && isChunkLoadError(error) && reloadForStaleBuild()) {
        return new Promise<T>(() => {});
      }
      throw error;
    });
}
