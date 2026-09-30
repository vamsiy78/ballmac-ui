// Ballmac UI: Tabs. https://ui.ballmac.com/components/tabs
"use client";

import * as React from "react";
import { Tabs as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

type TabsProps = React.ComponentProps<typeof Primitive.Root>;
function Tabs({ className, ...props }: TabsProps) {
  return (
    <Primitive.Root
      data-slot="tabs"
      className={cn("flex min-w-0 flex-col gap-4", className)}
      {...props}
    />
  );
}
type TabsListProps = React.ComponentProps<typeof Primitive.List> & {
  /** Visual treatment of the selected tab. */
  variant?: "pills" | "underline";
};
function TabsList({ className, variant = "pills", ...props }: TabsListProps) {
  return (
    <Primitive.List
      data-slot="tabs-list"
      data-variant={variant}
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
type TabsTriggerProps = React.ComponentProps<typeof Primitive.Trigger>;
function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <Primitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap outline-none transition-[color,background-color,box-shadow] duration-150 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 data-[state=active]:text-foreground [[data-variant=pills]_&]:data-[state=active]:bg-background [[data-variant=pills]_&]:data-[state=active]:shadow-xs [[data-variant=underline]_&]:rounded-none [[data-variant=underline]_&]:border-b-2 [[data-variant=underline]_&]:border-transparent [[data-variant=underline]_&]:data-[state=active]:border-primary motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}
type TabsContentProps = React.ComponentProps<typeof Primitive.Content>;
function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <Primitive.Content
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
