import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import CivilPage from './CivilPage';

// jsdom has no IntersectionObserver — ScrollReveal (framer-motion's
// `whileInView`) needs one to mount without throwing.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// Same passthrough pattern as EPCPage.test.tsx — this page uses
// returnObjects for its capabilities/qualityHighlights/benefits arrays.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValueOrOptions?: unknown) => {
      if (defaultValueOrOptions && typeof defaultValueOrOptions === 'object' && 'returnObjects' in defaultValueOrOptions) {
        if (key === 'services:civilPage.capabilities') {
          return [
            { title: 'Site Works & Enabling Coordination', description: 'x' },
            { title: 'Structural Interface Coordination', description: 'x' },
            { title: 'BIM-Based Clash Detection', description: 'x' },
            { title: 'Underground Services Coordination', description: 'x' },
            { title: 'Project Scheduling & Progress Reporting', description: 'x' },
            { title: 'Quality Assurance & HSE Compliance', description: 'x' },
          ];
        }
        if (key === 'services:civilPage.qualityHighlights') {
          return [
            { title: 'Coordinated Planning', description: 'x' },
            { title: 'Clash-Free Design', description: 'x' },
            { title: 'Consistent Standards', description: 'x' },
            { title: 'Single Point of Contact', description: 'x' },
          ];
        }
        if (key === 'services:civilPage.benefits') return ['Fewer on-site clashes'];
        return [];
      }
      if (typeof defaultValueOrOptions === 'string') return defaultValueOrOptions;
      return key;
    },
  }),
}));

function renderCivilPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/services/civil']}>
        <Routes>
          <Route path="/services/civil" element={<CivilPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('CivilPage (dedicated bespoke page)', () => {
  it('renders the hero, capabilities and quality sections, framing civil as a partner-delivered scope', () => {
    renderCivilPage();
    expect(screen.getByRole('heading', { name: 'services:civilPage.hero.title' })).toBeInTheDocument();
    expect(screen.getByText('Site Works & Enabling Coordination')).toBeInTheDocument();
    expect(screen.getByText('Coordinated Planning')).toBeInTheDocument();
    expect(screen.getByText('Fewer on-site clashes')).toBeInTheDocument();
  });
});
