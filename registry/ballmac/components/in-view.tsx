// Ballmac UI: In View. https://ui.ballmac.com/components/in-view
"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type InViewEffect = "none" | "fade" | "slide-up" | "slide-down" | "scale" | "blur"

const FROM: Record<Exclude<InViewEffect, "none">, Record<string, number | string>> = {
  fade: { opacity: 0 },
  "slide-up": { opacity: 0, y: 24 },
  "slide-down": { opacity: 0, y: -24 },
  scale: { opacity: 0, scale: 0.92 },
  blur: { opacity: 0, filter: "blur(10px)" },
}

type InViewProps = Omit<React.ComponentProps<"div">, "children" | "ref"> & {
  /** Content, or a function that receives whether the element is in view. */
  children: React.ReactNode | ((inView: boolean) => React.ReactNode)
  /** Built-in entrance. "none" only reports the state and leaves styling to you. */
  effect?: InViewEffect
  /** Fraction of the element that must be visible: 0 to 1, or "some" / "all". */
  amount?: number | "some" | "all"
  /** Shrinks or grows the viewport used for the check, like CSS margins: "0px 0px -20% 0px". */
  margin?: string
  /** Stay revealed after the first time. */
  once?: boolean
  /** Seconds before the entrance starts. */
  delay?: number
  /** Seconds the entrance takes. */
  duration?: number
  /** Called whenever the element enters or leaves the view. */
  onInViewChange?: (inView: boolean) => void
  /** Element to render. */
  as?: "div" | "section" | "article" | "li" | "span"
}

/** Tells you when an element is on screen. Sets `data-in-view` for CSS, and can run a simple entrance. */
function InView({ children, effect = "fade", amount = 0.25, margin, once = true, delay = 0, duration = 0.55, onInViewChange, as = "div", className, ...props }: InViewProps) {
  const ref = React.useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once, amount, margin: margin as `${number}px` | undefined })
  const last = React.useRef<boolean | null>(null)
  const callback = React.useRef(onInViewChange)
  React.useEffect(() => {
    callback.current = onInViewChange
  })
  React.useEffect(() => {
    if (last.current !== inView) {
      if (last.current !== null || inView) callback.current?.(inView)
      last.current = inView
    }
  }, [inView])

  const Tag = motion[as] as typeof motion.div
  const animated = effect !== "none" && !reduce
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      data-slot="in-view"
      data-in-view={inView}
      initial={false}
      animate={animated ? (inView ? { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" } : FROM[effect as Exclude<InViewEffect, "none">]) : undefined}
      transition={{ duration, delay: inView ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
      {...(props as object)}
    >
      {typeof children === "function" ? children(inView) : children}
    </Tag>
  )
}

export { InView, type InViewProps, type InViewEffect }
