// Ballmac UI: Spinning Text. https://ui.ballmac.com/components/spinning-text
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type SpinningTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The words that run around the circle. */
  text: string
  /** Shown between repeats of the text. */
  separator?: string
  /** Seconds for one full turn. */
  duration?: number
  /** Turn counter-clockwise. */
  reverse?: boolean
  /** Pause the spin while the pointer is over it or it has keyboard focus. */
  pauseOnHover?: boolean
  /** Content in the middle of the ring, such as a logo or an arrow. */
  children?: React.ReactNode
}

function SpinningText({ text, separator = " • ", duration = 14, reverse = false, pauseOnHover = true, className, children, ...props }: SpinningTextProps) {
  const reduce = useReducedMotion()
  const id = React.useId().replace(/:/g, "")
  const [paused, setPaused] = React.useState(false)
  const label = text.trim()
  const run = `${label}${separator}`
  // Fit the string to the circle: every character gets a small even share of the circumference.
  const radius = 76
  const circumference = 2 * Math.PI * radius

  return (
    <div
      data-slot="spinning-text"
      role="img"
      aria-label={label}
      onPointerEnter={() => pauseOnHover && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className={cn("relative inline-flex size-40 items-center justify-center text-foreground", className)}
      {...props}
    >
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="absolute inset-0 size-full overflow-visible"
        animate={reduce || paused ? undefined : { rotate: reverse ? -360 : 360 }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
        style={{ originX: "50%", originY: "50%" }}
      >
        <defs>
          <path id={id} d={`M100 100 m-${radius} 0 a${radius} ${radius} 0 1 1 ${radius * 2} 0 a${radius} ${radius} 0 1 1 -${radius * 2} 0`} />
        </defs>
        <text fill="currentColor" className="font-medium uppercase" style={{ fontSize: 15, letterSpacing: "0.04em" }}>
          <textPath href={`#${id}`} textLength={circumference - 4} lengthAdjust="spacing">
            {run}
          </textPath>
        </text>
      </motion.svg>
      {children && <div className="relative flex items-center justify-center">{children}</div>}
    </div>
  )
}

export { SpinningText, type SpinningTextProps }
