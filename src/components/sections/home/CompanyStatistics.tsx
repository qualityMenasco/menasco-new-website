import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Statistic } from '../../content/Statistic';
import { companyStats } from '../../../data/companyStats';

const statKeys: Record<string, string> = {
  projects: 'stats.projects',
  years: 'stats.years',
  countries: 'stats.countries',
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
        columns={3}
        size="lg"
        items={verifiedStats.map((stat) => ({ value: stat.value, label: t(statKeys[stat.id] ?? stat.label), animate: true }))}
        theme="light"
        className="pt-4 lg:!grid-cols-[repeat(3,minmax(0,260px))] lg:!justify-center lg:gap-x-14"
      />
    </Section>
  );
}
