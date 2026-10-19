// Ballmac UI: Event Calendar. https://ui.ballmac.com/components/event-calendar
"use client"

import * as React from "react"
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Plus } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ballmac/popover"
import { Skeleton } from "@/components/ballmac/skeleton"
import { StateView, type StateProps } from "@/components/ballmac/state-view"
import {
  addDays,
  addMinutes,
  addMonths,
  daysBetween,
  format,
  formatRange,
  isSameDay,
  isSameMonth,
  layoutDay,
  layoutWeek,
  minutesOfDay,
  monthGrid,
  setMinutesOfDay,
  snap,
  spanOf,
  startOfDay,
  toDate,
  touchesDay,
  weekDays,
  weekStartFor,
  type DateInput,
  type Span,
  type WeekStart,
} from "@/lib/ballmac/calendar-dates"
import { useDirection } from "@/lib/ballmac/direction"
import { useLocale, useMessages } from "@/lib/ballmac/i18n"
import { cn } from "@/lib/utils"

type EventTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "muted"
type EventCalendarView = "month" | "week" | "day" | "agenda"

type CalendarEvent = {
  id: string
  title: string
  start: DateInput
  /** For a timed event, when it ends (an hour after `start` when left out). For an all-day event, its last day. */
  end?: DateInput
  allDay?: boolean
  tone?: EventTone
  location?: string
  description?: string
  /** Stays where it is even when the calendar is editable. */
  readOnly?: boolean
}

type EventChange = { start: Date; end: Date; allDay: boolean }
type EventRange = { start: Date; end: Date; allDay: boolean }

type EventCalendarProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> &
  StateProps & {
    /** What the calendar is, read by screen readers: "Team calendar". */
    label: string
    events: CalendarEvent[]
    view?: EventCalendarView
    defaultView?: EventCalendarView
    onViewChange?: (view: EventCalendarView) => void
    /** Which views people can switch between. */
    views?: EventCalendarView[]
    /** Any day in the period on show. */
    date?: Date
    defaultDate?: Date
    onDateChange?: (date: Date) => void
    /** The day treated as today. It is read from the clock after the page loads when you leave it out, so a server render never shows the wrong day. */
    today?: Date
    locale?: string
    /** 0 is Sunday, 1 is Monday. Defaults to what the locale uses. */
    weekStartsOn?: WeekStart
    /** Let people drag events to move them and drag their bottom edge to change the length. */
    editable?: boolean
    /** Let people drag across empty time to make an event. */
    selectable?: boolean
    onEventClick?: (event: CalendarEvent) => void
    onEventChange?: (event: CalendarEvent, change: EventChange) => void
    onRangeSelect?: (range: EventRange) => void
    /** Called when a day is chosen in the month view. Default: open that day. */
    onDateClick?: (date: Date) => void
    /** Minutes in one step when dragging. */
    slotMinutes?: 15 | 30 | 60
    /** Pixels in an hour of the week and day views. */
    hourHeight?: number
    /** The first hour of the day on show, so the grid opens on working hours. */
    scrollToHour?: number
    /** Height of the scrolling week and day views. */
    height?: number
    /** How many bars a month cell shows before "+n more". */
    maxLanes?: number
    /** Replace what an event shows inside its block. */
    renderEvent?: (event: CalendarEvent, info: { view: EventCalendarView; compact: boolean }) => React.ReactNode
  }

const TONES: Record<EventTone, { block: string; accent: string; dot: string }> = {
  "chart-1": { block: "border-chart-1/40 bg-chart-1/15 hover:bg-chart-1/25", accent: "bg-chart-1", dot: "bg-chart-1" },
  "chart-2": { block: "border-chart-2/40 bg-chart-2/15 hover:bg-chart-2/25", accent: "bg-chart-2", dot: "bg-chart-2" },
  "chart-3": { block: "border-chart-3/40 bg-chart-3/15 hover:bg-chart-3/25", accent: "bg-chart-3", dot: "bg-chart-3" },
  "chart-4": { block: "border-chart-4/40 bg-chart-4/15 hover:bg-chart-4/25", accent: "bg-chart-4", dot: "bg-chart-4" },
  "chart-5": { block: "border-chart-5/40 bg-chart-5/15 hover:bg-chart-5/25", accent: "bg-chart-5", dot: "bg-chart-5" },
  muted: { block: "border-border bg-muted hover:bg-muted/70", accent: "bg-muted-foreground", dot: "bg-muted-foreground" },
}

const ALL_VIEWS: EventCalendarView[] = ["month", "week", "day", "agenda"]
const GUTTER = 56 // width of the hour labels, in pixels
const ALL_DAY_LANE = 24
const MONTH_CELL = 124

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

/** The current time, read after the page loads and every minute, never during render. */
function useNow(override?: Date) {
  const fixed = override?.getTime()
  const [now, setNow] = React.useState<Date | null>(fixed === undefined ? null : new Date(fixed))
  React.useEffect(() => {
    if (fixed !== undefined) {
      setNow(new Date(fixed))
      return
    }
    setNow(new Date())
    const t = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(t)
  }, [fixed])
  return now
}

type Ctx = {
  locale: string
  rtl: boolean
  today: Date | null
  /** The current moment, for the now line. */
  now: Date | null
  editable: boolean
  selectable: boolean
  slot: number
  hourHeight: number
  onEventClick?: (e: CalendarEvent) => void
  onEventChange?: (e: CalendarEvent, c: EventChange) => void
  onRangeSelect?: (r: EventRange) => void
  announce: (text: string) => void
  renderEvent?: EventCalendarProps["renderEvent"]
  view: EventCalendarView
}
const CalendarCtx = React.createContext<Ctx | null>(null)
const useCal = () => {
  const c = React.useContext(CalendarCtx)
  if (!c) throw new Error("EventCalendar parts must be used inside <EventCalendar>.")
  return c
}

// ------------------------------------------------------------------------------------------------- words

function useWords() {
  const msg = useMessages()
  const { locale } = useCal()
  const time = (d: Date) => format(d, locale, { hour: "numeric", minute: "2-digit" })
  /** "9 AM" on the hour, "9:30 AM" otherwise: shorter, for narrow cells. */
  const shortTime = (d: Date) => format(d, locale, d.getMinutes() === 0 ? { hour: "numeric" } : { hour: "numeric", minute: "2-digit" })
  const dayLong = (d: Date) => format(d, locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  /** "Design review, Tuesday, October 20, 2026, 10:00 AM to 11:00 AM, Room 4" */
  const describe = (event: CalendarEvent) => {
    const s = spanOf(event)
    const where = event.location ? `, ${event.location}` : ""
    if (s.allDay) {
      const last = addDays(s.end, -1)
      return isSameDay(s.start, last)
        ? msg("event-calendar.describeAllDay", "{title}, {date}, all day{where}", { title: event.title, date: dayLong(s.start), where })
        : msg("event-calendar.describeAllDayRange", "{title}, {from} to {to}, all day{where}", { title: event.title, from: dayLong(s.start), to: dayLong(last), where })
    }
    return isSameDay(s.start, addMinutes(s.end, -1))
      ? msg("event-calendar.describeTimed", "{title}, {date}, {from} to {to}{where}", { title: event.title, date: dayLong(s.start), from: time(s.start), to: time(s.end), where })
      : msg("event-calendar.describeTimedRange", "{title}, {from} to {to}{where}", { title: event.title, from: `${dayLong(s.start)} ${time(s.start)}`, to: `${dayLong(s.end)} ${time(s.end)}`, where })
  }
  return { msg, time, shortTime, dayLong, describe }
}

// ------------------------------------------------------------------------------------------------- an event, as a button

type ChipProps = {
  event: CalendarEvent
  /** `block` is a tinted block with an accent edge. `inline` is a dot, the time and the title, for a short event in a month cell. */
  variant: "block" | "inline"
  className?: string
  style?: React.CSSProperties
  /** Where the event continues, for a bar that is cut by the edge of a week. */
  continues?: { before: boolean; after: boolean }
  /** Which keys move it, and what they do. Set by the view. */
  onKeyMove?: (event: CalendarEvent, key: string, shift: boolean) => boolean
  onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void
  dragging?: boolean
  ghost?: boolean
  showTime?: boolean
  children?: React.ReactNode
}

function EventChip({ event, variant, className, style, continues, onKeyMove, onPointerDown, dragging, ghost, showTime = true, children }: ChipProps) {
  const cal = useCal()
  const { time, shortTime, describe } = useWords()
  const tone = TONES[event.tone ?? "chart-1"]
  const s = spanOf(event)
  const compact = variant === "inline"
  return (
    <button
      type="button"
      data-slot="event-calendar-event"
      data-event-id={event.id}
      data-dragging={dragging || undefined}
      aria-label={describe(event)}
      aria-roledescription={cal.editable && !event.readOnly ? "movable event" : undefined}
      tabIndex={ghost ? -1 : 0}
      onPointerDown={onPointerDown}
      onClick={(e) => {
        if (ghost) return
        e.stopPropagation()
        cal.onEventClick?.(event)
      }}
      onKeyDown={(e) => {
        if (e.altKey && onKeyMove?.(event, e.key, e.shiftKey)) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      style={style}
      className={cn(
        "group/event relative flex min-w-0 items-start gap-1.5 overflow-hidden text-start text-xs leading-tight outline-none transition-colors focus-visible:z-20 focus-visible:ring-[3px] focus-visible:ring-ring/60 motion-reduce:transition-none",
        compact ? "rounded px-1 py-0.5 hover:bg-accent" : cn("rounded-md border px-2 py-1", tone.block),
        !compact && continues?.before && "rounded-s-none border-s-0",
        !compact && continues?.after && "rounded-e-none border-e-0",
        dragging && "z-30 cursor-grabbing shadow-lg",
        ghost && "pointer-events-none opacity-90 shadow-xl ring-1 ring-ring/40",
        className
      )}
    >
      {compact ? <span aria-hidden="true" className={cn("mt-[3px] size-1.5 shrink-0 rounded-full", tone.dot)} /> : <span aria-hidden="true" className={cn("absolute inset-y-0 start-0 w-1", tone.accent, continues?.before && "hidden")} />}
      {children ?? (
        <span className={cn("min-w-0 flex-1", !compact && !continues?.before && "ps-1")}>
          {cal.renderEvent ? (
            cal.renderEvent(event, { view: cal.view, compact })
          ) : (
            <>
              <span className="block truncate font-medium text-foreground">
                {compact && showTime && !s.allDay ? <span className="me-1 font-normal tabular-nums text-muted-foreground">{shortTime(s.start)}</span> : null}
                {event.title}
              </span>
              {!compact && showTime && !s.allDay ? <bdi className="block truncate tabular-nums text-muted-foreground">{time(s.start)} – {time(s.end)}</bdi> : null}
            </>
          )}
        </span>
      )}
    </button>
  )
}

// ------------------------------------------------------------------------------------------------- the calendar

/**
 * A full calendar with month, week, day and agenda views. Events that overlap sit side by side, multi-day events run as bars across the month,
 * and when `editable` is on people drag events to move them and drag across empty time to make new ones. Everything has a keyboard path:
 * arrow keys move between days, Alt+arrow moves an event, and the toolbar makes a new one.
 */
function EventCalendar({
  label,
  events,
  view: viewProp,
  defaultView = "month",
  onViewChange,
  views = ALL_VIEWS,
  date: dateProp,
  defaultDate,
  onDateChange,
  today: todayProp,
  locale: localeProp,
  weekStartsOn,
  editable = false,
  selectable = false,
  onEventClick,
  onEventChange,
  onRangeSelect,
  onDateClick,
  slotMinutes = 30,
  hourHeight = 56,
  scrollToHour = 7,
  height = 560,
  maxLanes = 3,
  renderEvent,
  state,
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: EventCalendarProps) {
  const msg = useMessages()
  const contextLocale = useLocale()
  const locale = localeProp ?? contextLocale
  const dir = useDirection()
  const rtl = dir === "rtl"
  const now = useNow(todayProp)
  const weekStart = weekStartsOn ?? weekStartFor(locale)

  const [innerView, setInnerView] = React.useState<EventCalendarView>(defaultView)
  const view = viewProp ?? innerView
  const setView = (v: EventCalendarView) => {
    if (viewProp === undefined) setInnerView(v)
    onViewChange?.(v)
  }
  const [innerDate, setInnerDate] = React.useState<Date | null>(defaultDate ? startOfDay(defaultDate) : null)
  // with no date given, the calendar opens on today once it knows what today is
  const date = dateProp ?? innerDate ?? (now ? startOfDay(now) : null)
  const setDate = (d: Date) => {
    if (dateProp === undefined) setInnerDate(d)
    onDateChange?.(d)
  }

  const [spoken, setSpoken] = React.useState("")
  const spans = React.useMemo(() => events.map((e) => spanOf(e)), [events])

  const ctx: Ctx = {
    locale,
    rtl,
    today: now ? startOfDay(now) : null,
    now,
    editable,
    selectable,
    slot: slotMinutes,
    hourHeight,
    onEventClick,
    onEventChange,
    onRangeSelect,
    announce: setSpoken,
    renderEvent,
    view,
  }

  const step = (n: -1 | 1) => {
    if (!date) return
    setDate(view === "month" || view === "agenda" ? addMonths(date, n) : view === "week" ? addDays(date, 7 * n) : addDays(date, n))
  }
  const goToday = () => now && setDate(startOfDay(now))

  const title = !date
    ? ""
    : view === "month" || view === "agenda"
      ? format(date, locale, { month: "long", year: "numeric" })
      : view === "day"
        ? format(date, locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
        : (() => {
            const days = weekDays(date, weekStart)
            return formatRange(days[0]!, days[6]!, locale, { month: "short", day: "numeric", year: "numeric" })
          })()

  const periodWord = view === "month" || view === "agenda" ? "month" : view
  const prevLabel = msg(`event-calendar.previous.${periodWord}`, periodWord === "month" ? "Previous month" : periodWord === "week" ? "Previous week" : "Previous day")
  const nextLabel = msg(`event-calendar.next.${periodWord}`, periodWord === "month" ? "Next month" : periodWord === "week" ? "Next week" : "Next day")
  const viewName = (v: EventCalendarView) => msg(`event-calendar.view.${v}`, v === "month" ? "Month" : v === "week" ? "Week" : v === "day" ? "Day" : "Agenda")

  const openDay = (d: Date) => {
    setDate(startOfDay(d))
    if (views.includes("day")) setView("day")
  }

  const toolbar = (
    <div data-slot="event-calendar-toolbar" className="flex flex-wrap items-center gap-2 border-b px-3 py-2.5">
      <div className="flex items-center gap-1">
        <Button type="button" variant="outline" size="sm" onClick={goToday} disabled={!now}>
          {msg("event-calendar.today", "Today")}
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={prevLabel} onClick={() => step(-1)} disabled={!date}>
          <ChevronLeft className="rtl:rotate-180" aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={nextLabel} onClick={() => step(1)} disabled={!date}>
          <ChevronRight className="rtl:rotate-180" aria-hidden="true" />
        </Button>
      </div>
      <h2 aria-live="polite" className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight tabular-nums">
        {title}
      </h2>
      {selectable && date ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const start = setMinutesOfDay(date, 9 * 60)
            onRangeSelect?.({ start, end: addMinutes(start, 60), allDay: false })
          }}
        >
          <Plus aria-hidden="true" />
          {msg("event-calendar.add", "Add event")}
        </Button>
      ) : null}
      {views.length > 1 ? (
        <div role="group" aria-label={msg("event-calendar.viewSwitch", "Calendar view")} className="inline-flex rounded-lg bg-muted p-0.5">
          {views.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-2.5 py-1 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
                view === v ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {viewName(v)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )

  const skeleton = (
    <div className="overflow-hidden rounded-xl border bg-card" aria-hidden="true">
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: 35 }, (_, i) => (
          <div key={i} className="h-20 border-e border-b p-2">
            <Skeleton className="h-3 w-5" />
            {i % 4 === 1 ? <Skeleton className="mt-3 h-4 w-full" /> : null}
            {i % 6 === 2 ? <Skeleton className="mt-2 h-4 w-3/4" /> : null}
          </div>
        ))}
      </div>
    </div>
  )

  const effective: StateProps["state"] = state ?? "ready"

  return (
    <CalendarCtx.Provider value={ctx}>
      <div data-slot="event-calendar" data-view={view} dir={dir} className={cn("min-w-0", className)} {...props}>
        <StateView state={effective} loading={skeleton} error={errorState ?? {}} empty={emptyState ?? {}} onRetry={onRetry} label={msg("event-calendar.loading", "Loading the calendar")} bare className="rounded-xl">
          <section aria-label={label} className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
            {toolbar}
            {date ? (
              view === "month" ? (
                <MonthView date={date} spans={spans} events={events} weekStart={weekStart} maxLanes={maxLanes} label={label} onOpenDay={onDateClick ?? openDay} setDate={setDate} />
              ) : view === "agenda" ? (
                <AgendaView date={date} spans={spans} events={events} emptyState={emptyState} />
              ) : (
                <TimeGridView date={date} days={view === "day" ? [date] : weekDays(date, weekStart)} spans={spans} events={events} height={height} scrollToHour={scrollToHour} onOpenDay={openDay} label={label} />
              )
            ) : (
              <div className="h-64" aria-hidden="true" />
            )}
          </section>
        </StateView>
        <span data-slot="event-calendar-status" role="status" aria-live="polite" className="sr-only">
          {spoken}
        </span>
      </div>
    </CalendarCtx.Provider>
  )
}

const eventById = (events: CalendarEvent[], id: string) => events.find((e) => e.id === id)

/** The result of moving an event with the keyboard: Alt+arrows move it, Alt+Shift+arrows change its length. */
function keyChange(event: CalendarEvent, key: string, shift: boolean, opts: { dayStep: number; weekStep: number; slot: number; timed: boolean; rtl: boolean }): EventChange | null {
  const s = spanOf(event)
  const start = key === "ArrowLeft" ? -1 : key === "ArrowRight" ? 1 : 0
  const horizontal = opts.rtl ? -start : start
  const vertical = key === "ArrowUp" ? -1 : key === "ArrowDown" ? 1 : 0
  if (!horizontal && !vertical) return null
  if (shift) {
    // length: Down and Right make it longer
    const delta = (vertical || horizontal) * (opts.timed ? opts.slot : 1440)
    const end = addMinutes(s.end, delta)
    if (end <= addMinutes(s.start, opts.timed ? opts.slot : 1440)) return null
    return { start: s.start, end, allDay: s.allDay }
  }
  if (opts.timed) {
    const days = horizontal
    const minutes = vertical * opts.slot
    const start2 = addMinutes(addDays(s.start, days), minutes)
    const end2 = addMinutes(addDays(s.end, days), minutes)
    return { start: start2, end: end2, allDay: false }
  }
  const days = horizontal * opts.dayStep + vertical * opts.weekStep
  return { start: addDays(s.start, days), end: addDays(s.end, days), allDay: s.allDay }
}

/** Gives a change back in the shape callers store: an all-day event's end is its last day. */
function forCaller(event: CalendarEvent, c: EventChange): EventChange {
  return c.allDay ? { ...c, end: addDays(c.end, -1) } : c
}

// ------------------------------------------------------------------------------------------------- month

function MonthView({
  date,
  spans,
  events,
  weekStart,
  maxLanes,
  label,
  onOpenDay,
  setDate,
}: {
  date: Date
  spans: Span<CalendarEvent>[]
  events: CalendarEvent[]
  weekStart: WeekStart
  maxLanes: number
  label: string
  onOpenDay: (d: Date) => void
  setDate: (d: Date) => void
}) {
  const cal = useCal()
  const { msg, dayLong } = useWords()
  const weeks = React.useMemo(() => monthGrid(date, weekStart), [date, weekStart])
  const heads = weeks[0]!
  const [focus, setFocus] = React.useState<Date>(date)
  const root = React.useRef<HTMLDivElement>(null)
  const wantFocus = React.useRef(false)
  React.useEffect(() => setFocus(date), [date])

  const moveFocus = (d: Date) => {
    wantFocus.current = true
    if (!isSameMonth(d, date)) setDate(d)
    setFocus(d)
  }
  React.useLayoutEffect(() => {
    if (!wantFocus.current) return
    wantFocus.current = false
    root.current?.querySelector<HTMLElement>(`[data-date="${keyOfDate(focus)}"]`)?.focus()
  }, [focus, date])

  const onGridKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-date]")
    if (!target || target !== e.target) return
    const d = parseKey(target.dataset.date!)
    const back = cal.rtl ? "ArrowRight" : "ArrowLeft"
    const fwd = cal.rtl ? "ArrowLeft" : "ArrowRight"
    let next: Date | null = null
    if (e.key === back) next = addDays(d, -1)
    else if (e.key === fwd) next = addDays(d, 1)
    else if (e.key === "ArrowUp") next = addDays(d, -7)
    else if (e.key === "ArrowDown") next = addDays(d, 7)
    else if (e.key === "PageUp") next = addMonths(d, -1)
    else if (e.key === "PageDown") next = addMonths(d, 1)
    else if (e.key === "Home") next = addDays(d, -((d.getDay() - weekStart + 7) % 7))
    else if (e.key === "End") next = addDays(d, 6 - ((d.getDay() - weekStart + 7) % 7))
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onOpenDay(d)
      return
    }
    if (next) {
      e.preventDefault()
      moveFocus(next)
    }
  }

  // ----- dragging an event to another day
  const [drag, setDrag] = React.useState<{ id: string; x: number; y: number; over: Date | null } | null>(null)
  const startDrag = (event: CalendarEvent) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!cal.editable || event.readOnly || e.button !== 0) return
    const el = e.currentTarget
    const x0 = e.clientX
    const y0 = e.clientY
    let moved = false
    const dayAt = (x: number, y: number) => {
      const hit = document.elementsFromPoint(x, y).find((n) => (n as HTMLElement).dataset?.dateCell !== undefined) as HTMLElement | undefined
      return hit ? parseKey(hit.dataset.dateCell!) : null
    }
    const mv = (ev: PointerEvent) => {
      if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 5) return
      moved = true
      setDrag({ id: event.id, x: ev.clientX, y: ev.clientY, over: dayAt(ev.clientX, ev.clientY) })
    }
    const finish = (ev: PointerEvent, commit: boolean) => {
      window.removeEventListener("pointermove", mv)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", cancel)
      setDrag(null)
      if (!moved) return
      // the click that follows a drag must not open the event
      el.addEventListener("click", (c) => c.stopPropagation(), { capture: true, once: true })
      const target = commit ? dayAt(ev.clientX, ev.clientY) : null
      if (!target) return
      const s = spanOf(event)
      const delta = daysBetween(s.start, target)
      if (!delta) return
      const change: EventChange = { start: addDays(s.start, delta), end: addDays(s.end, delta), allDay: s.allDay }
      cal.onEventChange?.(event, forCaller(event, change))
      cal.announce(msg("event-calendar.movedTo", "Moved {title} to {date}.", { title: event.title, date: dayLong(change.start) }))
    }
    const up = (ev: PointerEvent) => finish(ev, true)
    const cancel = (ev: PointerEvent) => finish(ev, false)
    window.addEventListener("pointermove", mv)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", cancel)
  }

  const onKeyMove = (event: CalendarEvent, key: string, shift: boolean) => {
    if (!cal.editable || event.readOnly) return false
    const c = keyChange(event, key, shift, { dayStep: 1, weekStep: 7, slot: cal.slot, timed: false, rtl: cal.rtl })
    if (!c) return false
    const out = spanOf(event).allDay ? c : { ...c, allDay: false }
    cal.onEventChange?.(event, forCaller(event, out))
    cal.announce(msg("event-calendar.movedTo", "Moved {title} to {date}.", { title: event.title, date: dayLong(out.start) }))
    return true
  }

  const dragged = drag ? eventById(events, drag.id) : null

  return (
    <div ref={root} role="grid" aria-label={format(date, cal.locale, { month: "long", year: "numeric" })} aria-colcount={7} aria-rowcount={weeks.length + 1} onKeyDown={onGridKey} data-slot="event-calendar-month" className="select-none">
      <div role="row" className="grid grid-cols-7 border-b bg-muted/40">
        {heads.map((d) => (
          <div key={d.getDay()} role="columnheader" aria-label={format(d, cal.locale, { weekday: "long" })} className="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground">
            {format(d, cal.locale, { weekday: "short" })}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => {
        const segs = layoutWeek(spans, week)
        const overflow = week.map((day, di) => segs.filter((s) => s.from <= di && s.to >= di && s.lane >= maxLanes).length)
        return (
          <div key={wi} role="row" aria-rowindex={wi + 2} className="relative grid grid-cols-7 border-b last:border-b-0" style={{ minHeight: MONTH_CELL }}>
            {week.map((day, di) => {
              const inMonth = isSameMonth(day, date)
              const isToday = !!cal.today && isSameDay(day, cal.today)
              const count = spans.filter((s) => touchesDay(s, day)).length
              const hover = drag?.over && isSameDay(drag.over, day)
              return (
                <div
                  key={di}
                  role="gridcell"
                  tabIndex={isSameDay(day, focus) ? 0 : -1}
                  data-date={keyOfDate(day)}
                  data-date-cell={keyOfDate(day)}
                  data-today={isToday || undefined}
                  data-outside={!inMonth || undefined}
                  aria-label={count ? msg("event-calendar.dayWithEvents", { one: "{date}, {count} event", other: "{date}, {count} events" }, { date: dayLong(day), count }) : dayLong(day)}
                  aria-current={isToday ? "date" : undefined}
                  onFocus={(e) => e.target === e.currentTarget && setFocus(day)}
                  onClick={(e) => e.target === e.currentTarget && cal.selectable && cal.onRangeSelect?.({ start: day, end: addDays(day, 1), allDay: true })}
                  onDoubleClick={() => onOpenDay(day)}
                  className={cn(
                    "relative min-w-0 border-e p-1 outline-none transition-colors last:border-e-0 focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60 motion-reduce:transition-none",
                    !inMonth && "bg-muted/30",
                    hover && "bg-accent"
                  )}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => onOpenDay(day)}
                    aria-label={msg("event-calendar.openDay", "Open {date}", { date: dayLong(day) })}
                    className={cn(
                      "ms-auto flex size-6 items-center justify-center rounded-full text-xs tabular-nums outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
                      !inMonth && "text-muted-foreground",
                      isToday && "bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {day.getDate()}
                  </button>
                  {overflow[di]! > 0 ? (
                    <MoreButton
                      day={day}
                      spans={spans}
                      count={overflow[di]!}
                      className="absolute inset-x-1"
                      style={{ top: 28 + maxLanes * ALL_DAY_LANE }}
                    />
                  ) : null}
                  {/* a bar starts in the cell of its first day and runs across the cells after it, so the row holds only cells */}
                  {segs
                    .filter((seg) => seg.from === di && seg.lane < maxLanes)
                    .map((seg) => {
                      const e = seg.span.event
                      const multi = seg.span.allDay || seg.to > seg.from || !isSameDay(seg.span.start, addMinutes(seg.span.end, -1))
                      return (
                        <EventChip
                          key={`${e.id}-${wi}`}
                          event={e}
                          variant={multi ? "block" : "inline"}
                          continues={{ before: !seg.startsHere, after: !seg.endsHere }}
                          dragging={drag?.id === e.id}
                          onPointerDown={startDrag(e)}
                          onKeyMove={onKeyMove}
                          className={cn("absolute z-10", cal.editable && !e.readOnly && "cursor-grab")}
                          style={{
                            insetInlineStart: 3,
                            width: `calc(${(seg.to - seg.from + 1) * 100}% - 6px)`,
                            top: 30 + seg.lane * ALL_DAY_LANE,
                            height: ALL_DAY_LANE - 2,
                          }}
                        />
                      )
                    })}
                </div>
              )
            })}
          </div>
        )
      })}
      {drag && dragged ? (
        <div className="pointer-events-none fixed z-50" style={{ left: drag.x + 8, top: drag.y + 8, width: 180 }}>
          <EventChip event={dragged} variant="block" ghost style={{ height: ALL_DAY_LANE + 4 }} />
        </div>
      ) : null}
    </div>
  )
}

function MoreButton({ day, spans, count, className, style }: { day: Date; spans: Span<CalendarEvent>[]; count: number; className?: string; style?: React.CSSProperties }) {
  const { msg, dayLong } = useWords()
  const { locale } = useCal()
  const list = spans.filter((s) => touchesDay(s, day)).sort((a, b) => a.start.getTime() - b.start.getTime())
  return (
    <Popover>
      <PopoverTrigger
        className={cn("rounded px-1 text-start text-xs font-medium text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50", className)}
        style={style}
        onClick={(e) => e.stopPropagation()}
        aria-label={msg("event-calendar.moreOn", "{count} more events on {date}", { count, date: dayLong(day) })}
      >
        {msg("event-calendar.more", "+{count} more", { count })}
      </PopoverTrigger>
      <PopoverContent label={msg("event-calendar.eventsOn", "Events on {date}", { date: dayLong(day) })} align="start" className="w-64 p-2">
        <p className="mb-1.5 px-1 text-sm font-semibold">{format(day, locale, { weekday: "long", month: "long", day: "numeric" })}</p>
        <div className="grid gap-1">
          {list.map((s) => (
            <EventChip key={s.event.id} event={s.event} variant="block" className="h-8 items-center" />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

const keyOfDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
const parseKey = (k: string) => toDate(k)

// ------------------------------------------------------------------------------------------------- week and day

type TimeDrag =
  | { kind: "move"; event: CalendarEvent; day: number; start: Date; end: Date; grab: number }
  | { kind: "resize-end" | "resize-start"; event: CalendarEvent; day: number; start: Date; end: Date; grab: number }
  | { kind: "create"; day: number; anchor: number; start: Date; end: Date; grab: number }

function TimeGridView({
  date,
  days,
  spans,
  events,
  height,
  scrollToHour,
  onOpenDay,
  label,
}: {
  date: Date
  days: Date[]
  spans: Span<CalendarEvent>[]
  events: CalendarEvent[]
  height: number
  scrollToHour: number
  onOpenDay: (d: Date) => void
  label: string
}) {
  const cal = useCal()
  const { msg, time, dayLong } = useWords()
  const { hourHeight: hh, slot } = cal
  const total = hh * 24
  const body = React.useRef<HTMLDivElement>(null)
  const scroller = React.useRef<HTMLDivElement>(null)
  const columns = React.useRef<HTMLDivElement>(null)
  const [drag, setDrag] = React.useState<TimeDrag | null>(null)
  const dragRef = React.useRef<TimeDrag | null>(null)
  dragRef.current = drag

  React.useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = Math.max(0, scrollToHour * hh - 8)
    // opens on working hours once, and again when the view changes length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days.length])

  const allDay = spans.filter((s) => s.allDay || s.end.getTime() - s.start.getTime() >= 86_400_000)
  const timedSpans = spans.filter((s) => !allDay.includes(s))
  const segs = layoutWeek(allDay, days)
  const lanes = segs.reduce((m, s) => Math.max(m, s.lane + 1), 0)

  /** The column and minute the pointer is over. */
  const locate = (x: number, y: number) => {
    const box = columns.current!.getBoundingClientRect()
    const w = box.width / days.length
    const raw = cal.rtl ? (box.right - x) / w : (x - box.left) / w
    const day = clamp(Math.floor(raw), 0, days.length - 1)
    const minutes = clamp(((y - box.top) / hh) * 60, 0, 1440)
    return { day, minutes }
  }

  const rangeFor = (day: number, a: number, b: number) => {
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    const start = setMinutesOfDay(days[day]!, clamp(snap(lo, slot), 0, 1440 - slot))
    const end = setMinutesOfDay(days[day]!, clamp(Math.max(snap(hi, slot), snap(lo, slot) + slot), slot, 1440))
    return { start, end }
  }

  const begin = (kind: "move" | "resize-end" | "resize-start", event: CalendarEvent, dayIndex: number) => (e: React.PointerEvent<HTMLElement>) => {
    if (!cal.editable || event.readOnly || e.button !== 0) return
    e.stopPropagation()
    const s = spanOf(event)
    const x0 = e.clientX
    const y0 = e.clientY
    const at = locate(x0, y0)
    const grab = at.minutes - minutesOfDay(s.start)
    const el = e.currentTarget
    let moved = false
    const dur = (s.end.getTime() - s.start.getTime()) / 60_000
    const mv = (ev: PointerEvent) => {
      if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 5) return
      moved = true
      const p = locate(ev.clientX, ev.clientY)
      if (kind === "move") {
        const startMin = clamp(snap(p.minutes - grab, slot), 0, Math.max(0, 1440 - Math.min(dur, 1440)))
        const start = setMinutesOfDay(days[p.day]!, startMin)
        setDrag({ kind, event, day: p.day, start, end: addMinutes(start, dur), grab })
      } else if (kind === "resize-end") {
        const end = clamp(Math.max(snap(p.minutes, slot), minutesOfDay(s.start) + slot), 0, 1440)
        setDrag({ kind, event, day: dayIndex, start: s.start, end: setMinutesOfDay(days[dayIndex]!, end), grab })
      } else {
        const startMin = clamp(Math.min(snap(p.minutes, slot), minutesOfDay(s.end) - slot), 0, 1440)
        setDrag({ kind, event, day: dayIndex, start: setMinutesOfDay(days[dayIndex]!, startMin), end: s.end, grab })
      }
    }
    const done = (commit: boolean) => {
      window.removeEventListener("pointermove", mv)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", cancel)
      window.removeEventListener("keydown", key, true)
      const d = dragRef.current
      setDrag(null)
      if (!moved) return
      el.addEventListener("click", (c) => c.stopPropagation(), { capture: true, once: true })
      if (!commit || !d || d.kind === "create") return
      if (d.start.getTime() === s.start.getTime() && d.end.getTime() === s.end.getTime()) return
      cal.onEventChange?.(event, { start: d.start, end: d.end, allDay: false })
      cal.announce(msg("event-calendar.movedTimed", "Moved {title} to {date}, {from} to {to}.", { title: event.title, date: dayLong(d.start), from: time(d.start), to: time(d.end) }))
    }
    const up = () => done(true)
    const cancel = () => done(false)
    const key = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.stopPropagation()
        done(false)
      }
    }
    window.addEventListener("pointermove", mv)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", cancel)
    window.addEventListener("keydown", key, true)
  }

  const beginCreate = (e: React.PointerEvent<HTMLDivElement>) => {
    // only empty time starts one: the surface itself or a day column, not an event on it
    const onEmpty = e.target === e.currentTarget || (e.target as HTMLElement).dataset?.day !== undefined
    if (!cal.selectable || e.button !== 0 || !onEmpty) return
    const x0 = e.clientX
    const y0 = e.clientY
    const at = locate(x0, y0)
    const anchor = snap(at.minutes, slot)
    const dayIndex = at.day
    let moved = false
    const mv = (ev: PointerEvent) => {
      if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 5) return
      moved = true
      const p = locate(ev.clientX, ev.clientY)
      const r = rangeFor(dayIndex, anchor, p.minutes)
      setDrag({ kind: "create", day: dayIndex, anchor, ...r, grab: 0 })
    }
    const done = (commit: boolean) => {
      window.removeEventListener("pointermove", mv)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", cancel)
      const d = dragRef.current
      setDrag(null)
      if (!commit) return
      // a click without a drag makes one slot
      const range = d && d.kind === "create" ? { start: d.start, end: d.end } : rangeFor(dayIndex, anchor, anchor)
      cal.onRangeSelect?.({ ...range, allDay: false })
    }
    const up = () => done(true)
    const cancel = () => done(false)
    window.addEventListener("pointermove", mv)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", cancel)
  }

  const onKeyMove = (event: CalendarEvent, key: string, shift: boolean) => {
    if (!cal.editable || event.readOnly) return false
    const s = spanOf(event)
    const timed = !s.allDay
    const c = keyChange(event, key, shift, { dayStep: 1, weekStep: 7, slot, timed, rtl: cal.rtl })
    if (!c) return false
    const out = timed ? c : c
    cal.onEventChange?.(event, forCaller(event, out))
    cal.announce(
      timed
        ? msg("event-calendar.movedTimed", "Moved {title} to {date}, {from} to {to}.", { title: event.title, date: dayLong(out.start), from: time(out.start), to: time(out.end) })
        : msg("event-calendar.movedTo", "Moved {title} to {date}.", { title: event.title, date: dayLong(out.start) })
    )
    return true
  }

  const hours = Array.from({ length: 24 }, (_, h) => h)
  const gridCols = { gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }

  return (
    <div data-slot="event-calendar-timegrid" className="flex min-w-0 select-none flex-col">
      {/* day headings and the all-day row stay in view while the hours scroll */}
      <div className="border-b bg-card">
        <div className="flex" style={{ paddingInlineStart: GUTTER }}>
          <div className="grid flex-1" style={gridCols}>
            {days.map((d) => {
              const isToday = !!cal.today && isSameDay(d, cal.today)
              return (
                <div key={keyOfDate(d)} className="flex min-w-0 flex-col items-center gap-0.5 border-s px-1 py-2 first:border-s-0">
                  <span className="text-xs font-medium text-muted-foreground">{format(d, cal.locale, { weekday: "short" })}</span>
                  <button
                    type="button"
                    onClick={() => onOpenDay(d)}
                    aria-label={msg("event-calendar.openDay", "Open {date}", { date: dayLong(d) })}
                    aria-current={isToday ? "date" : undefined}
                    className={cn("flex size-8 items-center justify-center rounded-full text-sm font-medium tabular-nums outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none", isToday && "bg-primary text-primary-foreground hover:bg-primary/90")}
                  >
                    {d.getDate()}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
        {lanes > 0 ? (
          <div className="flex border-t" style={{ paddingInlineStart: GUTTER }}>
            <div className="relative flex-1" style={{ height: lanes * ALL_DAY_LANE + 8 }}>
              <span className="absolute -start-14 top-1.5 w-14 pe-2 text-end text-[11px] text-muted-foreground">{msg("event-calendar.allDay", "All day")}</span>
              {segs.map((s) => (
                <EventChip
                  key={`${s.span.event.id}-all`}
                  event={s.span.event}
                  variant="block"
                  showTime={false}
                  continues={{ before: !s.startsHere, after: !s.endsHere }}
                  onKeyMove={onKeyMove}
                  className="absolute"
                  style={{ insetInlineStart: `calc(${(s.from / days.length) * 100}% + 2px)`, width: `calc(${((s.to - s.from + 1) / days.length) * 100}% - 4px)`, top: 4 + s.lane * ALL_DAY_LANE, height: ALL_DAY_LANE - 3 }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div ref={scroller} className="relative overflow-y-auto overscroll-contain" style={{ height }}>
        <div ref={body} className="relative flex" style={{ height: total }}>
          <div aria-hidden="true" className="sticky start-0 z-20 shrink-0 border-e bg-card" style={{ width: GUTTER }}>
            {hours.map((h) => (
              <div key={h} className="relative text-end text-[11px] tabular-nums text-muted-foreground" style={{ height: hh }}>
                {h > 0 ? <span className="absolute -top-2 end-2">{format(new Date(2000, 0, 1, h), cal.locale, { hour: "numeric" })}</span> : null}
              </div>
            ))}
          </div>
          <div ref={columns} className="relative grid flex-1" style={gridCols} onPointerDown={beginCreate} role="presentation">
            {/* the hour and half-hour lines */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {hours.map((h) => (
                <div key={h} className="border-t border-border/70" style={{ height: hh }}>
                  <div className="border-t border-dashed border-border/40" style={{ marginTop: hh / 2 - 1 }} />
                </div>
              ))}
            </div>
            {days.map((d, di) => {
              const placed = layoutDay(timedSpans, d, Math.max(18, (hh / 60) * slot))
              const isToday = !!cal.today && isSameDay(d, cal.today)
              return (
                <div key={keyOfDate(d)} role="group" aria-label={dayLong(d)} data-day={keyOfDate(d)} className={cn("relative border-s first:border-s-0", isToday && "bg-primary/[0.03]")}>
                  {placed.map((p) => {
                    const e = p.span.event
                    const beingDragged = drag && drag.kind !== "create" && drag.event.id === e.id
                    const width = 100 / p.columns
                    return (
                      <EventChip
                        key={e.id}
                        event={e}
                        variant="block"
                        dragging={!!beingDragged}
                        onPointerDown={begin("move", e, di)}
                        onKeyMove={onKeyMove}
                        className={cn("absolute z-10 items-start", cal.editable && !e.readOnly && "cursor-grab", beingDragged && "opacity-40")}
                        style={{
                          top: (p.top / 60) * hh,
                          height: Math.max((p.height / 60) * hh - 2, 18),
                          insetInlineStart: `calc(${p.column * width}% + 2px)`,
                          width: `calc(${width}% - 4px)`,
                        }}
                      >
                        <span className="min-w-0 flex-1 ps-1">
                          {cal.renderEvent ? (
                            cal.renderEvent(e, { view: cal.view, compact: p.height < 45 })
                          ) : (
                            <>
                              <span className="block truncate font-medium text-foreground">{e.title}</span>
                              {p.height >= 45 ? <bdi className="block truncate tabular-nums text-muted-foreground">{time(p.span.start)} – {time(p.span.end)}</bdi> : null}
                              {p.height >= 75 && e.location ? (
                                <span className="mt-0.5 flex items-center gap-1 truncate text-muted-foreground">
                                  <MapPin className="size-3 shrink-0" aria-hidden="true" />
                                  <span className="truncate">{e.location}</span>
                                </span>
                              ) : null}
                            </>
                          )}
                        </span>
                        {cal.editable && !e.readOnly ? (
                          <span
                            aria-hidden="true"
                            onPointerDown={begin("resize-end", e, di)}
                            className="absolute inset-x-0 bottom-0 flex h-2 cursor-ns-resize touch-none items-end justify-center after:mb-0.5 after:h-0.5 after:w-6 after:rounded-full after:bg-foreground/0 group-hover/event:after:bg-foreground/30"
                          />
                        ) : null}
                      </EventChip>
                    )
                  })}
                  {/* what is being made or moved, drawn where it will land */}
                  {drag && drag.day === di && drag.kind !== "resize-end" && drag.kind !== "resize-start" ? <Ghost drag={drag} hh={hh} /> : null}
                  {drag && drag.kind !== "create" && (drag.kind === "resize-end" || drag.kind === "resize-start") && drag.day === di ? <Ghost drag={drag} hh={hh} /> : null}
                  {isToday && cal.today ? <NowLine hh={hh} /> : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  )
}

function Ghost({ drag, hh }: { drag: TimeDrag; hh: number }) {
  const { time } = useWords()
  const top = (minutesOfDay(drag.start) / 60) * hh
  const end = drag.end.getTime() - startOfDay(drag.start).getTime() >= 86_400_000 ? 1440 : minutesOfDay(drag.end)
  const h = Math.max(((end - minutesOfDay(drag.start)) / 60) * hh - 2, 18)
  const event = drag.kind === "create" ? null : drag.event
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0.5 z-30" style={{ top, height: h }}>
      {event ? (
        <EventChip event={{ ...event, start: drag.start, end: drag.end, allDay: false }} variant="block" ghost className="h-full items-start" />
      ) : (
        <div className="h-full rounded-md border border-primary/50 bg-primary/10 px-2 py-1 text-xs tabular-nums text-primary">
          {time(drag.start)} – {time(drag.end)}
        </div>
      )}
    </div>
  )
}

/** The line for the current time. The clock is read in an effect, so the server never draws it in the wrong place. */
function NowLine({ hh }: { hh: number }) {
  const { now } = useCal()
  if (!now) return null
  return (
    <div aria-hidden="true" data-slot="event-calendar-now" className="pointer-events-none absolute inset-x-0 z-20 flex items-center" style={{ top: (minutesOfDay(now) / 60) * hh }}>
      <span className="-ms-1 size-2 rounded-full bg-destructive" />
      <span className="h-px flex-1 bg-destructive" />
    </div>
  )
}

// ------------------------------------------------------------------------------------------------- agenda

function AgendaView({ date, spans, events, emptyState }: { date: Date; spans: Span<CalendarEvent>[]; events: CalendarEvent[]; emptyState: EventCalendarProps["emptyState"] }) {
  const cal = useCal()
  const { msg, time, dayLong } = useWords()
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  const days = Array.from({ length: last.getDate() }, (_, i) => addDays(first, i))
  const groups = days
    .map((d) => ({ day: d, items: spans.filter((s) => touchesDay(s, d)).sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start.getTime() - b.start.getTime()) }))
    .filter((g) => g.items.length)
  if (!groups.length) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-8 text-center" data-slot="event-calendar-empty">
        <CalendarDays className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium">{emptyState?.title ?? msg("event-calendar.emptyTitle", "No events this month")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{emptyState?.description ?? msg("event-calendar.emptyDescription", "Events you add will be listed here by day.")}</p>
        {emptyState?.action}
      </div>
    )
  }
  return (
    <ol data-slot="event-calendar-agenda" className="divide-y" aria-label={format(date, cal.locale, { month: "long", year: "numeric" })}>
      {groups.map(({ day, items }) => {
        const isToday = !!cal.today && isSameDay(day, cal.today)
        return (
          <li key={keyOfDate(day)} className="grid gap-x-4 gap-y-2 p-3 sm:grid-cols-[8rem_1fr]">
            <h3 className={cn("flex items-baseline gap-2 text-sm font-semibold sm:flex-col sm:gap-0", isToday && "text-primary")}>
              <span className="text-2xl tabular-nums sm:leading-none">{day.getDate()}</span>
              <span className="text-xs font-medium text-muted-foreground">{format(day, cal.locale, { weekday: "long", month: "short" })}</span>
            </h3>
            <ul className="grid min-w-0 gap-1.5">
              {items.map((s) => (
                <li key={s.event.id} className="min-w-0">
                  <EventChip event={s.event} variant="block" className="w-full items-center gap-3 py-1.5">
                    <span className="w-24 shrink-0 ps-1 text-xs tabular-nums text-muted-foreground">{s.allDay ? msg("event-calendar.allDay", "All day") : `${time(s.start)}`}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{s.event.title}</span>
                      {s.event.location ? <span className="block truncate text-xs text-muted-foreground">{s.event.location}</span> : null}
                    </span>
                  </EventChip>
                </li>
              ))}
            </ul>
          </li>
        )
      })}
    </ol>
  )
}

export {
  EventCalendar,
  type CalendarEvent,
  type EventCalendarProps,
  type EventCalendarView,
  type EventChange,
  type EventRange,
  type EventTone,
}
