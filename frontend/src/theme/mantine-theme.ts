import { MantineColorsTuple, createTheme } from '@mantine/core';

const primary: MantineColorsTuple = [
  '#f4f4f5',
  '#e4e4e7',
  '#d4d4d8',
  '#a1a1aa',
  '#71717a',
  '#52525b',
  '#3f3f46',
  '#27272a',
  '#18181b',
  '#09090b',
];

const success: MantineColorsTuple = [
  '#e6f7ed',
  '#c3ead4',
  '#9fddbb',
  '#7bd0a2',
  '#57c389',
  '#33b670',
  '#2a9259',
  '#206e42',
  '#174a2b',
  '#0d2614',
];

const warning: MantineColorsTuple = [
  '#fff4e5',
  '#ffe6c7',
  '#ffd6a3',
  '#ffc57d',
  '#ffb352',
  '#f29a2e',
  '#c7791f',
  '#9d5b11',
  '#734006',
  '#492700',
];

const danger: MantineColorsTuple = [
  '#ffe8e5',
  '#ffc9bf',
  '#ffa499',
  '#ff7e72',
  '#ff564c',
  '#f33c32',
  '#c72d26',
  '#9e211c',
  '#741513',
  '#4d0a0a',
];

const info: MantineColorsTuple = [
  '#e8f1ff',
  '#c7d9ff',
  '#a3c0ff',
  '#7da7ff',
  '#578eff',
  '#3a74e6',
  '#2c5cb4',
  '#1f4584',
  '#122e56',
  '#06182c',
];

export const mantineTheme = createTheme({
  colors: {
    primary,
    success,
    warning,
    danger,
    info,
  },
  primaryColor: 'primary',
  defaultRadius: 'md',
  fontFamily: 'Chivo Mono, Noto Emoji, monospace',
  fontFamilyMonospace: 'Chivo Mono, monospace',
  headings: {
    fontFamily: 'Chivo Mono, Noto Emoji, monospace',
    sizes: {
      h1: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: '700' },
      h2: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '600' },
      h3: { fontSize: '0.95rem', lineHeight: '1.4rem', fontWeight: '600' },
    },
  },
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
});
