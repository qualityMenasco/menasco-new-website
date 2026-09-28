import { createContext, useContext } from 'react';
import type { Theme } from '../types';

export const SectionThemeContext = createContext<Theme>('light');

/** Content theme ('light' = dark text for light surfaces, 'dark' = light text for dark surfaces). */
export function useSectionTheme(override?: Theme): Theme {
  const contextTheme = useContext(SectionThemeContext);
  return override ?? contextTheme;
}
