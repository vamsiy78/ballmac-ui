// Ballmac UI: Scroll Area. https://ui.ballmac.com/components/scroll-area
"use client";

import * as React from "react";
import { ScrollArea as Primitive } from "@base-ui/react/scroll-area";
import { cn } from "@/lib/utils";

type ScrollAreaType = "auto" | "always" | "scroll" | "hover";
const TypeContext = React.createContext<ScrollAreaType>("hover");

type ScrollAreaProps = Omit<React.ComponentProps<typeof Primitive.Root>, "className"> & {
  className?: string;
  /** Accessible name of the focusable reading region. */
  label: string;
  /** When the scrollbars show: "hover" (default) while the pointer is over the area, "scroll" while scrolling, "auto" or "always" whenever there is something to scroll. */
  type?: ScrollAreaType;
};
function ScrollArea({ className, children, label, type = "hover", ...props }: ScrollAreaProps) {
  return (
    <TypeContext.Provider value={type}>
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
        <Primitive.Content>{children}</Primitive.Content>
      </Primitive.Viewport>
      <ScrollBar />
      <Primitive.Corner data-slot="scroll-area-corner" className="bg-muted" />
    </Primitive.Root>
    </TypeContext.Provider>
  );
}
type ScrollBarProps = Omit<React.ComponentProps<typeof Primitive.Scrollbar>, "className"> & { className?: string };
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollBarProps) {
  const type = React.useContext(TypeContext);
  return (
    <Primitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none select-none p-0.5 transition-[color,opacity] duration-150 motion-reduce:transition-none",
        type === "hover" && "opacity-0 data-hovering:opacity-100 data-scrolling:opacity-100",
        type === "scroll" && "opacity-0 data-scrolling:opacity-100",
        type === "always" && "opacity-100",
        orientation === "vertical"
          ? "h-full w-2.5 border-s border-s-transparent"
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
export { ScrollArea, ScrollBar, type ScrollAreaProps, type ScrollAreaType, type ScrollBarProps };
