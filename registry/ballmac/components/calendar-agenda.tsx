// Ballmac UI: Calendar Agenda. https://ui.ballmac.com/components/calendar-agenda
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocale, useMessages } from "@/lib/ballmac/i18n"

type AgendaEvent = {
  /** Stable event ID. */ id: string
  /** ISO date (YYYY-MM-DD). */ date: string
  /** 24-hour time (HH:mm), or omitted for all-day. */ time?: string
  /** Event title. */ title: string
  /** Optional supporting detail. */ description?: string
  /** Optional category. */ label?: string
}
type CalendarAgendaProps = Omit<React.ComponentProps<"div">, "defaultValue"> & {
  /** Agenda events to display. */
  events: AgendaEvent[]
  /** Controlled selected ISO date. */
  value?: string
  /** Initial selected ISO date. */
  defaultValue?: string
  /** Called when the selected date changes. */
  onValueChange?: (date: string) => void
  /** Fixed locale for date and time labels. */
  locale?: string
  /** Empty-day message. */
  emptyMessage?: string
}
function shiftDay(date: string, days: number) {
  const parsed = new Date(`${date}T00:00:00Z`)
  parsed.setUTCDate(parsed.getUTCDate() + days)
  return parsed.toISOString().slice(0, 10)
}
function CalendarAgenda({
  className,
  events,
  value,
  defaultValue,
  onValueChange,
  locale,
  emptyMessage,
  ...props
}: CalendarAgendaProps) {
  const defaultLocale = useLocale()
  locale ??= defaultLocale
  const msg = useMessages()
  emptyMessage ??= msg("calendar-agenda.emptyMessage", "No events scheduled")
  const [internal, setInternal] = React.useState(
    defaultValue ?? events[0]?.date ?? "",
  )
  const selected = value ?? internal
  const day = selected ? new Date(`${selected}T00:00:00Z`) : null
  const heading =
    day && !Number.isNaN(day.getTime())
      ? new Intl.DateTimeFormat(locale, {
          weekday: "long",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        }).format(day)
      : "Choose a date"
  const daily = events
    .filter((event) => event.date === selected)
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))
  function choose(date: string) {
    if (value === undefined) setInternal(date)
    onValueChange?.(date)
  }
  return (
    <div
      data-slot="calendar-agenda"
      className={cn(
        "bg-card min-w-0 rounded-xl border border-border p-4 shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {msg("calendar-agenda.agenda", "Agenda")}
          </p>
          <h3 className="mt-1 text-base font-semibold">{heading}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={msg("calendar-agenda.previousDay", "Previous day")}
            disabled={!selected}
            onClick={() => choose(shiftDay(selected, -1))}
            className="hover:bg-accent flex size-8 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40"
          >
            <ChevronLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
          </button>
          <input
            type="date"
            aria-label={msg("calendar-agenda.chooseDate", "Choose date")}
            value={selected}
            onChange={(event) => choose(event.target.value)}
            className="border-input bg-background h-8 max-w-32 rounded-md border px-1 text-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <button
            type="button"
            aria-label={msg("calendar-agenda.nextDay", "Next day")}
            disabled={!selected}
            onClick={() => choose(shiftDay(selected, 1))}
            className="hover:bg-accent flex size-8 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40"
          >
            <ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
      <ol className="mt-3 flex flex-col divide-y divide-border">
        {daily.length ? (
          daily.map((event) => (
            <li
              key={event.id}
              data-slot="calendar-agenda-event"
              className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 py-3"
            >
              <time
                dateTime={
                  event.time ? `${event.date}T${event.time}` : event.date
                }
                className="text-muted-foreground pt-0.5 text-xs tabular-nums"
              >
                {event.time
                  ? new Intl.DateTimeFormat(locale, {
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "UTC",
                    }).format(new Date(`${event.date}T${event.time}:00Z`))
                  : "All day"}
              </time>
              <div className="min-w-0 border-s-2 border-primary ps-3">
                <p className="text-sm font-medium">{event.title}</p>
                {event.description && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {event.description}
                  </p>
                )}
                {event.label && (
                  <span className="text-primary mt-1 block text-xs font-medium">
                    {event.label}
                  </span>
                )}
              </div>
            </li>
          ))
        ) : (
          <li
            data-slot="calendar-agenda-empty"
            className="text-muted-foreground py-8 text-center text-sm"
          >
            {emptyMessage}
          </li>
        )}
      </ol>
    </div>
  )
}
export { CalendarAgenda, type CalendarAgendaProps, type AgendaEvent }
