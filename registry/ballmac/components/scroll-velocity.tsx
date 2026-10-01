// Ballmac UI: Scroll Velocity. https://ui.ballmac.com/components/scroll-velocity
"use client"

import * as React from "react"
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react"

import { cn } from "@/lib/utils"

type ScrollVelocityProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** What runs along the row: words, logos, anything. It is repeated to fill the width. */
  children: React.ReactNode
  /** Pixels per second when the page is still. */
  baseVelocity?: number
  /** Which way the row drifts when still. Scrolling down pushes it the way it already goes; scrolling up reverses it. */
  direction?: "left" | "right"
  /** How strongly scrolling speeds the row up. 0 turns it off. */
  sensitivity?: number
  /** A scrollable element to watch instead of the page. Pass a ref to it. */
  scrollContainer?: React.RefObject<HTMLElement | null>
  /** Gap between repeats, as a CSS length. */
  gap?: string
}

const wrap = (min: number, max: number, v: number) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

/** A row that drifts sideways and speeds up, or reverses, with how fast you scroll. */
function ScrollVelocity({ children, baseVelocity = 60, direction = "left", sensitivity = 1, scrollContainer, gap = "2rem", className, ...props }: ScrollVelocityProps) {
  const reduce = useReducedMotion()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const copyRef = React.useRef<HTMLDivElement>(null)
  const [copies, setCopies] = React.useState(4)
  const [copyWidth, setCopyWidth] = React.useState(0)

  const offset = useMotionValue(0)
  const { scrollY } = useScroll(scrollContainer ? { container: scrollContainer } : undefined)
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 })
  const factor = useTransform(smooth, [0, 1000], [0, 5 * sensitivity], { clamp: false })
  const heading = React.useRef(direction === "left" ? -1 : 1)

  // Measure one copy, then repeat it enough times to cover the row plus one for the wrap.
  React.useLayoutEffect(() => {
    const root = rootRef.current
    const copy = copyRef.current
    if (!root || !copy) return
    const measure = () => {
      const w = copy.offsetWidth
      setCopyWidth(w)
      setCopies(w > 0 ? Math.ceil(root.offsetWidth / w) + 2 : 4)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    ro.observe(copy)
    return () => ro.disconnect()
  }, [children, gap])

  useAnimationFrame((_, delta) => {
    if (reduce || !copyWidth) return
    const base = direction === "left" ? -1 : 1
    const f = factor.get()
    if (f < -0.01) heading.current = -base
    else if (f > 0.01) heading.current = base
    let move = heading.current * baseVelocity * (delta / 1000)
    move += heading.current * Math.abs(move) * Math.abs(f)
    offset.set(wrap(-copyWidth, 0, offset.get() + move))
  })

  const x = useTransform(offset, (v) => `${v}px`)

  if (reduce) {
    return (
      <div data-slot="scroll-velocity" className={cn("overflow-x-auto", className)} {...props}>
        <div className="flex w-max items-center" style={{ gap }}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div ref={rootRef} data-slot="scroll-velocity" className={cn("relative overflow-hidden", className)} {...props}>
      <motion.div className="flex w-max items-center will-change-transform" style={{ x, gap }}>
        {Array.from({ length: copies }, (_, i) => (
          <div
            key={i}
            ref={i === 0 ? copyRef : undefined}
            aria-hidden={i > 0 ? true : undefined}
            // The repeats are for looks only, so they are removed from tab order and screen readers.
            {...(i > 0 ? { inert: true } : {})}
            className="flex shrink-0 items-center"
            style={{ gap, paddingRight: gap }}
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export { ScrollVelocity, type ScrollVelocityProps }
