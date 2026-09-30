// Ballmac UI: Progress Ring. https://ui.ballmac.com/components/progress-ring
import * as React from "react"
import { cn } from "@/lib/utils"

type ProgressRingProps = React.ComponentProps<"div"> & {
  /** Current progress value. */ value: number
  /** Maximum value; defaults to 100. */ max?: number
  /** Accessible name for the progress meter. */ label: string
  /** Diameter in pixels. */ size?: number
  /** Center content, or the formatted percentage by default. */ children?: React.ReactNode
}
function ProgressRing({
  className,
  value,
  max = 100,
  label,
  size = 96,
  children,
  ...props
}: ProgressRingProps) {
  const safeMax = max > 0 ? max : 100
  const bounded = Math.min(
    safeMax,
    Math.max(0, Number.isFinite(value) ? value : 0),
  )
  const percent = Math.round((bounded / safeMax) * 100)
  const radius = 42
  const circumference = 2 * Math.PI * radius
  return (
    <div
      data-slot="progress-ring"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={bounded}
      className={cn(
        "relative inline-grid shrink-0 place-items-center text-primary",
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          className="transition-[stroke-dashoffset] duration-200 motion-reduce:transition-none"
        />
      </svg>
      <span
        data-slot="progress-ring-value"
        aria-hidden="true"
        className="text-foreground relative text-lg font-semibold tabular-nums"
      >
        {children ?? `${percent}%`}
      </span>
    </div>
  )
}
export { ProgressRing, type ProgressRingProps }
