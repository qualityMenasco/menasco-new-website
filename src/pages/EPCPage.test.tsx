import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import EPCPage from './EPCPage';

// jsdom has no IntersectionObserver — ScrollReveal (framer-motion's
// `whileInView`) needs one to mount without throwing.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// Same passthrough pattern as ServiceDetailPage.test.tsx — this page uses
// returnObjects for its capabilities/qualityHighlights/benefits arrays, so
// the mock must return those too, not just plain strings.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValueOrOptions?: unknown) => {
      if (defaultValueOrOptions && typeof defaultValueOrOptions === 'object' && 'returnObjects' in defaultValueOrOptions) {
        if (key === 'services:epcPage.capabilities') {
          return [
            { title: 'Engineering Design & BIM Coordination', description: 'x' },
            { title: 'Procurement & Supply-Chain Coordination', description: 'x' },
            { title: 'Site Mobilisation & Construction Management', description: 'x' },
            { title: 'Installation, Testing & Commissioning', description: 'x' },
            { title: 'Project Scheduling & Progress Reporting', description: 'x' },
            { title: 'Quality Assurance & HSE Compliance', description: 'x' },
          ];
        }
        if (key === 'services:epcPage.qualityHighlights') {
          return [
            { title: 'Coordinated Engineering', description: 'x' },
            { title: 'Managed Procurement', description: 'x' },
            { title: 'Disciplined Execution', description: 'x' },
            { title: 'Full Accountability', description: 'x' },
          ];
        }
        if (key === 'services:epcPage.benefits') return ['Single point of accountability'];
        return [];
      }
      if (typeof defaultValueOrOptions === 'string') return defaultValueOrOptions;
      return key;
    },
  }),
}));

function renderEPCPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/services/turnkey-developments']}>
        <Routes>
          <Route path="/services/turnkey-developments" element={<EPCPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('EPCPage (dedicated bespoke page)', () => {
  it('renders the hero, capabilities and quality sections', () => {
    renderEPCPage();
    expect(screen.getByRole('heading', { name: 'services:epcPage.hero.title' })).toBeInTheDocument();
    expect(screen.getByText('Engineering Design & BIM Coordination')).toBeInTheDocument();
    expect(screen.getByText('Coordinated Engineering')).toBeInTheDocument();
    expect(screen.getByText('Single point of accountability')).toBeInTheDocument();
  });
});
