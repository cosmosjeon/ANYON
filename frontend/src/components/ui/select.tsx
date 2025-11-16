import {
  Select as MantineSelect,
  type SelectProps as MantineSelectProps,
} from '@mantine/core';
import {
  Children,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

type SelectItemProps = {
  value: string;
  disabled?: boolean;
  children: ReactNode;
};

const SelectItem = ({ children }: SelectItemProps) => <>{children}</>;
SelectItem.displayName = 'SelectItem';

type SelectValueProps = { placeholder?: string; children?: undefined };
const SelectValue = ({ placeholder }: SelectValueProps) => (
  <span data-placeholder>{placeholder}</span>
);
SelectValue.displayName = 'SelectValue';

const SelectTrigger = ({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  asChild?: boolean;
}) => (
  <span id={id} className={className}>
    {children}
  </span>
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = ({ children }: { children: ReactNode }) => <>{children}</>;
SelectContent.displayName = 'SelectContent';

export interface SelectProps
  extends Omit<MantineSelectProps, 'data' | 'value' | 'onChange'> {
  value?: string;
  onValueChange?: (value: any) => void;
  children?: ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

const collectItems = (children: ReactNode): Array<{ value: string; label: string; disabled?: boolean }> => {
  const items: Array<{ value: string; label: string; disabled?: boolean }> = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const element = child as ReactElement<any>;
    if (element.type === SelectItem) {
      const { value, disabled } = element.props as SelectItemProps;
      const label = typeof element.props.children === 'string'
        ? element.props.children
        : String(value);
      items.push({ value: String(value), label, disabled });
    } else if (element.props?.children) {
      items.push(...collectItems(element.props.children));
    }
  });

  return items;
};

const findPlaceholder = (children: ReactNode): string | undefined => {
  let placeholder: string | undefined;
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const element = child as ReactElement<any>;
    if (element.type === SelectValue) {
      placeholder = element.props.placeholder;
    } else if (element.props?.children && placeholder === undefined) {
      placeholder = findPlaceholder(element.props.children);
    }
  });
  return placeholder;
};

const Select = forwardRef<HTMLInputElement, SelectProps>(function Select(
  { children, value, onValueChange, className, ...props },
  ref: Ref<HTMLInputElement>
) {
  const data = collectItems(children);
  const placeholder = props.placeholder ?? findPlaceholder(children);

  return (
    <MantineSelect
      ref={ref}
      data={data}
      value={value}
      onChange={(val) => onValueChange?.(val ?? '')}
      placeholder={placeholder}
      className={className}
      radius="md"
      {...props}
    />
  );
});

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
