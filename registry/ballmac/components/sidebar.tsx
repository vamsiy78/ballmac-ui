// Ballmac UI: Sidebar. https://ui.ballmac.com/components/sidebar
// Based on shadcn/ui Sidebar (MIT, Copyright (c) 2023 shadcn), trimmed and restyled: theme-token surfaces, links without asChild, a mobile sheet with a named dialog, tooltips only while collapsed, and reduced-motion-safe width transitions.
"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";
import { Slot } from "radix-ui";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ballmac/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ballmac/tooltip";
import { cn } from "@/lib/utils";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeMobile(callback: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
/** True below 768px. Returns false on the server so the desktop layout renders first. */
function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

type SidebarContextValue = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};
const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a <SidebarProvider>");
  return context;
}

type SidebarProviderProps = React.ComponentProps<"div"> & {
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Controlled open state (desktop). */
  open?: boolean;
  /** Called when the desktop sidebar opens or closes, for example to save the choice in a cookie. */
  onOpenChange?: (open: boolean) => void;
  /** Key that toggles the sidebar together with ⌘ (Ctrl on Windows and Linux). `false` turns the shortcut off. */
  shortcut?: string | false;
};

/** Holds the open state, the mobile sheet state and the ⌘B shortcut. Wrap the sidebar and the page content in it. */
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  shortcut = "b",
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const open = openProp ?? innerOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInnerOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );
  const toggleSidebar = React.useCallback(
    () => (isMobile ? setOpenMobile((v) => !v) : setOpen(!open)),
    [isMobile, open, setOpen],
  );
  React.useEffect(() => {
    if (!shortcut) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === shortcut.toLowerCase()) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcut, toggleSidebar]);

  const value = React.useMemo<SidebarContextValue>(
    () => ({ state: open ? "expanded" : "collapsed", open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }),
    [open, setOpen, openMobile, isMobile, toggleSidebar],
  );
  return (
    <SidebarContext.Provider value={value}>
      <div
        data-slot="sidebar-wrapper"
        style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3.5rem", ...style } as React.CSSProperties}
        className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-muted/40", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

type SidebarProps = React.ComponentProps<"div"> & {
  /** Which edge the sidebar sits on. */
  side?: "left" | "right";
  /** `sidebar` is flush, `floating` is a rounded card with a gap, `inset` pairs with `SidebarInset`. */
  variant?: "sidebar" | "floating" | "inset";
  /** `icon` collapses to an icon rail, `offcanvas` slides away, `none` is always open. */
  collapsible?: "offcanvas" | "icon" | "none";
  /** Accessible name of the navigation landmark (and of the mobile sheet). */
  label?: string;
};

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  label = "Sidebar",
  className,
  children,
  ...props
}: SidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn("flex h-full w-(--sidebar-width) flex-col border-r bg-card text-card-foreground", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          showCloseButton={false}
          data-slot="sidebar"
          data-mobile="true"
          className="w-72 gap-0 bg-card p-0 sm:w-72 [&>button]:hidden"
        >
          <SheetTitle className="sr-only">{label}</SheetTitle>
          <SheetDescription className="sr-only">Navigation</SheetDescription>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <div
      className="group peer hidden text-card-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      <div
        aria-hidden="true"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear motion-reduce:transition-none",
          "group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        className={cn(
          "fixed inset-y-0 z-20 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear motion-reduce:transition-none md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <nav
          aria-label={label}
          data-sidebar="sidebar"
          className={cn(
            "flex h-full w-full flex-col bg-card",
            variant === "floating" && "rounded-xl border shadow-sm",
            variant === "inset" && "rounded-xl",
          )}
        >
          {children}
        </nav>
      </div>
    </div>
  );
}

type SidebarTriggerProps = React.ComponentProps<"button">;
/** Toggles the sidebar (the sheet on small screens). Announces the state with `aria-expanded`. */
function SidebarTrigger({ className, onClick, ...props }: SidebarTriggerProps) {
  const { toggleSidebar, open, openMobile, isMobile } = useSidebar();
  return (
    <button
      type="button"
      data-slot="sidebar-trigger"
      aria-label="Toggle sidebar"
      aria-expanded={isMobile ? openMobile : open}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      <PanelLeft aria-hidden="true" />
    </button>
  );
}

type SidebarInsetProps = React.ComponentProps<"main">;
/** The page area beside the sidebar. With `variant="inset"` it becomes a rounded card. */
function SidebarInset({ className, ...props }: SidebarInsetProps) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex min-h-svh min-w-0 flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:m-2 peer-data-[variant=inset]:min-h-[calc(100svh-1rem)] peer-data-[variant=inset]:rounded-xl peer-data-[variant=inset]:border peer-data-[variant=inset]:shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

type SidebarSectionProps = React.ComponentProps<"div">;
function SidebarHeader({ className, ...props }: SidebarSectionProps) {
  return <div data-slot="sidebar-header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
}
function SidebarFooter({ className, ...props }: SidebarSectionProps) {
  return <div data-slot="sidebar-footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
}
function SidebarContent({ className, ...props }: SidebarSectionProps) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}
function SidebarSeparator({ className, ...props }: React.ComponentProps<"hr">) {
  return <hr data-slot="sidebar-separator" className={cn("mx-2 h-px w-auto border-0 bg-border", className)} {...props} />;
}
function SidebarGroup({ className, ...props }: SidebarSectionProps) {
  return <div data-slot="sidebar-group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />;
}
function SidebarGroupLabel({ className, ...props }: SidebarSectionProps) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "flex h-8 shrink-0 items-center px-2 text-xs font-medium text-muted-foreground transition-[margin,opacity] duration-200 ease-linear motion-reduce:transition-none group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}
function SidebarGroupContent({ className, ...props }: SidebarSectionProps) {
  return <div data-slot="sidebar-group-content" className={cn("w-full text-sm", className)} {...props} />;
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />;
}
function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" className={cn("group/menu-item relative", className)} {...props} />;
}

const menuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-lg px-2 text-left text-sm outline-none transition-[width,height,padding,background-color] hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 active:bg-accent disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-accent-foreground group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&>span:not(:first-child)]:sr-only group-data-[collapsible=icon]:[&>svg:not(:first-child)]:hidden [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: { size: { default: "h-9", sm: "h-8 text-[13px]", lg: "h-12 group-data-[collapsible=icon]:p-0!" } },
    defaultVariants: { size: "default" },
  },
);

type SidebarMenuButtonProps = Omit<React.ComponentProps<"button">, "type"> & {
  /** Link target. When set the button renders as an `<a>`; add `aria-current="page"` via `isActive`. */
  href?: string;
  /** Render the child (a router link) with button styles and behavior. */
  asChild?: boolean;
  /** Highlight as the current page (sets `aria-current="page"` on links). */
  isActive?: boolean;
  /** Tooltip text shown only while the sidebar is collapsed to icons. Defaults to the button's `aria-label`. */
  tooltip?: string;
  size?: "default" | "sm" | "lg";
};
function SidebarMenuButton({
  asChild = false,
  href,
  isActive = false,
  tooltip,
  size = "default",
  className,
  ...props
}: SidebarMenuButtonProps) {
  const { isMobile, state } = useSidebar();
  const Comp = asChild ? Slot.Root : href ? "a" : "button";
  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive}
      data-size={size}
      aria-current={isActive && (href || asChild) ? "page" : undefined}
      {...(href ? { href } : {})}
      {...(!asChild && !href ? { type: "button" } : {})}
      className={cn(menuButtonVariants({ size }), className)}
      {...(props as object)}
    />
  );
  if (!tooltip) return button;
  // createElement keeps `asChild` out of JSX, which the shadcn CLI would rewrite for Base UI projects and break this Radix-based tooltip.
  return (
    <Tooltip>
      {React.createElement(TooltipTrigger, { asChild: true }, button)}
      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarMenuBadge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      className={cn(
        "pointer-events-none absolute top-1/2 right-2 flex h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums select-none group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      className={cn("mx-3.5 flex min-w-0 flex-col gap-0.5 border-l py-0.5 pl-2.5 group-data-[collapsible=icon]:hidden", className)}
      {...props}
    />
  );
}
function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-sub-item" className={cn("relative", className)} {...props} />;
}
type SidebarMenuSubButtonProps = React.ComponentProps<"a"> & { isActive?: boolean };
function SidebarMenuSubButton({ isActive = false, className, ...props }: SidebarMenuSubButtonProps) {
  return (
    <a
      data-slot="sidebar-menu-sub-button"
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-8 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-[13px] text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-accent-foreground [&>span:last-child]:truncate",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
  type SidebarProps,
  type SidebarProviderProps,
  type SidebarTriggerProps,
  type SidebarMenuButtonProps,
  type SidebarMenuSubButtonProps,
};
