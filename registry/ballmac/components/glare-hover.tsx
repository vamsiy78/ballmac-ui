// Ballmac UI: Glare Hover. https://ui.ballmac.com/components/glare-hover
"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type GlareHoverProps = React.ComponentProps<"div"> & {
  /** Tilt of the band of light, in degrees. */
  angle?: number
  /** Milliseconds the sweep takes. */
  duration?: number
  /** Brightness of the glare, from 0 to 1. */
  intensity?: number
  /** "light" sweeps white light, good over images and dark surfaces. "dark" sweeps a soft shadow, good on light surfaces. */
  tone?: "light" | "dark"
}

function GlareHover({ angle = 18, duration = 800, intensity = 0.55, tone = "light", className, children, style, ...props }: GlareHoverProps) {
  const reduce = useReducedMotion()
  const color = tone === "light" ? `rgb(255 255 255 / ${intensity})` : `color-mix(in oklab, var(--foreground) ${Math.round(intensity * 22)}%, transparent)`

  return (
    <div
      data-slot="glare-hover"
      className={cn("group/glare relative isolate overflow-hidden", className)}
      style={{ ...style, ["--glare-ms" as string]: `${duration}ms` } as React.CSSProperties}
      {...props}
    >
      {children}
      {!reduce && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]">
          <span
            className="absolute -inset-y-[40%] left-0 w-[45%] -translate-x-[130%] transition-none group-focus-within/glare:translate-x-[300%] group-focus-within/glare:transition-transform group-focus-within/glare:duration-[var(--glare-ms)] group-focus-within/glare:ease-out group-hover/glare:translate-x-[300%] group-hover/glare:transition-transform group-hover/glare:duration-[var(--glare-ms)] group-hover/glare:ease-out"
            style={{ background: `linear-gradient(90deg, transparent, ${color} 50%, transparent)`, transform: `skewX(${-angle}deg)`, mixBlendMode: tone === "light" ? "overlay" : "normal" }}
          />
        </span>
      )}
    </div>
  )
}

export { GlareHover, type GlareHoverProps }
