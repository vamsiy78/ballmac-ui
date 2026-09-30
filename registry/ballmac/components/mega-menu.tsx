// Ballmac UI: Mega Menu. https://ui.ballmac.com/components/mega-menu
"use client";

import * as React from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ballmac/navigation-menu";
import { cn } from "@/lib/utils";

type MegaMenuLinkItem = {
  /** Link title. */
  title: string;
  /** Destination. */
  href: string;
  /** One line under the title. */
  description?: string;
  /** Icon shown in a tile before the title. */
  icon?: React.ReactNode;
  /** Small label after the title, such as "New". */
  badge?: string;
};

type MegaMenuColumn = {
  /** Small heading above the links. */
  title?: string;
  links: MegaMenuLinkItem[];
};

type MegaMenuFeatured = {
  title: string;
  description: string;
  href: string;
  /** Call-to-action text. */
  cta?: string;
  /** Visual area above the text: an icon, illustration or gradient element. */
  media?: React.ReactNode;
};

type MegaMenuItem =
  | { label: string; href: string }
  | { label: string; columns: MegaMenuColumn[]; featured?: MegaMenuFeatured };

type MegaMenuProps = Omit<React.ComponentProps<typeof NavigationMenu>, "children"> & {
  /** Top-level entries: a plain link (`href`) or a panel (`columns`, optionally `featured`). */
  items: MegaMenuItem[];
  /** Accessible name of the navigation landmark. */
  label?: string;
};

function isPanel(item: MegaMenuItem): item is Extract<MegaMenuItem, { columns: MegaMenuColumn[] }> {
  return "columns" in item;
}

function LinkCard({ link }: { link: MegaMenuLinkItem }) {
  return (
    <NavigationMenuLink
      href={link.href}
      className="group/link flex-row items-start gap-3 rounded-xl p-2.5"
    >
      {link.icon && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-foreground shadow-xs transition-colors group-hover/link:border-ring/40 [&_svg]:size-4">
          {link.icon}
        </span>
      )}
      <span className="grid min-w-0 gap-0.5">
        <span className="flex items-center gap-2 text-sm font-medium">
          {link.title}
          {link.badge && (
            <span className="rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-semibold tracking-wide text-primary uppercase">
              {link.badge}
            </span>
          )}
        </span>
        {link.description && <span className="text-xs leading-snug text-muted-foreground">{link.description}</span>}
      </span>
    </NavigationMenuLink>
  );
}

/**
 * A data-driven mega menu on Navigation Menu: wide panels with grouped, described links and an optional featured card.
 * Shown from the `md` breakpoint up; pair it with MegaMenuMobileList inside your mobile menu.
 */
function MegaMenu({ items, label = "Main", className, viewportAlign = "center", ...props }: MegaMenuProps) {
  return (
    <NavigationMenu
      aria-label={label}
      viewportAlign={viewportAlign}
      data-slot="mega-menu"
      className={cn("hidden md:flex", className)}
      {...props}
    >
      <NavigationMenuList>
        {items.map((item) =>
          isPanel(item) ? (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div
                  className={cn(
                    "grid gap-2 p-1 md:w-[min(46rem,calc(100vw-3rem))]",
                    item.featured ? "md:grid-cols-[1fr_1fr_14rem]" : item.columns.length > 1 ? "md:grid-cols-2" : "md:w-80",
                  )}
                >
                  {item.columns.map((column, index) => (
                    <div key={column.title ?? index} className="grid content-start gap-0.5">
                      {column.title && (
                        <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                          {column.title}
                        </p>
                      )}
                      {column.links.map((link) => (
                        <LinkCard key={link.href} link={link} />
                      ))}
                    </div>
                  ))}
                  {item.featured && (
                    <NavigationMenuLink
                      href={item.featured.href}
                      className="group/featured row-span-1 justify-between gap-3 rounded-xl border bg-gradient-to-br from-primary/10 via-muted/60 to-muted/30 p-4 hover:from-primary/15"
                    >
                      <span className="flex min-h-20 items-center justify-center text-primary [&_svg]:size-10">
                        {item.featured.media}
                      </span>
                      <span className="grid gap-1">
                        <span className="text-sm font-semibold">{item.featured.title}</span>
                        <span className="text-xs leading-snug text-muted-foreground">{item.featured.description}</span>
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-foreground">
                          {item.featured.cta ?? "Learn more"}
                          <ArrowRight
                            aria-hidden="true"
                            className="size-3 transition-transform group-hover/featured:translate-x-0.5 motion-reduce:transition-none"
                          />
                        </span>
                      </span>
                    </NavigationMenuLink>
                  )}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink href={item.href} topLevel>
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

type MegaMenuMobileListProps = React.ComponentProps<"div"> & {
  items: MegaMenuItem[];
  /** Called when a link is chosen, for example to close a sheet. */
  onNavigate?: () => void;
};

/** The same items as accordions for small screens. Uses native disclosure elements, so it works without JavaScript. */
function MegaMenuMobileList({ items, onNavigate, className, ...props }: MegaMenuMobileListProps) {
  return (
    <div data-slot="mega-menu-mobile" className={cn("grid gap-1", className)} {...props}>
      {items.map((item) =>
        isPanel(item) ? (
          <details key={item.label} className="group/details rounded-lg">
            <summary className="flex h-11 cursor-pointer list-none items-center justify-between rounded-lg px-3 text-[15px] font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
              {item.label}
              <ChevronDown
                aria-hidden="true"
                className="size-4 text-muted-foreground transition-transform group-open/details:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <div className="grid gap-0.5 pt-1 pb-2 pl-3">
              {item.columns.flatMap((column) => column.links).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className="grid gap-0.5 rounded-lg px-3 py-2 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <span className="text-sm font-medium">{link.title}</span>
                  {link.description && <span className="text-xs text-muted-foreground">{link.description}</span>}
                </a>
              ))}
            </div>
          </details>
        ) : (
          <a
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className="flex h-11 items-center rounded-lg px-3 text-[15px] font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {item.label}
          </a>
        ),
      )}
    </div>
  );
}

export {
  MegaMenu,
  MegaMenuMobileList,
  type MegaMenuProps,
  type MegaMenuItem,
  type MegaMenuColumn,
  type MegaMenuLinkItem,
  type MegaMenuFeatured,
  type MegaMenuMobileListProps,
};
