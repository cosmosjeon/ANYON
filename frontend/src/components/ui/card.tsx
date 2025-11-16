import {
  Card as MantineCard,
  CardSection as MantineCardSection,
  type CardProps as MantineCardProps,
  Title,
  Text,
} from '@mantine/core';
import { forwardRef } from 'react';
import type {
  ComponentPropsWithoutRef,
  MouseEventHandler,
  ReactNode,
} from 'react';

type CardProps = MantineCardProps & {
  children?: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  tabIndex?: number;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
};

type CardSectionPropsWithRef = ComponentPropsWithoutRef<
  typeof MantineCardSection
> & {
  children?: ReactNode;
  className?: string;
};

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(props, ref) {
  return <MantineCard ref={ref} radius="md" withBorder {...props} />;
});

function CardHeader({ children, ...props }: CardSectionPropsWithRef) {
  return (
    <MantineCardSection {...props} inheritPadding>
      {children}
    </MantineCardSection>
  );
}

function CardTitle({ children, ...props }: CardSectionPropsWithRef) {
  return (
    <MantineCardSection {...props} inheritPadding py="sm">
      <Title order={3}>{children}</Title>
    </MantineCardSection>
  );
}

function CardDescription({ children, ...props }: CardSectionPropsWithRef) {
  return (
    <MantineCardSection {...props} inheritPadding py="xs">
      <Text size="sm" c="dimmed">
        {children}
      </Text>
    </MantineCardSection>
  );
}

function CardContent({ children, ...props }: CardSectionPropsWithRef) {
  return (
    <MantineCardSection {...props} inheritPadding>
      {children}
    </MantineCardSection>
  );
}

function CardFooter({ children, ...props }: CardSectionPropsWithRef) {
  return (
    <MantineCardSection {...props} inheritPadding>
      {children}
    </MantineCardSection>
  );
}

export {
  Card as Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
