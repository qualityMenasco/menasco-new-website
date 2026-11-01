import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ServiceDetailPage from './ServiceDetailPage';

// Same passthrough pattern as ProjectDetailPage.test.tsx — this page doesn't
// use returnObjects for the fields this smoke test checks, so a plain
// key/defaultValue passthrough is enough.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValueOrOptions?: unknown) => {
      if (typeof defaultValueOrOptions === 'string') return defaultValueOrOptions;
      if (defaultValueOrOptions && typeof defaultValueOrOptions === 'object' && 'defaultValue' in defaultValueOrOptions) {
        return (defaultValueOrOptions as { defaultValue: unknown }).defaultValue;
      }
      return key;
    },
  }),
}));

function renderService(slug: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/services/${slug}`]}>
        <Routes>
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

// EPC (turnkey-developments) now has its own dedicated bespoke page
// (src/pages/EPCPage.tsx, routed ahead of this catch-all) — see
// src/pages/EPCPage.test.tsx for its tests.

describe('ServiceDetailPage — an existing real service (sanity check, unaffected by the EPC change)', () => {
  it('still renders Mechanical correctly', () => {
    renderService('mechanical');
    expect(screen.getByRole('heading', { name: 'Mechanical' })).toBeInTheDocument();
  });
});
