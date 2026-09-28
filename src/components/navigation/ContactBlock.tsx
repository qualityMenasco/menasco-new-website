import { Mail, MapPin, Phone } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Text } from '../typography/Typography';

export interface ContactBlockProps {
  heading?: string;
  phone?: string;
  email?: string;
  address?: string;
  theme?: Theme;
  className?: string;
}

export function ContactBlock({ heading = 'Contact', phone, email, address, theme, className }: ContactBlockProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const linkClasses = cn('text-small transition-colors duration-base', isDark ? 'text-gray-300 hover:text-warmwhite' : 'text-gray-700 hover:text-ink');
  const iconClasses = cn('mt-0.5 shrink-0', isDark ? 'text-gray-500' : 'text-gray-400');

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Text variant="small" theme={resolvedTheme} muted className="font-semibold uppercase tracking-wide">
        {heading}
      </Text>
      <ul role="list" className="flex flex-col gap-3">
        {phone && (
          <li className="flex items-start gap-2.5">
            <Phone size={16} aria-hidden="true" className={iconClasses} />
            <a href={`tel:${phone.replace(/\s+/g, '')}`} dir="ltr" className={linkClasses}>
              {phone}
            </a>
          </li>
        )}
        {email && (
          <li className="flex items-start gap-2.5">
            <Mail size={16} aria-hidden="true" className={iconClasses} />
            <a href={`mailto:${email}`} dir="ltr" className={linkClasses}>
              {email}
            </a>
          </li>
        )}
        {address && (
          <li className="flex items-start gap-2.5">
            <MapPin size={16} aria-hidden="true" className={iconClasses} />
            <span dir="ltr" className={cn(linkClasses, 'text-start')}>{address}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
