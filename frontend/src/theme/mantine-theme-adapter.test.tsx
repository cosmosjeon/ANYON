/// <reference types="vitest/globals" />

import { useEffect } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { useMantineColorScheme } from '@mantine/core';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { ThemeMode } from 'shared/types';

const setSystemTheme = (isDark: boolean) => {
  const matcher = (query: string): MediaQueryList => ({
    matches: query.includes('dark') ? isDark : !isDark,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });

  window.matchMedia = vi.fn(matcher);
};

describe('MantineThemeAdapter', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-mantine-color-scheme');
    setSystemTheme(false);
  });

  it('동기화: LIGHT → DARK → SYSTEM(시스템 다크) 전환 시 클래스/컬러스킴을 일관되게 유지한다', async () => {
    setSystemTheme(true); // 시스템 다크 모드 가정

    const snapshots: Array<{
      theme: ThemeMode;
      colorScheme: string | null;
      classes: string[];
    }> = [];
    let setThemeFn: ((mode: ThemeMode) => void) | undefined;

    function Probe() {
      const { theme, setTheme } = useTheme();
      const { colorScheme } = useMantineColorScheme();

      useEffect(() => {
        setThemeFn = setTheme;
        snapshots.push({
          theme,
          colorScheme,
          classes: Array.from(document.documentElement.classList),
        });
      }, [theme, colorScheme, setTheme]);

      return null;
    }

    render(
      <ThemeProvider initialTheme={ThemeMode.LIGHT}>
        <Probe />
      </ThemeProvider>
    );

    await waitFor(() =>
      expect(snapshots[snapshots.length - 1]?.theme).toBe(ThemeMode.LIGHT)
    );
    expect(snapshots[snapshots.length - 1]?.classes).toContain('light');
    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe(
      'light'
    );

    act(() => setThemeFn?.(ThemeMode.DARK));
    await waitFor(() =>
      expect(snapshots[snapshots.length - 1]?.theme).toBe(ThemeMode.DARK)
    );
    expect(snapshots[snapshots.length - 1]?.classes).toContain('dark');
    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe(
      'dark'
    );

    act(() => setThemeFn?.(ThemeMode.SYSTEM));
    await waitFor(() =>
      expect(snapshots[snapshots.length - 1]?.theme).toBe(ThemeMode.SYSTEM)
    );
    expect(snapshots[snapshots.length - 1]?.classes).toContain('dark'); // 시스템 다크 매칭
    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe(
      'dark'
    );
  });
});
