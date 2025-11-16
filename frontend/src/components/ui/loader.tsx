import { Loader as MantineLoader, Stack, Text } from '@mantine/core';
import { type ReactNode } from 'react';

interface LoaderProps {
  message?: ReactNode;
  size?: number | string;
  className?: string;
}

export const Loader = ({
  message,
  size = 32,
  className,
}: LoaderProps): JSX.Element => (
  <Stack align="center" gap="xs" className={className}>
    <MantineLoader data-testid="loader-spinner" color="primary" size={size} />
    {message ? (
      <Text size="sm" c="dimmed" ta="center" data-testid="loader-message">
        {message}
      </Text>
    ) : null}
  </Stack>
);
