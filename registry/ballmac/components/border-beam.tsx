// Ballmac UI: Border Beam. https://ui.ballmac.com/components/border-beam
// Based on Magic UI's Border Beam (MIT, Copyright (c) Magic UI), rewritten: span markup, token colors, Motion loop, reduced-motion and support checks.
"use client"

import * as React from "react"
import { animate, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type BorderBeamProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Seconds for one lap around the border. */
  duration?: number
  /** Seconds before the first lap. Use different delays to offset two beams. */
  delay?: number
  /** Length of the beam in pixels. */
  size?: number
  /** Color at the head of the beam. Any CSS color. */
  colorFrom?: string
  /** Color the beam fades through before its transparent tail. Any CSS color. */
  colorTo?: string
  /** Travel counter-clockwise. */
  reverse?: boolean
  /** Thickness of the beam in pixels; match your border width. */
  borderWidth?: number
}

// Keeps only the border ring: the padding box is cut out of the full box.
const borderOnlyMask: React.CSSProperties = {
  WebkitMask: "linear-gradient(black, black) padding-box, linear-gradient(black, black)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(black, black) padding-box exclude, linear-gradient(black, black)",
}

function BorderBeam({
  duration = 8,
  delay = 0,
  size = 80,
  colorFrom = "var(--ring)",
  colorTo = "color-mix(in oklch, var(--ring) 45%, transparent)",
  reverse = false,
  borderWidth = 1,
  className,
  style,
  ...props
}: BorderBeamProps) {
  const beamRef = React.useRef<HTMLSpanElement>(null)
  const reduceMotion = useReducedMotion()

  React.useEffect(() => {
    const beam = beamRef.current
    if (!beam || reduceMotion) return
    // Browsers without offset-path rect() would park the beam in a corner; hide it instead.
    if (typeof CSS !== "undefined" && !CSS.supports("offset-path", "rect(0 auto auto 0)")) {
      beam.style.display = "none"
      return
    }
    const controls = animate(
      beam,
      { offsetDistance: reverse ? ["100%", "0%"] : ["0%", "100%"] },
      { duration, delay, ease: "linear", repeat: Infinity }
    )
    return () => controls.stop()
  }, [duration, delay, reverse, reduceMotion])

  return (
    <span
      aria-hidden="true"
      data-slot="border-beam"
      className={cn(
        "pointer-events-none absolute inset-0 block rounded-[inherit] border-solid border-transparent motion-reduce:hidden",
        className
      )}
      style={{ ...borderOnlyMask, borderWidth, ...style }}
    >
      <span
        ref={beamRef}
        data-slot="border-beam-light"
        className="absolute block aspect-square"
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          offsetDistance: "0%",
          // The head of the beam faces the direction of travel.
          background: `linear-gradient(${reverse ? "to right" : "to left"}, ${colorFrom}, ${colorTo}, transparent)`,
        }}
      />
    </span>
  )
}

export { BorderBeam, type BorderBeamProps }
