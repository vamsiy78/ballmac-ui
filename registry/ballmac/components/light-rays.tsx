// Ballmac UI: Light Rays. https://ui.ballmac.com/components/light-rays
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type RayTone = "foreground" | "primary" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5"

const VAR: Record<RayTone, string> = {
  foreground: "var(--foreground)",
  primary: "var(--primary)",
  "chart-1": "var(--chart-1)",
  "chart-2": "var(--chart-2)",
  "chart-3": "var(--chart-3)",
  "chart-4": "var(--chart-4)",
  "chart-5": "var(--chart-5)",
}

type LightRaysProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Number of rays. */
  count?: number
  /** Color of the light. */
  tone?: RayTone
  /** How far the rays fan out, in degrees from one edge to the other. */
  spread?: number
  /** Brightness from 0 to 1. */
  intensity?: number
  /** Seconds for a ray to sway once. Longer is calmer. */
  duration?: number
}

// Deterministic pseudo-randomness keeps the server and browser identical.
const noise = (i: number, salt: number) => {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return v - Math.floor(v)
}

/** Soft beams of light fanning down from the top edge, swaying slowly. Decorative. */
function LightRays({ count = 7, tone = "chart-1", spread = 70, intensity = 0.55, duration = 9, className, ...props }: LightRaysProps) {
  const reduce = useReducedMotion()
  const color = VAR[tone]
  return (
    <div data-slot="light-rays" aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} {...props}>
      <span
        className="absolute inset-x-0 top-0 h-1/2"
        style={{ background: `radial-gradient(60% 100% at 50% 0%, color-mix(in oklab, ${color} ${Math.round(intensity * 45)}%, transparent), transparent 70%)` }}
      />
      {Array.from({ length: count }, (_, i) => {
        const t = count === 1 ? 0.5 : i / (count - 1)
        const angle = (t - 0.5) * spread + (noise(i, 1) - 0.5) * 6
        const width = 7 + noise(i, 2) * 12
        const sway = 1.5 + noise(i, 3) * 3
        const alpha = intensity * (0.35 + noise(i, 4) * 0.5)
        return (
          <motion.span
            key={i}
            className="absolute top-[-12%] left-1/2 h-[135%] origin-top blur-[10px]"
            style={{
              width: `${width}%`,
              marginLeft: `${-width / 2}%`,
              rotate: angle,
              background: `linear-gradient(to bottom, color-mix(in oklab, ${color} ${Math.round(alpha * 60)}%, transparent), transparent 82%)`,
              clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)",
            }}
            animate={reduce ? undefined : { rotate: [angle - sway, angle + sway, angle - sway], opacity: [0.65, 1, 0.65] }}
            transition={{ duration: duration * (0.8 + noise(i, 5) * 0.6), repeat: Infinity, ease: "easeInOut", delay: -noise(i, 6) * duration }}
          />
        )
      })}
    </div>
  )
}

export { LightRays, type LightRaysProps, type RayTone }
