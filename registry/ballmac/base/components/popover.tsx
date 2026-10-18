// Ballmac UI: Popover. https://ui.ballmac.com/components/popover
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Popover as Primitive } from "@base-ui/react/popover";
import { splitPositioner } from "@/lib/ballmac/positioner";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/ballmac/i18n";

// Radix UI has an Anchor part that the popover is positioned against. Base UI takes an `anchor` on the positioner instead, so the anchor registers here.
const AnchorContext = React.createContext<{ anchor: HTMLElement | null; setAnchor: (el: HTMLElement | null) => void } | null>(null);

type PopoverProps = React.ComponentProps<typeof Primitive.Root>;
function Popover(props: PopoverProps) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const value = React.useMemo(() => ({ anchor, setAnchor }), [anchor]);
  return (
    <AnchorContext.Provider value={value}>
      <Primitive.Root {...props} />
    </AnchorContext.Provider>
  );
}
type PopoverTriggerProps = Omit<React.ComponentProps<typeof Primitive.Trigger>, "className"> & { className?: string };
function PopoverTrigger({ className, ...props }: PopoverTriggerProps) {
  return (
    <Primitive.Trigger
      data-slot="popover-trigger"
      className={className}
      {...props}
    />
  );
}
type PopoverAnchorProps = React.ComponentProps<"div">;
function PopoverAnchor({ ref, ...props }: PopoverAnchorProps) {
  const ctx = React.useContext(AnchorContext);
  return (
    <div
      data-slot="popover-anchor"
      ref={(el) => {
        ctx?.setAnchor(el);
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = el;
      }}
      {...props}
    />
  );
}
type PopoverContentProps = Omit<React.ComponentProps<typeof Primitive.Popup>, "className"> &
  Pick<React.ComponentProps<typeof Primitive.Positioner>, "side" | "alignOffset" | "collisionPadding"> & {
    className?: string;
    align?: "start" | "center" | "end";
    sideOffset?: number;
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
  closeLabel,
  ...rest
}: PopoverContentProps) {
  const msg = useMessages()
  const anchor = React.useContext(AnchorContext)?.anchor;
  const [position, props] = splitPositioner(rest);
  closeLabel ??= msg("popover.closeLabel", "Close popover")
  return (
    <Primitive.Portal>
      <Primitive.Positioner align={align} sideOffset={sideOffset} collisionPadding={12} anchor={anchor ?? undefined} className="z-50" {...position}>
        <Primitive.Popup
          data-slot="popover-content"
          aria-label={label}
          className={cn(
            "grid w-[min(21rem,calc(100vw-1.5rem))] origin-(--transform-origin) gap-3 rounded-xl border bg-popover/[var(--bm-material-alpha,100%)] backdrop-blur-[var(--bm-material-blur,0px)] p-4 text-popover-foreground shadow-[var(--bm-shadow-popover,0_12px_36px_-10px_rgb(0_0_0/0.2))] outline-none transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <Primitive.Close
              data-slot="popover-close"
              aria-label={closeLabel}
              className="absolute top-2.5 end-2.5 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <X aria-hidden="true" className="size-4" />
            </Primitive.Close>
          )}
        </Primitive.Popup>
      </Primitive.Positioner>
    </Primitive.Portal>
  );
}
type PopoverHeaderProps = React.ComponentProps<"div">;
function PopoverHeader({ className, ...props }: PopoverHeaderProps) {
  return (
    <div
      data-slot="popover-header"
      className={cn("grid gap-1 pe-6", className)}
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
