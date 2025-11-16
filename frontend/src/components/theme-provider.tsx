import React, { createContext, useContext } from 'react';
import {
  ColorSchemeScript,
  MantineProvider,
} from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { mantineTheme } from '@/theme/mantine-theme';
import { MantineThemeAdapter } from '@/theme/mantine-theme-adapter';
import { ThemeMode } from 'shared/types';

type ThemeProviderProps = {
  children: React.ReactNode;
  initialTheme?: ThemeMode;
};

type ThemeProviderState = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

const initialState: ThemeProviderState = {
  theme: ThemeMode.SYSTEM,
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  initialTheme = ThemeMode.SYSTEM,
}: ThemeProviderProps) {
  return (
    <MantineProvider
      theme={mantineTheme}
      defaultColorScheme="auto"
      cssVariablesSelector=":root"
    >
      <ColorSchemeScript />
      <MantineThemeAdapter initialTheme={initialTheme}>
        {(value) => (
          <ThemeProviderContext.Provider value={value}>
            <Notifications position="top-right" zIndex={1000} />
            <ModalsProvider>{children}</ModalsProvider>
          </ThemeProviderContext.Provider>
        )}
      </MantineThemeAdapter>
    </MantineProvider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
