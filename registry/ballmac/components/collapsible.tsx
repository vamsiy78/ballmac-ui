// Ballmac UI: Collapsible. https://ui.ballmac.com/components/collapsible
"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

type CollapsibleProps = React.ComponentProps<typeof Primitive.Root>;
function Collapsible({ className, ...props }: CollapsibleProps) {
  return (
    <Primitive.Root
      data-slot="collapsible"
      className={cn("w-full", className)}
      {...props}
    />
  );
}
type CollapsibleTriggerProps = React.ComponentProps<
  typeof Primitive.Trigger
> & {
  /** Show the rotating disclosure chevron after the label. */
  showChevron?: boolean;
};
function CollapsibleTrigger({
  className,
  children,
  showChevron = true,
  ...props
}: CollapsibleTriggerProps) {
  return (
    <Primitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        "group flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 text-start text-sm font-medium outline-none transition-colors duration-150 hover:bg-accent/70 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {children}
      {showChevron && (
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
        />
      )}
    </Primitive.Trigger>
  );
}
type CollapsibleContentProps = React.ComponentProps<typeof Primitive.Content>;
function CollapsibleContent({ className, ...props }: CollapsibleContentProps) {
  return (
    <Primitive.Content
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden text-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
  type CollapsibleContentProps,
};
