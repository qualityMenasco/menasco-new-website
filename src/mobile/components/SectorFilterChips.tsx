import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

export interface SectorFilterChipsProps {
  options: { slug: string; title: string }[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
}

/** Horizontally scrollable, tap-only filter chips — no hover state required, so it works identically on touch. */
export function SectorFilterChips({ options, activeSlug, onSelect }: SectorFilterChipsProps) {
  const { t } = useTranslation('projects');
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={activeSlug === null}
        className={cn(
          'shrink-0 rounded-full border px-4 py-2 text-small font-semibold transition-colors duration-base',
          activeSlug === null ? 'border-brand-600 bg-brand-600 text-warmwhite' : 'border-gray-300 text-ink',
        )}
      >
        {t('categoriesPage.allProjects')}
      </button>
      {options.map((option) => (
        <button
          key={option.slug}
          type="button"
          onClick={() => onSelect(option.slug)}
          aria-pressed={activeSlug === option.slug}
          className={cn(
            'shrink-0 rounded-full border px-4 py-2 text-small font-semibold transition-colors duration-base',
            activeSlug === option.slug ? 'border-brand-600 bg-brand-600 text-warmwhite' : 'border-gray-300 text-ink',
          )}
        >
          {option.title}
        </button>
      ))}
    </div>
  );
}
