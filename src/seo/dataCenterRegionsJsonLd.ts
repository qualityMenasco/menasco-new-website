import { dcTechnical } from '../data/dataCenterTechnical';
import { SITE_URL } from './constants';
import { regionalServicesJsonLd } from './structuredData';

const PATH = '/services/data-centers';

/** Market regions on the Data Center page, for the page Service's `areaServed`. */
export const dataCenterAreaServed = dcTechnical.energy.markets.map((m) => m.name);

/**
 * One standalone Service per Local energy markets region, built from the
 * page's own copy ("How MENASCO helps" + competitive advantage). Shared by the
 * page (src/pages/DataCenterPage.tsx) and the prerender route config
 * (scripts/seo/routes.ts) so client and static JSON-LD never drift apart.
 */
export function dataCenterRegionsJsonLd() {
  return regionalServicesJsonLd(
    dcTechnical.energy.markets.map((m) => ({
      name: `Data center MEP and infrastructure delivery in ${m.inName}`,
      description: `${m.help} ${m.advantage.join('. ')}.`,
      url: `${SITE_URL}${PATH}#${m.slug}`,
      area: m.name,
      areaType: m.id === 'europe' ? ('Place' as const) : ('Country' as const),
    })),
  );
}
