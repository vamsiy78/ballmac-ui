// Ballmac UI: Booking 1. https://ui.ballmac.com/blocks/booking-1
"use client"

import * as React from "react"
import { CalendarCheck, Clock, Loader2, UserRound } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Booking1Class = {
  id: string
  /** For example "Vinyasa flow". */
  title: string
  /** The kind of class, used by the filter: "Yoga", "Strength", "Cycling". */
  kind: string
  instructor: string
  /** Which day it is on, as the heading should read: "Mon 27 Oct". */
  day: string
  /** Start time, such as "07:00". */
  time: string
  /** For example "45 min". */
  length: string
  capacity: number
  /** Places already taken, not counting you. */
  taken: number
  /** The person using the page has a place. */
  booked?: boolean
  /** The person using the page is on the waiting list. */
  waitlisted?: boolean
}

type Booking1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    classes?: Booking1Class[]
    title?: string
    /** Called to book, join the waiting list, or cancel. Reject and the change is undone with the message. */
    onChange?: (cls: Booking1Class, action: "book" | "waitlist" | "cancel" | "leave") => void | Promise<void>
  }

const sample: Booking1Class[] = [
  { id: "c1", title: "Vinyasa flow", kind: "Yoga", instructor: "Mira Patel", day: "Mon 27 Oct", time: "07:00", length: "45 min", capacity: 16, taken: 11 },
  { id: "c2", title: "Strength basics", kind: "Strength", instructor: "Luca Ferri", day: "Mon 27 Oct", time: "12:15", length: "40 min", capacity: 12, taken: 12 },
  { id: "c3", title: "Spin 45", kind: "Cycling", instructor: "Dana Cole", day: "Mon 27 Oct", time: "18:30", length: "45 min", capacity: 20, taken: 14, booked: true },
  { id: "c4", title: "Yin and stretch", kind: "Yoga", instructor: "Mira Patel", day: "Tue 28 Oct", time: "19:00", length: "60 min", capacity: 16, taken: 15 },
  { id: "c5", title: "Strength basics", kind: "Strength", instructor: "Luca Ferri", day: "Tue 28 Oct", time: "07:30", length: "40 min", capacity: 12, taken: 12, waitlisted: true },
  { id: "c6", title: "Spin 45", kind: "Cycling", instructor: "Dana Cole", day: "Wed 29 Oct", time: "06:45", length: "45 min", capacity: 20, taken: 6 },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6">
      {[0, 1].map((d) => (
        <div key={d} className="grid gap-3">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * A weekly class timetable people can book from: classes grouped by day, places left written out ("3 places left", "Full"), and one button that does the
 * right thing for each class: Book, Join the waiting list, or Cancel. Changes show at once and are undone with the reason if they fail.
 */
function Booking1({ classes: classesProp = sample, title = "Timetable", onChange, state = "ready", onRetry, emptyState, errorState, className, ...props }: Booking1Props) {
  const id = React.useId()
  const [classes, setClasses] = React.useState<Booking1Class[]>(classesProp)
  React.useEffect(() => setClasses(classesProp), [classesProp])
  const [kind, setKind] = React.useState("all")
  const [busy, setBusy] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<{ id: string; ok: boolean; text: string } | null>(null)
  const view = state === "ready" && classes.length === 0 ? "empty" : state
  const kinds = [...new Set(classes.map((c) => c.kind))]
  const shown = classes.filter((c) => kind === "all" || c.kind === kind)
  const days = [...new Set(shown.map((c) => c.day))]
  const mine = classes.filter((c) => c.booked).length
  const left = (c: Booking1Class) => Math.max(0, c.capacity - c.taken - (c.booked ? 1 : 0))

  async function act(c: Booking1Class, action: "book" | "waitlist" | "cancel" | "leave") {
    setBusy(c.id)
    setNote(null)
    const next: Booking1Class = { ...c, booked: action === "book" ? true : action === "cancel" ? false : c.booked, waitlisted: action === "waitlist" ? true : action === "leave" ? false : c.waitlisted }
    setClasses((l) => l.map((x) => (x.id === c.id ? next : x)))
    try {
      await onChange?.(c, action)
      setNote({ id: c.id, ok: true, text: action === "book" ? `You are booked into ${c.title}, ${c.day} at ${c.time}.` : action === "waitlist" ? `You are on the waiting list for ${c.title}. We will email you if a place opens.` : action === "cancel" ? `Your place in ${c.title} is cancelled.` : `You left the waiting list for ${c.title}.` })
    } catch (e) {
      setClasses((l) => l.map((x) => (x.id === c.id ? c : x)))
      setNote({ id: c.id, ok: false, text: e instanceof Error ? e.message : "That did not go through, so nothing changed." })
    } finally {
      setBusy(null)
    }
  }

  return (
    <section data-slot="booking-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p aria-live="polite" className="text-muted-foreground mt-2">{mine === 0 ? "You have no classes booked this week." : `You are booked into ${mine} ${mine === 1 ? "class" : "classes"} this week.`}</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the timetable" loading={<Skel />} empty={{ title: "No classes this week", description: "The timetable for next week is added on Fridays.", ...emptyState }} error={{ title: "The timetable could not be loaded", description: "Nothing was booked or cancelled. Check your connection and try again.", ...errorState }}>
        <div role="group" aria-label="Filter by kind of class" className="mb-6 flex flex-wrap gap-2">
          {["all", ...kinds].map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={cn("focus-visible:ring-ring/50 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", kind === k ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
              {k === "all" ? "All classes" : k}
            </button>
          ))}
        </div>
        <div className="grid gap-8">
          {days.map((d) => (
            <section key={d} aria-label={d}>
              <h2 className="mb-3 text-lg font-semibold tracking-tight">{d}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {shown.filter((c) => c.day === d).sort((a, b) => a.time.localeCompare(b.time)).map((c) => {
                  const spots = left(c)
                  const full = spots === 0 && !c.booked
                  return (
                    <li key={c.id} data-booked={c.booked || undefined} className={cn("bg-card flex flex-col gap-3 rounded-xl border p-4", c.booked && "border-foreground")}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium">{c.title}</p>
                          <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs"><UserRound aria-hidden="true" className="size-3.5" /> {c.instructor}</p>
                        </div>
                        <p className="flex shrink-0 items-center gap-1.5 text-sm font-medium tabular-nums"><Clock aria-hidden="true" className="text-muted-foreground size-3.5" /> {c.time} <span className="text-muted-foreground text-xs font-normal">· {c.length}</span></p>
                      </div>
                      <p className={cn("text-xs tabular-nums", full ? "text-foreground font-medium" : spots <= 3 ? "text-foreground font-medium" : "text-muted-foreground")}>
                        {c.booked ? "You are booked" : c.waitlisted ? "You are on the waiting list" : full ? "Full" : spots <= 3 ? `Only ${spots} ${spots === 1 ? "place" : "places"} left` : `${spots} places left`}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center gap-2">
                        {c.booked ? (
                          <Button size="sm" variant="outline" disabled={busy === c.id} onClick={() => void act(c, "cancel")} aria-label={`Cancel your place in ${c.title}, ${c.day} at ${c.time}`}>
                            {busy === c.id && <Loader2 aria-hidden="true" className="animate-spin" />} Cancel booking
                          </Button>
                        ) : c.waitlisted ? (
                          <Button size="sm" variant="outline" disabled={busy === c.id} onClick={() => void act(c, "leave")} aria-label={`Leave the waiting list for ${c.title}, ${c.day} at ${c.time}`}>
                            Leave waiting list
                          </Button>
                        ) : full ? (
                          <Button size="sm" variant="outline" disabled={busy === c.id} onClick={() => void act(c, "waitlist")} aria-label={`Join the waiting list for ${c.title}, ${c.day} at ${c.time}`}>
                            Join waiting list
                          </Button>
                        ) : (
                          <Button size="sm" disabled={busy === c.id} onClick={() => void act(c, "book")} aria-label={`Book ${c.title}, ${c.day} at ${c.time}`}>
                            {busy === c.id ? <Loader2 aria-hidden="true" className="animate-spin" /> : <CalendarCheck aria-hidden="true" />} Book
                          </Button>
                        )}
                      </div>
                      {note?.id === c.id && <p role={note.ok ? "status" : "alert"} className={cn("text-sm font-medium", !note.ok && "text-destructive")}>{note.text}</p>}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </StateView>
    </section>
  )
}

export { Booking1, type Booking1Class, type Booking1Props }
