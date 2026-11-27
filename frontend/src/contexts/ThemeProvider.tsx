import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import type { ReactNode } from 'react';

import {
  ThemeContext,
  DEFAULT_ACCENT,
} from './theme.context';

interface ThemeProviderProps {
  children: ReactNode;
}

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [accentColor, setColor] =
    useState(DEFAULT_ACCENT);

  const setAccentColor = useCallback(
    (color: string) => {
      if (!HEX_COLOR_PATTERN.test(color)) {
        setColor(DEFAULT_ACCENT);
        return;
      }

      setColor(color);
    },
    [],
  );

  const resetAccentColor = useCallback(() => {
    setColor(DEFAULT_ACCENT);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--game-accent',
      accentColor,
    );

    return () => {
      document.documentElement.style.removeProperty(
        '--game-accent',
      );
    };
  }, [accentColor]);

  const value = useMemo(
    () => ({
      accentColor,
      setAccentColor,
      resetAccentColor,
    }),
    [
      accentColor,
      setAccentColor,
      resetAccentColor,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}