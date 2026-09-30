// Ballmac UI: Countdown. https://ui.ballmac.com/components/countdown
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type CountdownProps = Omit<React.ComponentProps<"div">, "defaultValue"> & {
  /** Controlled seconds remaining. */
  value?: number
  /** Initial seconds remaining when uncontrolled. */
  defaultValue?: number
  /** Called after a one-second tick. */
  onValueChange?: (seconds: number) => void
  /** Called once when an uncontrolled timer reaches zero. */
  onComplete?: () => void
  /** Pause or resume ticking. */
  running?: boolean
  /** Accessible purpose of the timer. */
  label?: string
}

function Countdown({
  className,
  value,
  defaultValue = 0,
  onValueChange,
  onComplete,
  running = true,
  label = "Time remaining",
  ...props
}: CountdownProps) {
  const [internal, setInternal] = React.useState(
    Math.max(0, Math.floor(defaultValue)),
  )
  const remaining = Math.max(0, Math.floor(value ?? internal))
  const onValueChangeRef = React.useRef(onValueChange)
  const onCompleteRef = React.useRef(onComplete)
  React.useEffect(() => {
    onValueChangeRef.current = onValueChange
    onCompleteRef.current = onComplete
  }, [onValueChange, onComplete])
  React.useEffect(() => {
    if (!running || remaining === 0) return
    const timer = window.setTimeout(() => {
      const next = Math.max(0, remaining - 1)
      if (value === undefined) setInternal(next)
      onValueChangeRef.current?.(next)
      if (next === 0) onCompleteRef.current?.()
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [running, remaining, value])
  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60
  const units =
    hours > 0
      ? ([
          [hours, "hours"],
          [minutes, "minutes"],
          [seconds, "seconds"],
        ] as const)
      : ([
          [minutes, "minutes"],
          [seconds, "seconds"],
        ] as const)
  return (
    <div
      data-slot="countdown"
      role="timer"
      aria-label={`${label}: ${hours ? `${hours} ${hours === 1 ? "hour" : "hours"}, ` : ""}${minutes} ${minutes === 1 ? "minute" : "minutes"}, ${seconds} ${seconds === 1 ? "second" : "seconds"}`}
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 font-mono tabular-nums",
        className,
      )}
      {...props}
    >
      {units.map(([number, unit], index) => (
        <React.Fragment key={unit}>
          {index > 0 && (
            <span aria-hidden="true" className="text-muted-foreground text-lg">
              :
            </span>
          )}
          <span
            aria-hidden="true"
            data-slot="countdown-unit"
            className="bg-card flex min-w-11 items-center justify-center rounded-lg border border-border px-2 py-1.5 text-lg font-semibold shadow-sm"
          >
            {String(number).padStart(2, "0")}
          </span>
        </React.Fragment>
      ))}
      <span className="sr-only" aria-live="polite">
        {remaining === 0 ? `${label} complete` : ""}
      </span>
    </div>
  )
}

export { Countdown, type CountdownProps }
