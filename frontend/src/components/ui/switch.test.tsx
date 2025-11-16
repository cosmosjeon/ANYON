/// <reference types="vitest/globals" />

import { fireEvent, render, screen } from '@testing-library/react';
import { Switch } from '@/components/ui/switch';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeMode } from 'shared/types';

const renderWithTheme = (ui: React.ReactNode) =>
  render(<ThemeProvider initialTheme={ThemeMode.LIGHT}>{ui}</ThemeProvider>);

describe('Switch (Mantine wrapper)', () => {
  it('체크 상태를 토글한다', () => {
    const handleToggle = vi.fn();
    renderWithTheme(
      <Switch
        label="토글"
        checked={false}
        onCheckedChange={handleToggle}
        aria-label="토글"
      />
    );

    fireEvent.click(screen.getByRole('switch', { name: '토글' }));
    expect(handleToggle).toHaveBeenCalledWith(true);
  });
});
