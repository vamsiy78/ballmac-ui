// Ballmac UI: Stagger List. https://ui.ballmac.com/components/stagger-list
"use client"

import * as React from "react"
import { AnimatePresence, motion, useInView, useReducedMotion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

type StaggerDirection = "up" | "down" | "left" | "right" | "scale"

function itemVariants(direction: StaggerDirection, distance: number): Variants {
  const from: Record<StaggerDirection, Record<string, number>> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    scale: { scale: 0.85 },
  }
  return {
    hidden: { opacity: 0, ...from[direction] },
    visible: { opacity: 1, x: 0, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 26 } },
  }
}

const Context = React.createContext<{ variants: Variants; reorder: boolean }>({ variants: itemVariants("up", 16), reorder: false })

type StaggerListProps = Omit<React.ComponentProps<"ul">, "ref"> & {
  /** Element for the list. */
  as?: "ul" | "ol" | "div"
  /** Seconds between items. */
  stagger?: number
  /** Seconds before the first item. */
  delay?: number
  /** Where items come from. */
  direction?: StaggerDirection
  /** Travel distance in pixels. */
  distance?: number
  /** Wait for the list to scroll into view. */
  inView?: boolean
  /** Items glide to their new place when the list is filtered, sorted or items are added or removed. */
  reorder?: boolean
}

function StaggerList({ as = "ul", stagger = 0.07, delay = 0, direction = "up", distance = 16, inView = true, reorder = true, className, children, ...props }: StaggerListProps) {
  const ref = React.useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" })
  const show = reduce || !inView || seen
  const variants = React.useMemo(() => itemVariants(direction, distance), [direction, distance])
  const Tag = motion[as] as typeof motion.ul

  return (
    <Context.Provider value={{ variants, reorder }}>
      <Tag
        ref={ref as React.Ref<HTMLUListElement>}
        data-slot="stagger-list"
        initial={false}
        animate={show ? "visible" : "hidden"}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: reduce ? 0 : delay } } }}
        className={className}
        {...(props as object)}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {children}
        </AnimatePresence>
      </Tag>
    </Context.Provider>
  )
}

type StaggerItemProps = Omit<React.ComponentProps<"li">, "ref">

function StaggerItem({ className, children, ...props }: StaggerItemProps) {
  const { variants, reorder } = React.useContext(Context)
  const reduce = useReducedMotion()
  return (
    <motion.li
      data-slot="stagger-item"
      variants={reduce ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : variants}
      layout={reorder && !reduce ? "position" : false}
      exit={reduce ? undefined : { opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={cn(className)}
      {...(props as object)}
    >
      {children}
    </motion.li>
  )
}

export { StaggerList, StaggerItem, type StaggerListProps, type StaggerItemProps }
