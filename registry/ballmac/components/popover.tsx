// Ballmac UI: Popover. https://ui.ballmac.com/components/popover
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Popover as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

type PopoverProps = React.ComponentProps<typeof Primitive.Root>;
function Popover(props: PopoverProps) {
  return <Primitive.Root data-slot="popover" {...props} />;
}
type PopoverTriggerProps = React.ComponentProps<typeof Primitive.Trigger>;
function PopoverTrigger({ className, ...props }: PopoverTriggerProps) {
  return (
    <Primitive.Trigger
      data-slot="popover-trigger"
      className={className}
      {...props}
    />
  );
}
type PopoverAnchorProps = React.ComponentProps<typeof Primitive.Anchor>;
function PopoverAnchor(props: PopoverAnchorProps) {
  return <Primitive.Anchor data-slot="popover-anchor" {...props} />;
}
type PopoverContentProps = React.ComponentProps<typeof Primitive.Content> & {
  /** Accessible name of the interactive panel. */
  label: string;
  /** Show the close control in the top-right corner. */
  showCloseButton?: boolean;
  /** Accessible name for the close control. */
  closeLabel?: string;
};
function PopoverContent({
  className,
  children,
  label,
  align = "center",
  sideOffset = 8,
  showCloseButton = false,
  closeLabel = "Close popover",
  ...props
}: PopoverContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        data-slot="popover-content"
        aria-label={label}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        className={cn(
          "z-50 grid w-[min(21rem,calc(100vw-1.5rem))] gap-3 rounded-xl border bg-popover p-4 text-popover-foreground shadow-[0_12px_36px_-10px_rgb(0_0_0/0.2)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 motion-reduce:animate-none",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <Primitive.Close
            data-slot="popover-close"
            aria-label={closeLabel}
            className="absolute top-2.5 right-2.5 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <X aria-hidden="true" className="size-4" />
          </Primitive.Close>
        )}
      </Primitive.Content>
    </Primitive.Portal>
  );
}
type PopoverHeaderProps = React.ComponentProps<"div">;
function PopoverHeader({ className, ...props }: PopoverHeaderProps) {
  return (
    <div
      data-slot="popover-header"
      className={cn("grid gap-1 pr-6", className)}
      {...props}
    />
  );
}
type PopoverTitleProps = React.ComponentProps<"h3">;
function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return (
    <h3
      data-slot="popover-title"
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  );
}
type PopoverDescriptionProps = React.ComponentProps<"p">;
function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}
export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  type PopoverProps,
  type PopoverTriggerProps,
  type PopoverAnchorProps,
  type PopoverContentProps,
  type PopoverHeaderProps,
  type PopoverTitleProps,
  type PopoverDescriptionProps,
};
