// Ballmac UI: Navbar. https://ui.ballmac.com/components/navbar
"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ballmac/sheet";
import { useScrollDirection, useScrolled, type ScrollContainer } from "@/lib/ballmac/scroll";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/ballmac/i18n";

type NavbarContextValue = { closeMobile: () => void; scrolled: boolean };
const NavbarContext = React.createContext<NavbarContextValue>({ closeMobile: () => {}, scrolled: false });

type NavbarProps = React.ComponentProps<"header"> & {
  /** Stick to the top of the page. */
  sticky?: boolean;
  /** Slide out of view while scrolling down and back in while scrolling up. Stays visible while it holds focus. */
  hideOnScroll?: boolean;
  /** When to draw the bottom border: `scrolled` only after the page moves, `always`, or `never`. */
  border?: "scrolled" | "always" | "never";
  /** Max width of the content row. */
  containerClassName?: string;
  /** A scrollable element to watch instead of the page (for a header inside a panel or preview). */
  scrollContainer?: ScrollContainer;
};

/** A responsive site header. Compose NavbarBrand, NavbarLinks, NavbarActions and NavbarMobileMenu. */
function Navbar({
  sticky = true,
  hideOnScroll = false,
  border = "scrolled",
  className,
  containerClassName,
  scrollContainer,
  children,
  ...props
}: NavbarProps) {
  const scrolled = useScrolled(8, scrollContainer);
  const direction = useScrollDirection(12, scrollContainer);
  const hidden = hideOnScroll && scrolled && direction === "down";
  const value = React.useMemo(() => ({ closeMobile: () => {}, scrolled }), [scrolled]);
  return (
    <NavbarContext.Provider value={value}>
      <header
        data-slot="navbar"
        data-scrolled={scrolled || undefined}
        data-hidden={hidden || undefined}
        className={cn(
          "z-40 w-full border-b border-transparent bg-background/80 backdrop-blur-md transition-[transform,border-color,box-shadow] duration-300 motion-reduce:transition-none supports-[backdrop-filter]:bg-background/70",
          sticky && "sticky top-0",
          border === "always" && "border-border",
          border === "scrolled" && "data-[scrolled]:border-border data-[scrolled]:shadow-[0_1px_0_0_rgb(0_0_0/0.02),0_8px_24px_-16px_rgb(0_0_0/0.18)]",
          hidden && "-translate-y-full focus-within:translate-y-0",
          className,
        )}
        {...props}
      >
        <div className={cn("mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6", containerClassName)}>
          {children}
        </div>
      </header>
    </NavbarContext.Provider>
  );
}

type NavbarBrandProps = React.ComponentProps<"a">;
function NavbarBrand({ className, ...props }: NavbarBrandProps) {
  return (
    <a
      data-slot="navbar-brand"
      className={cn(
        "-ms-1 flex shrink-0 items-center gap-2 rounded-md px-1 text-[15px] font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}

type NavbarLinksProps = React.ComponentProps<"nav"> & {
  /** Accessible name of the navigation landmark. */
  label?: string;
};
/** The primary links. Hidden below the `md` breakpoint; put the same links in NavbarMobileMenu. */
function NavbarLinks({ className, label, children, ...props }: NavbarLinksProps) {
  const msg = useMessages()
  label ??= msg("navbar.label", "Main")
  return (
    <nav aria-label={label} data-slot="navbar-links" className={cn("hidden md:block", className)} {...props}>
      <ul className="flex items-center gap-1">{children}</ul>
    </nav>
  );
}

type NavbarLinkProps = React.ComponentProps<"a"> & {
  /** Marks the link as the current page (`aria-current="page"`). */
  active?: boolean;
};
function NavbarLink({ active = false, className, children, ...props }: NavbarLinkProps) {
  return (
    <li>
      <a
        data-slot="navbar-link"
        data-active={active || undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active]:text-foreground",
          "after:absolute after:inset-x-3 after:-bottom-[9px] after:h-0.5 after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-200 data-[active]:after:scale-x-100 motion-reduce:after:transition-none",
          className,
        )}
        {...props}
      >
        {children}
      </a>
    </li>
  );
}

type NavbarActionsProps = React.ComponentProps<"div">;
/** Buttons on the right: sign in, theme toggle, call to action. */
function NavbarActions({ className, ...props }: NavbarActionsProps) {
  return <div data-slot="navbar-actions" className={cn("ms-auto flex items-center gap-2", className)} {...props} />;
}

type NavbarMobileMenuProps = Omit<React.ComponentProps<typeof SheetContent>, "side"> & {
  /** Accessible name of the menu button and the panel. */
  label?: string;
};
/** A menu button (shown below `md`) that opens the links in a sheet. Links inside close it when chosen. */
function NavbarMobileMenu({ label, className, children, ...props }: NavbarMobileMenuProps) {
  const msg = useMessages()
  label ??= msg("navbar.label2", "Menu")
  const [open, setOpen] = React.useState(false);
  const parent = React.useContext(NavbarContext);
  const value = React.useMemo(() => ({ ...parent, closeMobile: () => setOpen(false) }), [parent]);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        data-slot="navbar-mobile-trigger"
        aria-label={label}
        className="ms-auto inline-flex size-9 items-center justify-center rounded-md outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 md:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>
      <SheetContent side="end" className={cn("w-72 sm:w-80", className)} {...props}>
        <SheetTitle className="px-5 pt-5 text-base font-semibold">{label}</SheetTitle>
        <SheetDescription className="sr-only">{msg("navbar.siteNavigation", "Site navigation")}</SheetDescription>
        <NavbarContext.Provider value={value}>
          <nav aria-label={label} className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-5">
            {children}
          </nav>
        </NavbarContext.Provider>
      </SheetContent>
    </Sheet>
  );
}

type NavbarMobileLinkProps = React.ComponentProps<"a"> & { active?: boolean };
/** A full-width link for NavbarMobileMenu that closes the menu on click. */
function NavbarMobileLink({ active = false, className, onClick, ...props }: NavbarMobileLinkProps) {
  const { closeMobile } = React.useContext(NavbarContext);
  return (
    <a
      data-slot="navbar-mobile-link"
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      onClick={(event) => {
        onClick?.(event);
        closeMobile();
      }}
      className={cn(
        "flex h-11 items-center rounded-lg px-3 text-[15px] font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active]:bg-accent data-[active]:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Navbar,
  NavbarBrand,
  NavbarLinks,
  NavbarLink,
  NavbarActions,
  NavbarMobileMenu,
  NavbarMobileLink,
  type NavbarProps,
  type NavbarBrandProps,
  type NavbarLinksProps,
  type NavbarLinkProps,
  type NavbarActionsProps,
  type NavbarMobileMenuProps,
  type NavbarMobileLinkProps,
};
