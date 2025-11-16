/// <reference types="vitest/globals" />

import { fireEvent, render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/input';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeMode } from 'shared/types';

describe('Input (Mantine wrapper)', () => {
  it('meta+enter 호출 시 onCommandEnter를 실행한다', () => {
    const handleCommandEnter = vi.fn();
    render(
      <ThemeProvider initialTheme={ThemeMode.LIGHT}>
        <Input onCommandEnter={handleCommandEnter} />
      </ThemeProvider>
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter', metaKey: true });

    expect(handleCommandEnter).toHaveBeenCalledTimes(1);
  });

  it('meta+shift+enter 호출 시 onCommandShiftEnter를 실행한다', () => {
    const handleCommandShiftEnter = vi.fn();
    render(
      <ThemeProvider initialTheme={ThemeMode.LIGHT}>
        <Input onCommandShiftEnter={handleCommandShiftEnter} />
      </ThemeProvider>
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter', metaKey: true, shiftKey: true });

    expect(handleCommandShiftEnter).toHaveBeenCalledTimes(1);
  });
});
