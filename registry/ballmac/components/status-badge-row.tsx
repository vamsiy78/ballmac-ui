// Ballmac UI: Status Badge Row. https://ui.ballmac.com/components/status-badge-row
"use client"

import * as React from "react"
import { CheckCircle2, CircleAlert, OctagonAlert, Wrench } from "lucide-react"

import { cn } from "@/lib/utils"
import { useLocale, useMessages, defineMessage, type Message, type Msg } from "@/lib/ballmac/i18n"
import { useDirection } from "@/lib/ballmac/direction"

type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance"

type ServiceDay = ServiceStatus | { status: ServiceStatus; note?: string }

type ServiceItem = {
  /** Service name, such as "API". */
  name: string
  /** Current status. */
  status: ServiceStatus
  /** One line under the name. */
  description?: string
  /** Uptime over the history, in percent. Shown with two decimals. */
  uptime?: number
  /** One entry per day, oldest first. */
  days?: ServiceDay[]
}

const META: Record<ServiceStatus, { label: Message; icon: React.ComponentType<{ className?: string }>; bar: string; height: string; chip: string; order: number }> = {
  operational: { label: defineMessage("status-badge-row.META.operational", "Operational"), icon: CheckCircle2, bar: "bg-chart-2", height: "100%", chip: "border-chart-2/30 bg-chart-2/10", order: 0 },
  maintenance: { label: defineMessage("status-badge-row.META.maintenance", "Maintenance"), icon: Wrench, bar: "bg-chart-1", height: "82%", chip: "border-chart-1/30 bg-chart-1/10", order: 1 },
  degraded: { label: defineMessage("status-badge-row.META.degraded", "Degraded performance"), icon: CircleAlert, bar: "bg-chart-3", height: "66%", chip: "border-chart-3/30 bg-chart-3/10", order: 2 },
  outage: { label: defineMessage("status-badge-row.META.outage", "Outage"), icon: OctagonAlert, bar: "bg-destructive", height: "44%", chip: "border-destructive/30 bg-destructive/10", order: 3 },
}


/** "2026-09-30" minus `back` days, as "Sep 21". UTC, so the server and browser agree. */
function dayLabel(locale: string, msg: Msg, endDate: string | undefined, back: number) {
  const relative = () => (back === 0 ? msg("status-badge-row.today", "Today") : new Intl.RelativeTimeFormat(locale, { numeric: "always" }).format(-back, "day"))
  if (!endDate) return relative()
  const t = Date.parse(endDate.length === 10 ? `${endDate}T00:00:00Z` : endDate)
  if (Number.isNaN(t)) return relative()
  // UTC, so the server and browser agree.
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(t - back * 86_400_000))
}

function normalize(day: ServiceDay) {
  return typeof day === "string" ? { status: day, note: undefined } : day
}

/** The text shown for one day, such as "Sep 21 · Outage · Queue backlog". */
function readout(locale: string, msg: Msg, service: ServiceItem, endDate: string | undefined, index: number) {
  const days = service.days ?? []
  const day = normalize(days[index]!)
  return `${dayLabel(locale, msg, endDate, days.length - 1 - index)} · ${msg.of(META[day.status].label)}${day.note ? ` · ${day.note}` : ""}`
}

function ServiceRow({ service, endDate }: { service: ServiceItem; endDate?: string }) {
  const msg = useMessages()
  const locale = useLocale()
  const meta = META[service.status]
  const Icon = meta.icon
  const [cursor, setCursor] = React.useState<number | null>(null)
  return (
    <li className="grid gap-3 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{service.name}</p>
          {service.description && <p className="truncate text-xs text-muted-foreground">{service.description}</p>}
        </div>
        {cursor !== null && service.days ? (
          <span aria-hidden="true" className="truncate rounded-md bg-muted px-2 py-0.5 text-xs text-foreground">
            {readout(locale, msg, service, endDate, cursor)}
          </span>
        ) : (
          service.uptime !== undefined && (
            <span className="hidden font-mono text-xs text-muted-foreground tabular-nums sm:block">{msg("status-badge-row.uptime", "{percent}% uptime", { percent: service.uptime.toFixed(2) })}</span>
          )
        )}
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium text-foreground",
            meta.chip
          )}
        >
          <Icon aria-hidden="true" className="size-3.5" />
          {msg.of(meta.label)}
        </span>
      </div>
      <HistoryStrip service={service} endDate={endDate} cursor={cursor} setCursor={setCursor} />
    </li>
  )
}

function HistoryStrip({
  service,
  endDate,
  cursor,
  setCursor,
}: {
  service: ServiceItem
  endDate?: string
  cursor: number | null
  setCursor: React.Dispatch<React.SetStateAction<number | null>>
}) {
  const dir = useDirection()
  const msg = useMessages()
  const locale = useLocale()
  const days = service.days ?? []
  const [focused, setFocused] = React.useState(false)
  if (days.length === 0) return null
  const last = days.length - 1
  const at = cursor ?? last
  const day = normalize(days[at]!)
  const text = `${dayLabel(locale, msg, endDate, last - at)}: ${msg.of(META[day.status].label)}${day.note ? `, ${day.note}` : ""}`

  function onKeyDown(event: React.KeyboardEvent) {
    const step = event.shiftKey ? 7 : 1
    const next =
      event.key === (dir === "rtl" ? "ArrowRight" : "ArrowLeft") ? at - step : event.key === (dir === "rtl" ? "ArrowLeft" : "ArrowRight") ? at + step : event.key === "Home" ? 0 : event.key === "End" ? last : null
    if (next === null) return
    event.preventDefault()
    setCursor(Math.min(last, Math.max(0, next)))
  }

  return (
    <div className="relative">
      <div
        role="slider"
        tabIndex={0}
        aria-label={msg("status-badge-row.historyDays", "{name} history, {length} days", { name: service.name, length: days.length })}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={at}
        aria-valuetext={text}
        onKeyDown={onKeyDown}
        onFocus={() => {
          setFocused(true)
          setCursor((c) => c ?? last)
        }}
        onBlur={() => {
          setFocused(false)
          setCursor(null)
        }}
        onPointerLeave={() => !focused && setCursor(null)}
        className="group/strip flex h-8 items-end gap-px rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {days.map((raw, i) => {
          const d = normalize(raw)
          return (
            <span
              key={i}
              onPointerEnter={() => setCursor(i)}
              className="flex h-full min-w-px flex-1 items-end"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "block w-full rounded-[2px] transition-[opacity,transform] duration-100 motion-reduce:transition-none",
                  META[d.status].bar,
                  cursor !== null && cursor !== i && "opacity-60",
                  cursor === i && "scale-y-[1.08]"
                )}
                style={{ height: META[d.status].height }}
              />
            </span>
          )
        })}
      </div>
    </div>
  )
}

type StatusBadgeRowProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** The services to list. */
  services: ServiceItem[]
  /** Heading above the list. */
  title?: string
  /** ISO date of the newest day in each `days` array, for example "2026-09-30". Used to label the bars. */
  endDate?: string
  /** Text under the heading, such as "Updated 2 minutes ago". */
  updated?: string
  /** Replaces the computed banner message. */
  summary?: string
}

function StatusBadgeRow({ services, title, endDate, updated, summary, className, ...props }: StatusBadgeRowProps) {
  const msg = useMessages()
  const locale = useLocale()
  title ??= msg("status-badge-row.title", "System status")
  const worst = services.reduce<ServiceStatus>((w, s) => (META[s.status].order > META[w].order ? s.status : w), "operational")
  const bannerText =
    summary ??
    (worst === "operational"
      ? "All systems operational"
      : worst === "maintenance"
        ? "Scheduled maintenance in progress"
        : worst === "degraded"
          ? "Some systems are slower than usual"
          : "Some systems are down")
  const Banner = META[worst].icon
  const historyDays = services.reduce((n, s) => Math.max(n, s.days?.length ?? 0), 0)

  return (
    <section
      data-slot="status-badge-row"
      data-status={worst}
      aria-label={title}
      className={cn("w-full overflow-hidden rounded-xl border bg-card text-card-foreground", className)}
      {...props}
    >
      <header className={cn("flex items-center gap-3 border-b px-4 py-3.5", META[worst].chip)}>
        <Banner aria-hidden="true" className="size-5 shrink-0" />
        <div className="min-w-0 flex-1" role="status">
          <h3 className="text-sm leading-5 font-semibold text-foreground">{bannerText}</h3>
          {updated && <p className="text-xs leading-4 text-muted-foreground">{updated}</p>}
        </div>
      </header>
      <ul className="divide-y">
        {services.map((service) => (
          <ServiceRow key={service.name} service={service} endDate={endDate} />
        ))}
      </ul>
      {historyDays > 0 && (
        <footer className="flex items-center justify-between border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground" aria-hidden="true">
          <span>{new Intl.RelativeTimeFormat(locale, { numeric: "always" }).format(-historyDays, "day")}</span>
          <span>{msg("status-badge-row.today", "Today")}</span>
        </footer>
      )}
    </section>
  )
}

export { StatusBadgeRow, type StatusBadgeRowProps, type ServiceItem, type ServiceStatus, type ServiceDay }
