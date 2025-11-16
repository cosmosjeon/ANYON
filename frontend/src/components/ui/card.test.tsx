/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeMode } from 'shared/types';

const renderWithTheme = (ui: React.ReactNode) =>
  render(<ThemeProvider initialTheme={ThemeMode.LIGHT}>{ui}</ThemeProvider>);

describe('Card (Mantine wrapper)', () => {
  it('섹션과 본문을 렌더링한다', () => {
    renderWithTheme(
      <Card>
        <CardHeader>헤더</CardHeader>
        <CardTitle>제목</CardTitle>
        <CardDescription>설명</CardDescription>
        <CardContent>본문</CardContent>
        <CardFooter>푸터</CardFooter>
      </Card>
    );

    expect(screen.getByText('헤더')).toBeInTheDocument();
    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('설명')).toBeInTheDocument();
    expect(screen.getByText('본문')).toBeInTheDocument();
    expect(screen.getByText('푸터')).toBeInTheDocument();
  });
});
