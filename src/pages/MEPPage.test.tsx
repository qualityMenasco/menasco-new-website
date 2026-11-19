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
            { id: 'mechanical', label: 'Mechanical', title: 'Mechanical Systems' },
            { id: 'electrical', label: 'Electrical', title: 'Electrical & ELV' },
            { id: 'plumbing', label: 'Water Systems', title: 'Plumbing, Water & Drainage' },
            { id: 'fire', label: 'Life Safety', title: 'Fire Protection & Life Safety' },
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
  it('renders the hero and switches discipline sheets', () => {
    renderMEPPage();
    expect(screen.getByRole('heading', { level: 1, name: /^mepPage\.hero\.eyebrow:\s*mepPage\.hero\.title$/ })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getByRole('tab', { name: /M-01/ })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: /FP-04/ }));
    expect(screen.getByRole('tab', { name: /FP-04/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('items.fire.introduction');
    expect(screen.getByRole('link', { name: /mepPage.hero.secondaryCta/ })).toHaveAttribute('href', '/projects/categories');
  });

  it('isolates a discipline and toggles the exploded view in the systems diagram', () => {
    renderMEPPage();
    const all = screen.getByRole('radio', { name: 'mepPage.integration.allLayers' });
    const mechanical = screen.getByRole('radio', { name: 'mepPage.integration.layers.mechanical' });
    expect(all).toHaveAttribute('aria-checked', 'true');
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    fireEvent.click(mechanical);
    expect(mechanical).toHaveAttribute('aria-checked', 'true');
    expect(all).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText(/mepPage.integration.annotations.supply/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'mepPage.integration.assemble' }));
    expect(screen.getByRole('button', { name: 'mepPage.integration.explode' })).toBeInTheDocument();
  });
});
