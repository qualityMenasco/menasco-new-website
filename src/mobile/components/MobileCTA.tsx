import { cn } from '../lib/utils';
import { LocaleLink } from './LocaleLink';

export interface MobileCTAProps {
  heading: string;
  description?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  theme?: 'light' | 'dark';
  className?: string;
}

/** Full-width closing call-to-action band, reused at the bottom of most pages. */
export function MobileCTA({ heading, description, primary, secondary, theme = 'dark', className }: MobileCTAProps) {
  const isDark = theme === 'dark';
  const isPrimaryExternal = /^([a-z]+:|\/[a-z0-9-]+\.[a-z0-9]+$)/i.test(primary.href) && !primary.href.startsWith('/');

  return (
    <section className={cn('px-4 py-12', isDark ? 'bg-gradient-to-br from-brand-800 via-brand-900 to-ink' : 'bg-stone', className)}>
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <h3 className={cn('font-display text-h2 font-semibold', isDark ? 'text-warmwhite' : 'text-ink')}>{heading}</h3>
        {description && <p className={cn('text-body', isDark ? 'text-brand-100' : 'text-gray-600')}>{description}</p>}
        <div className="mt-2 flex w-full flex-col gap-3">
          {isPrimaryExternal ? (
            <a href={primary.href} className="flex h-12 w-full items-center justify-center rounded-md bg-brand-600 text-body font-semibold text-warmwhite">
              {primary.label}
            </a>
          ) : (
            <LocaleLink to={primary.href} className="flex h-12 w-full items-center justify-center rounded-md bg-brand-600 text-body font-semibold text-warmwhite">
              {primary.label}
            </LocaleLink>
          )}
          {secondary && (
            <LocaleLink
              to={secondary.href}
              className={cn(
                'flex h-12 w-full items-center justify-center rounded-md border text-body font-semibold',
                isDark ? 'border-white/30 text-warmwhite' : 'border-gray-300 text-ink',
              )}
            >
              {secondary.label}
            </LocaleLink>
          )}
        </div>
      </div>
    </section>
  );
}
