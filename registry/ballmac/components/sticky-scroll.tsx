// Ballmac UI: Sticky Scroll. https://ui.ballmac.com/components/sticky-scroll
"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";

type StickyScrollItem = {
  /** Unique id of the step. */
  id: string;
  /** Step heading. */
  title: string;
  /** Step text. */
  description: React.ReactNode;
  /** The visual shown in the sticky panel while this step is active. */
  visual: React.ReactNode;
};

type StickyScrollProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Steps, in reading order. */
  items: StickyScrollItem[];
  /** Which side the sticky visual sits on from the `lg` breakpoint up. */
  visualSide?: "left" | "right";
  /** Distance from the top of the viewport where the sticky visual stops, in pixels. */
  stickyOffset?: number;
  /** Called when the active step changes. */
  onActiveChange?: (id: string) => void;
  /** A scrollable element that contains the steps, when the page itself does not scroll (panels, previews). */
  container?: React.RefObject<HTMLElement | null>;
  /** Minimum height of each step from `lg` up. Longer steps give the reader more time on each visual. */
  stepMinHeight?: string;
};

/**
 * Scroll-driven storytelling: text steps scroll past while one visual stays pinned and crossfades to match the step.
 * Below `lg` each step shows its own visual inline, so nothing is hidden and nothing is pinned.
 */
function StickyScroll({
  items,
  visualSide = "right",
  stickyOffset = 96,
  onActiveChange,
  container,
  stepMinHeight = "70svh",
  className,
  ...props
}: StickyScrollProps) {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = React.useState(items[0]?.id);
  const stepRefs = React.useRef(new Map<string, HTMLElement>());
  const callback = React.useRef(onActiveChange);
  React.useEffect(() => {
    callback.current = onActiveChange;
  });

  React.useEffect(() => {
    const steps = [...stepRefs.current.entries()];
    if (!steps.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        const best = visible.reduce((a, b) => (b.intersectionRatio > a.intersectionRatio ? b : a));
        const id = steps.find(([, el]) => el === best.target)?.[0];
        if (id) {
          setActiveId(id);
          callback.current?.(id);
        }
      },
      { root: container?.current ?? null, rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    steps.forEach(([, el]) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, container]);

  const active = items.find((i) => i.id === activeId) ?? items[0];
  return (
    <div
      data-slot="sticky-scroll"
      className={cn("grid gap-10 lg:grid-cols-2 lg:gap-16", className)}
      {...props}
    >
      <ol className={cn("grid gap-16 lg:gap-0", visualSide === "left" && "lg:order-2")}>
        {items.map((item) => {
          const isActive = item.id === active?.id;
          return (
            <li
              key={item.id}
              ref={(el) => {
                if (el) stepRefs.current.set(item.id, el);
                else stepRefs.current.delete(item.id);
              }}
              aria-current={isActive ? "step" : undefined}
              data-active={isActive || undefined}
              style={{ "--step-min-h": stepMinHeight } as React.CSSProperties}
              className="group/step relative grid content-center gap-4 lg:min-h-(--step-min-h) lg:border-s-2 lg:border-transparent lg:ps-6 lg:transition-colors lg:data-[active]:border-primary motion-reduce:transition-none"
            >
              <div className="lg:hidden" aria-hidden="true">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border bg-card">{item.visual}</div>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-balance transition-colors sm:text-3xl lg:text-muted-foreground lg:group-data-[active]/step:text-foreground motion-reduce:transition-none">{item.title}</h3>
              <div className="max-w-prose text-base leading-relaxed text-muted-foreground">{item.description}</div>
            </li>
          );
        })}
      </ol>
      <div className={cn("hidden lg:block", visualSide === "left" && "lg:order-1")} aria-hidden="true">
        <div
          className="sticky aspect-[4/3] w-full overflow-hidden rounded-3xl border bg-card shadow-[0_24px_60px_-24px_rgb(0_0_0/0.25)]"
          style={{ top: stickyOffset }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {active && (
              <motion.div
                key={active.id}
                className="absolute inset-0"
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
                transition={{ duration: reduce ? 0 : 0.4, ease: ease.out }}
              >
                {active.visual}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export { StickyScroll, type StickyScrollProps, type StickyScrollItem };
