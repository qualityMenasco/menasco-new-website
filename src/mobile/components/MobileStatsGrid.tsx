import { useTranslation } from 'react-i18next';
import { companyStats } from '../../data/companyStats';
import { cn } from '../lib/utils';
import { useCountUp } from '../../components/content/Statistic';

/** The stat value, counting up from 0 the first time it scrolls into view (static under reduced motion). */
function CountUp({ value }: { value: string }) {
  const { ref, display } = useCountUp(value, true);
  return <span ref={ref}>{display}</span>;
}

const statKeys: Record<string, string> = {
  projects: 'stats.projects',
  years: 'stats.years',
  countries: 'stats.countries',
};

/** Shorter wording for the homepage's compact tiles — full labels (above) stay unchanged for every other surface reusing this component. */
const compactStatKeys: Record<string, string> = {
  projects: 'stats.projectsShort',
  years: 'stats.yearsShort',
  countries: 'stats.countriesShort',
};

export interface MobileStatsGridProps {
  /** Denser 2x2 tiles with shortened labels — opt-in so existing callers (e.g. the mobile About page) keep their current sizing/wording. */
  compact?: boolean;
}

/** Stat tiles — reused wherever the homepage stats need to appear. */
export function MobileStatsGrid({ compact = false }: MobileStatsGridProps) {
  const { t } = useTranslation('home');
  const keys = compact ? compactStatKeys : statKeys;

  return (
    <div className={cn('grid', compact ? 'grid-cols-3 gap-2' : 'grid-cols-2 gap-3 md:grid-cols-3')}>
      {companyStats.map((stat, index) => (
        <div
          key={stat.id}
          className={cn(
            'rounded-md border border-gray-200 bg-warmwhite',
            compact ? 'p-3.5' : 'p-4',
            // Odd last tile spans the 2-up phone row; tablets fit all three in one row.
            !compact && index === companyStats.length - 1 && companyStats.length % 2 === 1 && 'col-span-2 md:col-span-1',
          )}
        >
          <div
            className={cn(
              'font-display font-semibold text-brand-600',
              compact ? 'text-[28px] leading-none' : 'text-stat leading-none',
            )}
          >
            <CountUp value={stat.value} />
          </div>
          <div
            className={cn(
              'font-medium text-gray-600',
              compact ? 'mt-1 text-caption leading-[1.2]' : 'mt-1.5 text-caption',
            )}
          >
            {t(keys[stat.id] ?? stat.label)}
          </div>
        </div>
      ))}
    </div>
  );
}
