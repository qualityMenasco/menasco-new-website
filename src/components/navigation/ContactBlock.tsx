import { Mail, MapPin, Phone } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Heading } from '../typography/Typography';
import { ContactLink } from '../ui/ContactLink';

export interface ContactBlockProps {
  heading?: string;
  phone?: string;
  email?: string;
  address?: string;
  /**
   * When set, all three rows always render and a missing value shows this
   * label instead — so a set of blocks (e.g. the footer offices) keeps an
   * identical shape even when some details aren't published yet.
   */
  pendingLabel?: string;
  /** Which rows the block has (default: all three). */
  rows?: Array<'phone' | 'email' | 'address'>;
  theme?: Theme;
  className?: string;
}

export function ContactBlock({ heading = 'Contact', phone, email, address, pendingLabel, rows = ['phone', 'email', 'address'], theme, className }: ContactBlockProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const textClasses = cn('text-small', isDark ? 'text-gray-300' : 'text-gray-700');
  const linkClasses = cn(textClasses, 'transition-colors duration-base', isDark ? 'hover:text-warmwhite' : 'hover:text-ink');
  const pendingClasses = cn('text-small italic', isDark ? 'text-gray-500' : 'text-gray-400');
  const iconClasses = cn('mt-0.5 shrink-0', isDark ? 'text-gray-500' : 'text-gray-400');
  const has = (row: 'phone' | 'email' | 'address', value?: string) => rows.includes(row) && Boolean(value || pendingLabel);
  const pending = <span className={pendingClasses}>{pendingLabel}</span>;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Heading level="h4" as="h3" theme={resolvedTheme}>
        {heading}
      </Heading>
      <ul role="list" className="flex flex-col gap-3">
        {has('phone', phone) && (
          <li className="flex items-start gap-2.5">
            <Phone size={16} aria-hidden="true" className={iconClasses} />
            {phone ? (
              <ContactLink kind="tel" value={phone} className={linkClasses} />
            ) : (
              pending
            )}
          </li>
        )}
        {has('email', email) && (
          <li className="flex items-start gap-2.5">
            <Mail size={16} aria-hidden="true" className={iconClasses} />
            {email ? (
              <ContactLink kind="email" value={email} className={linkClasses} />
            ) : (
              pending
            )}
          </li>
        )}
        {has('address', address) && (
          <li className="flex items-start gap-2.5">
            <MapPin size={16} aria-hidden="true" className={iconClasses} />
            {address ? (
              <span dir="ltr" className={cn(textClasses, 'text-start')}>
                {address}
              </span>
            ) : (
              pending
            )}
          </li>
        )}
      </ul>
    </div>
  );
}
