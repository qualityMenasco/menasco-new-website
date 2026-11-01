import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import CustomPage from './CustomPage';

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
        if (key === 'services:customPage.sections') {
          return [
            { heading: 'Engineered to Project Requirements', paragraph: 'x' },
            { heading: 'Where Custom Fabrication Applies', paragraph: 'x', list: ['Non-standard plant-room layouts'] },
            { heading: 'Quality & Coordination', paragraph: 'x' },
          ];
        }
        return [];
      }
      if (typeof defaultValueOrOptions === 'string') return defaultValueOrOptions;
      if (key === 'services:customPage.name') return 'Custom Engineered Components';
      return key;
    },
  }),
}));

function renderCustomPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/services/manufacturing-prefabrication/custom']}>
        <Routes>
          <Route path="/services/manufacturing-prefabrication/custom" element={<CustomPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('CustomPage (Manufacturing & Prefabrication child page)', () => {
  it('renders the hero and section-carousel cards', () => {
    renderCustomPage();
    expect(screen.getByRole('heading', { name: 'Custom Engineered Components' })).toBeInTheDocument();
    expect(screen.getByText('Engineered to Project Requirements')).toBeInTheDocument();
    expect(screen.getByText('Where Custom Fabrication Applies')).toBeInTheDocument();
  });
});
