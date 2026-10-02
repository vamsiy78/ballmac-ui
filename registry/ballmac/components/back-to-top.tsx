// Ballmac UI: Back To Top. https://ui.ballmac.com/components/back-to-top
"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { prefersReducedMotion, useScrolled } from "@/lib/ballmac/scroll";
import { spring } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/ballmac/i18n";

type BackToTopProps = Omit<React.ComponentProps<"button">, "onClick"> & {
  /** Scroll distance in pixels after which the button appears. */
  threshold?: number;
  /** A scrollable element to watch and scroll instead of the page. */
  container?: React.RefObject<HTMLElement | null>;
  /** Draw a ring around the button that fills with scroll progress. */
  showProgress?: boolean;
  /** CSS selector of the element that receives focus after scrolling. Defaults to `main`, then the page. */
  focusTarget?: string;
  /** Button text, used as the accessible name. */
  label?: string;
  /** Show the label next to the arrow. */
  showLabel?: boolean;
};

const R = 18;
const C = 2 * Math.PI * R;

/**
 * A floating button that appears after the reader scrolls down and returns them to the top. Focus moves to the main
 * content afterwards, so keyboard users do not lose their place when the button fades away.
 * Fixed to the viewport; add `absolute` to `className` to place it inside a positioned container.
 */
function BackToTop({
  threshold = 320,
  container,
  showProgress = true,
  focusTarget,
  label,
  showLabel = false,
  className,
  ...props
}: BackToTopProps) {
  const msg = useMessages()
  label ??= msg("back-to-top.label", "Back to top")
  const reduce = useReducedMotion();
  const visible = useScrolled(threshold, container);
  const { scrollYProgress } = useScroll(container ? { container } : undefined);
  const dashOffset = useTransform(scrollYProgress, (p) => C * (1 - p));
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          data-slot="back-to-top"
          aria-label={showLabel ? undefined : label}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.9 }}
          transition={reduce ? { duration: 0.1 } : spring.snappy}
          onClick={() => {
            const behavior = prefersReducedMotion() ? "auto" : "smooth";
            const box = container?.current;
            if (box) box.scrollTo({ top: 0, behavior });
            else window.scrollTo({ top: 0, behavior });
            const target = document.querySelector<HTMLElement>(focusTarget ?? "main") ?? document.body;
            if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
          }}
          className={cn(
            "fixed end-5 bottom-5 z-40 inline-flex h-11 items-center justify-center gap-2 rounded-full border bg-background/90 text-foreground shadow-[0_8px_24px_-8px_rgb(0_0_0/0.3)] outline-none backdrop-blur transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
            showLabel ? "pe-4 ps-3" : "w-11",
            className,
          )}
          {...(props as object)}
        >
          {showProgress && !showLabel ? (
            <svg aria-hidden="true" viewBox="0 0 44 44" className="pointer-events-none absolute inset-0 -rotate-90">
              <circle cx="22" cy="22" r={R} fill="none" strokeWidth="2" className="stroke-border" />
              <motion.circle
                cx="22"
                cy="22"
                r={R}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                className="stroke-primary"
                strokeDasharray={C}
                style={{ strokeDashoffset: dashOffset }}
              />
            </svg>
          ) : null}
          <ArrowUp aria-hidden="true" className="relative size-4" />
          {showLabel && <span className="relative text-sm font-medium">{label}</span>}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export { BackToTop, type BackToTopProps };
