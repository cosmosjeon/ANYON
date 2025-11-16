/// <reference types="vitest/globals" />

import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeMode } from 'shared/types';

const renderWithTheme = (ui: React.ReactNode) =>
  render(<ThemeProvider initialTheme={ThemeMode.LIGHT}>{ui}</ThemeProvider>);

describe('Button (Mantine wrapper)', () => {
  it('클릭 이벤트를 전달한다', () => {
    const handleClick = vi.fn();
    renderWithTheme(<Button onClick={handleClick}>확인</Button>);

    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('variant 매핑에 따라 data-variant가 설정된다', () => {
    renderWithTheme(<Button variant="destructive">위험</Button>);
    const btn = screen.getByRole('button', { name: '위험' });
    expect(btn).toHaveAttribute('data-variant', 'filled');
  });
});
