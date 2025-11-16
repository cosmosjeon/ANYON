import {
  Tooltip as MantineTooltip,
  type TooltipProps as MantineTooltipProps,
} from '@mantine/core';
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

type AllowedPosition = MantineTooltipProps['position'];

type TooltipTriggerProps = {
  children: ReactNode;
  asChild?: boolean;
};

type TooltipContentProps = {
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
};

const sideToPosition = (
  side: TooltipContentProps['side']
): AllowedPosition => {
  switch (side) {
    case 'left':
      return 'left';
    case 'right':
      return 'right';
    case 'bottom':
      return 'bottom';
    case 'top':
    default:
      return 'top';
  }
};

const TooltipTrigger = ({ children }: TooltipTriggerProps) => <>{children}</>;
const TooltipContent = ({ children }: TooltipContentProps) => <>{children}</>;

const TooltipProvider = ({ children }: { children: ReactNode }) => (
  <>{children}</>
);

type TooltipRootProps = {
  children: ReactNode;
  openDelay?: number;
  closeDelay?: number;
};

const Tooltip = ({ children, openDelay, closeDelay }: TooltipRootProps) => {
  let trigger: ReactNode = null;
  let content: ReactNode = null;
  let side: TooltipContentProps['side'] = 'top';

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const element = child as ReactElement<any>;
    if (element.type === TooltipTrigger) {
      trigger = element.props.children;
    }
    if (element.type === TooltipContent) {
      content = element.props.children;
      side = element.props.side ?? side;
    }
  });

  if (!trigger || !content) {
    return <>{children}</>;
  }

  return (
    <MantineTooltip
      label={content}
      position={sideToPosition(side)}
      openDelay={openDelay}
      closeDelay={closeDelay}
    >
      <span>{trigger}</span>
    </MantineTooltip>
  );
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
