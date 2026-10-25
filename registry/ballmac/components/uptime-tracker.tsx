// Ballmac UI: Uptime Tracker. https://ui.ballmac.com/components/uptime-tracker
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type UptimeStatus = "up" | "degraded" | "down" | "none"

type UptimeDay = {
  /** The day, as text, for example "Oct 3". */
  date: string
  status: UptimeStatus
  /** What happened, for example "42 minutes of errors on checkout". */
  note?: string
}

type UptimeTrackerProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Oldest first. */
  days: UptimeDay[]
  /** The service name. */
  label: string
  /** Overrides the uptime shown. Defaults to the share of days that were up. */
  uptime?: number
  /** Text under the left end, for example "90 days ago". */
  startLabel?: string
  /** Text under the right end. Defaults to "Today". */
  endLabel?: string
}

const WORDS: Record<UptimeStatus, string> = { up: "Operational", degraded: "Degraded", down: "Outage", none: "No data" }
const TONE: Record<UptimeStatus, string> = {
  up: "bg-chart-2",
  degraded: "bg-chart-3",
  down: "bg-destructive",
  none: "bg-muted",
}

/**
 * A row of one cell per day, the way status pages show a service's history. It reads as a sentence first (the uptime and how many days went wrong), and the
 * cells are a single tab stop that you move along with the arrow keys; the day you are on is written out underneath, not hidden in a tooltip.
 */
function UptimeTracker({ days, label, uptime, startLabel, endLabel, className, ...props }: UptimeTrackerProps) {
  const msg = useMessages()
  const id = React.useId()
  const [active, setActive] = React.useState<number | null>(null)
  const [focus, setFocus] = React.useState(Math.max(0, days.length - 1))
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])
  const counted = days.filter((d) => d.status !== "none")
  const upDays = counted.filter((d) => d.status === "up").length
  const value = uptime ?? (counted.length ? (upDays / counted.length) * 100 : 0)
  const bad = days.filter((d) => d.status === "down").length
  const soft = days.filter((d) => d.status === "degraded").length
  const day = active !== null ? days[active] : undefined
  const word = (s: UptimeStatus) => msg(`uptime-tracker.${s}`, WORDS[s])

  function move(e: React.KeyboardEvent, i: number) {
    const last = days.length - 1
    const next = e.key === "ArrowRight" ? Math.min(last, i + 1) : e.key === "ArrowLeft" ? Math.max(0, i - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : e.key === "Escape" ? -1 : null
    if (next === null) return
    e.preventDefault()
    if (next < 0) return setActive(null)
    setFocus(next)
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <div data-slot="uptime-tracker" className={cn("grid min-w-0 gap-2.5", className)} {...props}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p id={`${id}-l`} className="text-sm font-medium">{label}</p>
        <p className="text-sm tabular-nums">
          <span className="font-semibold">{msg("uptime-tracker.uptime", "{percent}% uptime", { percent: (Math.round(value * 100) / 100).toString() })}</span>
          {(bad > 0 || soft > 0) && (
            <span className="ms-2 text-xs text-muted-foreground">
              {[bad > 0 && (bad === 1 ? msg("uptime-tracker.outage1", "1 outage day") : msg("uptime-tracker.outages", "{count} outage days", { count: bad })), soft > 0 && msg("uptime-tracker.slow", "{count} degraded", { count: soft })].filter(Boolean).join(", ")}
            </span>
          )}
        </p>
      </div>
      <div role="group" aria-labelledby={`${id}-l`} className="flex h-9 gap-px sm:gap-0.5" onMouseLeave={() => setActive(null)}>
        {days.map((d, i) => (
          <button
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            tabIndex={i === focus ? 0 : -1}
            aria-label={msg("uptime-tracker.cell", "{date}: {status}{note}", { date: d.date, status: word(d.status), note: d.note ? `. ${d.note}` : "" })}
            onMouseEnter={() => setActive(i)}
            onFocus={() => {
              setFocus(i)
              setActive(i)
            }}
            onBlur={() => setActive(null)}
            onKeyDown={(e) => move(e, i)}
            className="group/c relative h-full min-w-0 flex-1 rounded-[3px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
          >
            <span aria-hidden="true" className={cn("absolute inset-0 rounded-[3px] transition-[opacity,transform] motion-reduce:transition-none", TONE[d.status], active !== null && active !== i ? "opacity-50" : "", active === i && "scale-y-110")} />
          </button>
        ))}
      </div>
      <div className="flex min-h-5 items-center justify-between gap-3 text-xs text-muted-foreground" aria-live="polite">
        {day ? (
          <p className="min-w-0 truncate text-foreground">
            <span className="font-medium">{day.date}</span> · {word(day.status)}
            {day.note ? ` · ${day.note}` : ""}
          </p>
        ) : (
          <>
            <span>{startLabel ?? msg("uptime-tracker.start", "{count} days ago", { count: days.length })}</span>
            <span>{endLabel ?? msg("uptime-tracker.today", "Today")}</span>
          </>
        )}
      </div>
    </div>
  )
}

export { UptimeTracker, type UptimeDay, type UptimeStatus, type UptimeTrackerProps }
