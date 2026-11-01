import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import MEPPage from './MEPPage';

// jsdom has no IntersectionObserver — ScrollReveal (framer-motion's
// `whileInView`) needs one to mount without throwing.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// Same passthrough pattern as EPCPage.test.tsx — this page uses
// returnObjects for its capabilities/qualityHighlights/disciplines arrays.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValueOrOptions?: unknown) => {
      if (defaultValueOrOptions && typeof defaultValueOrOptions === 'object' && 'returnObjects' in defaultValueOrOptions) {
        if (key === 'services:mepPage.capabilities') {
          return [
            { title: 'HVAC & Chilled-Water Systems', description: 'x' },
            { title: 'Power Distribution & ELV Systems', description: 'x' },
            { title: 'Water, Drainage & Plumbing Systems', description: 'x' },
            { title: 'Fire Protection & Life Safety', description: 'x' },
            { title: 'BIM Coordination & Design', description: 'x' },
            { title: 'Testing, Commissioning & Handover', description: 'x' },
          ];
        }
        if (key === 'services:mepPage.qualityHighlights') {
          return [
            { title: 'Single-Source Accountability', description: 'x' },
            { title: 'Code & Standards Compliance', description: 'x' },
            { title: 'Integrated Testing & Commissioning', description: 'x' },
            { title: 'Long-Term Reliability', description: 'x' },
          ];
        }
        if (key === 'services:mepPage.disciplines.items') {
          return [
            { title: 'Mechanical', description: 'x', href: '/services/mechanical' },
            { title: 'Electrical', description: 'x', href: '/services/electrical' },
            { title: 'Plumbing', description: 'x', href: '/services/plumbing' },
            { title: 'Fire Protection', description: 'x', href: '/services/fire-protection' },
          ];
        }
        return [];
      }
      if (typeof defaultValueOrOptions === 'string') return defaultValueOrOptions;
      return key;
    },
  }),
}));

function renderMEPPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/services/mep']}>
        <Routes>
          <Route path="/services/mep" element={<MEPPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('MEPPage (dedicated bespoke page)', () => {
  it('renders the hero, capabilities, quality and discipline-link sections', () => {
    renderMEPPage();
    expect(screen.getByRole('heading', { name: 'services:mepPage.hero.title' })).toBeInTheDocument();
    expect(screen.getByText('HVAC & Chilled-Water Systems')).toBeInTheDocument();
    expect(screen.getByText('Single-Source Accountability')).toBeInTheDocument();
    const mechanicalLink = screen.getByRole('link', { name: /Mechanical/ });
    expect(mechanicalLink).toHaveAttribute('href', '/services/mechanical');
  });
});
