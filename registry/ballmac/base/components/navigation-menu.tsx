// Ballmac UI: Navigation Menu. https://ui.ballmac.com/components/navigation-menu
// Based on shadcn/ui Navigation Menu (MIT, Copyright (c) 2023 shadcn), restyled with a shared animated viewport that sizes to its content, and exported trigger styles for plain links.
"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { NavigationMenu as Primitive } from "@base-ui/react/navigation-menu";
import { DirectionProvider, useDirection } from "@/lib/ballmac/direction";
import { cn } from "@/lib/utils";

type NavigationMenuProps = Omit<React.ComponentProps<typeof Primitive.Root>, "className" | "onValueChange" | "value" | "defaultValue"> & {
  className?: string;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** Reading direction for the arrow keys. Defaults to the page's. */
  dir?: "ltr" | "rtl";
  /** Milliseconds from pointer enter until a panel opens (Radix UI called this delayDuration). */
  delayDuration?: number;
  /** Render panels in a shared viewport that resizes between items. Base UI always uses one shared popup, so this only changes its look. */
  viewport?: boolean;
  /** Where the shared viewport sits under the menu: from its left edge, or centered under the whole menu (good for wide mega menus). */
  viewportAlign?: "start" | "center";
};
function NavigationMenu({
  className,
  children,
  viewport = true,
  viewportAlign = "start",
  dir: dirProp,
  delayDuration,
  onValueChange,
  ...props
}: NavigationMenuProps) {
  const dir = useDirection(dirProp);
  return (
    <DirectionProvider dir={dir}>
      <Primitive.Root
        dir={dir}
        data-slot="navigation-menu"
        data-viewport={viewport}
        delay={delayDuration}
        onValueChange={(v) => onValueChange?.(v == null ? "" : String(v))}
        className={cn(
          "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
          className,
        )}
        {...props}
      >
        {children}
        <NavigationMenuViewport align={viewportAlign} />
      </Primitive.Root>
    </DirectionProvider>
  );
}

type NavigationMenuListProps = Omit<React.ComponentProps<typeof Primitive.List>, "className"> & { className?: string };
function NavigationMenuList({ className, ...props }: NavigationMenuListProps) {
  return (
    <Primitive.List
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
      {...props}
    />
  );
}

type NavigationMenuItemProps = Omit<React.ComponentProps<typeof Primitive.Item>, "className"> & { className?: string };
function NavigationMenuItem({ className, ...props }: NavigationMenuItemProps) {
  return (
    <Primitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

/** Class names for a top-level trigger or link, so plain links can match triggers. */
const navigationMenuTriggerStyle = cva(
  "group/trigger inline-flex h-9 w-max items-center justify-center gap-1 rounded-md bg-transparent px-3.5 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-accent/60 data-active:bg-accent/60 data-popup-open:bg-accent/60 data-popup-open:text-accent-foreground",
);

type NavigationMenuTriggerProps = Omit<React.ComponentProps<typeof Primitive.Trigger>, "className"> & { className?: string };
function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuTriggerProps) {
  return (
    <Primitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), className)}
      {...props}
    >
      {children}
      <ChevronDown
        aria-hidden="true"
        className="relative top-px size-3.5 transition-transform duration-200 group-data-popup-open/trigger:rotate-180 motion-reduce:transition-none"
      />
    </Primitive.Trigger>
  );
}

type NavigationMenuContentProps = Omit<React.ComponentProps<typeof Primitive.Content>, "className"> & { className?: string };
function NavigationMenuContent({ className, ...props }: NavigationMenuContentProps) {
  return (
    <Primitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "w-[calc(100vw-2rem)] p-2 transition-[opacity,translate] duration-200 ease-out md:w-max data-ending-style:opacity-0 data-starting-style:opacity-0 data-starting-style:data-[activation-direction=left]:-translate-x-1/2 data-starting-style:data-[activation-direction=right]:translate-x-1/2 data-ending-style:data-[activation-direction=left]:translate-x-1/2 data-ending-style:data-[activation-direction=right]:-translate-x-1/2 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

type NavigationMenuViewportProps = Omit<React.ComponentProps<typeof Primitive.Viewport>, "className"> & {
  className?: string;
  /** Align the viewport to the menu's left edge or center it under the menu. */
  align?: "start" | "center";
};
/** Base UI's shared popup for every panel: positioned under the whole menu, it sizes itself to the open panel. The root renders it for you. */
function NavigationMenuViewport({ className, align = "start", ...props }: NavigationMenuViewportProps) {
  return (
    <Primitive.Portal>
      <Primitive.Positioner sideOffset={8} align={align} collisionPadding={{ top: 8, bottom: 8, left: 16, right: 16 }} collisionAvoidance={{ side: "none" }} className="z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-300 ease-out data-instant:transition-none motion-reduce:transition-none">
        <Primitive.Popup
          className="relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-xl border bg-popover/[var(--bm-material-alpha,100%)] backdrop-blur-[var(--bm-material-blur,0px)] text-popover-foreground shadow-[var(--bm-shadow-popover,0_12px_36px_-10px_rgb(0_0_0/0.25))] outline-none transition-[opacity,scale,width,height] duration-300 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none"
        >
          <Primitive.Viewport
            data-slot="navigation-menu-viewport"
            className={cn("relative h-full w-full overflow-hidden rounded-[inherit]", className)}
            {...props}
          />
        </Primitive.Popup>
      </Primitive.Positioner>
    </Primitive.Portal>
  );
}

type NavigationMenuLinkProps = Omit<React.ComponentProps<typeof Primitive.Link>, "className"> & {
  className?: string;
  /** Style the link like a top-level trigger (for links placed directly in the bar, such as Pricing). Server components can use this instead of calling `navigationMenuTriggerStyle`. */
  topLevel?: boolean;
};
function NavigationMenuLink({ className, topLevel = false, ...props }: NavigationMenuLinkProps) {
  return (
    <Primitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        topLevel ? navigationMenuTriggerStyle() : "flex flex-col gap-1 rounded-lg p-2.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active=true]:bg-accent/60 data-active:bg-accent/60 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

type NavigationMenuIndicatorProps = React.ComponentProps<"div">;
/** Kept so code written for the Radix UI version still compiles. Base UI has no moving indicator; its popup carries the pointer. */
function NavigationMenuIndicator(_props: NavigationMenuIndicatorProps) {
  return null;
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
  type NavigationMenuProps,
  type NavigationMenuListProps,
  type NavigationMenuItemProps,
  type NavigationMenuContentProps,
  type NavigationMenuTriggerProps,
  type NavigationMenuLinkProps,
  type NavigationMenuIndicatorProps,
  type NavigationMenuViewportProps,
};
