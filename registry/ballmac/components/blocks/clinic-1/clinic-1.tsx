// Ballmac UI: Clinic 1. https://ui.ballmac.com/blocks/clinic-1
"use client"

import * as React from "react"
import { Check, DoorOpen, Eye, EyeOff, UserCheck, UserX } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Clinic1Status = "booked" | "arrived" | "in-room" | "done" | "no-show"

type Clinic1Appointment = {
  id: string
  /** Which provider's column it is in. */
  providerId: string
  /** Minutes after the first slot, in steps of 15. */
  start: number
  /** Length in minutes. */
  length: number
  patient: string
  /** For example "Follow-up" or "New patient". */
  reason: string
  status: Clinic1Status
}

type Clinic1Provider = { id: string; name: string; role?: string }

type Clinic1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    providers?: Clinic1Provider[]
    appointments?: Clinic1Appointment[]
    title?: string
    /** Label for the day, such as "Friday 24 October". */
    day?: string
    /** The first slot, in 24-hour time, such as "08:00". */
    firstSlot?: string
    /** How many 15-minute slots the day has. */
    slots?: number
    /** Show patients as initials only. Useful on a screen the waiting room can see. */
    defaultPrivate?: boolean
    /** Called when the front desk moves a patient on: arrived, in room, done or no-show. */
    onStatus?: (appointment: Clinic1Appointment, status: Clinic1Status) => void | Promise<void>
  }

const providers: Clinic1Provider[] = [
  { id: "p1", name: "Dr. Amara Okafor", role: "General practice" },
  { id: "p2", name: "Dr. Jonas Weber", role: "General practice" },
  { id: "p3", name: "Nurse Lina Rossi", role: "Vaccinations" },
]
const appts: Clinic1Appointment[] = [
  { id: "a1", providerId: "p1", start: 0, length: 30, patient: "Maria Lopez", reason: "Follow-up", status: "done" },
  { id: "a2", providerId: "p1", start: 30, length: 30, patient: "Ken Watanabe", reason: "Blood pressure check", status: "in-room" },
  { id: "a3", providerId: "p1", start: 75, length: 45, patient: "Fatima Zahra", reason: "New patient", status: "arrived" },
  { id: "a4", providerId: "p1", start: 150, length: 30, patient: "Oscar Lindqvist", reason: "Follow-up", status: "booked" },
  { id: "a5", providerId: "p2", start: 15, length: 30, patient: "Grace Mbeki", reason: "Test results", status: "done" },
  { id: "a6", providerId: "p2", start: 60, length: 30, patient: "Ivan Petrov", reason: "Back pain", status: "no-show" },
  { id: "a7", providerId: "p2", start: 105, length: 30, patient: "Chloe Martin", reason: "Prescription", status: "booked" },
  { id: "a8", providerId: "p3", start: 0, length: 15, patient: "Noah Kim", reason: "Flu vaccine", status: "done" },
  { id: "a9", providerId: "p3", start: 30, length: 15, patient: "Sofia Alves", reason: "Flu vaccine", status: "arrived" },
  { id: "a10", providerId: "p3", start: 60, length: 15, patient: "Yusuf Demir", reason: "Travel vaccine", status: "booked" },
]

const STATUS: Record<Clinic1Status, { label: string; tone: string }> = {
  booked: { label: "Booked", tone: "bg-card" },
  arrived: { label: "Arrived", tone: "bg-chart-3/15 border-chart-3/50" },
  "in-room": { label: "In room", tone: "bg-chart-1/15 border-chart-1/50" },
  done: { label: "Done", tone: "bg-muted/60 text-muted-foreground" },
  "no-show": { label: "No-show", tone: "border-destructive/50 border-dashed bg-destructive/5" },
}
const NEXT: { to: Clinic1Status; label: string; icon: typeof Check; when: Clinic1Status[] }[] = [
  { to: "arrived", label: "Mark arrived", icon: UserCheck, when: ["booked"] },
  { to: "in-room", label: "Send to room", icon: DoorOpen, when: ["arrived"] },
  { to: "done", label: "Mark done", icon: Check, when: ["in-room"] },
  { to: "no-show", label: "Mark no-show", icon: UserX, when: ["booked", "arrived"] },
]

const SLOT = 44
const clock = (first: string, minutes: number) => {
  const [h, m] = first.split(":").map(Number)
  const t = h * 60 + m + minutes
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`
}
const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).join(".").toUpperCase() + "."

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-3 md:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-96 rounded-xl" />
      ))}
    </div>
  )
}

/**
 * A clinic's day: a column for each provider and a row for every quarter hour, each appointment at its real time and length, with the status written out
 * (booked, arrived, in room, done, no-show) and one button to move a patient on. A privacy switch shows initials only, for a screen the waiting room can see.
 */
function Clinic1({ providers: provs = providers, appointments: apptsProp = appts, title = "Today's schedule", day = "Friday 24 October", firstSlot = "08:00", slots = 12, defaultPrivate = false, onStatus, state = "ready", onRetry, emptyState, errorState, className, ...props }: Clinic1Props) {
  const id = React.useId()
  const [list, setList] = React.useState<Clinic1Appointment[]>(apptsProp)
  React.useEffect(() => setList(apptsProp), [apptsProp])
  const [priv, setPriv] = React.useState(defaultPrivate)
  const [sel, setSel] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<{ ok: boolean; text: string } | null>(null)
  const view = state === "ready" && list.length === 0 ? "empty" : state
  const chosen = list.find((a) => a.id === sel)
  const who = (a: Clinic1Appointment) => (priv ? initials(a.patient) : a.patient)
  const counts = (s: Clinic1Status) => list.filter((a) => a.status === s).length
  const hours = Array.from({ length: slots }, (_, i) => clock(firstSlot, i * 15))

  async function move(a: Clinic1Appointment, to: Clinic1Status) {
    setNote(null)
    const before = a
    setList((l) => l.map((x) => (x.id === a.id ? { ...x, status: to } : x)))
    try {
      await onStatus?.(a, to)
      setNote({ ok: true, text: `${who(a)} is now ${STATUS[to].label.toLowerCase()}.` })
    } catch (e) {
      setList((l) => l.map((x) => (x.id === a.id ? before : x)))
      setNote({ ok: false, text: e instanceof Error ? e.message : `${who(a)} could not be updated, so it is as it was.` })
    }
  }

  return (
    <section data-slot="clinic-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2">{day}</p>
        </div>
        {view === "ready" && (
          <Button variant="outline" aria-pressed={priv} onClick={() => setPriv((v) => !v)}>
            {priv ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />} {priv ? "Initials only" : "Show full names"}
          </Button>
        )}
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the schedule" loading={<Skel />} empty={{ title: "No appointments today", description: "Booked appointments will appear in each provider's column.", ...emptyState }} error={{ title: "The schedule could not be loaded", description: "No appointment was changed. Check your connection and try again.", ...errorState }}>
        <p aria-live="polite" className="text-muted-foreground mb-4 text-sm tabular-nums">
          {counts("arrived")} waiting · {counts("in-room")} in a room · {counts("done")} done · {counts("booked")} still to come{counts("no-show") ? ` · ${counts("no-show")} no-show` : ""}
        </p>
        <div className="overflow-x-auto rounded-xl border">
          <div className="grid min-w-[44rem]" style={{ gridTemplateColumns: `4rem repeat(${provs.length}, minmax(0, 1fr))` }}>
            <div className="bg-muted/40 border-b" />
            {provs.map((p) => (
              <div key={p.id} className="bg-muted/40 border-s border-b px-3 py-2.5">
                <p className="text-sm font-medium">{p.name}</p>
                {p.role && <p className="text-muted-foreground text-xs">{p.role}</p>}
              </div>
            ))}
            <div>
              {hours.map((h, i) => (
                <div key={h} className={cn("text-muted-foreground flex items-start justify-end pe-2 font-mono text-[11px] tabular-nums", i % 4 !== 0 && "opacity-0")} style={{ height: SLOT }} dir="ltr" aria-hidden="true">
                  {h}
                </div>
              ))}
            </div>
            {provs.map((p) => (
              <div key={p.id} role="group" aria-label={`${p.name}, appointments`} className="relative border-s" style={{ height: slots * SLOT }}>
                {hours.map((h, i) => (
                  <span key={h} aria-hidden="true" className={cn("absolute inset-x-0 border-t", i % 4 === 0 ? "border-border" : "border-border/40")} style={{ top: i * SLOT }} />
                ))}
                {list.filter((a) => a.providerId === p.id).map((a) => {
                  const st = STATUS[a.status]
                  const on = sel === a.id
                  return (
                    <button
                      key={a.id}
                      type="button"
                      data-status={a.status}
                      aria-pressed={on}
                      aria-label={`${clock(firstSlot, a.start)} to ${clock(firstSlot, a.start + a.length)}, ${who(a)}, ${a.reason}, ${st.label}`}
                      onClick={() => { setSel(on ? null : a.id); setNote(null) }}
                      className={cn("focus-visible:ring-ring/50 absolute inset-x-1 flex flex-col overflow-hidden rounded-lg border px-2 py-1 text-start text-xs outline-none transition-shadow focus-visible:z-10 focus-visible:ring-[3px] motion-reduce:transition-none", st.tone, on && "ring-foreground/70 z-10 ring-2")}
                      style={{ top: (a.start / 15) * SLOT + 2, height: (a.length / 15) * SLOT - 4 }}
                    >
                      <span className="truncate font-medium">{who(a)}</span>
                      {a.length >= 30 && <span className="text-muted-foreground truncate">{a.reason}</span>}
                      <span className="mt-auto truncate font-medium">{st.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div aria-live="polite" className="bg-card mt-4 min-h-[5rem] rounded-xl border p-4">
          {chosen ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{who(chosen)} <span className="text-muted-foreground font-normal">· {chosen.reason}</span></p>
                <p className="text-muted-foreground text-sm tabular-nums">{clock(firstSlot, chosen.start)} to {clock(firstSlot, chosen.start + chosen.length)} · {provs.find((p) => p.id === chosen.providerId)?.name} · {STATUS[chosen.status].label}</p>
                {note && <p role={note.ok ? "status" : "alert"} className={cn("mt-1 text-sm font-medium", !note.ok && "text-destructive")}>{note.text}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {NEXT.filter((n) => n.when.includes(chosen.status)).map((n) => (
                  <Button key={n.to} size="sm" variant={n.to === "no-show" ? "outline" : "default"} onClick={() => void move(chosen, n.to)}>
                    <n.icon aria-hidden="true" /> {n.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Select an appointment to move the patient on.</p>
          )}
        </div>
      </StateView>
    </section>
  )
}

export { Clinic1, type Clinic1Props, type Clinic1Appointment, type Clinic1Provider, type Clinic1Status }
