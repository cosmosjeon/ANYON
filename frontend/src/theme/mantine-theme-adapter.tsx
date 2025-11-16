import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { ThemeMode } from 'shared/types';

type MantineThemeAdapterProps = {
  initialTheme: ThemeMode;
  children: (value: {
    theme: ThemeMode;
    setTheme: (mode: ThemeMode) => void;
  }) => ReactNode;
};

type ColorSchemeValue = 'auto' | 'light' | 'dark';

const mapThemeModeToColorScheme = (mode: ThemeMode): ColorSchemeValue => {
  if (mode === ThemeMode.DARK) return 'dark';
  if (mode === ThemeMode.LIGHT) return 'light';
  return 'auto';
};

export function MantineThemeAdapter({
  initialTheme,
  children,
}: MantineThemeAdapterProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });

  // Keep internal state in sync when caller passes a new initial theme.
  useEffect(() => {
    setThemeMode(initialTheme);
  }, [initialTheme]);

  // Apply Mantine color scheme + HTML class for Tailwind-based fallbacks.
  useEffect(() => {
    const target = mapThemeModeToColorScheme(themeMode);
    setColorScheme(target);

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      const next =
        themeMode === ThemeMode.SYSTEM ? computedColorScheme : themeMode.toLowerCase();
      root.classList.add(next);
    }
  }, [computedColorScheme, setColorScheme, themeMode]);

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      setThemeMode(mode);
    },
    [setThemeMode]
  );

  // Expose the user-selected theme, preserving ThemeMode.SYSTEM for callers.
  const value = useMemo(
    () => ({ theme: themeMode, setTheme }),
    [setTheme, themeMode]
  );

  return <>{children(value)}</>;
}
