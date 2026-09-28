import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { IconComponent, Theme } from '../../types';
import { Heading, Text } from '../typography/Typography';

export interface CareerPathCardProps {
  icon: IconComponent;
  title: string;
  description: string;
  href: string;
  theme?: Theme;
  className?: string;
}

/** One career-path card (graduate / experienced / internship) — icon-led rather than photo-led since no candidate photography exists. */
export function CareerPathCard({ icon: Icon, title, description, href, theme, className }: CareerPathCardProps) {
  const { t } = useTranslation('common');
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return (
    <article
      className={cn(
        'group flex flex-col gap-5 rounded-md border p-7 transition-[transform,box-shadow,border-color] duration-base ease-engineered hover:-translate-y-1 hover:shadow-strong md:p-8',
        isDark ? 'border-white/10 bg-graphite hover:border-white/25' : 'border-gray-200 bg-warmwhite hover:border-gray-300',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex h-14 w-14 items-center justify-center rounded-sm transition-colors duration-base',
          isDark ? 'bg-white/10 text-brand-400' : 'bg-stone text-brand-600',
        )}
      >
        <Icon size={26} aria-hidden="true" />
      </span>
      <div className="flex flex-1 flex-col gap-2">
        <Heading level="h4" as="h3" theme={resolvedTheme}>
          {title}
        </Heading>
        <Text theme={resolvedTheme} muted>
          {description}
        </Text>
      </div>
      <SmartLink
        href={href}
        className={cn(
          'inline-flex items-center gap-1.5 text-small font-semibold transition-colors duration-base',
          isDark ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700',
        )}
      >
        {t('buttons.learnMore')}
        <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180 transition-transform duration-base group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
      </SmartLink>
    </article>
  );
}
