import { Briefcase, ChevronRight, HardHat, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import type { ContactEnquiryType } from '../../lib/contactApi';
import type { IconComponent } from '../../types';

export interface EnquiryTypeTabsProps {
  /** `null` before the visitor has made a deliberate choice — no card is selected. */
  value: ContactEnquiryType | null;
  onChange: (value: ContactEnquiryType) => void;
  className?: string;
}

const TYPES: ContactEnquiryType[] = ['general', 'career', 'project'];

const ICONS: Record<ContactEnquiryType, IconComponent> = {
  general: MessageCircle,
  career: Briefcase,
  project: HardHat,
};

/**
 * The General / Career / Project selector — shared by desktop and mobile so
 * the enquiry-type model can never diverge between them. A real tablist
 * (not three separate buttons/links) so switching type never reloads the
 * page or loses values already entered in shared fields.
 *
 * Below `lg` (the same 1024/1025px threshold the app's desktop/mobile shells
 * already split on — see useIsDesktop) this renders as a compact three-
 * across segmented control (icon + label only, one line, no description or
 * chevron) so it never dominates a phone screen's vertical space; at `lg`
 * and above every class here is overridden back to the original three
 * selection cards (icon + title + short description + chevron) — deliberately
 * stronger visual weight than the muted form underneath, which stays
 * disabled until one of these is picked.
 */
export function EnquiryTypeTabs({ value, onChange, className }: EnquiryTypeTabsProps) {
  const { t } = useTranslation('contact');

  return (
    <div role="tablist" aria-label={t('tabs.general')} className={cn('grid grid-cols-3 gap-1.5 lg:gap-2.5', className)}>
      {TYPES.map((type) => {
        const isActive = type === value;
        const Icon = ICONS[type];
        return (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(type)}
            className={cn(
              'group flex items-center justify-center gap-1.5 rounded-md border px-2 py-2.5 text-center transition-all duration-fast ease-out lg:justify-start lg:gap-3 lg:px-3.5 lg:py-3 lg:text-start',
              isActive
                ? 'border-brand-600 bg-brand-50 shadow-sm'
                : 'border-gray-200 bg-white hover:-translate-y-px hover:border-brand-300 hover:shadow-md',
            )}
          >
            <span
              className={cn(
                'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-fast lg:h-9 lg:w-9',
                isActive ? 'bg-brand-100 text-brand-700' : 'bg-brand-50 text-brand-600',
              )}
            >
              <Icon aria-hidden="true" className="h-3.5 w-3.5 lg:h-[18px] lg:w-[18px]" />
            </span>
            <span className="flex min-w-0 flex-col items-center lg:flex-1 lg:items-start">
              <span className="whitespace-nowrap text-caption font-semibold text-ink lg:whitespace-normal lg:text-body">
                {t(`tabs.${type}`)}
              </span>
              <span className="hidden truncate text-caption text-gray-500 lg:block">{t(`tabs.descriptions.${type}`)}</span>
            </span>
            <ChevronRight
              size={16}
              aria-hidden="true"
              className={cn(
                'hidden shrink-0 transition-transform duration-fast rtl:rotate-180 lg:block',
                isActive ? 'text-brand-600' : 'text-gray-400 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
