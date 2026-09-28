import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { Eyebrow } from '../typography/Typography';

export interface CountryNavOption {
  /** `null` represents the "All Projects" option. */
  value: string | null;
  label: string;
}

export interface CountrySidebarProps {
  options: CountryNavOption[];
  activeValue: string | null;
  onSelect: (value: string | null) => void;
  className?: string;
}

const itemBase =
  'group relative block w-full border-s-2 py-2.5 ps-4 pe-2 text-start text-body font-sans transition-all duration-300 ease-out';

/**
 * Understated left-hand wayfinding nav for prioritizing projects by
 * country — a vertical list, not a button/pill group, with a compact
 * horizontally scrollable chip fallback below the `md` breakpoint.
 * Selecting an option reorders (never hides) the project gallery it
 * controls — see prioritizeByField in lib/projectOrdering.
 */
export function CountrySidebar({ options, activeValue, onSelect, className }: CountrySidebarProps) {
  const { t } = useTranslation('projects');
  const navLabel = t('categoriesPage.projectLocations');

  return (
    <>
      {/* Desktop / tablet: vertical wayfinding list */}
      <nav aria-label={navLabel} className={cn('hidden md:flex md:flex-col', className)}>
        <Eyebrow className="mb-4 ps-4">{navLabel}</Eyebrow>
        <ul className="flex flex-col">
          {options.map((option) => {
            const key = option.value ?? 'all';
            const isActive = option.value === activeValue;
            return (
              <li key={key}>
                <button
                  type="button"
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => onSelect(option.value)}
                  className={cn(
                    itemBase,
                    isActive
                      ? 'border-brand-600 bg-brand-50/60 font-semibold text-ink'
                      : 'border-transparent text-gray-600 hover:border-gray-200 hover:bg-stone/60 hover:ps-5 hover:text-brand-600',
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile: compact horizontally scrollable chip selector, same options/behavior */}
      <nav
        aria-label={navLabel}
        className={cn(
          'flex gap-2 overflow-x-auto pb-1 md:hidden',
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          className,
        )}
      >
        {options.map((option) => {
          const key = option.value ?? 'all';
          const isActive = option.value === activeValue;
          return (
            <button
              key={key}
              type="button"
              aria-current={isActive ? 'true' : undefined}
              onClick={() => onSelect(option.value)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-small font-medium transition-colors duration-base',
                isActive
                  ? 'border-brand-600 bg-brand-50 font-semibold text-brand-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:text-ink',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
