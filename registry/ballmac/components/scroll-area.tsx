// Ballmac UI: Scroll Area. https://ui.ballmac.com/components/scroll-area
"use client";

import * as React from "react";
import { ScrollArea as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

type ScrollAreaProps = React.ComponentProps<typeof Primitive.Root> & {
  /** Accessible name of the focusable reading region. */
  label: string;
};
function ScrollArea({ className, children, label, ...props }: ScrollAreaProps) {
  return (
    <Primitive.Root
      data-slot="scroll-area"
      className={cn("relative overflow-hidden rounded-lg", className)}
      {...props}
    >
      <Primitive.Viewport
        data-slot="scroll-area-viewport"
        role="region"
        aria-label={label}
        tabIndex={0}
        className="size-full rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50"
      >
        {children}
      </Primitive.Viewport>
      <ScrollBar />
      <Primitive.Corner data-slot="scroll-area-corner" className="bg-muted" />
    </Primitive.Root>
  );
}
type ScrollBarProps = React.ComponentProps<typeof Primitive.Scrollbar>;
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollBarProps) {
  return (
    <Primitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none select-none p-0.5 transition-colors duration-150 motion-reduce:transition-none",
        orientation === "vertical"
          ? "h-full w-2.5 border-l border-l-transparent"
          : "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      {...props}
    >
      <Primitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border hover:bg-muted-foreground/50"
      />
    </Primitive.Scrollbar>
  );
}
export { ScrollArea, ScrollBar, type ScrollAreaProps, type ScrollBarProps };
