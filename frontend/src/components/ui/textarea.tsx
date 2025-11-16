import {
  Textarea as MantineTextarea,
  type TextareaProps as MantineTextareaProps,
} from '@mantine/core';
import { forwardRef, type Ref } from 'react';

export interface TextareaProps extends MantineTextareaProps {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ radius = 'md', autosize = false, minRows = 3, ...props }, ref: Ref<HTMLTextAreaElement>) {
    return (
      <MantineTextarea
        ref={ref}
        radius={radius}
        autosize={autosize}
        minRows={minRows}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
