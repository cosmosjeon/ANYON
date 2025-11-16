/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '@/components/ui/checkbox';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeMode } from 'shared/types';

const renderWithTheme = (ui: React.ReactNode) =>
  render(<ThemeProvider initialTheme={ThemeMode.LIGHT}>{ui}</ThemeProvider>);

describe('Checkbox (Mantine wrapper)', () => {
  it('체크 상태를 토글 이벤트로 반영한다', () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <Checkbox
        label="동의"
        checked={false}
        onCheckedChange={(checked) => handleChange(checked)}
      />
    );

    fireEvent.click(screen.getByRole('checkbox', { name: '동의' }));
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
