// Ballmac UI: Calendar 1. https://ui.ballmac.com/blocks/calendar-1
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MapPin, Plus } from "lucide-react"

import { Button, buttonVariants } from "@/components/ballmac/button"
import { Calendar } from "@/components/ballmac/calendar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ballmac/dialog"
import { Input } from "@/components/ballmac/input"
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/ballmac/popover"
import { cn } from "@/lib/utils"

type Calendar1Event = {
  id: string
  title: string
  /** Start, as local date and time: YYYY-MM-DDTHH:mm. */
  start: string
  /** End, as local date and time: YYYY-MM-DDTHH:mm. Ignored for all-day events. */
  end: string
  /** Which calendar it belongs to; sets the colour and the checkbox that shows or hides it. */
  calendar: string
  location?: string
  /** Show it in the all-day row instead of the time grid. */
  allDay?: boolean
}

type Calendar1Props = Omit<React.ComponentProps<"div">, "children" | "onSelect"> & {
  /** Events to show. */
  defaultEvents?: Calendar1Event[]
  /** Calendars and their colours (chart tokens 1 to 5). */
  calendars?: { id: string; label: string; color: 1 | 2 | 3 | 4 | 5 }[]
  /** Today, as YYYY-MM-DD. Passed in so the page is the same on the server and in the browser. */
  today?: string
  /** The time of day for the "now" line, as HH:mm. Pass null to hide it. */
  now?: string | null
  /** First hour shown. */
  startHour?: number
  /** Last hour shown. */
  endHour?: number
  /** Called when an event is added. */
  onAdd?: (event: Calendar1Event) => void
  /** Height of the frame. */
  height?: string
}

const ROW = 56
const DAY_MS = 86400000

const palette: Record<number, { bg: string; bar: string }> = {
  1: { bg: "bg-chart-1/15", bar: "bg-chart-1" },
  2: { bg: "bg-chart-2/15", bar: "bg-chart-2" },
  3: { bg: "bg-chart-3/20", bar: "bg-chart-3" },
  4: { bg: "bg-chart-4/15", bar: "bg-chart-4" },
  5: { bg: "bg-chart-5/15", bar: "bg-chart-5" },
}

const defaultCalendars: NonNullable<Calendar1Props["calendars"]> = [
  { id: "work", label: "Work", color: 1 },
  { id: "team", label: "Team", color: 5 },
  { id: "personal", label: "Personal", color: 2 },
]

const defaultEvents: Calendar1Event[] = [
  { id: "e1", title: "Team standup", start: "2026-09-28T09:30", end: "2026-09-28T09:45", calendar: "team" },
  { id: "e2", title: "Design review", start: "2026-09-29T11:00", end: "2026-09-29T12:00", calendar: "work", location: "Room 3" },
  { id: "e3", title: "Team standup", start: "2026-09-30T09:30", end: "2026-09-30T09:45", calendar: "team" },
  { id: "e4", title: "1:1 with Maya", start: "2026-09-30T14:00", end: "2026-09-30T14:30", calendar: "work" },
  { id: "e5", title: "Team standup", start: "2026-10-01T09:30", end: "2026-10-01T09:45", calendar: "team" },
  { id: "e6", title: "Pricing page working session", start: "2026-10-01T10:00", end: "2026-10-01T12:00", calendar: "work", location: "Zoom" },
  { id: "e7", title: "Lunch with Amara", start: "2026-10-01T12:30", end: "2026-10-01T13:30", calendar: "personal", location: "Café Lisboa" },
  { id: "e8", title: "Roadmap sync", start: "2026-10-01T14:00", end: "2026-10-01T15:00", calendar: "team", location: "Room 1" },
  { id: "e9", title: "Customer call: Northwind", start: "2026-10-01T14:30", end: "2026-10-01T15:15", calendar: "work" },
  { id: "e10", title: "Team standup", start: "2026-10-02T09:30", end: "2026-10-02T09:45", calendar: "team" },
  { id: "e11", title: "Launch day", start: "2026-10-02T00:00", end: "2026-10-02T23:59", calendar: "work", allDay: true },
  { id: "e12", title: "Quarterly planning", start: "2026-10-02T13:00", end: "2026-10-02T16:00", calendar: "team", location: "Main hall" },
  { id: "e13", title: "Pottery class", start: "2026-10-03T10:00", end: "2026-10-03T12:00", calendar: "personal" },
]

const parseDay = (iso: string) => Date.parse(`${iso.slice(0, 10)}T00:00:00Z`)
const minutes = (iso: string) => Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16))
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const mondayOf = (ms: number) => ms - ((new Date(ms).getUTCDay() + 6) % 7) * DAY_MS
const clock = (m: number) => {
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${h % 12 === 0 ? 12 : h % 12}${mm ? `:${String(mm).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`
}

/** Stack events that overlap in time side by side. */
function lanes(list: Calendar1Event[]) {
  const sorted = [...list].sort((a, b) => minutes(a.start) - minutes(b.start) || minutes(b.end) - minutes(a.end))
  const placed: { e: Calendar1Event; lane: number; of: number }[] = []
  let group: typeof placed = []
  let groupEnd = -1
  const flush = () => {
    const of = Math.max(1, ...group.map((g) => g.lane + 1))
    group.forEach((g) => (g.of = of))
    placed.push(...group)
    group = []
  }
  for (const e of sorted) {
    if (minutes(e.start) >= groupEnd && group.length) flush()
    const used = new Set(group.filter((g) => minutes(g.e.end) > minutes(e.start)).map((g) => g.lane))
    let lane = 0
    while (used.has(lane)) lane++
    group.push({ e, lane, of: 1 })
    groupEnd = Math.max(groupEnd, minutes(e.end))
  }
  if (group.length) flush()
  return placed
}

function Calendar1({
  defaultEvents: initial = defaultEvents,
  calendars = defaultCalendars,
  today = "2026-10-01",
  now = "10:24",
  startHour = 8,
  endHour = 18,
  onAdd,
  height = "44rem",
  className,
  style,
  ...props
}: Calendar1Props) {
  const [events, setEvents] = React.useState(initial)
  const [selected, setSelected] = React.useState(today)
  const [hidden, setHidden] = React.useState<string[]>([])
  const [adding, setAdding] = React.useState(false)
  const [draft, setDraft] = React.useState({ title: "", day: today, from: "09:00", to: "10:00", calendar: calendars[0]?.id ?? "work" })
  const monday = mondayOf(parseDay(selected))
  const week = Array.from({ length: 7 }, (_, i) => monday + i * DAY_MS)
  const title = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(monday + 3 * DAY_MS))
  const colorOf = (id: string) => palette[calendars.find((c) => c.id === id)?.color ?? 1]
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const visible = events.filter((e) => !hidden.includes(e.calendar))
  const gridHeight = hours.length * ROW
  const sel = new Date(Number(selected.slice(0, 4)), Number(selected.slice(5, 7)) - 1, Number(selected.slice(8, 10)))
  const shift = (days: number) => setSelected(iso(parseDay(selected) + days * DAY_MS))
  const dayFmt = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" })
  const longFmt = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })
  const nowMin = now ? minutes(`0000-00-00T${now}`) : null

  function addEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.title.trim() || draft.to <= draft.from) return
    const ev: Calendar1Event = { id: `new-${events.length + 1}`, title: draft.title.trim(), start: `${draft.day}T${draft.from}`, end: `${draft.day}T${draft.to}`, calendar: draft.calendar }
    setEvents((all) => [...all, ev])
    onAdd?.(ev)
    setSelected(draft.day)
    setAdding(false)
    setDraft({ ...draft, title: "" })
  }

  return (
    <div data-slot="calendar-1" className={cn("bg-background flex overflow-hidden rounded-2xl border shadow-[0_30px_80px_-50px_rgb(0_0_0/0.4)]", className)} style={{ height, ...style }} {...props}>
      <aside aria-label="Calendars" className="bg-muted/30 hidden w-64 shrink-0 flex-col gap-5 overflow-y-auto border-r p-4 lg:flex">
        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger className={buttonVariants({ className: "w-full" })}><Plus /> New event</DialogTrigger>
          <DialogContent>
            <form onSubmit={addEvent}>
              <DialogHeader>
                <DialogTitle>New event</DialogTitle>
                <DialogDescription>It appears on your calendar straight away.</DialogDescription>
              </DialogHeader>
              <div className="my-5 grid gap-3">
                <Input aria-label="Title" placeholder="Event title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
                <Input aria-label="Day" type="date" value={draft.day} onChange={(e) => setDraft({ ...draft, day: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1.5 text-sm font-medium">Starts<Input type="time" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} /></label>
                  <label className="grid gap-1.5 text-sm font-medium">Ends<Input type="time" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} aria-invalid={draft.to <= draft.from || undefined} /></label>
                </div>
                {draft.to <= draft.from && <p role="alert" className="text-destructive text-sm">The end time must be after the start time.</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
                <Button type="submit" disabled={!draft.title.trim() || draft.to <= draft.from}>Add event</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Calendar mode="single" selected={sel} month={sel} onMonthChange={(m) => setSelected(iso(Date.UTC(m.getFullYear(), m.getMonth(), 1)))} onSelect={(d) => d && setSelected(iso(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())))} className="-mx-2 p-0" />
        <fieldset>
          <legend className="text-muted-foreground mb-2 text-xs font-medium">My calendars</legend>
          <ul className="space-y-1">
            {calendars.map((c) => (
              <li key={c.id}>
                <label className="hover:bg-accent/60 flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm">
                  <input type="checkbox" checked={!hidden.includes(c.id)} onChange={() => setHidden((h) => (h.includes(c.id) ? h.filter((x) => x !== c.id) : [...h, c.id]))} className="peer sr-only" />
                  <span aria-hidden="true" className={cn("peer-focus-visible:ring-ring/50 flex size-4 items-center justify-center rounded border-2 transition-colors peer-focus-visible:ring-[3px]", hidden.includes(c.id) ? "border-border" : cn(palette[c.color].bar, "border-transparent"))}>{!hidden.includes(c.id) && <svg viewBox="0 0 12 12" className="text-background size-3"><path d="M2.5 6.5l2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span>
                  {c.label}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-2 border-b p-3">
          <h2 className="mr-2 text-lg font-semibold tracking-[-0.02em]">{title}</h2>
          <Button variant="outline" size="sm" onClick={() => setSelected(today)}>Today</Button>
          <div className="hidden md:flex">
            <Button variant="ghost" size="icon" aria-label="Previous week" onClick={() => shift(-7)}><ChevronLeft /></Button>
            <Button variant="ghost" size="icon" aria-label="Next week" onClick={() => shift(7)}><ChevronRight /></Button>
          </div>
          <Button variant="outline" size="icon" className="ml-auto lg:hidden" aria-label="New event" onClick={() => setAdding(true)}><Plus /></Button>
          <div className="flex items-center gap-1 md:hidden">
            <Button variant="ghost" size="icon" aria-label="Previous day" onClick={() => shift(-1)}><ChevronLeft /></Button>
            <Button variant="ghost" size="icon" aria-label="Next day" onClick={() => shift(1)}><ChevronRight /></Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto" tabIndex={0} role="region" aria-label={`Week of ${longFmt.format(new Date(monday))}`}>
          <div className="min-w-0" style={{ minWidth: "0" }}>
            <div className="bg-background/95 sticky top-0 z-20 border-b backdrop-blur">
              <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] max-md:grid-cols-[3.5rem_minmax(0,1fr)]">
                <div />
                {week.map((d) => {
                  const day = iso(d)
                  const isToday = day === today
                  const isSel = day === selected
                  return (
                    <button key={day} type="button" onClick={() => setSelected(day)} aria-current={isToday ? "date" : undefined} aria-label={longFmt.format(new Date(d))} className={cn("focus-visible:ring-ring/50 flex-col items-center gap-0.5 py-2 text-center outline-none focus-visible:ring-[3px] focus-visible:ring-inset", isSel ? "flex" : "hidden md:flex")}>
                      <span className="text-muted-foreground text-xs font-medium">{dayFmt.format(new Date(d))}</span>
                      <span className={cn("flex size-8 items-center justify-center rounded-full text-sm font-semibold tabular-nums", isToday && "bg-foreground text-background")}>{new Date(d).getUTCDate()}</span>
                    </button>
                  )
                })}
              </div>
              {visible.some((e) => e.allDay) && (
                <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] border-t max-md:grid-cols-[3.5rem_minmax(0,1fr)]">
                  <span className="text-muted-foreground py-1.5 pr-2 text-right text-[10px]">all-day</span>
                  {week.map((d) => (
                    <div key={d} className={cn("min-h-7 space-y-0.5 border-l p-0.5", iso(d) !== selected && "max-md:hidden")}>
                      {visible.filter((e) => e.allDay && parseDay(e.start) === d).map((e) => (
                        <div key={e.id} className={cn("truncate rounded px-1.5 py-0.5 text-xs font-medium", colorOf(e.calendar).bg)}>{e.title}</div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] max-md:grid-cols-[3.5rem_minmax(0,1fr)]" style={{ height: gridHeight }}>
              <div aria-hidden="true">
                {hours.map((h) => (
                  <div key={h} className="text-muted-foreground relative pr-2 text-right text-[10px]" style={{ height: ROW }}><span className="absolute -top-2 right-2">{h === startHour ? "" : clock(h * 60)}</span></div>
                ))}
              </div>
              {week.map((d) => {
                const day = iso(d)
                const items = lanes(visible.filter((e) => !e.allDay && parseDay(e.start) === d))
                return (
                  <div key={day} className={cn("relative border-l", day !== selected && "max-md:hidden", day === today && "bg-accent/20")}>
                    {hours.map((h) => <div key={h} className="border-b" style={{ height: ROW }} />)}
                    {day === today && nowMin !== null && nowMin >= startHour * 60 && nowMin <= endHour * 60 && (
                      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: ((nowMin - startHour * 60) / 60) * ROW }}>
                        <span className="bg-destructive -ml-1 size-2 rounded-full" />
                        <span className="bg-destructive h-px flex-1" />
                      </div>
                    )}
                    {items.map(({ e, lane, of }) => {
                      const top = ((Math.max(minutes(e.start), startHour * 60) - startHour * 60) / 60) * ROW
                      const h = Math.max(((Math.min(minutes(e.end), endHour * 60) - Math.max(minutes(e.start), startHour * 60)) / 60) * ROW, 22)
                      const c = colorOf(e.calendar)
                      return (
                        <Popover key={e.id}>
                          <PopoverTrigger
                            className={cn("focus-visible:ring-ring/50 absolute z-[5] overflow-hidden rounded-md border-l-[3px] px-1.5 py-1 text-left text-xs leading-tight outline-none transition-[filter] hover:brightness-95 focus-visible:z-20 focus-visible:ring-[3px]", c.bg, c.bar.replace("bg-", "border-"))}
                            style={{ top, height: h - 2, left: `calc(${(lane / of) * 100}% + 2px)`, width: `calc(${100 / of}% - 4px)` }}
                            aria-label={`${e.title}, ${clock(minutes(e.start))} to ${clock(minutes(e.end))}${e.location ? `, ${e.location}` : ""}`}
                          >
                            <span className="block truncate font-semibold">{e.title}</span>
                            {h > 36 && <span className="block truncate opacity-90">{clock(minutes(e.start))}</span>}
                          </PopoverTrigger>
                          <PopoverContent className="w-64" label={e.title}>
                            <PopoverTitle>{e.title}</PopoverTitle>
                            <PopoverDescription>{longFmt.format(new Date(d))}<br />{clock(minutes(e.start))} to {clock(minutes(e.end))}</PopoverDescription>
                            {e.location && <p className="mt-2 flex items-center gap-1.5 text-sm"><MapPin className="size-4" aria-hidden="true" />{e.location}</p>}
                            <p className="text-muted-foreground mt-2 text-xs">{calendars.find((x) => x.id === e.calendar)?.label} calendar</p>
                          </PopoverContent>
                        </Popover>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Calendar1, type Calendar1Props, type Calendar1Event }
