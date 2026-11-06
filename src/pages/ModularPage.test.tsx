import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ModularPage from './ModularPage';

// jsdom has no ResizeObserver — useServiceCarousel needs one to mount
// without throwing.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

// Same passthrough pattern as ServiceDetailPage.test.tsx — this page uses
// returnObjects for its `sections` array.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValueOrOptions?: unknown) => {
      if (defaultValueOrOptions && typeof defaultValueOrOptions === 'object' && 'returnObjects' in defaultValueOrOptions) {
        if (key === 'services:modularPage.sections') {
          return [
            { heading: 'What We Deliver', paragraph: 'x' },
            { heading: 'Modular Data Center Solutions', paragraph: 'x' },
            { heading: 'Why Modular', paragraph: 'x', list: ['Faster on-site installation'] },
          ];
        }
        return [];
      }
      if (typeof defaultValueOrOptions === 'string') return defaultValueOrOptions;
      if (key === 'services:modularPage.name') return 'Modular MEP Solutions';
      return key;
    },
  }),
}));

function renderModularPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/services/manufacturing-prefabrication/modular']}>
        <Routes>
          <Route path="/services/manufacturing-prefabrication/modular" element={<ModularPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('ModularPage (Manufacturing & Prefabrication child page)', () => {
  it('renders the hero and section-carousel cards', () => {
    renderModularPage();
    expect(screen.getByRole('heading', { name: 'Modular MEP Solutions' })).toBeInTheDocument();
    expect(screen.getByText('What We Deliver')).toBeInTheDocument();
    expect(screen.getByText('Modular Data Center Solutions')).toBeInTheDocument();
  });
});
