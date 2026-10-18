// Ballmac UI: Roster 1. https://ui.ballmac.com/blocks/roster-1
"use client"

import * as React from "react"
import { CalendarOff, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, Loader2, Plus, Send, TriangleAlert, Users } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ballmac/dialog"
import { Input } from "@/components/ballmac/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { useReturnFocus } from "@/lib/ballmac/return-focus"
import { cn } from "@/lib/utils"

type Roster1Person = { id: string; name: string; role: string; /** Most hours a week before it counts as overtime. */ maxHours?: number }
type Roster1Shift = { start: string; end: string; position: string } | { off: true }
type Roster1Position = { id: string; label: string; tone: string }

type Roster1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    staff?: Roster1Person[]
    positions?: Roster1Position[]
    /** Shifts by "personId|2026-10-12". */
    shifts?: Record<string, Roster1Shift>
    /** ISO date of the Monday of the first week. */
    weekStart?: string
    /** How many people each day needs, Monday first. */
    required?: number[]
    /** The least hours between the end of one shift and the start of the next. */
    minRest?: number
    locale?: string
    /** ISO dates of weeks already published. */
    publishedWeeks?: string[]
    onChange?: (key: string, shift: Roster1Shift | null) => void
    /** Called to publish a week to the team. Return a promise; reject to keep it as a draft with the reason. */
    onPublish?: (weekStart: string) => void | Promise<void>
  }

const DAY = 86_400_000
const toT = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const iso = (t: number) => new Date(t).toISOString().slice(0, 10)
const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const hrs = (s: Roster1Shift) => ("off" in s ? 0 : Math.max(0, (mins(s.end) - mins(s.start)) / 60))

const staff0: Roster1Person[] = [
  { id: "p1", name: "Amara Okoye", role: "Barista", maxHours: 40 },
  { id: "p2", name: "Diego Marín", role: "Barista", maxHours: 40 },
  { id: "p3", name: "Mia Laurent", role: "Kitchen", maxHours: 40 },
  { id: "p4", name: "Kofi Mensah", role: "Kitchen", maxHours: 32 },
  { id: "p5", name: "Yuki Tanaka", role: "Front of house", maxHours: 40 },
  { id: "p6", name: "Oliver Reed", role: "Front of house", maxHours: 24 },
]
const positions0: Roster1Position[] = [
  { id: "bar", label: "Bar", tone: "bg-chart-1/15 border-chart-1/40" },
  { id: "kit", label: "Kitchen", tone: "bg-chart-3/15 border-chart-3/40" },
  { id: "foh", label: "Floor", tone: "bg-chart-2/15 border-chart-2/40" },
]
const S = (start: string, end: string, position: string): Roster1Shift => ({ start, end, position })
const shifts0: Record<string, Roster1Shift> = {
  "p1|2026-10-12": S("07:00", "15:00", "bar"), "p1|2026-10-13": S("07:00", "15:00", "bar"), "p1|2026-10-14": S("07:00", "15:00", "bar"), "p1|2026-10-15": S("07:00", "15:00", "bar"), "p1|2026-10-16": S("07:00", "15:00", "bar"),
  "p2|2026-10-12": S("14:00", "22:00", "bar"), "p2|2026-10-13": S("14:00", "22:00", "bar"), "p2|2026-10-14": { off: true }, "p2|2026-10-15": S("14:00", "22:00", "bar"), "p2|2026-10-16": S("14:00", "23:00", "bar"), "p2|2026-10-17": S("12:00", "22:00", "bar"),
  "p3|2026-10-12": S("09:00", "17:00", "kit"), "p3|2026-10-13": S("09:00", "17:00", "kit"), "p3|2026-10-14": S("09:00", "17:00", "kit"), "p3|2026-10-15": S("09:00", "17:00", "kit"), "p3|2026-10-16": S("09:00", "17:00", "kit"), "p3|2026-10-17": S("09:00", "18:00", "kit"),
  "p4|2026-10-12": S("16:00", "23:30", "kit"), "p4|2026-10-13": { off: true }, "p4|2026-10-14": S("16:00", "23:30", "kit"), "p4|2026-10-15": S("16:00", "23:30", "kit"), "p4|2026-10-16": S("08:00", "16:00", "kit"),
  "p5|2026-10-13": S("11:00", "19:00", "foh"), "p5|2026-10-14": S("11:00", "19:00", "foh"), "p5|2026-10-15": S("11:00", "19:00", "foh"), "p5|2026-10-17": S("10:00", "20:00", "foh"), "p5|2026-10-18": S("10:00", "18:00", "foh"),
  "p6|2026-10-16": S("17:00", "23:00", "foh"), "p6|2026-10-17": S("17:00", "23:00", "foh"), "p6|2026-10-18": S("12:00", "18:00", "foh"),
}

function Skel() {
  return (
    <div aria-hidden="true" className="bg-card rounded-2xl border p-5">
      <Skeleton className="h-8 w-60" />
      <Skeleton className="mt-6 h-80" />
    </div>
  )
}

/**
 * A weekly shift roster: a row for each person, a column for each day, each cell a shift you can set, change or mark as time off. Hours are totalled for every
 * person with a flag when they go over their limit or have too little rest between shifts, and a coverage row shows how many people each day has against how
 * many it needs. The week can be paged through, and publishing tells the team and locks nothing until it succeeds.
 */
function Roster1({
  title = "Shift roster",
  staff = staff0,
  positions = positions0,
  shifts: shiftsProp = shifts0,
  weekStart = "2026-10-12",
  required = [3, 3, 3, 4, 4, 5, 4],
  minRest = 11,
  locale = "en",
  publishedWeeks = [],
  onChange,
  onPublish,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Roster1Props) {
  const id = React.useId()
  const [shifts, setShifts] = React.useState(shiftsProp)
  React.useEffect(() => setShifts(shiftsProp), [shiftsProp])
  const [start, setStart] = React.useState(weekStart)
  const [published, setPublished] = React.useState<string[]>(publishedWeeks)
  const [editing, setEditing] = React.useState<{ person: Roster1Person; date: string } | null>(null)
  const [form, setForm] = React.useState({ start: "09:00", end: "17:00", position: positions[0]!.id, off: false })
  const [formError, setFormError] = React.useState<string>()
  const [publishing, setPublishing] = React.useState(false)
  const [publishError, setPublishError] = React.useState<string>()
  const [announce, setAnnounce] = React.useState("")
  const ret = useReturnFocus(!!editing)
  const list = state === "empty" ? [] : staff
  const days = Array.from({ length: 7 }, (_, i) => iso(toT(start) + i * DAY))
  const dayFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }), [locale])
  const numFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }), [locale])
  const isPublished = published.includes(start)
  const pos = (pid: string) => positions.find((p) => p.id === pid) ?? positions[0]!
  const get = (p: Roster1Person, d: string) => shifts[`${p.id}|${d}`]

  const weekHours = (p: Roster1Person) => days.reduce((n, d) => n + (get(p, d) ? hrs(get(p, d)!) : 0), 0)
  // The gap between the end of a shift and the start of the next day's shift.
  const restIssue = (p: Roster1Person, d: string) => {
    const a = get(p, d)
    const next = get(p, iso(toT(d) + DAY))
    if (!a || "off" in a || !next || "off" in next) return null
    const gap = (24 * 60 - mins(a.end) + mins(next.start)) / 60
    return gap < minRest ? gap : null
  }
  const covered = (d: string) => list.filter((p) => { const s = get(p, d); return s && !("off" in s) }).length
  const issues = list.reduce((n, p) => n + (weekHours(p) > (p.maxHours ?? 40) ? 1 : 0) + days.filter((d) => restIssue(p, d) !== null).length, 0) + days.filter((d, i) => covered(d) < (required[i] ?? 0)).length

  function open(p: Roster1Person, d: string) {
    const cur = get(p, d)
    setFormError(undefined)
    setForm(cur && !("off" in cur) ? { start: cur.start, end: cur.end, position: cur.position, off: false } : cur ? { start: "09:00", end: "17:00", position: positions[0]!.id, off: true } : { start: "09:00", end: "17:00", position: positions.find((x) => x.label === p.role || x.id === "bar")?.id ?? positions[0]!.id, off: false })
    setEditing({ person: p, date: d })
  }
  function save(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const key = `${editing.person.id}|${editing.date}`
    if (!form.off && mins(form.end) <= mins(form.start)) return setFormError("The shift has to end after it starts.")
    const next: Roster1Shift = form.off ? { off: true } : { start: form.start, end: form.end, position: form.position }
    setShifts((s) => ({ ...s, [key]: next }))
    onChange?.(key, next)
    setAnnounce(`${editing.person.name}, ${dayFmt.format(toT(editing.date))}: ${form.off ? "time off" : `${form.start} to ${form.end}`}`)
    setEditing(null)
  }
  function clear() {
    if (!editing) return
    const key = `${editing.person.id}|${editing.date}`
    setShifts((s) => { const { [key]: _gone, ...rest } = s; return rest })
    onChange?.(key, null)
    setAnnounce(`${editing.person.name}, ${dayFmt.format(toT(editing.date))}: shift removed`)
    setEditing(null)
  }
  async function publish() {
    setPublishError(undefined)
    setPublishing(true)
    try {
      await onPublish?.(start)
      setPublished((p) => [...p, start])
      setAnnounce("Week published to the team")
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : "The week could not be published. It is still a draft, so try again.")
    } finally {
      setPublishing(false)
    }
  }

  const content = !list.length ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <Users className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No staff on this roster"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm text-pretty">{emptyState?.description ?? "Add the people who work here and you can start planning their weeks."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="bg-card rounded-2xl border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" aria-label="Previous week" onClick={() => setStart(iso(toT(start) - 7 * DAY))}>
            <ChevronLeft aria-hidden="true" className="rtl:rotate-180" />
          </Button>
          <h2 className="min-w-44 px-3 text-center font-semibold tracking-tight tabular-nums">
            {numFmt.format(toT(days[0]!))} to {numFmt.format(toT(days[6]!))}
          </h2>
          <Button variant="outline" size="icon" aria-label="Next week" onClick={() => setStart(iso(toT(start) + 7 * DAY))}>
            <ChevronRight aria-hidden="true" className="rtl:rotate-180" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p role="status" className={cn("flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium", issues ? "border-amber-500/40 bg-amber-500/15" : isPublished && "bg-chart-2/10 border-chart-2/30")}>
            {issues ? <TriangleAlert aria-hidden="true" className="size-4" /> : <CircleCheck aria-hidden="true" className="size-4" />}
            {issues ? `${issues} ${issues === 1 ? "thing needs" : "things need"} a look` : "No problems found"}
          </p>
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">{isPublished ? "Published" : "Draft"}</p>
        </div>
      </div>

      <div role="region" tabIndex={0} aria-label="Roster grid" className="focus-visible:ring-ring/50 relative overflow-x-auto outline-none focus-visible:ring-[3px] focus-visible:ring-inset">
        <table className="w-full min-w-[56rem] border-collapse text-sm">
          <caption className="sr-only">Shifts for each person for the week of {numFmt.format(toT(start))}</caption>
          <thead>
            <tr className="text-muted-foreground">
              <th scope="col" className="w-52 px-5 py-3 text-start font-medium">Team</th>
              {days.map((d, i) => (
                <th key={d} scope="col" className="px-1 py-3 text-center font-medium">
                  <span className="block text-xs">{dayFmt.format(toT(d))}</span>
                  <span className={cn("text-foreground block tabular-nums", i > 4 && "text-muted-foreground")}>{numFmt.format(toT(d))}</span>
                </th>
              ))}
              <th scope="col" className="px-5 py-3 text-end font-medium">Hours</th>
            </tr>
          </thead>
          <tbody className="border-t">
            {list.map((p) => {
              const h = weekHours(p)
              const over = h > (p.maxHours ?? 40)
              return (
                <tr key={p.id} className="border-b">
                  <th scope="row" className="px-5 py-2.5 text-start font-normal">
                    <span className="flex items-center gap-3">
                      <span aria-hidden="true" className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border text-xs font-semibold">
                        <CoverArt seed={p.name} variant="mesh" className="absolute inset-0" />
                        <span className="relative">{p.name.split(" ").map((w) => w[0]).join("")}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{p.name}</span>
                        <span className="text-muted-foreground block text-xs">{p.role}</span>
                      </span>
                    </span>
                  </th>
                  {days.map((d) => {
                    const s = get(p, d)
                    const rest = restIssue(p, d)
                    const label = `${p.name}, ${dayFmt.format(toT(d))} ${numFmt.format(toT(d))}`
                    return (
                      <td key={d} className="px-1 py-1.5 align-top">
                        {s ? (
                          <button type="button" onClick={() => open(p, d)} aria-label={`${label}: ${"off" in s ? "time off" : `${s.start} to ${s.end}, ${pos(s.position).label}`}${rest !== null ? `, only ${rest.toFixed(1)} hours before the next shift` : ""}. Edit`} className={cn("focus-visible:ring-ring/50 relative block h-14 w-full min-w-[6.25rem] rounded-lg border px-2 py-1.5 text-start outline-none focus-visible:ring-[3px]", "off" in s ? "bg-muted/50 text-muted-foreground border-dashed" : pos(s.position).tone, rest !== null && "ring-1 ring-amber-500")}>
                            {"off" in s ? (
                              <span className="flex h-full items-center gap-1.5 text-xs font-medium">
                                <CalendarOff aria-hidden="true" className="size-3.5" />
                                Time off
                              </span>
                            ) : (
                              <>
                                <span className="block text-xs font-semibold tabular-nums">
                                  {s.start} to {s.end}
                                </span>
                                <span className="text-muted-foreground block text-[11px]">{pos(s.position).label} · {hrs(s)} h</span>
                              </>
                            )}
                            {rest !== null ? <TriangleAlert aria-hidden="true" className="absolute end-1.5 bottom-1.5 size-3.5 text-amber-600 dark:text-amber-400" /> : null}
                          </button>
                        ) : (
                          <button type="button" onClick={() => open(p, d)} aria-label={`${label}: no shift. Add one`} className="text-muted-foreground hover:bg-accent focus-visible:ring-ring/50 flex h-14 w-full min-w-[6.25rem] items-center justify-center rounded-lg border border-dashed outline-none focus-visible:ring-[3px]">
                            <Plus aria-hidden="true" className="size-4" />
                          </button>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-5 py-2.5 text-end tabular-nums">
                    <span className={cn("font-semibold", over && "text-amber-700 dark:text-amber-400")}>{h} h</span>
                    <span className="text-muted-foreground block text-xs">{over ? `${h - (p.maxHours ?? 40)} h over ${p.maxHours ?? 40}` : `of ${p.maxHours ?? 40}`}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className="px-5 py-3 text-start font-semibold">Covered</th>
              {days.map((d, i) => {
                const c = covered(d)
                const need = required[i] ?? 0
                const short = c < need
                return (
                  <td key={d} className="px-1 py-3 text-center">
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums", short ? "border-amber-500/40 bg-amber-500/15" : "bg-chart-2/10 border-chart-2/30")}>
                      {short ? <CircleAlert aria-hidden="true" className="size-3" /> : <CircleCheck aria-hidden="true" className="size-3" />}
                      {c} of {need}
                      <span className="sr-only">{short ? `, short by ${need - c}` : ", covered"}</span>
                    </span>
                  </td>
                )
              })}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-4 sm:px-5">
        <ul aria-label="Positions" className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          {positions.map((p) => (
            <li key={p.id} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={cn("size-3.5 rounded border", p.tone)} />
              {p.label}
            </li>
          ))}
        </ul>
        {isPublished ? (
          <p className="text-muted-foreground text-sm">Everyone has been told about this week.</p>
        ) : (
          <Button onClick={() => void publish()} disabled={publishing}>
            {publishing ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Send aria-hidden="true" className="rtl:-scale-x-100" />}
            {publishing ? "Publishing" : "Publish week"}
          </Button>
        )}
      </div>
      {publishError ? (
        <p role="alert" className="text-destructive flex items-start gap-2 border-t px-5 py-3 text-sm">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {publishError}
        </p>
      ) : null}
    </div>
  )

  return (
    <section data-slot="roster-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <h1 id={`${id}-title`} className="mb-6 text-3xl font-semibold tracking-[-0.035em] text-balance">
        {title}
      </h1>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the roster" loading={<Skel />} error={{ title: errorState?.title ?? "The roster could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent {...ret}>
          <form onSubmit={save} noValidate>
            <DialogHeader>
              <DialogTitle>{editing ? `${editing.person.name}, ${dayFmt.format(toT(editing.date))} ${numFmt.format(toT(editing.date))}` : "Shift"}</DialogTitle>
              <DialogDescription>Set the hours, or mark the day as time off.</DialogDescription>
            </DialogHeader>
            <div className="mt-5 grid gap-4">
              <label className="flex items-center gap-2.5 text-sm font-medium">
                <input type="checkbox" checked={form.off} onChange={(e) => setForm({ ...form, off: e.target.checked })} className="accent-foreground size-4" />
                Time off
              </label>
              {!form.off ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`${id}-s`} className="text-muted-foreground mb-1.5 block text-xs font-medium">Starts</label>
                    <Input id={`${id}-s`} type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor={`${id}-e`} className="text-muted-foreground mb-1.5 block text-xs font-medium">Ends</label>
                    <Input id={`${id}-e`} type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <p id={`${id}-p`} className="text-muted-foreground mb-1.5 text-xs font-medium">Position</p>
                    <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                      <SelectTrigger aria-labelledby={`${id}-p`} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}
              {formError ? (
                <p role="alert" className="text-destructive text-sm">
                  {formError}
                </p>
              ) : null}
            </div>
            <DialogFooter className="mt-6">
              {editing && get(editing.person, editing.date) ? (
                <Button type="button" variant="ghost" onClick={clear} className="me-auto">
                  Remove shift
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Roster1, type Roster1Props, type Roster1Person, type Roster1Shift, type Roster1Position }
