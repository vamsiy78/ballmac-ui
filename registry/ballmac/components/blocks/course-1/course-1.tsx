// Ballmac UI: Course 1. https://ui.ballmac.com/blocks/course-1
"use client"

import * as React from "react"
import { Award, BookOpen, CircleCheck, ClipboardCheck, ChevronDown, Hammer, Lock, Play } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Course1Kind = "video" | "reading" | "quiz" | "project"
type Course1Lesson = { id: string; title: string; kind: Course1Kind; minutes: number; done?: boolean; /** Why it cannot be opened yet, shown instead of the length. */ locked?: string }
type Course1Module = { id: string; title: string; lessons: Course1Lesson[] }

type Course1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    subtitle?: string
    instructor?: { name: string; role: string }
    level?: string
    modules?: Course1Module[]
    /** The module open at first. Defaults to the one with the next lesson. */
    defaultOpenId?: string
    /** Called when someone opens a lesson, or presses Continue. */
    onOpenLesson?: (lesson: Course1Lesson) => void
    /** Called when someone marks a lesson done or not done. */
    onToggleDone?: (lesson: Course1Lesson, done: boolean) => void
  }

const sample: Course1Module[] = [
  { id: "m1", title: "Start here", lessons: [{ id: "l1", title: "Welcome and how this course works", kind: "video", minutes: 4, done: true }, { id: "l2", title: "Set up your workspace", kind: "video", minutes: 11, done: true }, { id: "l3", title: "The one idea behind everything", kind: "reading", minutes: 8, done: true }] },
  { id: "m2", title: "Planning that holds up", lessons: [{ id: "l4", title: "Break a goal into work you can finish", kind: "video", minutes: 14, done: true }, { id: "l5", title: "Estimating without guessing", kind: "video", minutes: 18 }, { id: "l6", title: "Dependencies and what blocks you", kind: "reading", minutes: 9 }, { id: "l7", title: "Check your understanding", kind: "quiz", minutes: 6 }] },
  { id: "m3", title: "Running the work", lessons: [{ id: "l8", title: "Weekly rhythm that people keep", kind: "video", minutes: 16 }, { id: "l9", title: "Meetings that end early", kind: "video", minutes: 12 }, { id: "l10", title: "Reporting without a slide deck", kind: "reading", minutes: 10 }] },
  { id: "m4", title: "Final project", lessons: [{ id: "l11", title: "Plan a real project from scratch", kind: "project", minutes: 45, locked: "Finish the modules before it" }, { id: "l12", title: "Final check", kind: "quiz", minutes: 10, locked: "Finish the project first" }] },
]

const kindMeta: Record<Course1Kind, { label: string; icon: typeof Play }> = {
  video: { label: "Video", icon: Play },
  reading: { label: "Reading", icon: BookOpen },
  quiz: { label: "Quiz", icon: ClipboardCheck },
  project: { label: "Project", icon: Hammer },
}

const dur = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ""}`.trim() : `${m} min`)

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-5">
      <Skeleton className="h-64 rounded-3xl" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-20 rounded-2xl" />
      ))}
    </div>
  )
}

function Ring({ value }: { value: number }) {
  const r = 42
  const c = 2 * Math.PI * r
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className="size-28 -rotate-90 rtl:rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-background/20" />
      <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)} className="stroke-background transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none" />
    </svg>
  )
}

/**
 * A course page: a hero with your progress ring and a Continue button that goes to the next lesson, then the modules as expandable cards,
 * each with its own progress and lessons you can open, mark done or see are locked (with the reason). Progress, time left and the
 * certificate unlock are worked out from the lessons.
 */
function Course1({
  title = "Plan work that actually gets done",
  subtitle = "A practical course for team leads: turn goals into plans, run the week, and report without slides.",
  instructor = { name: "Dr. Elena Marsh", role: "Operations lead, 15 years" },
  level = "Beginner friendly",
  modules = sample,
  defaultOpenId,
  onOpenLesson,
  onToggleDone,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Course1Props) {
  const id = React.useId()
  const list = state === "empty" ? [] : modules
  const [done, setDone] = React.useState<Set<string>>(() => new Set(modules.flatMap((m) => m.lessons.filter((l) => l.done).map((l) => l.id))))
  const lessons = list.flatMap((m) => m.lessons)
  const total = lessons.length
  const doneCount = lessons.filter((l) => done.has(l.id)).length
  const minutes = lessons.reduce((n, l) => n + l.minutes, 0)
  const left = lessons.filter((l) => !done.has(l.id)).reduce((n, l) => n + l.minutes, 0)
  const next = lessons.find((l) => !done.has(l.id) && !l.locked)
  const nextModule = next ? list.find((m) => m.lessons.includes(next)) : undefined
  const [open, setOpen] = React.useState<Set<string>>(() => new Set([defaultOpenId ?? list.find((m) => m.lessons.some((l) => !l.done && !l.locked))?.id ?? list[0]?.id ?? ""]))
  const frac = total ? doneCount / total : 0
  const complete = total > 0 && doneCount === total

  const toggle = (l: Course1Lesson) => {
    const on = !done.has(l.id)
    setDone((d) => {
      const n = new Set(d)
      if (on) n.add(l.id)
      else n.delete(l.id)
      return n
    })
    onToggleDone?.(l, on)
  }

  const content = !total ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <BookOpen className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No lessons yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "The first lessons are on their way."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <>
      <div className="relative isolate overflow-hidden rounded-3xl border">
        <CoverArt seed={title} variant="mesh" className="absolute inset-0 -z-20 scale-110 saturate-150" />
        <div aria-hidden="true" className="from-foreground via-foreground/85 to-foreground/40 absolute inset-0 -z-10 bg-gradient-to-r rtl:bg-gradient-to-l" />
        <div className="text-background grid gap-8 p-6 sm:p-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <p className="text-background/70 text-sm font-medium">{level}</p>
            <h1 id={`${id}-title`} className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
              {title}
            </h1>
            <p className="text-background/75 mt-4 max-w-xl text-pretty sm:text-lg">{subtitle}</p>
            <p className="text-background/75 mt-5 text-sm">
              With <span className="text-background font-medium">{instructor.name}</span>, {instructor.role}
            </p>
            <p className="text-background/75 mt-1 text-sm tabular-nums">
              {total} lessons · {dur(minutes)} in all
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {complete ? (
                <p className="bg-background/15 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                  <Award aria-hidden="true" className="size-4" />
                  Course complete. Your certificate is ready.
                </p>
              ) : next ? (
                <Button variant="secondary" size="lg" onClick={() => onOpenLesson?.(next)}>
                  <Play aria-hidden="true" className="fill-current" />
                  {doneCount ? "Continue" : "Start"}: {next.title.length > 34 ? `${next.title.slice(0, 33)}…` : next.title}
                  <span className="sr-only"> ({nextModule?.title})</span>
                </Button>
              ) : (
                <p className="text-background/75 text-sm">Finish the open lessons to unlock the rest.</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-5 md:flex-col md:items-center md:gap-3">
            <div className="relative">
              <Ring value={frac} />
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-semibold tabular-nums">{Math.round(frac * 100)}%</span>
            </div>
            <p className="text-background/75 text-sm md:text-center">
              <span className="text-background font-medium tabular-nums">
                {doneCount} of {total}
              </span>{" "}
              done
              <br />
              {complete ? "Nothing left" : <span className="tabular-nums">{dur(left)} to go</span>}
            </p>
          </div>
        </div>
      </div>
      <div className="sr-only" role="progressbar" aria-label="Course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(frac * 100)} />

      <h2 className="mt-12 mb-5 text-xl font-semibold tracking-tight">What you will learn</h2>
      <ol className="grid gap-3">
        {list.map((m, mi) => {
          const md = m.lessons.filter((l) => done.has(l.id)).length
          const isOpen = open.has(m.id)
          const mMinutes = m.lessons.reduce((n, l) => n + l.minutes, 0)
          const all = md === m.lessons.length
          return (
            <li key={m.id} className="bg-card overflow-hidden rounded-2xl border">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`${id}-${m.id}`}
                  onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(m.id)) n.delete(m.id); else n.add(m.id); return n })}
                  className="hover:bg-accent/40 focus-visible:ring-ring/50 flex w-full items-center gap-4 px-5 py-4 text-start outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-inset motion-reduce:transition-none"
                >
                  <span aria-hidden="true" className={cn("flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold tabular-nums", all && "bg-foreground text-background border-foreground")}>
                    {all ? <CircleCheck className="size-5" /> : mi + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold tracking-tight">{m.title}</span>
                    <span className="text-muted-foreground mt-0.5 block text-sm tabular-nums">
                      {md} of {m.lessons.length} done · {dur(mMinutes)}
                    </span>
                  </span>
                  <span aria-hidden="true" className="bg-muted hidden h-1.5 w-24 overflow-hidden rounded-full sm:block">
                    <span className="bg-foreground block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${(md / m.lessons.length) * 100}%` }} />
                  </span>
                  <ChevronDown aria-hidden="true" className={cn("text-muted-foreground size-5 shrink-0 transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} />
                </button>
              </h3>
              {isOpen ? (
                <ul id={`${id}-${m.id}`} className="divide-y border-t">
                  {m.lessons.map((l) => {
                    const K = kindMeta[l.kind]
                    const d = done.has(l.id)
                    return (
                      <li key={l.id} className="flex items-center gap-3 px-5 py-3 sm:gap-4">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={d}
                          aria-label={`Mark "${l.title}" as ${d ? "not done" : "done"}`}
                          disabled={!!l.locked}
                          onClick={() => toggle(l)}
                          className={cn("focus-visible:ring-ring/50 flex size-7 shrink-0 items-center justify-center rounded-full border outline-none transition-colors focus-visible:ring-[3px] disabled:opacity-40 motion-reduce:transition-none", d ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}
                        >
                          {l.locked ? <Lock aria-hidden="true" className="size-3.5" /> : d ? <CircleCheck aria-hidden="true" className="size-4" /> : null}
                        </button>
                        <button type="button" disabled={!!l.locked} onClick={() => onOpenLesson?.(l)} className="hover:bg-accent/50 focus-visible:ring-ring/50 -my-1 flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-start outline-none transition-colors focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent motion-reduce:transition-none">
                          <K.icon aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className={cn("block truncate text-sm font-medium", d && "text-muted-foreground")}>{l.title}</span>
                            <span className="text-muted-foreground block text-xs">
                              {K.label}
                              {l.locked ? ` · ${l.locked}` : ""}
                            </span>
                          </span>
                          <span className="text-muted-foreground text-xs tabular-nums">{dur(l.minutes)}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </li>
          )
        })}
      </ol>

      <div className={cn("mt-8 flex items-center gap-4 rounded-2xl border p-5", complete ? "bg-chart-2/10 border-chart-2/30" : "border-dashed")}>
        <span aria-hidden="true" className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-full">
          {complete ? <Award className="size-5" /> : <Lock className="size-5" />}
        </span>
        <p className="text-sm text-pretty">
          <span className="font-semibold">Certificate of completion</span>
          <span className="text-muted-foreground block">{complete ? "You finished every lesson. Download it from your profile." : `Unlocks when you finish all ${total} lessons. ${total - doneCount} to go.`}</span>
        </p>
      </div>
    </>
  )

  return (
    <section data-slot="course-1" data-state={state} aria-labelledby={total && state === "ready" ? `${id}-title` : undefined} aria-label={total && state === "ready" ? undefined : "Course"} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the course" loading={<Skel />} error={{ title: errorState?.title ?? "The course could not be loaded", description: errorState?.description ?? "Your progress is safe. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Course1, type Course1Props, type Course1Module, type Course1Lesson, type Course1Kind }
