// Ballmac UI: Retro Grid. https://ui.ballmac.com/components/retro-grid
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type GridTone = "foreground" | "primary" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5"

const VAR: Record<GridTone, string> = {
  foreground: "var(--foreground)",
  primary: "var(--primary)",
  "chart-1": "var(--chart-1)",
  "chart-2": "var(--chart-2)",
  "chart-3": "var(--chart-3)",
  "chart-4": "var(--chart-4)",
  "chart-5": "var(--chart-5)",
}

type RetroGridProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Tilt of the floor in degrees. Higher is flatter and looks deeper. */
  angle?: number
  /** Size of one grid cell in pixels, at the front of the floor. */
  cellSize?: number
  /** Line color. */
  tone?: GridTone
  /** Seconds the floor takes to slide forward by one cell. Higher is slower. */
  speed?: number
  /** Soft glow along the horizon. */
  glow?: boolean
}

/** A perspective floor of grid lines that glides toward you, with a glowing horizon. Decorative. */
function RetroGrid({ angle = 62, cellSize = 64, tone = "foreground", speed = 1.4, glow = true, className, ...props }: RetroGridProps) {
  const reduce = useReducedMotion()
  const line = `color-mix(in oklab, ${VAR[tone]} 52%, transparent)`
  return (
    <div
      data-slot="retro-grid"
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden opacity-90 [perspective:240px]", className)}
      {...props}
    >
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent_0%,black_38%)]" style={{ transform: `rotateX(${angle}deg)` }}>
        <motion.div
          className="absolute -inset-x-[200%] -top-[100%] h-[300%]"
          style={{
            backgroundImage: `linear-gradient(to right, ${line} 1.5px, transparent 0), linear-gradient(to bottom, ${line} 1.5px, transparent 0)`,
            backgroundSize: `${cellSize}px ${cellSize}px`,
          }}
          animate={reduce ? undefined : { backgroundPositionY: [0, cellSize] }}
          transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {glow && (
        <span
          className="absolute inset-x-0 top-0 h-2/5"
          style={{ background: `radial-gradient(70% 90% at 50% 0%, color-mix(in oklab, ${VAR[tone === "foreground" ? "chart-1" : tone]} 28%, transparent), transparent 75%)` }}
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent" />
    </div>
  )
}

export { RetroGrid, type RetroGridProps, type GridTone }
