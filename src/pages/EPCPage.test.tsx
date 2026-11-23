import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import services from '../../public/locales/en/services.json';
import common from '../../public/locales/en/common.json';
import EPCPage from './EPCPage';

// jsdom has no IntersectionObserver — ScrollReveal (framer-motion's
// `whileInView`) needs one to mount without throwing.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// Resolve keys against the real English copy, so the test also catches a
// missing or misnamed key in services:epcPage.*.
const NAMESPACES: Record<string, unknown> = { services, common };
function lookup(key: string, ns: string): unknown {
  const [explicitNs, path] = key.includes(':') ? key.split(':') : [ns, key];
  return path.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), NAMESPACES[explicitNs]);
}

vi.mock('react-i18next', () => ({
  useTranslation: (ns: string | string[] = 'services') => ({
    t: (key: string) => {
      const value = lookup(key, Array.isArray(ns) ? ns[0] : ns);
      return value ?? key;
    },
    i18n: { language: 'en' },
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

describe('EPCPage', () => {
  it('renders every section from the real copy', () => {
    renderEPCPage();
    const epc = services.epcPage;
    expect(screen.getByRole('heading', { level: 1, name: new RegExp(epc.hero.title) })).toBeInTheDocument();
    for (const heading of [epc.approach.heading, epc.capabilities.heading, epc.advantage.heading, epc.controls.heading, epc.industries.heading, epc.faq.heading, epc.closing.heading]) {
      expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
    }
    for (const item of epc.capabilities.items) expect(screen.getAllByRole('heading', { level: 3, name: item.title }).length).toBeGreaterThan(0);
  });

  it('has exactly one closing call to action, pointing at the contact page', () => {
    renderEPCPage();
    const cta = screen.getByRole('link', { name: services.epcPage.closing.cta });
    expect(cta.getAttribute('href')).toMatch(/\/contact$/);
  });
});
