import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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

// Passthrough translator: keys render as-is; returnObjects arrays are stubbed.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValueOrOptions?: unknown) => {
      if (defaultValueOrOptions && typeof defaultValueOrOptions === 'object' && 'returnObjects' in defaultValueOrOptions) {
        if (key === 'mepPage.disciplinesSection.items') {
          return [
            // Mechanical has a (hypothetical) MEP-page section; the others don't yet.
            { label: 'Mechanical', title: 'Mechanical Systems', description: 'x', cta: 'Explore Mechanical', href: '/services/mep#mechanical-systems', imageAlt: '' },
            { label: 'Electrical', title: 'Electrical & ELV', description: 'x', imageAlt: '' },
            { label: 'Water Systems', title: 'Plumbing, Water & Drainage', description: 'x', imageAlt: '' },
            { label: 'Life Safety', title: 'Fire Protection & Life Safety', description: 'x', imageAlt: '' },
          ];
        }
        if (key === 'mepPage.integration.paragraphs') return ['p1', 'p2'];
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

describe('MEPPage', () => {
  it('renders the hero; discipline cards link only when they have a section', () => {
    renderMEPPage();
    expect(screen.getByRole('heading', { level: 2, name: 'mepPage.hero.title' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mechanical Systems' })).toHaveAttribute('href', '/services/mep#mechanical-systems');
    expect(screen.getByRole('heading', { level: 3, name: 'Fire Protection & Life Safety' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Fire Protection & Life Safety' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /mepPage.hero.secondaryCta/ })).toHaveAttribute('href', '/projects/categories');
  });

  it('toggles discipline layers in the systems diagram', () => {
    renderMEPPage();
    const mechanical = screen.getByRole('switch', { name: 'mepPage.integration.layers.mechanical' });
    expect(mechanical).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(mechanical);
    expect(mechanical).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(mechanical);
    expect(mechanical).toHaveAttribute('aria-checked', 'true');
    expect(screen.getAllByRole('switch')).toHaveLength(4);
  });
});
