// Ballmac UI: Neon Card. https://ui.ballmac.com/components/neon-card
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type NeonTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "primary" | "destructive"

const VAR: Record<NeonTone, string> = {
  "chart-1": "var(--chart-1)",
  "chart-2": "var(--chart-2)",
  "chart-3": "var(--chart-3)",
  "chart-4": "var(--chart-4)",
  "chart-5": "var(--chart-5)",
  primary: "var(--primary)",
  destructive: "var(--destructive)",
}

type NeonCardProps = Omit<React.ComponentProps<"div">, "ref"> & {
  /** Color at the start of the border. */
  from?: NeonTone
  /** Color at the end of the border. */
  to?: NeonTone
  /** Border thickness in pixels. */
  borderWidth?: number
  /** How strongly the outer light spreads, from 0 to 1. */
  glow?: number
  /** Let the light flicker like a neon sign that is warming up. Off by default and never on under reduced motion. */
  flicker?: boolean
  /** Corner radius. */
  radius?: "lg" | "xl" | "2xl" | "3xl"
  /** Classes for the inner surface. */
  contentClassName?: string
}

const RADIUS = {
  lg: ["rounded-lg", "rounded-[calc(var(--radius-lg)-var(--nw))]"],
  xl: ["rounded-xl", "rounded-[calc(var(--radius-xl)-var(--nw))]"],
  "2xl": ["rounded-2xl", "rounded-[calc(var(--radius-2xl)-var(--nw))]"],
  "3xl": ["rounded-3xl", "rounded-[calc(var(--radius-3xl)-var(--nw))]"],
}

function NeonCard({ from = "chart-1", to = "chart-4", borderWidth = 1.5, glow = 0.6, flicker = false, radius = "xl", className, contentClassName, children, style, ...props }: NeonCardProps) {
  const reduce = useReducedMotion()
  const gradient = `linear-gradient(135deg, ${VAR[from]}, ${VAR[to]})`
  const [outer, inner] = RADIUS[radius]
  const flickers = flicker && !reduce

  return (
    <div
      data-slot="neon-card"
      className={cn("group/neon relative isolate", outer, className)}
      style={{ ...style, ["--nw" as string]: `${borderWidth}px` } as React.CSSProperties}
      {...props}
    >
      {/* The light: the same gradient, blurred, behind the card. */}
      <motion.span
        aria-hidden="true"
        className={cn("pointer-events-none absolute -inset-1 -z-10 blur-xl", outer)}
        style={{ background: gradient, opacity: 0.18 + glow * 0.5 }}
        animate={flickers ? { opacity: [0.18 + glow * 0.5, 0.1, 0.18 + glow * 0.5, 0.05, 0.18 + glow * 0.5, 0.18 + glow * 0.5] } : undefined}
        transition={flickers ? { duration: 4, repeat: Infinity, times: [0, 0.04, 0.08, 0.12, 0.16, 1], ease: "linear" } : undefined}
      />
      <div className={cn("p-[var(--nw)]", outer)} style={{ background: gradient }}>
        <div className={cn("relative h-full bg-card text-card-foreground", inner, contentClassName)}>
          <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0 opacity-60 dark:opacity-100", inner)} style={{ boxShadow: `inset 0 0 28px -6px color-mix(in oklab, ${VAR[from]} ${Math.round(glow * 45)}%, transparent)` }} />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  )
}

export { NeonCard, type NeonCardProps, type NeonTone }
