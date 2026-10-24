// Ballmac UI: On-call 1. https://ui.ballmac.com/blocks/oncall-1
"use client"

import * as React from "react"
import { ArrowRightLeft, CircleAlert, PhoneCall, UserRoundCheck } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Oncall1Day = {
  /** Short label for the column, such as "Mon 20". */
  label: string
  /** Full text for assistive technology, such as "Monday 20 October". */
  full: string
}

type Oncall1Layer = {
  id: string
  /** Primary, Secondary, Escalation. */
  name: string
  /** Who is on call each day, in the same order as the days. null means nobody. */
  people: (string | null)[]
}

type Oncall1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    days?: Oncall1Day[]
    layers?: Oncall1Layer[]
    title?: string
    /** Which day is today, as an index into days. */
    todayIndex?: number
    /** The hour the rota hands over, shown as text. */
    handover?: string
    /** The person using the page, so "Take this shift" and "Request a swap" make sense. */
    me?: string
    /** Called when someone takes an uncovered or other person's shift. */
    onTake?: (shift: { layer: string; day: string }) => void | Promise<void>
    /** Called when someone asks to swap a shift with the person on it. */
    onRequestSwap?: (shift: { layer: string; day: string; person: string }) => void | Promise<void>
  }

const days: Oncall1Day[] = [
  { label: "Mon 20", full: "Monday 20 October" },
  { label: "Tue 21", full: "Tuesday 21 October" },
  { label: "Wed 22", full: "Wednesday 22 October" },
  { label: "Thu 23", full: "Thursday 23 October" },
  { label: "Fri 24", full: "Friday 24 October" },
  { label: "Sat 25", full: "Saturday 25 October" },
  { label: "Sun 26", full: "Sunday 26 October" },
]
const sample: Oncall1Layer[] = [
  { id: "primary", name: "Primary", people: ["Priya Shah", "Priya Shah", "Theo Nakamura", "Theo Nakamura", "Theo Nakamura", "Kofi Mensah", "Kofi Mensah"] },
  { id: "secondary", name: "Secondary", people: ["Noor Haddad", "Noor Haddad", "Noor Haddad", "Ana Souza", "Ana Souza", null, "Oliver Reed"] },
]

const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
/** The same person always gets the same one of five colours, so a run of days reads as one shift. Names are always written too. */
const TINTS = ["bg-chart-1/15 border-chart-1/40", "bg-chart-2/15 border-chart-2/40", "bg-chart-3/15 border-chart-3/40", "bg-chart-4/15 border-chart-4/40", "bg-chart-5/15 border-chart-5/40"]
const tint = (n: string) => TINTS[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-3">
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-52 rounded-xl" />
    </div>
  )
}

/**
 * An on-call rota for the week: a row per layer (primary, secondary), a column per day, who is on call now at the top, and any day nobody covers called out
 * in words. Select a shift to take it, or to ask the person on it for a swap.
 */
function Oncall1({ days: daysProp = days, layers = sample, title = "On-call this week", todayIndex = 4, handover = "09:00", me = "Priya Shah", onTake, onRequestSwap, state = "ready", onRetry, emptyState, errorState, className, ...props }: Oncall1Props) {
  const id = React.useId()
  const [picked, setPicked] = React.useState<{ layer: number; day: number } | null>(null)
  const [note, setNote] = React.useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = React.useState(false)
  const view = state === "ready" && layers.length === 0 ? "empty" : state

  const gaps = layers.flatMap((l) => l.people.map((p, d) => (p ? null : { layer: l.name, day: daysProp[d] }))).filter(Boolean) as { layer: string; day: Oncall1Day }[]
  const now = layers.map((l) => ({ name: l.name, person: l.people[todayIndex] ?? null }))
  const sel = picked ? { layer: layers[picked.layer], day: daysProp[picked.day], person: layers[picked.layer].people[picked.day] } : null

  async function run(kind: "take" | "swap") {
    if (!sel) return
    setBusy(true)
    setNote(null)
    try {
      if (kind === "take") await onTake?.({ layer: sel.layer.name, day: sel.day.full })
      else await onRequestSwap?.({ layer: sel.layer.name, day: sel.day.full, person: sel.person ?? "" })
      setNote({ ok: true, text: kind === "take" ? `You are now ${sel.layer.name.toLowerCase()} on ${sel.day.full}.` : `Swap request sent to ${sel.person}.` })
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : "That did not go through. Nothing was changed." })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section data-slot="oncall-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-pretty">Who gets the page, day by day. The rota hands over at {handover}.</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the rota" loading={<Skel />} empty={{ title: "No rota yet", description: "Add a primary layer and the people who share it, and this week will fill in.", ...emptyState }} error={{ title: "The rota could not be loaded", description: "Nobody was changed. Check your connection and try again.", ...errorState }}>
        <div className="bg-card rounded-xl border p-4 sm:p-5">
          <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
            <PhoneCall aria-hidden="true" className="size-3.5" /> On call now
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {now.map((n) => (
              <li key={n.name} className="flex items-center gap-3">
                <span aria-hidden="true" className={cn("flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold", n.person ? tint(n.person) : "border-destructive/50 text-destructive")}>{n.person ? initials(n.person) : "?"}</span>
                <span className="min-w-0">
                  <span className="text-muted-foreground block text-xs">{n.name}</span>
                  <span className={cn("block truncate font-medium", !n.person && "text-destructive")}>{n.person ?? "Nobody"}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {gaps.length > 0 && (
          <p role="status" className="border-destructive/40 bg-destructive/5 mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm">
            <CircleAlert aria-hidden="true" className="text-destructive mt-0.5 size-4 shrink-0" />
            <span>
              <strong>{gaps.length === 1 ? "1 shift has" : `${gaps.length} shifts have`} no one on call:</strong> {gaps.map((g) => `${g.layer} on ${g.day.full}`).join(", ")}.
            </span>
          </p>
        )}

        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <caption className="sr-only">{title}</caption>
            <thead className="bg-muted/40 text-xs">
              <tr>
                <th scope="col" className="w-28 px-3 py-2.5 text-start font-medium"><span className="sr-only">Layer</span></th>
                {daysProp.map((d, i) => (
                  <th key={d.full} scope="col" aria-label={d.full} className={cn("px-2 py-2.5 text-center font-medium", i === todayIndex ? "text-foreground" : "text-muted-foreground")}>
                    {d.label}
                    {i === todayIndex && <span className="bg-foreground text-background ms-1.5 rounded px-1 py-px text-[10px]">Today</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {layers.map((l, li) => (
                <tr key={l.id}>
                  <th scope="row" className="px-3 py-3 text-start font-medium">{l.name}</th>
                  {l.people.map((p, di) => {
                    const on = picked?.layer === li && picked.day === di
                    return (
                      <td key={di} className={cn("p-1.5", di === todayIndex && "bg-muted/30")}>
                        <button
                          type="button"
                          aria-pressed={on}
                          aria-label={p ? `${l.name}, ${daysProp[di].full}: ${p}` : `${l.name}, ${daysProp[di].full}: nobody on call`}
                          onClick={() => { setPicked(on ? null : { layer: li, day: di }); setNote(null) }}
                          className={cn("focus-visible:ring-ring/50 flex h-11 w-full items-center justify-center rounded-lg border px-1 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", p ? cn(tint(p), "hover:brightness-95") : "border-destructive/50 text-destructive border-dashed", on && "ring-foreground/70 ring-2")}
                        >
                          <span className="truncate">{p ? p.split(" ")[0] : "Nobody"}</span>
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div aria-live="polite" className="bg-card mt-4 min-h-[5rem] rounded-xl border p-4">
          {sel ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{sel.layer.name}, {sel.day.full}</p>
                <p className="text-muted-foreground text-sm">{sel.person ? `${sel.person} is on call, ${handover} to ${handover}.` : "Nobody is on call for this shift."}</p>
                {note && <p role={note.ok ? "status" : "alert"} className={cn("mt-1 text-sm font-medium", !note.ok && "text-destructive")}>{note.text}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {sel.person !== me && (
                  <Button size="sm" disabled={busy} onClick={() => void run("take")}>
                    <UserRoundCheck aria-hidden="true" /> Take this shift
                  </Button>
                )}
                {sel.person && sel.person !== me && (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => void run("swap")}>
                    <ArrowRightLeft aria-hidden="true" /> Ask {sel.person.split(" ")[0]} to swap
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Select a shift to see who is on it, take it, or ask for a swap.</p>
          )}
        </div>
      </StateView>
    </section>
  )
}

export { Oncall1, type Oncall1Props, type Oncall1Layer, type Oncall1Day }
