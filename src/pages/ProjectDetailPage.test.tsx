import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProjectDetailPage from './ProjectDetailPage';

// Same passthrough pattern as ArticleDetailView.test.tsx / NewsroomAdminPage.test.tsx —
// but `returnObjects: true` lookups (used by the cinematic branch for milestone copy,
// overview/outcome paragraphs) must return an array (the real i18next behavior for that
// option), not a string, or the component's own `.map()` calls on the result would throw.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: unknown; returnObjects?: boolean; [k: string]: unknown }) => {
      if (options?.returnObjects) return options.defaultValue ?? [];
      if (options && 'defaultValue' in options) return options.defaultValue as string;
      // Simulates src/lib/i18n.ts's real `parseMissingKeyHandler`, which
      // humanizes a missing key into a readable string rather than
      // returning the raw key — a call made with NO `defaultValue` (the
      // regression this file's "falls back ... without a locale entry"
      // test guards against) must not reach here and still render
      // correctly, since this sentinel is never equal to `key` or to any
      // real project field.
      return '__MISSING_KEY_HUMANIZED_PLACEHOLDER__';
    },
  }),
}));

// The cinematic experience (GSAP ScrollTrigger + canvas frame sequences) doesn't run
// meaningfully under jsdom and isn't what this test is about — it's replaced with a bare
// marker so these tests can assert the cinematic branch rendered (for vela/qiddiya) without
// exercising canvas/GSAP, and assert it did NOT render (for every other project).
vi.mock('../components/ScrollFrameAnimation', () => ({
  ScrollFrameAnimation: () => <div data-testid="cinematic-marker" />,
}));

// The cinematic branch's surrounding sections use framer-motion's whileInView (via
// ScrollReveal/ScrollRevealGroup), which needs a real IntersectionObserver — not available in
// jsdom and irrelevant to what this test verifies, so it's replaced with a plain passthrough.
vi.mock('../components/common/ScrollReveal', () => ({
  ScrollReveal: ({ children }: { children: ReactNode }) => <>{children}</>,
  ScrollRevealGroup: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

function renderProject(slug: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/projects/${slug}`]}>
        <Routes>
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('ProjectDetailPage — standard template (casa-cavalli)', () => {
  it('renders the new hero/metrics/tabs/gallery template, not the cinematic branch', () => {
    renderProject('casa-cavalli');
    expect(screen.queryByTestId('cinematic-marker')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Casa Cavalli' })).toBeInTheDocument();
  });

  it('renders Overview and Scope of Work tabs (casa-cavalli has menascoScope)', () => {
    renderProject('casa-cavalli');
    const tablist = screen.getByRole('tablist');
    // The mocked `t` doesn't simulate real locale copy for UI labels like tab names (this
    // test isn't about that) — it returns a fixed sentinel for any call made with no
    // `defaultValue`, so both tabs render with that same label text; what matters here is
    // that there are exactly two of them (Overview + Scope of Work).
    expect(within(tablist).getAllByRole('tab')).toHaveLength(2);
  });

  it('falls back the gallery to the hero image alone — casa-cavalli has an empty gallery array', () => {
    renderProject('casa-cavalli');
    const images = screen.getAllByAltText('Casa Cavalli');
    // One in the hero overlay region's <img> (decorative alt="") is separate; the gallery's
    // single fallback slide is the only element carrying the project title as alt text.
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  // Regression test for a real production bug (2026-11-02): getProjectField
  // called `t(key)` with no `defaultValue`, then checked `translated ===
  // key` to detect a missing locale entry — but i18next's real
  // missingKeyHandler/parseMissingKeyHandler (src/lib/i18n.ts) rewrites a
  // missing key into a humanized string instead of returning the raw key,
  // so that comparison silently failed and every CMS-uploaded project
  // (none of which have a hand-written projects:items.<slug>.* locale
  // entry) rendered a placeholder like "Menasco Scope" instead of its real
  // description/scope text. This file's mock `t` simulates that exact
  // failure mode for any call made without `defaultValue`.
  it('renders the real English description and scope text, not a humanized missing-key placeholder (casa-cavalli has no projects:items locale coverage in this mock)', () => {
    renderProject('casa-cavalli');
    const overviewPanel = screen.getByRole('tabpanel');
    expect(overviewPanel).toHaveTextContent('Casa Cavalli is a signature residential tower on Dubai Marina');
    expect(overviewPanel).not.toHaveTextContent('__MISSING_KEY_HUMANIZED_PLACEHOLDER__');
  });
});

describe('ProjectDetailPage — cinematic projects are untouched', () => {
  it.each(['vela-by-omniyat', 'qiddiya'])('renders the cinematic branch for %s, not the new tabs/gallery markup', (slug) => {
    renderProject(slug);
    expect(screen.getByTestId('cinematic-marker')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });
});
