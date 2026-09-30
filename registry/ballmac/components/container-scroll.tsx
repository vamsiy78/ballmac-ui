// Ballmac UI: Container Scroll. https://ui.ballmac.com/components/container-scroll
"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

type ContainerScrollProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Heading above the frame. It slides up slightly as the frame flattens. */
  title?: React.ReactNode;
  /** A scrollable element to track instead of the page. */
  container?: React.RefObject<HTMLElement | null>;
  /** Starting tilt of the frame in degrees. */
  tilt?: number;
  /** Classes for the frame that holds the children. */
  frameClassName?: string;
};

/**
 * A showcase frame that starts tilted back in 3D and flattens to face the reader as it scrolls into view.
 * Put a screenshot, video or live product demo inside. Under reduced motion the frame is flat from the start.
 */
function ContainerScroll({ title, container, tilt = 22, frameClassName, className, children, ...props }: ContainerScrollProps) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    container,
    offset: ["start end", "center center"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [tilt, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -24]);
  return (
    <div
      ref={ref}
      data-slot="container-scroll"
      className={cn("flex w-full flex-col items-center gap-8 py-10 [perspective:1100px]", className)}
      {...props}
    >
      {title && (
        <motion.div style={reduce ? undefined : { y: lift }} className="max-w-2xl text-center text-balance">
          {title}
        </motion.div>
      )}
      <motion.div
        data-slot="container-scroll-frame"
        style={reduce ? undefined : { rotateX: rotate, scale, transformOrigin: "50% 100%" }}
        className={cn(
          "w-full max-w-4xl overflow-hidden rounded-[1.75rem] border bg-card p-2 shadow-[0_0_0_1px_rgb(0_0_0/0.03),0_30px_80px_-30px_rgb(0_0_0/0.35),0_12px_24px_-12px_rgb(0_0_0/0.15)] sm:p-3",
          frameClassName,
        )}
      >
        <div className="overflow-hidden rounded-[1.25rem] border bg-background">{children}</div>
      </motion.div>
    </div>
  );
}

export { ContainerScroll, type ContainerScrollProps };
