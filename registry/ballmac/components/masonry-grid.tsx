// Ballmac UI: Masonry Grid. https://ui.ballmac.com/components/masonry-grid
"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";

type ColumnCount = 1 | 2 | 3 | 4 | 5 | 6;
type MasonryColumns = ColumnCount | { base?: ColumnCount; sm?: ColumnCount; md?: ColumnCount; lg?: ColumnCount; xl?: ColumnCount };

const BASE: Record<ColumnCount, string> = { 1: "columns-1", 2: "columns-2", 3: "columns-3", 4: "columns-4", 5: "columns-5", 6: "columns-6" };
const SM: Record<ColumnCount, string> = { 1: "sm:columns-1", 2: "sm:columns-2", 3: "sm:columns-3", 4: "sm:columns-4", 5: "sm:columns-5", 6: "sm:columns-6" };
const MD: Record<ColumnCount, string> = { 1: "md:columns-1", 2: "md:columns-2", 3: "md:columns-3", 4: "md:columns-4", 5: "md:columns-5", 6: "md:columns-6" };
const LG: Record<ColumnCount, string> = { 1: "lg:columns-1", 2: "lg:columns-2", 3: "lg:columns-3", 4: "lg:columns-4", 5: "lg:columns-5", 6: "lg:columns-6" };
const XL: Record<ColumnCount, string> = { 1: "xl:columns-1", 2: "xl:columns-2", 3: "xl:columns-3", 4: "xl:columns-4", 5: "xl:columns-5", 6: "xl:columns-6" };

const GAPS = {
  sm: { gap: "gap-3", item: "mb-3" },
  md: { gap: "gap-4", item: "mb-4" },
  lg: { gap: "gap-6", item: "mb-6" },
} as const;

type MasonryGridProps = React.ComponentProps<"div"> & {
  /** Number of columns, or a count per breakpoint: `{ base: 1, sm: 2, lg: 4 }`. */
  columns?: MasonryColumns;
  /** Space between items. */
  gap?: keyof typeof GAPS;
  /** Fade items up as they scroll into view. Off under reduced motion. */
  reveal?: boolean;
};

const GapContext = React.createContext<keyof typeof GAPS>("md");
const RevealContext = React.createContext(false);

function columnClasses(columns: MasonryColumns) {
  if (typeof columns === "number") return BASE[columns];
  return [
    columns.base && BASE[columns.base],
    columns.sm && SM[columns.sm],
    columns.md && MD[columns.md],
    columns.lg && LG[columns.lg],
    columns.xl && XL[columns.xl],
  ];
}

/**
 * A multi-column layout where items of different heights pack without gaps. Built on CSS columns, so it renders the
 * same on the server and in the browser, never shifts on load, and keeps DOM order equal to reading order
 * (down the first column, then the next).
 */
function MasonryGrid({
  columns = { base: 1, sm: 2, lg: 3 },
  gap = "md",
  reveal = false,
  className,
  ...props
}: MasonryGridProps) {
  return (
    <GapContext.Provider value={gap}>
      <RevealContext.Provider value={reveal}>
        <div
          data-slot="masonry-grid"
          className={cn(columnClasses(columns), GAPS[gap].gap, className)}
          {...props}
        />
      </RevealContext.Provider>
    </GapContext.Provider>
  );
}

type MasonryItemProps = Omit<React.ComponentProps<"div">, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart">;

/** One tile. It never splits across columns. */
function MasonryItem({ className, children, ...props }: MasonryItemProps) {
  const gap = React.useContext(GapContext);
  const reveal = React.useContext(RevealContext);
  const reduce = useReducedMotion();
  const classes = cn("break-inside-avoid", GAPS[gap].item, className);
  if (!reveal || reduce) {
    return (
      <div data-slot="masonry-item" className={classes} {...props}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      data-slot="masonry-item"
      className={classes}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.5, ease: ease.out }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export { MasonryGrid, MasonryItem, type MasonryGridProps, type MasonryItemProps, type MasonryColumns };
