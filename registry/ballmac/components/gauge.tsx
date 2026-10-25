// Ballmac UI: Gauge. https://ui.ballmac.com/components/gauge
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"
import { useReducedMotionSafe } from "@/lib/ballmac/motion"

type GaugeZone = {
  /** Where this zone ends, as a value between min and max. Zones are listed from low to high. */
  to: number
  /** What this zone means, in words, for example "Healthy". */
  label: string
}

type GaugeProps = Omit<React.ComponentProps<"figure">, "children"> & {
  value: number
  min?: number
  max?: number
  /** Zones from low to high, each with its words. The gauge says which zone the value is in. */
  zones?: GaugeZone[]
  /** A target to mark on the arc. */
  target?: number
  /** What is measured, for example "Error budget left". */
  label: string
  /** Formats the value and the ends. */
  format?: (value: number) => string
  /** A line under the value. */
  description?: string
}

const SHADES = ["var(--destructive)", "var(--chart-3)", "var(--chart-2)"]
const R = 80
const CX = 100
const CY = 96
const polar = (t: number, r = R) => {
  const a = Math.PI * (1 - t)
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)] as const
}
const arc = (t0: number, t1: number, r = R) => {
  const [x0, y0] = polar(t0, r)
  const [x1, y1] = polar(t1, r)
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}

/**
 * A half-circle gauge with a needle. The value, the zone it is in and the target are written as text under the arc, so the color and the needle are only a
 * second way of reading it. The needle sweeps in once and stays still with reduced motion.
 */
function Gauge({ value, min = 0, max = 100, zones, target, label, format = (v) => String(v), description, className, ...props }: GaugeProps) {
  const msg = useMessages()
  const reduced = useReducedMotionSafe()
  const clamp = (v: number) => Math.min(1, Math.max(0, (v - min) / (max - min || 1)))
  const t = clamp(value)
  const [shown, setShown] = React.useState(reduced ? t : 0)
  React.useEffect(() => {
    const f = requestAnimationFrame(() => setShown(t))
    return () => cancelAnimationFrame(f)
  }, [t])
  const zone = zones?.find((z) => value <= z.to) ?? zones?.[zones.length - 1]
  const edges = zones ? zones.map((z, i) => [i === 0 ? 0 : clamp(zones[i - 1].to), clamp(z.to)] as const) : null

  return (
    <figure data-slot="gauge" className={cn("grid min-w-0 justify-items-center gap-1 text-center", className)} {...props}>
      <div role="meter" aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={[format(value), zone?.label].filter(Boolean).join(", ")} className="w-full max-w-64">
        <svg aria-hidden="true" viewBox="0 0 200 112" className="w-full overflow-visible">
          <path d={arc(0, 1)} fill="none" strokeWidth="14" strokeLinecap="round" className="stroke-muted" />
          {edges ? (
            edges.map(([a, b], i) => (b > a ? <path key={i} d={arc(a + 0.004, b - 0.004)} fill="none" strokeWidth="14" stroke={SHADES[Math.min(i, SHADES.length - 1)]} opacity={zone === zones?.[i] ? 1 : 0.35} /> : null))
          ) : (
            <path d={arc(0, 1)} pathLength={1} fill="none" strokeWidth="14" strokeLinecap="round" className="stroke-foreground" strokeDasharray={`${Math.max(0.001, shown)} 1`} style={{ transition: reduced ? undefined : "stroke-dasharray 0.7s ease-out" }} />
          )}
          {target !== undefined && (
            <>
              <line x1={polar(clamp(target), R - 12)[0]} y1={polar(clamp(target), R - 12)[1]} x2={polar(clamp(target), R + 12)[0]} y2={polar(clamp(target), R + 12)[1]} className="stroke-foreground" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}
          {edges && (
            <g>
              <line x1={CX} y1={CY} x2={CX - (R - 14)} y2={CY} className="stroke-foreground" strokeWidth="3" strokeLinecap="round" style={{ transformOrigin: `${CX}px ${CY}px`, transform: `rotate(${shown * 180}deg)`, transition: reduced ? undefined : "transform 0.7s cubic-bezier(.2,.8,.2,1)" }} />
              <circle cx={CX} cy={CY} r="6" className="fill-foreground" />
              <circle cx={CX} cy={CY} r="2.5" className="fill-background" />
            </g>
          )}
        </svg>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] tabular-nums">{format(value)}</p>
      <figcaption className="grid gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        {zone && <span className="text-xs font-medium text-foreground">{zone.label}</span>}
        {target !== undefined && <span className="text-xs text-muted-foreground">{msg("gauge.target", "Target {value}", { value: format(target) })}</span>}
        {description && <span className="text-xs text-muted-foreground text-pretty">{description}</span>}
      </figcaption>
      <p className="flex w-full max-w-64 justify-between px-[10%] text-[11px] text-muted-foreground tabular-nums" aria-hidden="true">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </p>
    </figure>
  )
}

export { Gauge, type GaugeProps, type GaugeZone }
