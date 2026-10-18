// Ballmac UI: Tabs. https://ui.ballmac.com/components/tabs
"use client";

import * as React from "react";
import { Tabs as Primitive } from "@base-ui/react/tabs";
import { DirectionProvider, useDirection } from "@/lib/ballmac/direction";
import { cn } from "@/lib/utils";

const ActivationContext = React.createContext<"automatic" | "manual">("automatic");

type TabsProps = Omit<React.ComponentProps<typeof Primitive.Root>, "className"> & {
  className?: string;
  /** Reading direction for the arrow keys. Defaults to the page's. */
  dir?: "ltr" | "rtl";
  /** "automatic" selects a tab as soon as it takes focus. "manual" waits for Enter or Space. */
  activationMode?: "automatic" | "manual";
};
function Tabs({ className, dir: dirProp, activationMode = "automatic", ...props }: TabsProps) {
  const dir = useDirection(dirProp);
  return (
    <DirectionProvider dir={dir}>
      <ActivationContext.Provider value={activationMode}>
        <Primitive.Root
          dir={dir}
          data-slot="tabs"
          className={cn("flex min-w-0 flex-col gap-4", className)}
          {...props}
        />
      </ActivationContext.Provider>
    </DirectionProvider>
  );
}
type TabsListProps = Omit<React.ComponentProps<typeof Primitive.List>, "className"> & {
  className?: string;
  /** Visual treatment of the selected tab. */
  variant?: "pills" | "underline";
};
function TabsList({ className, variant = "pills", ...props }: TabsListProps) {
  const mode = React.useContext(ActivationContext);
  return (
    <Primitive.List
      data-slot="tabs-list"
      data-variant={variant}
      activateOnFocus={mode === "automatic"}
      className={cn(
        "inline-flex max-w-full items-center gap-1 self-start overflow-x-auto rounded-lg p-1 text-muted-foreground",
        variant === "pills"
          ? "bg-muted"
          : "rounded-none border-b bg-transparent pb-0",
        className,
      )}
      {...props}
    />
  );
}
type TabsTriggerProps = Omit<React.ComponentProps<typeof Primitive.Tab>, "className"> & { className?: string };
function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <Primitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex min-h-[var(--bm-control-h,calc(var(--spacing)*9))] shrink-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap outline-none transition-[color,background-color,box-shadow] duration-150 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 data-active:text-foreground [[data-variant=pills]_&]:data-active:bg-background [[data-variant=pills]_&]:data-active:shadow-xs [[data-variant=underline]_&]:rounded-none [[data-variant=underline]_&]:border-b-2 [[data-variant=underline]_&]:border-transparent [[data-variant=underline]_&]:data-active:border-primary motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}
type TabsContentProps = Omit<React.ComponentProps<typeof Primitive.Panel>, "className"> & { className?: string };
function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <Primitive.Panel
      data-slot="tabs-content"
      className={cn(
        "min-w-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
};
