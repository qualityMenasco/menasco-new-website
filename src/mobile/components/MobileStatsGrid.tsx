import { useTranslation } from 'react-i18next';
import { companyStats } from '../../data/companyStats';
import { cn } from '../lib/utils';

const statKeys: Record<string, string> = {
  projects: 'stats.projects',
  years: 'stats.years',
  countries: 'stats.countries',
  workforce: 'stats.workforce',
};

/** Shorter wording for the homepage's compact tiles — full labels (above) stay unchanged for every other surface reusing this component. */
const compactStatKeys: Record<string, string> = {
  projects: 'stats.projectsShort',
  years: 'stats.yearsShort',
  countries: 'stats.countriesShort',
  workforce: 'stats.workforce',
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
    <div className={cn('grid grid-cols-2', compact ? 'gap-2.5' : 'gap-3')}>
      {companyStats.map((stat) => (
        <div
          key={stat.id}
          className={cn('rounded-md border border-gray-200 bg-warmwhite', compact ? 'p-3.5' : 'p-4')}
        >
          <div
            className={cn(
              'font-display font-semibold text-brand-600',
              compact ? 'text-[32px] leading-none' : 'text-stat leading-none',
            )}
          >
            {stat.value}
          </div>
          <div
            className={cn(
              'font-medium text-gray-600',
              compact ? 'mt-1 text-[11px] leading-[1.2]' : 'mt-1.5 text-caption',
            )}
          >
            {t(keys[stat.id] ?? stat.label)}
          </div>
        </div>
      ))}
    </div>
  );
}
