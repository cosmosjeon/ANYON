import { TextInput, TextInputProps } from '@mantine/core';
import { forwardRef, type KeyboardEvent, type Ref } from 'react';

export interface InputProps
  extends Omit<TextInputProps, 'onKeyDown'> {
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onCommandEnter?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onCommandShiftEnter?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    onKeyDown,
    onCommandEnter,
    onCommandShiftEnter,
    size = 'sm',
    radius = 'md',
    variant = 'default',
    ...props
  },
  ref: Ref<HTMLInputElement>
) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      if (e.metaKey && e.shiftKey) {
        onCommandShiftEnter?.(e);
      } else {
        onCommandEnter?.(e);
      }
    }
    onKeyDown?.(e);
  };

  return (
    <TextInput
      ref={ref}
      onKeyDown={handleKeyDown}
      size={size}
      radius={radius}
      variant={variant}
      {...props}
    />
  );
});

Input.displayName = 'Input';
export { Input };
