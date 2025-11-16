import {
  Badge as MantineBadge,
  type BadgeProps as MantineBadgeProps,
} from '@mantine/core';

type Variant = 'default' | 'secondary' | 'outline' | 'destructive';

export interface BadgeProps
  extends Omit<MantineBadgeProps, 'variant' | 'color'> {
  variant?: Variant;
  title?: string;
}

const mapVariant = (
  variant: Variant | undefined
): Pick<MantineBadgeProps, 'variant' | 'color'> => {
  switch (variant) {
    case 'secondary':
      return { variant: 'light', color: 'gray' };
    case 'destructive':
      return { variant: 'filled', color: 'danger' as MantineBadgeProps['color'] };
    case 'outline':
      return { variant: 'outline', color: 'gray' };
    case 'default':
    default:
      return { variant: 'filled', color: 'primary' };
  }
};

function Badge({ variant = 'default', ...props }: BadgeProps) {
  const { variant: mantineVariant, color } = mapVariant(variant);
  return <MantineBadge radius="sm" variant={mantineVariant} color={color} {...props} />;
}

export { Badge };
