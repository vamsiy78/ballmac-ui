// Ballmac UI: Animated List. https://ui.ballmac.com/components/animated-list
"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type AnimatedListProps = Omit<React.ComponentProps<"ul">, "ref"> & {
  /** Most items drawn. Extra items beyond this are left out. */
  max?: number
  /** Fade the last visible items out so a long feed trails off. */
  fadeEnd?: boolean
  /** Read new items aloud politely, for feeds people rely on. */
  announce?: boolean
  /** Accessible name of the feed. */
  label?: string
}

/** A feed where new items spring in and the rest glide down. Put an AnimatedListItem with a stable `key` for each entry. */
function AnimatedList({ max, fadeEnd = false, announce = false, label, className, children, ...props }: AnimatedListProps) {
  const items = React.Children.toArray(children)
  const shown = typeof max === "number" ? items.slice(0, max) : items
  return (
    <ul
      data-slot="animated-list"
      aria-label={label}
      aria-live={announce ? "polite" : undefined}
      aria-relevant={announce ? "additions" : undefined}
      className={cn("relative flex flex-col", fadeEnd && "[mask-image:linear-gradient(to_bottom,black_70%,transparent)]", className)}
      {...props}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {shown}
      </AnimatePresence>
    </ul>
  )
}

type AnimatedListItemProps = Omit<React.ComponentProps<"li">, "ref">

function AnimatedListItem({ className, children, ...props }: AnimatedListItemProps) {
  const reduce = useReducedMotion()
  return (
    <motion.li
      data-slot="animated-list-item"
      layout={reduce ? false : "position"}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: -24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      style={{ originY: 0 }}
      className={cn(className)}
      {...(props as object)}
    >
      {children}
    </motion.li>
  )
}

export { AnimatedList, AnimatedListItem, type AnimatedListProps, type AnimatedListItemProps }
