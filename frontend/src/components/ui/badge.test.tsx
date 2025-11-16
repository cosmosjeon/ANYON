/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeMode } from 'shared/types';

const renderWithTheme = (ui: React.ReactNode) =>
  render(<ThemeProvider initialTheme={ThemeMode.LIGHT}>{ui}</ThemeProvider>);

describe('Badge (Mantine wrapper)', () => {
  it('텍스트를 렌더링한다', () => {
    renderWithTheme(<Badge>알림</Badge>);
    expect(screen.getByText('알림')).toBeInTheDocument();
  });
});
