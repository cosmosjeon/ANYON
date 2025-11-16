import {
  Checkbox as MantineCheckbox,
  type CheckboxProps as MantineCheckboxProps,
} from '@mantine/core';
import { forwardRef, type Ref } from 'react';

export interface CheckboxProps extends Omit<MantineCheckboxProps, 'onChange'> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ onCheckedChange, ...props }, ref: Ref<HTMLInputElement>) {
    return (
      <MantineCheckbox
        ref={ref}
        radius="sm"
        onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        {...props}
      />
    );
  }
);
