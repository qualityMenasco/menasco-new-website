import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Heading, Text } from '../typography/Typography';

export interface LocationBlockProps {
  name: string;
  address: string;
  phone?: string;
  theme?: Theme;
  className?: string;
}

export function LocationBlock({ name, address, phone, theme, className }: LocationBlockProps) {
  const resolvedTheme = useSectionTheme(theme);
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Heading level="h4" as="h3" theme={resolvedTheme}>
        {name}
      </Heading>
      <Text variant="small" theme={resolvedTheme} muted dir="ltr" className="text-start">
        {address}
      </Text>
      {phone && (
        <Text variant="small" theme={resolvedTheme} muted dir="ltr" className="text-start">
          {phone}
        </Text>
      )}
    </div>
  );
}
