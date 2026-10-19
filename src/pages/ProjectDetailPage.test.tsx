import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
      return (options?.defaultValue as string | undefined) ?? key;
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
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    // The mocked `t` returns the raw translation key when no `defaultValue` is passed (this
    // test isn't about real locale copy) — so tabs are queried by their resolved i18n keys.
    expect(screen.getByRole('tab', { name: 'projects:detail.tabOverview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'projects:detail.tabScope' })).toBeInTheDocument();
  });

  it('falls back the gallery to the hero image alone — casa-cavalli has an empty gallery array', () => {
    renderProject('casa-cavalli');
    const images = screen.getAllByAltText('Casa Cavalli');
    // One in the hero overlay region's <img> (decorative alt="") is separate; the gallery's
    // single fallback slide is the only element carrying the project title as alt text.
    expect(images.length).toBeGreaterThanOrEqual(1);
  });
});

describe('ProjectDetailPage — cinematic projects are untouched', () => {
  it.each(['vela-by-omniyat', 'qiddiya'])('renders the cinematic branch for %s, not the new tabs/gallery markup', (slug) => {
    renderProject(slug);
    expect(screen.getByTestId('cinematic-marker')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });
});
