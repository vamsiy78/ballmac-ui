// Ballmac UI: App Shell. https://ui.ballmac.com/components/app-shell
"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ballmac/sheet";
import { cn } from "@/lib/utils";

type AppShellContextValue = { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void };
const AppShellContext = React.createContext<AppShellContextValue | null>(null);

function useAppShell() {
  const context = React.useContext(AppShellContext);
  if (!context) throw new Error("App shell parts must be used inside <AppShell>");
  return context;
}

type AppShellProps = React.ComponentProps<"div"> & {
  /** Height of the header, used to offset sticky side panels. Any CSS length. */
  headerHeight?: string;
  /** Width of the sidebar column from the `lg` breakpoint up. */
  sidebarWidth?: string;
  /** Width of the aside column from the `xl` breakpoint up. */
  asideWidth?: string;
};

/**
 * The frame of an application page: skip link, sticky header, sidebar, main content, optional aside and footer.
 * The sidebar becomes a sheet below `lg`. Panels stick below the header and scroll on their own.
 */
function AppShell({
  headerHeight = "3.5rem",
  sidebarWidth = "15rem",
  asideWidth = "18rem",
  className,
  style,
  children,
  ...props
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const value = React.useMemo(() => ({ sidebarOpen, setSidebarOpen }), [sidebarOpen]);
  return (
    <AppShellContext.Provider value={value}>
      <div
        data-slot="app-shell"
        style={
          {
            "--app-header-h": headerHeight,
            "--app-sidebar-w": sidebarWidth,
            "--app-aside-w": asideWidth,
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "grid min-h-svh w-full grid-cols-1 grid-rows-[auto_1fr_auto] bg-background text-foreground",
          "lg:grid-cols-[var(--app-sidebar-w)_minmax(0,1fr)]",
          "has-[[data-slot=app-shell-aside]]:xl:grid-cols-[var(--app-sidebar-w)_minmax(0,1fr)_var(--app-aside-w)]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </AppShellContext.Provider>
  );
}

type AppShellSkipLinkProps = React.ComponentProps<"a">;
/** Becomes visible on keyboard focus and jumps to the main content. */
function AppShellSkipLink({ className, children = "Skip to content", href = "#app-main", ...props }: AppShellSkipLinkProps) {
  return (
    <a
      data-slot="app-shell-skip-link"
      href={href}
      className={cn(
        "sr-only z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

type AppShellHeaderProps = React.ComponentProps<"header">;
function AppShellHeader({ className, ...props }: AppShellHeaderProps) {
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        "sticky top-0 z-30 flex h-(--app-header-h) items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-md lg:col-span-full",
        className,
      )}
      {...props}
    />
  );
}

type AppShellSidebarTriggerProps = React.ComponentProps<"button">;
/** Opens the sidebar sheet below `lg`. Hidden on wider screens. */
function AppShellSidebarTrigger({ className, onClick, ...props }: AppShellSidebarTriggerProps) {
  const { sidebarOpen, setSidebarOpen } = useAppShell();
  return (
    <button
      type="button"
      data-slot="app-shell-sidebar-trigger"
      aria-label="Open navigation"
      aria-expanded={sidebarOpen}
      onClick={(event) => {
        onClick?.(event);
        setSidebarOpen(true);
      }}
      className={cn(
        "-ml-1 inline-flex size-9 items-center justify-center rounded-md outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:hidden",
        className,
      )}
      {...props}
    >
      <PanelLeft aria-hidden="true" className="size-5" />
    </button>
  );
}

type AppShellSidebarProps = React.ComponentProps<"aside"> & {
  /** Accessible name of the landmark and the mobile sheet. */
  label?: string;
};
function AppShellSidebar({ label = "Sidebar", className, children, ...props }: AppShellSidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useAppShell();
  return (
    <>
      <aside
        data-slot="app-shell-sidebar"
        aria-label={label}
        className={cn(
          "sticky top-(--app-header-h) hidden h-[calc(100svh-var(--app-header-h))] flex-col overflow-y-auto border-r bg-card/50 lg:flex",
          className,
        )}
        {...props}
      >
        {children}
      </aside>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-72 gap-0 p-0 sm:w-72 lg:hidden">
          <SheetTitle className="sr-only">{label}</SheetTitle>
          <SheetDescription className="sr-only">Navigation</SheetDescription>
          <div className="flex h-full flex-col overflow-y-auto" onClick={(e) => (e.target as HTMLElement).closest("a") && setSidebarOpen(false)}>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

type AppShellMainProps = React.ComponentProps<"main">;
function AppShellMain({ className, ...props }: AppShellMainProps) {
  return (
    <main
      id="app-main"
      tabIndex={-1}
      data-slot="app-shell-main"
      className={cn("min-w-0 p-4 outline-none sm:p-6 lg:p-8", className)}
      {...props}
    />
  );
}

type AppShellAsideProps = React.ComponentProps<"aside"> & { label?: string };
/** A right column shown from `xl` up (details, activity, table of contents). */
function AppShellAside({ label = "Details", className, ...props }: AppShellAsideProps) {
  return (
    <aside
      data-slot="app-shell-aside"
      aria-label={label}
      className={cn(
        "sticky top-(--app-header-h) hidden h-[calc(100svh-var(--app-header-h))] overflow-y-auto border-l p-5 xl:block",
        className,
      )}
      {...props}
    />
  );
}

type AppShellFooterProps = React.ComponentProps<"footer">;
function AppShellFooter({ className, ...props }: AppShellFooterProps) {
  return (
    <footer
      data-slot="app-shell-footer"
      className={cn("border-t px-4 py-3 text-xs text-muted-foreground sm:px-6 lg:col-span-full", className)}
      {...props}
    />
  );
}

export {
  AppShell,
  AppShellSkipLink,
  AppShellHeader,
  AppShellSidebarTrigger,
  AppShellSidebar,
  AppShellMain,
  AppShellAside,
  AppShellFooter,
  useAppShell,
  type AppShellProps,
  type AppShellSkipLinkProps,
  type AppShellHeaderProps,
  type AppShellSidebarTriggerProps,
  type AppShellSidebarProps,
  type AppShellMainProps,
  type AppShellAsideProps,
  type AppShellFooterProps,
};
