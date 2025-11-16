import {
  Tabs as MantineTabs,
  type TabsProps as MantineTabsProps,
  TabsList,
  TabsTab,
  TabsPanel,
} from '@mantine/core';
import { forwardRef, type Ref, type ReactNode } from 'react';

export interface TabsProps extends Omit<MantineTabsProps, 'children'> {
  children: ReactNode;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { children, ...props },
  ref: Ref<HTMLDivElement>
) {
  return (
    <MantineTabs ref={ref} {...props}>
      {children}
    </MantineTabs>
  );
});

const TabsTrigger = TabsTab;
const TabsContent = TabsPanel;

export { Tabs, TabsList, TabsTrigger, TabsContent };
