import {
  Button as MantineButton,
  type ButtonProps as MantineButtonProps,
} from '@mantine/core';
import {
  forwardRef,
  type ComponentProps,
  type ReactNode,
  type MouseEventHandler,
  type ButtonHTMLAttributes,
} from 'react';

type Variant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'icon';

type Size = 'default' | 'xs' | 'sm' | 'lg' | 'icon';

export interface ButtonProps
  extends Omit<
      ComponentProps<typeof MantineButton>,
      'size' | 'variant' | 'color'
    >,
    ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean; // legacy 수용용, 현재는 사용하지 않음
  children?: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const mapVariant = (
  variant: Variant | undefined
): Pick<MantineButtonProps, 'variant' | 'color'> => {
  switch (variant) {
    case 'destructive':
      return { variant: 'filled', color: 'danger' };
    case 'outline':
      return { variant: 'outline', color: 'primary' };
    case 'secondary':
      return { variant: 'light', color: 'secondary' as MantineButtonProps['color'] };
    case 'ghost':
      return { variant: 'subtle', color: 'primary' };
    case 'link':
      return { variant: 'transparent', color: 'primary' };
    case 'icon':
      return { variant: 'subtle', color: 'primary' };
    case 'default':
    default:
      return { variant: 'filled', color: 'primary' };
  }
};

const mapSize = (size: Size | undefined): MantineButtonProps['size'] => {
  switch (size) {
    case 'xs':
      return 'xs';
    case 'sm':
      return 'sm';
    case 'lg':
      return 'lg';
    case 'icon':
      return 'md';
    case 'default':
    default:
      return 'md';
  }
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = 'default', size = 'default', asChild, ...props },
  ref
) {
  const { variant: mantineVariant, color } = mapVariant(variant);
  const mappedSize = mapSize(size);

  return (
    <MantineButton
      ref={ref}
      component="button"
      variant={mantineVariant}
      color={color}
      size={mappedSize}
      radius="md"
      {...props}
    >
      {children}
    </MantineButton>
  );
});

Button.displayName = 'Button';

export { Button };
