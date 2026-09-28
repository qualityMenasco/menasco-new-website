import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Statistic } from '../../content/Statistic';
import { companyStats } from '../../../data/companyStats';

const statKeys: Record<string, string> = {
  projects: 'stats.projects',
  years: 'stats.years',
  countries: 'stats.countries',
  workforce: 'stats.workforce',
};

const verifiedStats = companyStats.filter((stat) => stat.verificationStatus === 'verified');

/**
 * Only verified figures render here. See src/data/companyStats.ts for the
 * source and provenance of each value.
 */
export function CompanyStatistics() {
  const { t } = useTranslation('home');

  return (
    <Section background="warmwhite" spacing="lg" edgeFade>
      <Statistic
        layout="grid"
        columns={4}
        size="lg"
        items={verifiedStats.map((stat) => ({ value: stat.value, label: t(statKeys[stat.id] ?? stat.label), animate: true }))}
        theme="light"
        className="pt-4"
      />
    </Section>
  );
}
