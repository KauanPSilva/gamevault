import { createContext } from 'react';

export const DEFAULT_ACCENT = '#22D3EE';

export interface ThemeContextValue {
  accentColor: string;
  setAccentColor: (color: string) => void;
  resetAccentColor: () => void;
}

export const ThemeContext =
  createContext<ThemeContextValue | undefined>(
    undefined,
  );