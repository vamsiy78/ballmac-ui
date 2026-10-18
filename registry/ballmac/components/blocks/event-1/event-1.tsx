// Ballmac UI: Event 1. https://ui.ballmac.com/blocks/event-1
"use client"

import * as React from "react"
import { CalendarArrowDown, CalendarDays, Clock, MapPin, Star, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { cn } from "@/lib/utils"

type Event1Session = {
  id: string
  /** ISO date of the day it happens. */
  day: string
  /** "09:30", in the event's time zone. */
  start: string
  end: string
  title: string
  track: string
  room?: string
  speakers?: { name: string; role?: string }[]
  description?: string
}

type Event1Props = Omit<React.ComponentProps<"section">, "title"> & {
  name?: string
  tagline?: string
  /** ISO dates of the first and last day. */
  dates?: [string, string]
  venue?: string
  /** Hours from UTC for the venue, so the schedule file has the right times. */
  utcOffset?: number
  sessions?: Event1Session[]
  /** An ISO date for "now", used for the countdown. The block never reads the clock. */
  now?: string
  locale?: string
  /** Sessions saved at first. */
  defaultSaved?: string[]
  onSavedChange?: (ids: string[]) => void
}

const sample: Event1Session[] = [
  { id: "s1", day: "2026-11-12", start: "09:00", end: "09:45", title: "Opening keynote: software that respects people", track: "Keynote", room: "Main hall", speakers: [{ name: "Mara Ellison", role: "CEO, Acme" }] },
  { id: "s2", day: "2026-11-12", start: "10:00", end: "10:45", title: "Design systems at 400 designers", track: "Design", room: "Room A", speakers: [{ name: "Noor Haddad", role: "Head of Design" }], description: "What broke, what held, and the three rules that survived growth." },
  { id: "s3", day: "2026-11-12", start: "10:15", end: "11:00", title: "Postgres in production: lessons from year five", track: "Engineering", room: "Room B", speakers: [{ name: "Priya Shah", role: "Platform lead" }] },
  { id: "s4", day: "2026-11-12", start: "11:15", end: "12:00", title: "Accessible by default", track: "Design", room: "Room A", speakers: [{ name: "Amara Okoye", role: "Product Designer" }, { name: "Jordan Lee", role: "Systems Lead" }] },
  { id: "s5", day: "2026-11-12", start: "13:30", end: "14:15", title: "Shipping with AI agents, safely", track: "Engineering", room: "Main hall", speakers: [{ name: "Theo Nakamura", role: "CTO" }], description: "Approvals, budgets and the logs you will wish you had." },
  { id: "s6", day: "2026-11-12", start: "14:30", end: "15:15", title: "Pricing pages that earn trust", track: "Business", room: "Room C", speakers: [{ name: "Sam Okafor", role: "Head of Support" }] },
  { id: "s7", day: "2026-11-13", start: "09:30", end: "10:15", title: "Remote teams, real friendships", track: "Business", room: "Main hall", speakers: [{ name: "Ana Souza", role: "Operations" }] },
  { id: "s8", day: "2026-11-13", start: "10:30", end: "11:15", title: "Fast front ends without a framework fight", track: "Engineering", room: "Room B", speakers: [{ name: "Yuki Tanaka", role: "Frontend Engineer" }] },
  { id: "s9", day: "2026-11-13", start: "10:30", end: "11:15", title: "Motion that helps, not distracts", track: "Design", room: "Room A", speakers: [{ name: "Jordan Lee", role: "Systems Lead" }] },
  { id: "s10", day: "2026-11-13", start: "12:00", end: "12:45", title: "Closing panel: what we got wrong", track: "Keynote", room: "Main hall", speakers: [{ name: "Mara Ellison" }, { name: "Theo Nakamura" }, { name: "Noor Haddad" }] },
]

const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const trackTone = ["bg-chart-1/15", "bg-chart-2/15", "bg-chart-3/15", "bg-chart-4/15", "bg-chart-5/15"]

function ics(sessions: Event1Session[], name: string, utcOffset: number) {
  const stamp = (day: string, t: string) => {
    const ms = Date.parse(`${day}T${t}:00Z`) - utcOffset * 3_600_000
    return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  }
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n")
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${esc(name)}//Schedule//EN`, "CALSCALE:GREGORIAN"]
  for (const s of sessions) {
    lines.push("BEGIN:VEVENT", `UID:${s.id}@${esc(name).replace(/\s+/g, "-").toLowerCase()}`, `DTSTAMP:${stamp(s.day, s.start)}`, `DTSTART:${stamp(s.day, s.start)}`, `DTEND:${stamp(s.day, s.end)}`, `SUMMARY:${esc(s.title)}`, ...(s.room ? [`LOCATION:${esc(s.room)}`] : []), ...(s.description ? [`DESCRIPTION:${esc(s.description)}`] : []), "END:VEVENT")
  }
  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}

/**
 * An event page with its agenda: the dates, venue and a countdown, then the schedule by day with a filter for each track, a star on every session
 * to build your own schedule, a warning when two of your sessions overlap, and one press to download your schedule as a calendar file.
 */
function Event1({
  name = "Acme Summit 2026",
  tagline = "Two days of talks on building software people trust.",
  dates = ["2026-11-12", "2026-11-13"],
  venue = "Convento do Beato, Lisbon",
  utcOffset = 0,
  sessions = sample,
  now = "2026-10-18T10:00:00Z",
  locale = "en",
  defaultSaved = [],
  onSavedChange,
  className,
  ...props
}: Event1Props) {
  const id = React.useId()
  const days = [...new Set(sessions.map((s) => s.day))].sort()
  const tracks = [...new Set(sessions.map((s) => s.track))]
  const [day, setDay] = React.useState(days[0] ?? dates[0])
  const [track, setTrack] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState<string[]>(defaultSaved)
  const [announce, setAnnounce] = React.useState("")
  const dayFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }), [locale])
  const shortFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }), [locale])
  const rangeFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }), [locale])

  const until = Math.ceil((Date.parse(`${dates[0]}T00:00:00Z`) - Date.parse(now)) / 86_400_000)
  const shown = sessions.filter((s) => s.day === day && (!track || s.track === track)).sort((a, b) => mins(a.start) - mins(b.start) || a.title.localeCompare(b.title))
  const mine = sessions.filter((s) => saved.includes(s.id)).sort((a, b) => a.day.localeCompare(b.day) || mins(a.start) - mins(b.start))
  const clash = (s: Event1Session) => mine.find((m) => m.id !== s.id && m.day === s.day && mins(m.start) < mins(s.end) && mins(s.start) < mins(m.end))

  const toggle = (s: Event1Session) => {
    const on = !saved.includes(s.id)
    const next = on ? [...saved, s.id] : saved.filter((x) => x !== s.id)
    setSaved(next)
    onSavedChange?.(next)
    setAnnounce(`${s.title} ${on ? "added to" : "removed from"} your schedule`)
  }
  const download = () => {
    const url = URL.createObjectURL(new Blob([ics(mine, name, utcOffset)], { type: "text/calendar" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-schedule.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section data-slot="event-1" aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...props}>
      <div className="relative isolate overflow-hidden rounded-3xl border">
        <CoverArt seed={name} variant="mesh" className="absolute inset-0 -z-20 scale-110 saturate-150" />
        <div aria-hidden="true" className="from-background/90 via-background/70 to-background/30 absolute inset-0 -z-10 bg-gradient-to-r rtl:bg-gradient-to-l" />
        <div className="p-6 sm:p-10">
          <p className="bg-background/70 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium backdrop-blur">
            <CalendarDays aria-hidden="true" className="size-4" />
            {rangeFmt.format(Date.parse(`${dates[0]}T00:00:00Z`))}
            {dates[1] !== dates[0] ? ` to ${rangeFmt.format(Date.parse(`${dates[1]}T00:00:00Z`))}` : ""}
          </p>
          <h1 id={`${id}-title`} className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
            {name}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-lg text-pretty">{tagline}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <p className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4" />
              {venue}
            </p>
            {until > 0 ? (
              <p className="flex items-center gap-2 font-medium tabular-nums">
                <Clock aria-hidden="true" className="size-4" />
                {until} {until === 1 ? "day" : "days"} to go
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <div role="tablist" aria-label="Day" className="flex gap-2">
            {days.map((d) => (
              <button key={d} type="button" role="tab" aria-selected={day === d} id={`${id}-tab-${d}`} aria-controls={`${id}-panel`} tabIndex={day === d ? 0 : -1} onClick={() => setDay(d)} onKeyDown={(e) => {
                const i = days.indexOf(d)
                const n = e.key === "ArrowRight" ? days[(i + 1) % days.length] : e.key === "ArrowLeft" ? days[(i - 1 + days.length) % days.length] : null
                if (n) { e.preventDefault(); setDay(n); document.getElementById(`${id}-tab-${n}`)?.focus() }
              }} className={cn("focus-visible:ring-ring/50 rounded-xl border px-4 py-2.5 text-start outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", day === d ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
                <span className="block text-xs opacity-70">Day {days.indexOf(d) + 1}</span>
                <span className="block text-sm font-semibold">{shortFmt.format(Date.parse(`${d}T00:00:00Z`))}</span>
              </button>
            ))}
          </div>

          <div role="group" aria-label="Filter by track" className="mt-5 flex flex-wrap gap-2">
            {[null, ...tracks].map((t) => (
              <button key={t ?? "all"} type="button" aria-pressed={track === t} onClick={() => setTrack(t)} className={cn("focus-visible:ring-ring/50 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", track === t ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
                {t ?? "All tracks"}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${day}`} className="mt-6">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">{dayFmt.format(Date.parse(`${day}T00:00:00Z`))}</h2>
            {shown.length ? (
              <ol className="grid gap-3">
                {shown.map((s) => {
                  const on = saved.includes(s.id)
                  const c = on ? clash(s) : undefined
                  return (
                    <li key={s.id} className={cn("bg-card grid gap-x-5 gap-y-2 rounded-2xl border p-4 transition-colors sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:p-5 motion-reduce:transition-none", on && "border-foreground/40")}>
                      <p className="text-sm font-semibold tabular-nums">
                        {s.start}
                        <span className="text-muted-foreground font-normal"> to {s.end}</span>
                      </p>
                      <div className="min-w-0">
                        <h3 className="font-semibold tracking-tight text-pretty">{s.title}</h3>
                        {s.speakers?.length ? (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {s.speakers.map((p) => p.name).join(", ")}
                            {s.speakers.length === 1 && s.speakers[0]!.role ? ` · ${s.speakers[0]!.role}` : ""}
                          </p>
                        ) : null}
                        {s.description ? <p className="text-muted-foreground mt-2 text-sm text-pretty">{s.description}</p> : null}
                        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className={cn("rounded-full border px-2.5 py-0.5 font-medium", trackTone[tracks.indexOf(s.track) % trackTone.length])}>{s.track}</span>
                          {s.room ? <span className="text-muted-foreground">{s.room}</span> : null}
                        </p>
                        {c ? (
                          <p role="status" className="text-destructive mt-3 flex items-start gap-1.5 text-sm">
                            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                            Overlaps with {c.title} ({c.start} to {c.end})
                          </p>
                        ) : null}
                      </div>
                      <Button variant={on ? "secondary" : "outline"} size="sm" aria-pressed={on} onClick={() => toggle(s)} className="self-start">
                        <Star aria-hidden="true" className={cn(on && "fill-current")} />
                        {on ? "Saved" : "Save"} <span className="sr-only">{s.title}</span>
                      </Button>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="text-muted-foreground rounded-2xl border border-dashed px-6 py-12 text-center text-sm">No sessions on this day for that track. Try All tracks.</p>
            )}
          </div>
        </div>

        <aside aria-labelledby={`${id}-mine`} className="bg-card rounded-2xl border p-5 lg:sticky lg:top-6">
          <h2 id={`${id}-mine`} className="flex items-center gap-2 font-semibold tracking-tight">
            <Star aria-hidden="true" className="size-4" />
            My schedule <span className="text-muted-foreground font-normal tabular-nums">· {mine.length}</span>
          </h2>
          {mine.length ? (
            <>
              <ul className="mt-4 grid gap-3">
                {mine.map((s) => (
                  <li key={s.id} className="text-sm">
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {shortFmt.format(Date.parse(`${s.day}T00:00:00Z`))} · {s.start} to {s.end}
                    </p>
                    <p className="font-medium text-pretty">{s.title}</p>
                  </li>
                ))}
              </ul>
              <Button className="mt-5 w-full" onClick={download}>
                <CalendarArrowDown aria-hidden="true" />
                Add to my calendar
              </Button>
              <p className="text-muted-foreground mt-2 text-xs">Downloads a calendar file with the right times for {venue.split(",").pop()?.trim()}.</p>
            </>
          ) : (
            <p className="text-muted-foreground mt-3 text-sm text-pretty">Press Save on a session to build your own schedule. Overlaps are flagged for you.</p>
          )}
        </aside>
      </div>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Event1, type Event1Props, type Event1Session }
