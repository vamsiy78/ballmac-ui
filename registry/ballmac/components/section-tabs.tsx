// Ballmac UI: Section Tabs. https://ui.ballmac.com/components/section-tabs
"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { scrollToId, useScrollSpy, useScrolled, type ScrollContainer } from "@/lib/ballmac/scroll";
import { spring } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/ballmac/i18n";

type SectionTab = {
  /** The id of the section in the page. */
  id: string;
  /** Tab text. */
  label: string;
};

type SectionTabsProps = Omit<React.ComponentProps<"nav">, "children"> & {
  /** Sections in page order. */
  sections: SectionTab[];
  /** Accessible name of the navigation landmark. */
  label?: string;
  /** Pixels of space to keep above a section after scrolling to it (your sticky header plus this bar). */
  offset?: number;
  /** A scrollable element to watch and scroll instead of the page. */
  container?: ScrollContainer;
  /** Indicator style. */
  variant?: "underline" | "pill";
  /** Stick to the top of the page (or container) while scrolling. */
  sticky?: boolean;
  /** Distance from the top when sticky. */
  stickyTop?: number;
};

/**
 * In-page navigation for long pages (pricing, product, docs). Tabs follow the reader: the current section is
 * highlighted with a sliding indicator, the active tab scrolls into view on narrow screens, and choosing a tab
 * scrolls to its section. Real links, so it works with the keyboard, new tabs and copied URLs.
 */
function SectionTabs({
  sections,
  label,
  offset = 72,
  container,
  variant = "underline",
  sticky = true,
  stickyTop = 0,
  className,
  style,
  ...props
}: SectionTabsProps) {
  const msg = useMessages()
  label ??= msg("section-tabs.label", "Sections")
  const reduce = useReducedMotion();
  const indicatorId = `section-tabs-${React.useId()}`;
  const ids = React.useMemo(() => sections.map((s) => s.id), [sections]);
  const active = useScrollSpy(ids, { offset, container });
  const stuck = useScrolled(offset, container);
  const listRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>("[aria-current=location]");
    if (!list || !el) return;
    const left = el.offsetLeft - (list.clientWidth - el.offsetWidth) / 2;
    if (typeof list.scrollTo === "function") list.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [active, reduce]);

  return (
    <nav
      aria-label={label}
      data-slot="section-tabs"
      data-stuck={stuck || undefined}
      style={{ top: sticky ? stickyTop : undefined, ...style }}
      className={cn(
        "z-30 border-b bg-background/85 backdrop-blur-md transition-shadow duration-200 data-[stuck]:shadow-[0_8px_24px_-16px_rgb(0_0_0/0.2)] motion-reduce:transition-none",
        sticky && "sticky",
        className,
      )}
      {...props}
    >
      <ul
        ref={listRef}
        className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((section) => {
          const isActive = section.id === active;
          return (
            <li key={section.id} className="shrink-0">
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  if (scrollToId(section.id, { offset: offset - 4, container })) history.replaceState(null, "", `#${section.id}`);
                }}
                className={cn(
                  "relative my-1.5 inline-flex h-9 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={indicatorId}
                    aria-hidden="true"
                    transition={reduce ? { duration: 0 } : spring.snappy}
                    className={cn(
                      "absolute",
                      variant === "underline"
                        ? "inset-x-2 -bottom-[7px] h-0.5 rounded-full bg-primary"
                        : "inset-0 -z-10 rounded-md bg-accent",
                    )}
                  />
                )}
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { SectionTabs, type SectionTabsProps, type SectionTab };
