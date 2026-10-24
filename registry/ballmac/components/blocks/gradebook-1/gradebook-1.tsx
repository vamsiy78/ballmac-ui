// Ballmac UI: Gradebook 1. https://ui.ballmac.com/blocks/gradebook-1
"use client"

import * as React from "react"
import { TriangleAlert } from "lucide-react"

import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Gradebook1Student = { id: string; name: string }
type Gradebook1Assignment = {
  id: string
  title: string
  /** The most points it can earn. */
  max: number
  /** How much it counts towards the final grade, in any unit: 20 and 30 count in the ratio 2 to 3. */
  weight: number
}

type Gradebook1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    students?: Gradebook1Student[]
    assignments?: Gradebook1Assignment[]
    /** Points earned, keyed "studentId:assignmentId". Leave one out, or use null, for not yet graded. */
    scores?: Record<string, number | null>
    title?: string
    /** The percentage a student needs to pass. */
    passMark?: number
    /** Called when a score is entered or cleared. Reject and the old score comes back with the message. */
    onScoreChange?: (studentId: string, assignmentId: string, score: number | null) => void | Promise<void>
  }

const students: Gradebook1Student[] = [
  { id: "s1", name: "Amara Okafor" },
  { id: "s2", name: "Jonas Weber" },
  { id: "s3", name: "Lina Rossi" },
  { id: "s4", name: "Kofi Mensah" },
  { id: "s5", name: "Mei Tanaka" },
]
const assignments: Gradebook1Assignment[] = [
  { id: "a1", title: "Essay", max: 40, weight: 30 },
  { id: "a2", title: "Quiz 1", max: 20, weight: 15 },
  { id: "a3", title: "Quiz 2", max: 20, weight: 15 },
  { id: "a4", title: "Project", max: 100, weight: 40 },
]
const scores: Record<string, number | null> = {
  "s1:a1": 36, "s1:a2": 18, "s1:a3": 19, "s1:a4": 92,
  "s2:a1": 28, "s2:a2": 12, "s2:a3": 15, "s2:a4": 64,
  "s3:a1": 33, "s3:a2": 17, "s3:a3": null, "s3:a4": null,
  "s4:a1": 19, "s4:a2": 9, "s4:a3": 11, "s4:a4": 48,
  "s5:a1": 39, "s5:a2": 20, "s5:a3": 18, "s5:a4": 88,
}

const letter = (p: number) => (p >= 90 ? "A" : p >= 80 ? "B" : p >= 70 ? "C" : p >= 60 ? "D" : "F")

/** A student's weighted average over the assignments that are graded, as a percentage, or null when nothing is graded yet. */
function average(studentId: string, as: Gradebook1Assignment[], sc: Record<string, number | null>) {
  let got = 0
  let weight = 0
  let graded = 0
  for (const a of as) {
    const v = sc[`${studentId}:${a.id}`]
    if (typeof v === "number") {
      got += (v / a.max) * a.weight
      weight += a.weight
      graded++
    }
  }
  return weight ? { percent: (got / weight) * 100, graded } : null
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-2">
      <Skeleton className="h-12 rounded-lg" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-14 rounded-lg" />
      ))}
    </div>
  )
}

/**
 * A teacher's gradebook: a score for every student and assignment that is edited in place and saved when you leave the cell, each student's weighted average and
 * letter, and the class average for each assignment. A score out of range is refused with a message, a student below the pass mark is called out in words,
 * and a save that fails puts the old score back and says why.
 */
function Gradebook1({ students: st = students, assignments: as = assignments, scores: scoresProp = scores, title = "Gradebook", passMark = 60, onScoreChange, state = "ready", onRetry, emptyState, errorState, className, ...props }: Gradebook1Props) {
  const id = React.useId()
  const [sc, setSc] = React.useState(scoresProp)
  React.useEffect(() => setSc(scoresProp), [scoresProp])
  const [draft, setDraft] = React.useState<Record<string, string>>({})
  const [error, setError] = React.useState<{ key: string; text: string } | null>(null)
  const view = state === "ready" && st.length === 0 ? "empty" : state
  const below = st.filter((s) => {
    const a = average(s.id, as, sc)
    return a && a.percent < passMark
  })

  async function commit(s: Gradebook1Student, a: Gradebook1Assignment) {
    const key = `${s.id}:${a.id}`
    const raw = (draft[key] ?? "").trim()
    setDraft(({ [key]: _gone, ...rest }) => rest)
    if (draft[key] === undefined) return
    const before = sc[key] ?? null
    const next = raw === "" ? null : Number(raw)
    if (next !== null && (!Number.isFinite(next) || next < 0 || next > a.max)) {
      setError({ key, text: `${a.title} is out of ${a.max}. Enter a number from 0 to ${a.max}, or leave it empty.` })
      return
    }
    if (next === before) return
    setError(null)
    setSc((c) => ({ ...c, [key]: next }))
    try {
      await onScoreChange?.(s.id, a.id, next)
    } catch (e) {
      setSc((c) => ({ ...c, [key]: before }))
      setError({ key, text: e instanceof Error ? e.message : `${s.name}'s ${a.title} score could not be saved, so it is as it was.` })
    }
  }

  return (
    <section data-slot="gradebook-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p aria-live="polite" className="text-muted-foreground mt-2 max-w-xl text-pretty">
          {below.length ? <><strong className="text-foreground">{below.length} {below.length === 1 ? "student is" : "students are"} below the {passMark}% pass mark:</strong> {below.map((s) => s.name).join(", ")}.</> : `Everyone graded so far is at or above ${passMark}%.`}
        </p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the gradebook" loading={<Skel />} empty={{ title: "No students yet", description: "Add students to this class and their scores will appear here.", ...emptyState }} error={{ title: "The gradebook could not be loaded", description: "No score was changed. Check your connection and try again.", ...errorState }}>
        <div tabIndex={0} role="region" aria-label={`${title}, scrollable`} className="focus-visible:ring-ring/50 overflow-x-auto rounded-xl border outline-none focus-visible:ring-[3px]">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <caption className="sr-only">{title}: points for each student and assignment, with weighted averages</caption>
            <thead className="bg-muted/40 text-xs">
              <tr>
                <th scope="col" className="bg-muted/40 sticky start-0 z-10 px-4 py-2.5 text-start font-medium">Student</th>
                {as.map((a) => (
                  <th key={a.id} scope="col" className="px-3 py-2.5 text-center font-medium">
                    {a.title}
                    <span className="text-muted-foreground block font-normal tabular-nums">out of {a.max} · counts {a.weight}</span>
                  </th>
                ))}
                <th scope="col" className="px-4 py-2.5 text-end font-medium">Average</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {st.map((s) => {
                const avg = average(s.id, as, sc)
                const low = !!avg && avg.percent < passMark
                return (
                  <tr key={s.id} data-below={low || undefined}>
                    <th scope="row" className="bg-card sticky start-0 z-10 px-4 py-2 text-start font-medium">{s.name}</th>
                    {as.map((a) => {
                      const key = `${s.id}:${a.id}`
                      const bad = error?.key === key
                      return (
                        <td key={a.id} className="p-1.5 text-center">
                          <input
                            inputMode="decimal"
                            aria-label={`${s.name}, ${a.title}, out of ${a.max}`}
                            aria-invalid={bad || undefined}
                            aria-describedby={bad ? `${id}-err` : undefined}
                            value={draft[key] ?? (sc[key] ?? "")}
                            placeholder="–"
                            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                            onBlur={() => void commit(s, a)}
                            onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
                            className="focus-visible:ring-ring/50 aria-invalid:border-destructive h-9 w-16 rounded-md border bg-background text-center tabular-nums outline-none focus-visible:ring-[3px]"
                          />
                        </td>
                      )
                    })}
                    <td className="px-4 py-2 text-end tabular-nums">
                      {avg ? (
                        <>
                          <span className="font-semibold">{Math.round(avg.percent)}%</span> <span className="text-muted-foreground">{letter(avg.percent)}</span>
                          <span className="text-muted-foreground block text-xs">{avg.graded} of {as.length} graded</span>
                          {low && <span className="text-destructive flex items-center justify-end gap-1 text-xs font-medium"><TriangleAlert aria-hidden="true" className="size-3" /> Below pass mark</span>}
                        </>
                      ) : (
                        <span className="text-muted-foreground">Not graded</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-muted/30 border-t text-xs">
              <tr>
                <th scope="row" className="bg-muted/30 sticky start-0 px-4 py-2.5 text-start font-medium">Class average</th>
                {as.map((a) => {
                  const vals = st.map((s) => sc[`${s.id}:${a.id}`]).filter((v): v is number => typeof v === "number")
                  return <td key={a.id} className="px-3 py-2.5 text-center tabular-nums">{vals.length ? `${Math.round((vals.reduce((n, v) => n + v, 0) / vals.length / a.max) * 100)}%` : "–"}</td>
                })}
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <p id={`${id}-err`} role="alert" className={cn("text-destructive mt-3 min-h-5 text-sm font-medium", !error && "sr-only")}>{error?.text}</p>
      </StateView>
    </section>
  )
}

export { Gradebook1, average, letter, type Gradebook1Assignment, type Gradebook1Props, type Gradebook1Student }
