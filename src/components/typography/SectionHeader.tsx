import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Align, HeadingLevel, Theme } from '../../types';
import { ButtonLink } from '../ui/Button';
import { Eyebrow, Heading, Text, type HeadingLevelStyle } from './Typography';

export interface SectionHeaderProps {
  eyebrow?: string;
  heading: string;
  description?: string;
  action?: { label: string; href: string };
  align?: Align;
  theme?: Theme;
  headingLevel?: HeadingLevelStyle;
  headingAs?: HeadingLevel;
  className?: string;
  headingClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeader({
  eyebrow,
  heading,
  description,
  action,
  align = 'left',
  theme,
  headingLevel = 'h2',
  headingAs,
  className,
  headingClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isCentered = align === 'center';

  return (
    <div className={cn('flex flex-col gap-4', isCentered && 'items-center text-center', className)}>
      {eyebrow && (
        <Eyebrow theme={resolvedTheme} className="mb-1">
          {eyebrow}
        </Eyebrow>
      )}
      <Heading level={headingLevel} as={headingAs} theme={resolvedTheme} className={cn('max-w-3xl', headingClassName)}>
        {heading}
      </Heading>
      {description && (
        <Text variant="body-lg" theme={resolvedTheme} className={cn('max-w-2xl', isCentered && 'mx-auto', descriptionClassName)}>
          {description}
        </Text>
      )}
      {action && (
        <ButtonLink href={action.href} variant="text" theme={resolvedTheme} trailingIcon={ArrowRight} className="mt-2">
          {action.label}
        </ButtonLink>
      )}
    </div>
  );
}
