// Ballmac UI: Hover Card. https://ui.ballmac.com/components/hover-card
"use client";

import * as React from "react";
import { PreviewCard as Primitive } from "@base-ui/react/preview-card";
import { splitPositioner } from "@/lib/ballmac/positioner";
import { cn } from "@/lib/utils";

// Radix UI sets the delays on the root; Base UI sets them on the trigger. The root keeps them here for its triggers.
const DelayContext = React.createContext<{ openDelay?: number; closeDelay?: number }>({});

type HoverCardProps = React.ComponentProps<typeof Primitive.Root> & {
  /** Milliseconds from pointer enter until the card opens. */
  openDelay?: number;
  /** Milliseconds from pointer leave until the card closes. */
  closeDelay?: number;
};
function HoverCard({ openDelay, closeDelay, ...props }: HoverCardProps) {
  const value = React.useMemo(() => ({ openDelay, closeDelay }), [openDelay, closeDelay]);
  return (
    <DelayContext.Provider value={value}>
      <Primitive.Root {...props} />
    </DelayContext.Provider>
  );
}
type HoverCardTriggerProps = Omit<React.ComponentProps<typeof Primitive.Trigger>, "className"> & { className?: string };
function HoverCardTrigger({ className, ...props }: HoverCardTriggerProps) {
  const { openDelay, closeDelay } = React.useContext(DelayContext);
  return (
    <Primitive.Trigger
      data-slot="hover-card-trigger"
      delay={openDelay}
      closeDelay={closeDelay}
      className={cn(
        "rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}
type HoverCardContentProps = Omit<React.ComponentProps<typeof Primitive.Popup>, "className"> &
  Pick<React.ComponentProps<typeof Primitive.Positioner>, "side" | "alignOffset" | "collisionPadding"> & {
    className?: string;
    align?: "start" | "center" | "end";
    /** Space in pixels between the trigger and preview. */
    sideOffset?: number;
  };
function HoverCardContent({
  className,
  align = "center",
  sideOffset = 8,
  ...rest
}: HoverCardContentProps) {
  const [position, props] = splitPositioner(rest);
  return (
    <Primitive.Portal>
      <Primitive.Positioner align={align} sideOffset={sideOffset} collisionPadding={12} className="z-50" {...position}>
        <Primitive.Popup
          data-slot="hover-card-content"
          className={cn(
            "w-[min(20rem,calc(100vw-1.5rem))] origin-(--transform-origin) rounded-xl border bg-popover/[var(--bm-material-alpha,100%)] backdrop-blur-[var(--bm-material-blur,0px)] p-4 text-popover-foreground shadow-[var(--bm-shadow-popover,0_12px_36px_-10px_rgb(0_0_0/0.2))] outline-none transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
            className,
          )}
          {...props}
        />
      </Primitive.Positioner>
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
