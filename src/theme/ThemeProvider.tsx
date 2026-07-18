import React, { createContext, useContext } from 'react';
import type { Theme } from './tokens';
import { wireframe } from './wireframe';

const ThemeContext = createContext<Theme>(wireframe);

export interface ThemeProviderProps {
  theme?: Theme;
  children: React.ReactNode;
}

/**
 * Provides the active theme. Optional — every component falls back to the
 * wireframe theme, so a bare app renders as an intentional wireframe.
 */
export function ThemeProvider({ theme = wireframe, children }: ThemeProviderProps) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
