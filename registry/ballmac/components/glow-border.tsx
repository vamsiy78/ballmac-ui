// Ballmac UI: Glow Border. https://ui.ballmac.com/components/glow-border
"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type GlowBorderProps = React.ComponentProps<"div"> & {
  /** Seconds for one full rotation of the gradient. */
  duration?: number
  /** Border thickness in pixels. */
  width?: number
  /** Outer corner radius in pixels; the content's radius is reduced by `width` so the ring stays even. */
  radius?: number
  /** Colors of the moving arc, as CSS colors or variables. The arc fades out before the first color repeats. */
  colors?: string[]
  /** How much of the ring the arc covers, 0 to 1. Use 1 for a continuous gradient ring. */
  arc?: number
  /** Strength of the soft outer glow, 0 to 1. */
  glow?: number
  /** Class names for the inner content surface. */
  contentClassName?: string
}

const ANGLE = "--glow-border-angle"

let registered = false
/** Registers the angle as a typed property so browsers can interpolate it; returns false if unsupported. */
function registerAngle() {
  if (registered) return true
  if (typeof CSS === "undefined" || !("registerProperty" in CSS)) return false
  try {
    CSS.registerProperty({ name: ANGLE, syntax: "<angle>", inherits: true, initialValue: "0deg" })
  } catch {
    // Already registered (hot reload, a second copy of this file): still usable.
  }
  registered = true
  return true
}

function gradientFor(colors: string[], arc: number) {
  if (arc >= 1) return `conic-gradient(from var(${ANGLE}), ${[...colors, colors[0]].join(", ")})`
  const span = Math.max(0.05, arc) * 100
  const step = span / (colors.length + 1)
  const stops = colors.map((c, i) => `${c} ${(step * (i + 1)).toFixed(2)}%`)
  return `conic-gradient(from var(${ANGLE}), transparent 0%, ${stops.join(", ")}, transparent ${span.toFixed(2)}%, transparent 100%)`
}

function GlowBorder({
  duration = 4,
  width = 1.5,
  radius = 14,
  colors = ["var(--chart-1)", "var(--chart-4)", "var(--chart-5)", "var(--chart-2)"],
  arc = 0.55,
  glow = 0.5,
  contentClassName,
  className,
  style,
  children,
  ...props
}: GlowBorderProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  React.useEffect(() => {
    const root = rootRef.current
    if (!root || reduceMotion || !registerAngle() || typeof root.animate !== "function") return
    const animation = root.animate([{ [ANGLE]: "0deg" }, { [ANGLE]: "360deg" }], {
      duration: duration * 1000,
      iterations: Infinity,
      easing: "linear",
    })
    // Pause while off-screen; browsers already throttle hidden tabs.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) animation.play()
      else animation.pause()
    })
    observer.observe(root)
    return () => {
      observer.disconnect()
      animation.cancel()
    }
  }, [duration, reduceMotion])

  const background = gradientFor(colors, arc)

  return (
    <div
      ref={rootRef}
      data-slot="glow-border"
      className={cn("relative isolate", className)}
      style={
        {
          borderRadius: radius,
          padding: width,
          // Static angle under reduced motion: the arc rests across the top-right corner.
          [ANGLE]: "40deg",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Soft glow behind the ring. */}
      {glow > 0 && (
        <span
          aria-hidden="true"
          data-slot="glow-border-glow"
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] blur-md"
          style={{ background, opacity: glow }}
        />
      )}
      {/* The ring: the gradient shows only in the padding around the content. */}
      <span
        aria-hidden="true"
        data-slot="glow-border-ring"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-border"
      >
        <span className="absolute inset-0 rounded-[inherit]" style={{ background }} />
      </span>
      <div
        data-slot="glow-border-content"
        className={cn("relative h-full rounded-[inherit] bg-card text-card-foreground", contentClassName)}
        style={{ borderRadius: Math.max(0, radius - width) }}
      >
        {children}
      </div>
    </div>
  )
}

export { GlowBorder, type GlowBorderProps }
