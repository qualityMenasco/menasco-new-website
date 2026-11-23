import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import services from '../../public/locales/en/services.json';
import common from '../../public/locales/en/common.json';
import CivilPage from './CivilPage';

// Must match the 'BIM & Digital Engineering' sectionId in src/data/navigation.ts.
const BIM_ANCHOR = 'bim-digital-engineering';

// jsdom has no IntersectionObserver — ScrollReveal (framer-motion's
// `whileInView`) needs one to mount without throwing.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// Resolve keys against the real English copy, so the test also catches a
// missing or misnamed key in services:civilPage.*.
const NAMESPACES: Record<string, unknown> = { services, common };
function lookup(key: string, ns: string): unknown {
  const [explicitNs, path] = key.includes(':') ? key.split(':') : [ns, key];
  return path.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), NAMESPACES[explicitNs]);
}

vi.mock('react-i18next', () => ({
  useTranslation: (ns: string | string[] = 'services') => ({
    t: (key: string) => lookup(key, Array.isArray(ns) ? ns[0] : ns) ?? key,
    i18n: { language: 'en' },
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

const civil = services.civilPage;

describe('CivilPage', () => {
  it('renders every section from the real copy', () => {
    renderCivilPage();
    expect(screen.getByRole('heading', { level: 1, name: new RegExp(civil.hero.title) })).toBeInTheDocument();
    for (const heading of [
      civil.approach.heading,
      civil.capabilities.heading,
      civil.integration.heading,
      civil.bim.heading,
      civil.missionCritical.heading,
      civil.delivery.heading,
      civil.faq.heading,
      civil.closing.heading,
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
    }
  });

  it('gives the Services menu BIM item a section to land on', () => {
    renderCivilPage();
    expect(document.getElementById(BIM_ANCHOR)).not.toBeNull();
  });

  it('switches the interface diagram point from its hotspots and arrows', () => {
    renderCivilPage();
    const [first, second] = civil.integration.points;
    expect(screen.getByRole('heading', { level: 3, name: first.title })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: second.title }));
    expect(screen.getByRole('button', { name: second.title })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: common.buttons.previous }));
    expect(screen.getByRole('button', { name: first.title })).toHaveAttribute('aria-pressed', 'true');
  });

  it('has exactly one closing call to action, pointing at the contact page', () => {
    renderCivilPage();
    const cta = screen.getByRole('link', { name: civil.closing.cta });
    expect(cta.getAttribute('href')).toMatch(/\/contact$/);
  });
});
