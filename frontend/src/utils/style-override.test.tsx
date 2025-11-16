/// <reference types="vitest/globals" />

import { useEffect } from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { AppWithStyleOverride } from '@/utils/style-override';
import { ThemeMode } from 'shared/types';

afterEach(() => {
  cleanup();
  document.documentElement.style.cssText = '';
});

describe('AppWithStyleOverride', () => {
  it('VIBE_STYLE_OVERRIDE(cssVars) 메시지로 전달된 CSS 변수를 documentElement에 반영한다', async () => {
    render(
      <ThemeProvider initialTheme={ThemeMode.LIGHT}>
        <AppWithStyleOverride>
          <div>child</div>
        </AppWithStyleOverride>
      </ThemeProvider>
    );

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'VIBE_STYLE_OVERRIDE',
            payload: {
              kind: 'cssVars',
              variables: {
                '--vibe-test-var': '#123456',
              },
            },
          },
          origin: 'http://localhost',
        })
      );
    });

    await waitFor(() =>
      expect(
        document.documentElement.style.getPropertyValue('--vibe-test-var')
      ).toBe('#123456')
    );
  });

  it('VIBE_STYLE_OVERRIDE(theme) 메시지로 테마를 전환한다', async () => {
    const themes: ThemeMode[] = [];
    let setThemeFn: ((mode: ThemeMode) => void) | undefined;

    function Probe() {
      const { theme, setTheme } = useTheme();
      useEffect(() => {
        themes.push(theme);
        setThemeFn = setTheme;
      }, [theme, setTheme]);
      return null;
    }

    render(
      <ThemeProvider initialTheme={ThemeMode.LIGHT}>
        <AppWithStyleOverride>
          <Probe />
        </AppWithStyleOverride>
      </ThemeProvider>
    );

    await waitFor(() => expect(themes[themes.length - 1]).toBe(ThemeMode.LIGHT));

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'VIBE_STYLE_OVERRIDE',
            payload: {
              kind: 'theme',
              theme: ThemeMode.DARK,
            },
          },
          origin: 'http://localhost',
        })
      );
    });

    await waitFor(() => expect(themes[themes.length - 1]).toBe(ThemeMode.DARK));

    // setTheme가 정상적으로 작동하는지 sanity check
    act(() => setThemeFn?.(ThemeMode.LIGHT));
    await waitFor(() => expect(themes[themes.length - 1]).toBe(ThemeMode.LIGHT));
  });
});
