/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { Alert } from '@/components/ui/alert';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeMode } from 'shared/types';

const renderWithTheme = (ui: React.ReactNode) =>
  render(<ThemeProvider initialTheme={ThemeMode.LIGHT}>{ui}</ThemeProvider>);

describe('Alert (Mantine wrapper)', () => {
  it('내용을 렌더링한다', () => {
    renderWithTheme(<Alert title="알림">메시지</Alert>);
    expect(screen.getByText('알림')).toBeInTheDocument();
    expect(screen.getByText('메시지')).toBeInTheDocument();
  });
});
