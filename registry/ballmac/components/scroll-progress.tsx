// Ballmac UI: Scroll Progress. https://ui.ballmac.com/components/scroll-progress
"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

type ScrollProgressProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Which edge the bar sits on. */
  position?: "top" | "bottom";
  /** A scrollable element to track instead of the page. Give the bar `absolute` positioning inside its wrapper. */
  container?: React.RefObject<HTMLElement | null>;
  /** Bar thickness in pixels. */
  thickness?: number;
};

/**
 * A thin bar that fills as the reader scrolls. It is decorative (hidden from assistive technology): screen-reader
 * users already have their own position cues. The fill follows a soft spring, or tracks the scroll exactly under reduced motion.
 */
function ScrollProgress({ position = "top", container, thickness = 3, className, ...props }: ScrollProgressProps) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll(container ? { container } : undefined);
  const spring = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return (
    <div
      aria-hidden="true"
      data-slot="scroll-progress"
      style={{ height: thickness }}
      className={cn(
        "pointer-events-none fixed inset-x-0 z-50 bg-transparent",
        position === "top" ? "top-0" : "bottom-0",
        className,
      )}
      {...props}
    >
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-primary/70 to-primary"
        style={{ scaleX: reduce ? scrollYProgress : spring }}
      />
    </div>
  );
}

export { ScrollProgress, type ScrollProgressProps };
