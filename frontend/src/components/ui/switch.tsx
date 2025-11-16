import {
  Switch as MantineSwitch,
  type SwitchProps as MantineSwitchProps,
} from '@mantine/core';
import { forwardRef, type Ref } from 'react';

export interface SwitchProps
  extends Omit<MantineSwitchProps, 'onChange' | 'checked'> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { checked, onCheckedChange, ...props },
  ref: Ref<HTMLInputElement>
) {
  return (
    <MantineSwitch
      ref={ref}
      radius="lg"
      checked={checked}
      onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
      {...props}
    />
  );
});

export { Switch };
