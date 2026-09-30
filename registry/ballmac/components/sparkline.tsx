// Ballmac UI: Sparkline. https://ui.ballmac.com/components/sparkline
import * as React from "react"
import { cn } from "@/lib/utils"

type SparklineProps = Omit<React.ComponentProps<"svg">, "values"> & {
  /** Ordered numeric samples. */ values: number[]
  /** Accessible description of the series. */ label: string
  /** Height in pixels. */ height?: number
  /** Show the last data point. */ showEnd?: boolean
}
function Sparkline({
  className,
  values,
  label,
  height = 48,
  showEnd = true,
  ...props
}: SparklineProps) {
  const safe = values.filter(Number.isFinite)
  const minimum = Math.min(...safe)
  const maximum = Math.max(...safe)
  const span = maximum - minimum || 1
  const points = safe.map((value, index) => ({
    x: safe.length === 1 ? 50 : 4 + (index / (safe.length - 1)) * 92,
    y: 42 - ((value - minimum) / span) * 34,
  }))
  const path = points
    .map(
      (point, index) =>
        `${index ? "L" : "M"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ")
  const last = points.at(-1)
  return (
    <svg
      data-slot="sparkline"
      role="img"
      aria-label={`${label}: ${safe.length ? `from ${safe[0]} to ${safe.at(-1)}` : "no data"}`}
      viewBox="0 0 100 48"
      preserveAspectRatio="none"
      height={height}
      className={cn("text-primary w-full overflow-visible", className)}
      {...props}
    >
      {safe.length > 1 && (
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {showEnd && last && (
        <circle
          cx={last.x}
          cy={last.y}
          r="3"
          fill="currentColor"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  )
}
export { Sparkline, type SparklineProps }
