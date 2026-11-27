import { useEffect } from 'react';

import { useTheme } from './useTheme';

export function useGameAccent(
  accentColor?: string | null,
) {
  const {
    setAccentColor,
    resetAccentColor,
  } = useTheme();

  useEffect(() => {
    if (accentColor) {
      setAccentColor(accentColor);
    } else {
      resetAccentColor();
    }

    return () => {
      resetAccentColor();
    };
  }, [
    accentColor,
    setAccentColor,
    resetAccentColor,
  ]);
}