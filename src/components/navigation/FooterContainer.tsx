import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { SectionThemeContext } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Container } from '../layout/Container';

export interface FooterContainerProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  theme?: Theme;
  children: ReactNode;
}

export function FooterContainer({ theme = 'dark', className, children, ...rest }: FooterContainerProps) {
  const isDark = theme === 'dark';

  return (
    <SectionThemeContext.Provider value={theme}>
      <footer
        className={cn('border-t', isDark ? 'border-white/10 bg-charcoal' : 'border-gray-200 bg-warmwhite', className)}
        {...rest}
      >
        <Container className="flex flex-col gap-16 py-16 md:py-20">{children}</Container>
      </footer>
    </SectionThemeContext.Provider>
  );
}
