/** Scrolls to an in-page anchor, honoring each section's `scroll-margin-top` (set via the `scroll-mt-*` utility) so the fixed header never covers the target. */
export function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth'): boolean {
  const element = document.getElementById(id);
  if (!element) return false;
  element.scrollIntoView({ behavior, block: 'start' });
  return true;
}

const MAX_WAIT_ATTEMPTS = 60; // ~1s at 60fps — generous for a lazy-loaded route chunk to render

/**
 * Same as `scrollToSection`, but for landing on a target that may not exist
 * yet — e.g. arriving at "/#services" while HomePage's lazy chunk is still
 * loading. Retries across animation frames instead of giving up on the
 * first miss. Returns a cleanup function to cancel any pending retry.
 */
export function scrollToSectionWhenReady(id: string, behavior: ScrollBehavior = 'smooth'): () => void {
  let frameId: number | null = null;
  let attempts = 0;
  let cancelled = false;

  const attempt = () => {
    if (cancelled) return;
    if (scrollToSection(id, behavior)) return;
    attempts += 1;
    if (attempts < MAX_WAIT_ATTEMPTS) frameId = requestAnimationFrame(attempt);
  };

  frameId = requestAnimationFrame(attempt);

  return () => {
    cancelled = true;
    if (frameId !== null) cancelAnimationFrame(frameId);
  };
}
