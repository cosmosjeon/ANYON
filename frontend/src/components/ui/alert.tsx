import {
  Alert as MantineAlert,
  type AlertProps as MantineAlertProps,
  Text,
} from '@mantine/core';
import { forwardRef, type Ref, type ReactNode } from 'react';

export interface AlertProps extends MantineAlertProps {}

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref: Ref<HTMLDivElement>
) {
  return <MantineAlert ref={ref} radius="md" {...props} />;
});

const AlertTitle = ({
  children,
  ...props
}: {
  children: ReactNode;
  className?: string;
}) => (
  <Text fw={600} size="sm" {...props}>
    {children}
  </Text>
);

const AlertDescription = ({
  children,
  ...props
}: {
  children: ReactNode;
  className?: string;
}) => (
  <Text size="sm" c="dimmed" {...props}>
    {children}
  </Text>
);

export { Alert, AlertTitle, AlertDescription };
