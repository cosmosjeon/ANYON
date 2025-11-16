/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { Loader } from '@/components/ui/loader';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeMode } from 'shared/types';

describe('Loader (Mantine wrapper)', () => {
  it('메시지를 렌더링한다', () => {
    render(
      <ThemeProvider initialTheme={ThemeMode.LIGHT}>
        <Loader message="로딩 중" />
      </ThemeProvider>
    );
    expect(screen.getByTestId('loader-message')).toHaveTextContent('로딩 중');
  });

  it('스피너를 렌더링한다', () => {
    render(
      <ThemeProvider initialTheme={ThemeMode.LIGHT}>
        <Loader />
      </ThemeProvider>
    );
    expect(screen.getByTestId('loader-spinner')).toBeInTheDocument();
  });
});
