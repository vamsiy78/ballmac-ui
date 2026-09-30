// Ballmac UI: Drawer. https://ui.ballmac.com/components/drawer
// Based on shadcn/ui Drawer (MIT, Copyright (c) 2023 shadcn) on Vaul (MIT, Copyright (c) 2023 Emil Kowalski), restyled with tokens, a grab handle, all four directions, and a scrollable body.
"use client";

import * as React from "react";
import { Drawer as Primitive } from "vaul";
import { cn } from "@/lib/utils";

type DrawerProps = React.ComponentProps<typeof Primitive.Root>;
/** Root. Props come from Vaul: `direction`, `snapPoints`, `activeSnapPoint`, `dismissible`, `shouldScaleBackground`, `modal`. */
function Drawer({ shouldScaleBackground = false, ...props }: DrawerProps) {
  return <Primitive.Root data-slot="drawer" shouldScaleBackground={shouldScaleBackground} {...props} />;
}

type DrawerTriggerProps = React.ComponentProps<typeof Primitive.Trigger>;
function DrawerTrigger(props: DrawerTriggerProps) {
  return <Primitive.Trigger data-slot="drawer-trigger" {...props} />;
}

type DrawerCloseProps = React.ComponentProps<typeof Primitive.Close>;
function DrawerClose(props: DrawerCloseProps) {
  return <Primitive.Close data-slot="drawer-close" {...props} />;
}

type DrawerContentProps = React.ComponentProps<typeof Primitive.Content> & {
  /** Show the grab handle. On by default for bottom drawers. */
  handle?: boolean;
};
function DrawerContent({ className, children, handle, ...props }: DrawerContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay
        data-slot="drawer-overlay"
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
      />
      <Primitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content fixed z-50 flex h-auto flex-col bg-card text-card-foreground shadow-[0_24px_48px_-12px_rgb(0_0_0/0.3)] outline-none",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[90dvh] data-[vaul-drawer-direction=bottom]:rounded-t-2xl data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[90dvh] data-[vaul-drawer-direction=top]:rounded-b-2xl data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-[min(24rem,calc(100vw-2.5rem))] data-[vaul-drawer-direction=right]:border-l",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-[min(24rem,calc(100vw-2.5rem))] data-[vaul-drawer-direction=left]:border-r",
          "motion-reduce:!transition-none",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30",
            handle === false ? "hidden" : handle ? "block" : "hidden group-data-[vaul-drawer-direction=bottom]/drawer-content:block",
          )}
        />
        {children}
      </Primitive.Content>
    </Primitive.Portal>
  );
}

type DrawerHeaderProps = React.ComponentProps<"div">;
function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("grid gap-1.5 px-5 pt-4 text-center sm:text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center", className)}
      {...props}
    />
  );
}

type DrawerBodyProps = React.ComponentProps<"div">;
/** Scrollable middle region. Focusable so keyboard users can scroll long content. */
function DrawerBody({ className, ...props }: DrawerBodyProps) {
  return (
    <div
      data-slot="drawer-body"
      tabIndex={0}
      data-vaul-no-drag=""
      className={cn(
        "min-h-0 flex-1 overflow-y-auto px-5 py-3 outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}

type DrawerFooterProps = React.ComponentProps<"div">;
function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]", className)}
      {...props}
    />
  );
}

type DrawerTitleProps = React.ComponentProps<typeof Primitive.Title>;
function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <Primitive.Title
      data-slot="drawer-title"
      className={cn("text-lg leading-tight font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

type DrawerDescriptionProps = React.ComponentProps<typeof Primitive.Description>;
function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <Primitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  type DrawerProps,
  type DrawerTriggerProps,
  type DrawerCloseProps,
  type DrawerContentProps,
  type DrawerHeaderProps,
  type DrawerBodyProps,
  type DrawerFooterProps,
  type DrawerTitleProps,
  type DrawerDescriptionProps,
};
