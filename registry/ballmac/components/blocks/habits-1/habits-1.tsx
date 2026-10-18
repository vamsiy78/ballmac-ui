// Ballmac UI: Habits 1. https://ui.ballmac.com/blocks/habits-1
"use client"

import * as React from "react"
import { Check, CircleAlert, Flame, Plus, Sprout, Trophy } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Habits1Habit = {
  id: string
  name: string
  /** How many days a week is the goal. */
  target: number
  /** ISO dates it was done. */
  done: string[]
  /** One of the five chart colors, 1 to 5. */
  tone?: 1 | 2 | 3 | 4 | 5
}

type Habits1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    habits?: Habits1Habit[]
    /** An ISO date for "today". The block never reads the clock. */
    today?: string
    title?: string
    locale?: string
    /** Called when a day is ticked or unticked. Return a promise; reject and the day goes back with a message. */
    onToggle?: (habitId: string, date: string, done: boolean) => void | Promise<void>
    onAdd?: (habit: { name: string; target: number }) => void | Promise<void>
  }

const DAY = 86_400_000
const toT = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const iso = (t: number) => new Date(t).toISOString().slice(0, 10)

// A believable history without any randomness, so the server and the browser draw the same grid.
const hist = (today: string, every: number, offset: number, upTo: number): string[] => Array.from({ length: 84 }, (_, i) => i).filter((i) => i >= upTo && (i * 7 + offset) % every !== 0 && (i * 3 + offset) % 5 !== 0).map((i) => iso(toT(today) - i * DAY))
const sample = (today: string): Habits1Habit[] => [
  { id: "h1", name: "Read for 20 minutes", target: 5, done: hist(today, 9, 2, 0), tone: 1 },
  { id: "h2", name: "Walk 8,000 steps", target: 6, done: hist(today, 7, 1, 1), tone: 2 },
  { id: "h3", name: "Write three lines", target: 7, done: hist(today, 4, 3, 2), tone: 3 },
  { id: "h4", name: "No screens after 22:00", target: 5, done: hist(today, 6, 0, 0).filter((_, k) => k % 2 === 0 || k > 30), tone: 4 },
]

const tones = ["", "bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4">
      <Skeleton className="h-28 rounded-2xl" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-44 rounded-2xl" />
      ))}
    </div>
  )
}

// A streak is the run of days ending today, or ending yesterday if today is not done yet, so it is not lost until the day is over.
function streakOf(done: Set<string>, today: string) {
  let t = toT(today)
  if (!done.has(iso(t))) t -= DAY
  let n = 0
  while (done.has(iso(t))) { n++; t -= DAY }
  return n
}
function bestOf(done: Set<string>) {
  const days = [...done].map(toT).sort((a, b) => a - b)
  let best = 0
  let run = 0
  days.forEach((d, i) => { run = i && d - days[i - 1]! === DAY ? run + 1 : 1; best = Math.max(best, run) })
  return best
}

/**
 * A habit tracker: each habit shows its streak (kept alive until today is over), its best streak, this week against its goal, the last seven days to tick or untick,
 * and twelve weeks as a grid. The ring at the top counts what is done today. A tick is counted at once and goes back, with the reason, if it cannot be saved.
 */
function Habits1({ habits: habitsProp, today = "2026-10-18", title = "Habits", locale = "en", onToggle, onAdd, state = "ready", onRetry, emptyState, errorState, className, ...props }: Habits1Props) {
  const id = React.useId()
  const [habits, setHabits] = React.useState<Habits1Habit[]>(() => habitsProp ?? sample(today))
  React.useEffect(() => { if (habitsProp) setHabits(habitsProp) }, [habitsProp])
  const list = state === "empty" ? [] : habits
  const [error, setError] = React.useState<{ id: string; text: string } | null>(null)
  const [name, setName] = React.useState("")
  const [target, setTarget] = React.useState(5)
  const [announce, setAnnounce] = React.useState("")
  const dayFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" }), [locale])
  const longFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }), [locale])
  const last7 = Array.from({ length: 7 }, (_, i) => iso(toT(today) - (6 - i) * DAY))
  // Weeks run Monday to Sunday; "this week" is the Monday on or before today up to today.
  const dow = (new Date(toT(today)).getUTCDay() + 6) % 7
  const weekDays = Array.from({ length: dow + 1 }, (_, i) => iso(toT(today) - i * DAY))
  const doneToday = list.filter((h) => h.done.includes(today)).length

  async function toggle(h: Habits1Habit, date: string) {
    const on = !h.done.includes(date)
    const before = habits
    setError(null)
    setHabits((hs) => hs.map((x) => (x.id === h.id ? { ...x, done: on ? [...x.done, date] : x.done.filter((d) => d !== date) } : x)))
    setAnnounce(`${h.name}, ${longFmt.format(toT(date))}: ${on ? "done" : "not done"}`)
    try {
      await onToggle?.(h.id, date, on)
    } catch (e) {
      setHabits(before)
      setError({ id: h.id, text: e instanceof Error ? e.message : `That change was not saved, so ${longFmt.format(toT(date))} went back.` })
    }
  }
  async function add(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    const h: Habits1Habit = { id: `n${habits.length}${n.length}`, name: n, target, done: [], tone: ((habits.length % 5) + 1) as 1 | 2 | 3 | 4 | 5 }
    setHabits((hs) => [...hs, h])
    setName("")
    try { await onAdd?.({ name: n, target }) } catch { setHabits((hs) => hs.filter((x) => x.id !== h.id)); setError({ id: "new", text: "The habit could not be added, so it was taken out again." }) }
  }

  const content = !list.length ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <Sprout className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No habits yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm text-pretty">{emptyState?.description ?? "Pick one small thing to do most days. A streak starts with the first tick."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="grid gap-5">
      <div className="bg-card flex flex-wrap items-center gap-6 rounded-3xl border p-5 sm:p-7">
        <div className="relative">
          <svg aria-hidden="true" viewBox="0 0 100 100" className="size-24 -rotate-90 rtl:rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-muted" />
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 * (1 - doneToday / list.length)} className="stroke-foreground transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold tabular-nums">
            {doneToday}/{list.length}
          </span>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">{longFmt.format(toT(today))}</p>
          <p className="text-xl font-semibold tracking-tight text-balance">{doneToday === list.length ? "Every habit done today" : doneToday ? `${list.length - doneToday} to go today` : "Nothing ticked yet today"}</p>
        </div>
      </div>

      <ul className="grid gap-4">
        {list.map((h) => {
          const set = new Set(h.done)
          const streak = streakOf(set, today)
          const best = Math.max(bestOf(set), streak)
          const week = weekDays.filter((d) => set.has(d)).length
          const hit = week >= h.target
          const dot = tones[h.tone ?? 1]
          return (
            <li key={h.id} className="bg-card rounded-2xl border p-5 sm:p-6">
              <article aria-labelledby={`${id}-${h.id}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 id={`${id}-${h.id}`} className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
                      <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-full", dot)} />
                      {h.name}
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm tabular-nums">
                      {week} of {h.target} this week{hit ? ", goal reached" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm tabular-nums">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <Flame aria-hidden="true" className={cn("size-5", streak ? "text-orange-500" : "text-muted-foreground")} />
                      {streak} {streak === 1 ? "day" : "days"}
                      <span className="sr-only"> streak</span>
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1.5">
                      <Trophy aria-hidden="true" className="size-4" />
                      Best {best}
                    </p>
                  </div>
                </div>

                <ol aria-label={`Last seven days of ${h.name}`} className="mt-5 grid grid-cols-7 gap-2">
                  {last7.map((d) => {
                    const on = set.has(d)
                    return (
                      <li key={d} className="text-center">
                        <span aria-hidden="true" className="text-muted-foreground mb-1.5 block text-xs">
                          {dayFmt.format(toT(d))}
                        </span>
                        <button type="button" role="checkbox" aria-checked={on} aria-label={`${h.name}, ${longFmt.format(toT(d))}${d === today ? ", today" : ""}`} onClick={() => void toggle(h, d)} className={cn("focus-visible:ring-ring/60 mx-auto flex size-10 items-center justify-center rounded-full border-2 outline-none transition-[transform,background-color] focus-visible:ring-[3px] active:scale-90 motion-reduce:transition-none sm:size-11", on ? cn("border-transparent text-white", dot) : "hover:bg-accent", d === today && !on && "border-foreground")}>
                          {on ? <Check aria-hidden="true" className="size-5" /> : null}
                        </button>
                      </li>
                    )
                  })}
                </ol>

                <div dir="ltr" role="img" aria-label={`Twelve weeks: done on ${h.done.filter((d) => toT(today) - toT(d) < 84 * DAY && toT(d) <= toT(today)).length} of the last 84 days`} className="mt-5 grid w-fit grid-flow-col grid-rows-[repeat(7,0.875rem)] auto-cols-[0.875rem] gap-[3px]">
                  {Array.from({ length: 84 }, (_, i) => {
                    const col = Math.floor(i / 7)
                    const row = i % 7
                    // Oldest on the left; the last column is the current week with its days from Monday.
                    const dayIndex = (11 - col) * 7 + (dow - row)
                    const d = iso(toT(today) - dayIndex * DAY)
                    const future = dayIndex < 0
                    return <span key={i} className={cn("size-3.5 rounded-[3px]", future ? "bg-transparent" : set.has(d) ? dot : "bg-muted")} />
                  })}
                </div>
                {error?.id === h.id ? (
                  <p role="alert" className="text-destructive mt-3 flex items-start gap-2 text-sm">
                    <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    {error.text}
                  </p>
                ) : null}
              </article>
            </li>
          )
        })}
      </ul>

      <form onSubmit={add} className="bg-muted/30 flex flex-wrap items-end gap-3 rounded-2xl border border-dashed p-4 sm:p-5">
        <div className="min-w-48 flex-1">
          <label htmlFor={`${id}-n`} className="text-muted-foreground mb-1.5 block text-xs font-medium">New habit</label>
          <Input id={`${id}-n`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Stretch for ten minutes" />
        </div>
        <div>
          <label htmlFor={`${id}-t`} className="text-muted-foreground mb-1.5 block text-xs font-medium">Days a week</label>
          <select id={`${id}-t`} value={target} onChange={(e) => setTarget(Number(e.target.value))} className="bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="outline" disabled={!name.trim()}>
          <Plus aria-hidden="true" />
          Add habit
        </Button>
        {error?.id === "new" ? (
          <p role="alert" className="text-destructive w-full text-sm">
            {error.text}
          </p>
        ) : null}
      </form>
    </div>
  )

  return (
    <section data-slot="habits-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-3xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <h1 id={`${id}-title`} className="mb-6 text-3xl font-semibold tracking-[-0.035em] text-balance">
        {title}
      </h1>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading your habits" loading={<Skel />} error={{ title: errorState?.title ?? "Your habits could not be loaded", description: errorState?.description ?? "Nothing was lost. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Habits1, type Habits1Props, type Habits1Habit }
