// Ballmac UI: Circular Progress. https://ui.ballmac.com/components/circular-progress
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type RingTone = "primary" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "destructive"

const STROKE: Record<RingTone, string> = {
  primary: "stroke-primary",
  "chart-1": "stroke-chart-1",
  "chart-2": "stroke-chart-2",
  "chart-3": "stroke-chart-3",
  "chart-4": "stroke-chart-4",
  "chart-5": "stroke-chart-5",
  destructive: "stroke-destructive",
}
const DOT: Record<RingTone, string> = {
  primary: "bg-primary",
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
  destructive: "bg-destructive",
}
const AUTO: RingTone[] = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]

type ProgressRing = {
  /** What this ring measures, such as "Move". */
  label: string
  /** Current value. */
  value: number
  /** Value that fills the ring. */
  max?: number
  /** Ring color. Defaults to the next chart color. */
  tone?: RingTone
  /** Text shown for the value in the legend, such as "420 kcal". Defaults to the percentage. */
  display?: string
}

type CircularProgressProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** One ring per item, outermost first. */
  rings: ProgressRing[]
  /** Diameter in pixels. */
  size?: number
  /** Ring thickness in pixels. */
  thickness?: number
  /** Space between rings in pixels. */
  gap?: number
  /** Degrees of the circle that the rings cover. 360 is a full circle; 270 makes a gauge with the opening at the bottom. */
  sweep?: number
  /** Show a legend with each ring's name and value. */
  legend?: boolean
  /** Seconds the rings take to fill. */
  duration?: number
  /** Content in the middle. Defaults to the first ring's percentage. */
  children?: React.ReactNode
}

function CircularProgress({
  rings,
  size = 176,
  thickness = 14,
  gap = 5,
  sweep = 360,
  legend = true,
  duration = 1.1,
  className,
  children,
  ...props
}: CircularProgressProps) {
  const reduce = useReducedMotion()
  const arc = Math.min(Math.max(sweep, 30), 360) / 360
  // A gauge opens at the bottom, so it starts at the lower left.
  const rotation = sweep >= 360 ? -90 : 90 + (360 - sweep) / 2
  const center = size / 2
  const data = rings.map((r, i) => {
    const max = r.max ?? 100
    const fraction = max > 0 ? Math.min(Math.max(r.value / max, 0), 1) : 0
    return { ...r, tone: r.tone ?? AUTO[i % AUTO.length]!, fraction, percent: Math.round(fraction * 100), radius: center - thickness / 2 - i * (thickness + gap) - 1, circumference: 0 }
  })
  data.forEach((r) => {
    r.circumference = 2 * Math.PI * r.radius
  })
  const first = data[0]
  const summary = data.map((r) => `${r.label} ${r.display ?? `${r.percent}%`}`).join(", ")

  return (
    <div
      data-slot="circular-progress"
      className={cn("inline-flex flex-col items-center gap-4", className)}
      {...props}
    >
      <div
        role={data.length === 1 ? "meter" : "img"}
        aria-label={data.length === 1 ? first?.label : `Progress rings: ${summary}`}
        aria-valuemin={data.length === 1 ? 0 : undefined}
        aria-valuemax={data.length === 1 ? (rings[0]?.max ?? 100) : undefined}
        aria-valuenow={data.length === 1 ? first?.value : undefined}
        aria-valuetext={data.length === 1 ? summary : undefined}
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg aria-hidden="true" viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ transform: `rotate(${rotation}deg)` }}>
          {data.map((r, i) => (
            <g key={i}>
              <circle cx={center} cy={center} r={r.radius} fill="none" strokeWidth={thickness} strokeLinecap="round" strokeDasharray={`${arc * r.circumference} ${r.circumference}`} className="stroke-muted" />
              <motion.circle
                cx={center}
                cy={center}
                r={r.radius}
                fill="none"
                strokeWidth={thickness}
                strokeLinecap="round"
                className={STROKE[r.tone]}
                opacity={r.fraction === 0 ? 0 : 1}
                initial={reduce ? false : { strokeDasharray: `0 ${r.circumference}` }}
                animate={{ strokeDasharray: `${r.fraction * arc * r.circumference} ${r.circumference}` }}
                transition={{ duration: reduce ? 0 : duration, delay: reduce ? 0 : i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
            </g>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: (data.length * (thickness + gap)) + 4 }}>
          {children ?? (
            <>
              <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">{first?.display ?? `${first?.percent ?? 0}%`}</span>
              {first && <span className="text-xs text-muted-foreground">{first.label}</span>}
            </>
          )}
        </div>
      </div>
      {legend && data.length > 0 && (
        <ul className="grid gap-1.5">
          {data.map((r, i) => (
            <li key={i} className="flex items-center gap-2 text-[13px]">
              <span aria-hidden="true" className={cn("size-2.5 rounded-full", DOT[r.tone])} />
              <span className="text-foreground">{r.label}</span>
              <span className="ml-auto pl-4 font-mono text-xs text-muted-foreground tabular-nums">{r.display ?? `${r.percent}%`}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { CircularProgress, type CircularProgressProps, type ProgressRing, type RingTone }
