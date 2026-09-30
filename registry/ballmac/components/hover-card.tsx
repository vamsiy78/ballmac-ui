// Ballmac UI: Hover Card. https://ui.ballmac.com/components/hover-card
"use client";

import * as React from "react";
import { HoverCard as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

type HoverCardProps = React.ComponentProps<typeof Primitive.Root>;
function HoverCard(props: HoverCardProps) {
  return <Primitive.Root data-slot="hover-card" {...props} />;
}
type HoverCardTriggerProps = React.ComponentProps<typeof Primitive.Trigger>;
function HoverCardTrigger({ className, ...props }: HoverCardTriggerProps) {
  return (
    <Primitive.Trigger
      data-slot="hover-card-trigger"
      className={cn(
        "rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}
type HoverCardContentProps = React.ComponentProps<typeof Primitive.Content> & {
  /** Space in pixels between the trigger and preview. */
  sideOffset?: number;
};
function HoverCardContent({
  className,
  align = "center",
  sideOffset = 8,
  ...props
}: HoverCardContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        className={cn(
          "z-50 w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border bg-popover p-4 text-popover-foreground shadow-[0_12px_36px_-10px_rgb(0_0_0/0.2)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 motion-reduce:animate-none",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}
export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  type HoverCardProps,
  type HoverCardTriggerProps,
  type HoverCardContentProps,
};
