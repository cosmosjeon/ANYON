/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme-provider';
import { Textarea } from '@/components/ui/textarea';
import { ThemeMode } from 'shared/types';

const renderWithTheme = (ui: React.ReactNode) =>
  render(<ThemeProvider initialTheme={ThemeMode.LIGHT}>{ui}</ThemeProvider>);

describe('Textarea (Mantine wrapper)', () => {
  it('플레이스홀더를 표시한다', () => {
    renderWithTheme(<Textarea placeholder="내용 입력" />);
    expect(screen.getByPlaceholderText('내용 입력')).toBeInTheDocument();
  });
});
