// Ballmac UI: Navigation Menu. https://ui.ballmac.com/components/navigation-menu
// Based on shadcn/ui Navigation Menu (MIT, Copyright (c) 2023 shadcn), restyled with a shared animated viewport that sizes to its content, and exported trigger styles for plain links.
"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { NavigationMenu as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

type NavigationMenuProps = React.ComponentProps<typeof Primitive.Root> & {
  /** Render panels in a shared viewport that resizes between items. Turn off to position each panel under its trigger. */
  viewport?: boolean;
};
function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: NavigationMenuProps) {
  return (
    <Primitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </Primitive.Root>
  );
}

type NavigationMenuListProps = React.ComponentProps<typeof Primitive.List>;
function NavigationMenuList({ className, ...props }: NavigationMenuListProps) {
  return (
    <Primitive.List
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
      {...props}
    />
  );
}

type NavigationMenuItemProps = React.ComponentProps<typeof Primitive.Item>;
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
  "group/trigger inline-flex h-9 w-max items-center justify-center gap-1 rounded-md bg-transparent px-3.5 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-accent/60 data-[state=open]:bg-accent/60 data-[state=open]:text-accent-foreground",
);

type NavigationMenuTriggerProps = React.ComponentProps<typeof Primitive.Trigger>;
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
        className="relative top-px size-3.5 transition-transform duration-200 group-data-[state=open]/trigger:rotate-180 motion-reduce:transition-none"
      />
    </Primitive.Trigger>
  );
}

type NavigationMenuContentProps = React.ComponentProps<typeof Primitive.Content>;
function NavigationMenuContent({ className, ...props }: NavigationMenuContentProps) {
  return (
    <Primitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-2 pr-2.5 data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-32 data-[motion=from-start]:slide-in-from-left-32 data-[motion=to-end]:slide-out-to-right-32 data-[motion=to-start]:slide-out-to-left-32 motion-reduce:animate-none md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-xl group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

type NavigationMenuViewportProps = React.ComponentProps<typeof Primitive.Viewport>;
function NavigationMenuViewport({ className, ...props }: NavigationMenuViewportProps) {
  return (
    <div className="absolute top-full left-0 isolate z-50 flex justify-center">
      <Primitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-[0_12px_36px_-10px_rgb(0_0_0/0.25)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-(--radix-navigation-menu-viewport-width) motion-reduce:animate-none",
          className,
        )}
        {...props}
      />
    </div>
  );
}

type NavigationMenuLinkProps = React.ComponentProps<typeof Primitive.Link> & {
  /** Style the link like a top-level trigger (for links placed directly in the bar, such as Pricing). Server components can use this instead of calling `navigationMenuTriggerStyle`. */
  topLevel?: boolean;
};
function NavigationMenuLink({ className, topLevel = false, ...props }: NavigationMenuLinkProps) {
  return (
    <Primitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        topLevel ? navigationMenuTriggerStyle() : "flex flex-col gap-1 rounded-lg p-2.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active=true]:bg-accent/60 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

type NavigationMenuIndicatorProps = React.ComponentProps<typeof Primitive.Indicator>;
function NavigationMenuIndicator({ className, ...props }: NavigationMenuIndicatorProps) {
  return (
    <Primitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <div className="relative top-[60%] size-2 rotate-45 rounded-tl-sm border-t border-l bg-popover shadow-md" />
    </Primitive.Indicator>
  );
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
