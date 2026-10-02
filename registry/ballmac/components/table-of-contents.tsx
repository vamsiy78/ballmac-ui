// Ballmac UI: Table Of Contents. https://ui.ballmac.com/components/table-of-contents
"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { scrollToId, useScrollSpy, type ScrollContainer } from "@/lib/ballmac/scroll";
import { spring } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/ballmac/i18n";

type TocItem = {
  /** The id of the heading in the page. */
  id: string;
  /** Text of the link. */
  title: string;
  /** Heading level (2 = top level, 3 = indented, and so on). */
  level?: number;
};

type TableOfContentsProps = Omit<React.ComponentProps<"nav">, "children"> & {
  /** Links to show. Leave out to collect headings from the page automatically. */
  items?: TocItem[];
  /** Where to look for headings when `items` is not given. Defaults to `<main>`, then the whole page. */
  headingsFrom?: React.RefObject<HTMLElement | null>;
  /** Heading levels to collect automatically. */
  levels?: number[];
  /** Title above the list. Also the accessible name of the navigation. */
  title?: string;
  /** Pixels reserved at the top for a sticky header; also where a section counts as "reached". */
  offset?: number;
  /** A scrollable element to watch and scroll instead of the page. */
  container?: ScrollContainer;
  /** Called when the reader chooses a link. */
  onNavigate?: (id: string) => void;
};

function slug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * "On this page" navigation with a scroll spy. The current section is marked with a sliding indicator and
 * `aria-current="location"`; choosing a link scrolls smoothly (instantly under reduced motion) below a sticky header.
 */
function TableOfContents({
  items: itemsProp,
  headingsFrom,
  levels = [2, 3],
  title,
  offset = 96,
  container,
  onNavigate,
  className,
  ...props
}: TableOfContentsProps) {
  const msg = useMessages()
  title ??= msg("table-of-contents.title", "On this page")
  const reduce = useReducedMotion();
  const indicatorId = `toc-${React.useId()}`;
  const [found, setFound] = React.useState<TocItem[]>([]);
  const levelKey = levels.join(",");

  React.useEffect(() => {
    if (itemsProp) return;
    const frame = requestAnimationFrame(() => {
      const scope = headingsFrom?.current ?? document.querySelector("main") ?? document.body;
      const selector = levelKey.split(",").map((l) => `h${l}`).join(",");
      const next: TocItem[] = [];
      scope.querySelectorAll<HTMLElement>(selector).forEach((heading) => {
        const text = heading.textContent?.trim() ?? "";
        if (!text) return;
        if (!heading.id) heading.id = slug(text);
        next.push({ id: heading.id, title: text, level: Number(heading.tagName.slice(1)) });
      });
      setFound(next);
    });
    return () => cancelAnimationFrame(frame);
  }, [itemsProp, headingsFrom, levelKey]);

  const items = itemsProp ?? found;
  const ids = React.useMemo(() => items.map((i) => i.id), [items]);
  const active = useScrollSpy(ids, { offset, container });
  const base = items.length ? Math.min(...items.map((i) => i.level ?? 2)) : 2;
  if (!items.length) return null;
  return (
    <nav aria-label={title} data-slot="table-of-contents" className={cn("text-sm", className)} {...props}>
      <p className="mb-3 text-xs font-semibold tracking-wide text-foreground uppercase">{title}</p>
      <ul className="relative grid gap-0.5 border-s border-border">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                data-active={isActive || undefined}
                onClick={(event) => {
                  event.preventDefault();
                  if (scrollToId(item.id, { offset: offset - 8, container })) {
                    history.replaceState(null, "", `#${item.id}`);
                    onNavigate?.(item.id);
                  }
                }}
                style={{ paddingInlineStart: `${0.75 + ((item.level ?? 2) - base) * 0.75}rem` }}
                className="relative -ms-px block rounded-e-md py-1.5 pe-2 leading-snug text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active]:font-medium data-[active]:text-foreground"
              >
                {isActive && (
                  <motion.span
                    layoutId={indicatorId}
                    aria-hidden="true"
                    className="absolute inset-y-1 start-0 w-0.5 rounded-full bg-primary"
                    transition={reduce ? { duration: 0 } : spring.snappy}
                  />
                )}
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { TableOfContents, type TableOfContentsProps, type TocItem };
