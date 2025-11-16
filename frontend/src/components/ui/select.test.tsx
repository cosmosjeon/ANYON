/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeMode } from 'shared/types';

const renderWithTheme = (ui: React.ReactNode) =>
  render(<ThemeProvider initialTheme={ThemeMode.LIGHT}>{ui}</ThemeProvider>);

describe('Select (Mantine wrapper, Radix-compatible API)', () => {
  it('placeholder와 아이템을 렌더링한다', () => {
    renderWithTheme(
      <Select value="a" onValueChange={() => {}}>
        <SelectTrigger>
          <SelectValue placeholder="선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
          <SelectItem value="b">B</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByPlaceholderText('선택')).toBeInTheDocument();
  });
});
