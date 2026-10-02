// Ballmac UI: Floating Nav. https://ui.ballmac.com/components/floating-nav
"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { useScrollDirection, useScrolled, type ScrollContainer } from "@/lib/ballmac/scroll";
import { spring } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/ballmac/i18n";

type FloatingNavItem = {
  /** Unique value; used for `value` and `onValueChange`. */
  value: string;
  /** Visible label (hidden on small screens when an icon is given, but still the accessible name). */
  label: string;
  /** Link destination. */
  href?: string;
  /** Icon shown before the label. */
  icon?: React.ReactNode;
};

type FloatingNavProps = Omit<React.ComponentProps<"nav">, "onChange" | "defaultValue"> & {
  /** Links in the bar. */
  items: FloatingNavItem[];
  /** Controlled active item. */
  value?: string;
  /** Initial active item when uncontrolled. */
  defaultValue?: string;
  /** Called when an item is chosen. */
  onValueChange?: (value: string) => void;
  /** Edge of the screen the bar floats from. */
  position?: "top" | "bottom";
  /** Slide away when scrolling down (top) or up (bottom), and return on the opposite scroll. Stays while it holds focus. */
  autoHide?: boolean;
  /** Accessible name of the navigation landmark. */
  label?: string;
  /** A scrollable element to watch for auto-hide instead of the page. */
  scrollContainer?: ScrollContainer;
};

/**
 * A pill-shaped navigation that floats over the page, with an active indicator that glides between items on a spring.
 * Positioned with `fixed`; add `absolute` in `className` to place it inside a positioned container.
 */
function FloatingNav({
  items,
  value: valueProp,
  defaultValue,
  onValueChange,
  position = "top",
  autoHide = false,
  label,
  scrollContainer,
  className,
  ...props
}: FloatingNavProps) {
  const msg = useMessages()
  label ??= msg("floating-nav.label", "Primary")
  const reduce = useReducedMotion();
  const indicatorId = `floating-nav-${React.useId()}`;
  const [inner, setInner] = React.useState(defaultValue ?? items[0]?.value);
  const value = valueProp ?? inner;
  const scrolled = useScrolled(24, scrollContainer);
  const direction = useScrollDirection(12, scrollContainer);
  const hidden = autoHide && scrolled && (position === "top" ? direction === "down" : direction === "up");
  return (
    <nav
      aria-label={label}
      data-slot="floating-nav"
      data-hidden={hidden || undefined}
      className={cn(
        "fixed left-1/2 z-40 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 transition-[transform,opacity] duration-300 motion-reduce:transition-none",
        position === "top" ? "top-4" : "bottom-4",
        hidden && (position === "top" ? "-translate-y-[calc(100%+1.5rem)]" : "translate-y-[calc(100%+1.5rem)]"),
        hidden && "opacity-0 focus-within:translate-y-0 focus-within:opacity-100",
        className,
      )}
      {...props}
    >
      <ul className="flex items-center gap-0.5 rounded-full border bg-background/80 p-1 shadow-[0_8px_32px_-8px_rgb(0_0_0/0.25)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        {items.map((item) => {
          const active = item.value === value;
          return (
            <li key={item.value}>
              <a
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.icon ? item.label : undefined}
                onClick={() => {
                  if (valueProp === undefined) setInner(item.value);
                  onValueChange?.(item.value);
                }}
                className={cn(
                  "relative inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId={indicatorId}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-primary shadow-sm"
                    transition={reduce ? { duration: 0 } : spring.snappy}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  {item.icon}
                  <span className={cn(item.icon && "max-sm:sr-only")}>{item.label}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { FloatingNav, type FloatingNavProps, type FloatingNavItem };
