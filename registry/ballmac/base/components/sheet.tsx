// Ballmac UI: Sheet. https://ui.ballmac.com/components/sheet
// Based on shadcn/ui Sheet (MIT, Copyright (c) 2023 shadcn), adding a scrollable body, a grab handle for bottom sheets, and safe-area padding.
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { Dialog as Primitive } from "@base-ui/react/dialog";
import { autoFocus, keepOpenWhenPrevented, type AutoFocusProps } from "@/lib/ballmac/positioner";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/ballmac/i18n";

type SheetProps = React.ComponentProps<typeof Primitive.Root>;
function Sheet(props: SheetProps) {
  return <Primitive.Root data-slot="sheet" {...props} />;
}

type SheetTriggerProps = React.ComponentProps<typeof Primitive.Trigger>;
function SheetTrigger(props: SheetTriggerProps) {
  return <Primitive.Trigger data-slot="sheet-trigger" {...props} />;
}

type SheetCloseProps = React.ComponentProps<typeof Primitive.Close>;
function SheetClose({ onClick, ...props }: SheetCloseProps) {
  return <Primitive.Close data-slot="sheet-close" onClick={keepOpenWhenPrevented(onClick as never) as never} {...props} />;
}

const sheetVariants = cva(
  "fixed z-50 flex flex-col gap-4 bg-card text-card-foreground shadow-[0_24px_48px_-12px_rgb(0_0_0/0.3)] outline-none duration-300 data-open:animate-in data-closed:animate-out motion-reduce:animate-none motion-reduce:duration-0",
  {
    variants: {
      side: {
        // `start` and `end` follow the reading direction; `left` and `right` are fixed edges.
        end: "inset-y-0 end-0 h-full w-[min(24rem,calc(100vw-2.5rem))] border-s data-open:slide-in-from-right data-closed:slide-out-to-right rtl:data-open:slide-in-from-left rtl:data-closed:slide-out-to-left sm:w-[min(28rem,calc(100vw-4rem))]",
        start:
          "inset-y-0 start-0 h-full w-[min(24rem,calc(100vw-2.5rem))] border-e data-open:slide-in-from-left data-closed:slide-out-to-left rtl:data-open:slide-in-from-right rtl:data-closed:slide-out-to-right sm:w-[min(28rem,calc(100vw-4rem))]",
        right:
          "inset-y-0 right-0 h-full w-[min(24rem,calc(100vw-2.5rem))] border-l data-open:slide-in-from-right data-closed:slide-out-to-right sm:w-[min(28rem,calc(100vw-4rem))]", // rtl-fixed: fixed right edge
        left: "inset-y-0 left-0 h-full w-[min(24rem,calc(100vw-2.5rem))] border-r data-open:slide-in-from-left data-closed:slide-out-to-left sm:w-[min(28rem,calc(100vw-4rem))]", // rtl-fixed: fixed left edge
        top: "inset-x-0 top-0 max-h-[85dvh] rounded-b-2xl border-b data-open:slide-in-from-top data-closed:slide-out-to-top",
        bottom:
          "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl border-t data-open:slide-in-from-bottom data-closed:slide-out-to-bottom",
      },
    },
    defaultVariants: { side: "end" },
  },
);

type SheetContentProps = Omit<React.ComponentProps<typeof Primitive.Popup>, "className"> & AutoFocusProps & { className?: string } &
  VariantProps<typeof sheetVariants> & {
    /** Edge the sheet slides in from. `end` (the default) and `start` follow the reading direction; `right` and `left` are fixed. */
    side?: "top" | "end" | "bottom" | "start" | "right" | "left";
    /** Show the close control in the corner. */
    showCloseButton?: boolean;
    /** Accessible name for the close control. */
    closeLabel?: string;
  };
function SheetContent({
  className,
  children,
  side = "end",
  showCloseButton = true,
  closeLabel,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: SheetContentProps) {
  const msg = useMessages()
  closeLabel ??= msg("sheet.closeLabel", "Close")
  return (
    <Primitive.Portal>
      <Primitive.Backdrop
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:animate-none"
      />
      <Primitive.Popup
        data-slot="sheet-content"
        {...autoFocus(onOpenAutoFocus, onCloseAutoFocus)}
        data-side={side}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {side === "bottom" && (
          <span
            aria-hidden="true"
            className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30"
          />
        )}
        {children}
        {showCloseButton && (
          <Primitive.Close
            data-slot="sheet-close"
            aria-label={closeLabel}
            className="absolute top-3.5 end-3.5 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <X aria-hidden="true" className="size-4" />
          </Primitive.Close>
        )}
      </Primitive.Popup>
    </Primitive.Portal>
  );
}

type SheetHeaderProps = React.ComponentProps<"div">;
function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("grid gap-1.5 px-5 pt-5 pe-14", className)}
      {...props}
    />
  );
}

type SheetBodyProps = React.ComponentProps<"div">;
/** Scrollable middle region. It is focusable so keyboard users can scroll long content. */
function SheetBody({ className, ...props }: SheetBodyProps) {
  return (
    <div
      data-slot="sheet-body"
      tabIndex={0}
      className={cn(
        "min-h-0 flex-1 overflow-y-auto px-5 outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}

type SheetFooterProps = React.ComponentProps<"div">;
function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col-reverse gap-2 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

type SheetTitleProps = Omit<React.ComponentProps<typeof Primitive.Title>, "className"> & { className?: string };
function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <Primitive.Title
      data-slot="sheet-title"
      className={cn("text-lg leading-tight font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

type SheetDescriptionProps = Omit<React.ComponentProps<typeof Primitive.Description>, "className"> & { className?: string };
function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <Primitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  sheetVariants,
  type SheetProps,
  type SheetTriggerProps,
  type SheetCloseProps,
  type SheetContentProps,
  type SheetHeaderProps,
  type SheetBodyProps,
  type SheetFooterProps,
  type SheetTitleProps,
  type SheetDescriptionProps,
};
