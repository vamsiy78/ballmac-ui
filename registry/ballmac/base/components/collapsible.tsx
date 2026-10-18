// Ballmac UI: Collapsible. https://ui.ballmac.com/components/collapsible
"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible as Primitive } from "@base-ui/react/collapsible";
import { cn } from "@/lib/utils";

type CollapsibleProps = Omit<React.ComponentProps<typeof Primitive.Root>, "className"> & { className?: string };
function Collapsible({ className, ...props }: CollapsibleProps) {
  return (
    <Primitive.Root
      data-slot="collapsible"
      className={cn("w-full", className)}
      {...props}
    />
  );
}
type CollapsibleTriggerProps = Omit<React.ComponentProps<typeof Primitive.Trigger>, "className"> & {
  className?: string;
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
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-panel-open:rotate-180 motion-reduce:transition-none"
        />
      )}
    </Primitive.Trigger>
  );
}
type CollapsibleContentProps = Omit<React.ComponentProps<typeof Primitive.Panel>, "className"> & { className?: string };
/** The part that opens and closes. Base UI calls it a panel and sets `--collapsible-panel-height` for the animation. */
function CollapsibleContent({ className, ...props }: CollapsibleContentProps) {
  return (
    <Primitive.Panel
      data-slot="collapsible-content"
      className={cn(
        "h-(--collapsible-panel-height) overflow-hidden text-sm transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none",
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
