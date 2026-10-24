// Ballmac UI: Dispatch 1. https://ui.ballmac.com/blocks/dispatch-1
"use client"

import * as React from "react"
import { CircleAlert, MapPin, Truck, UserMinus } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Dispatch1JobStatus = "scheduled" | "en-route" | "on-site" | "done"

type Dispatch1Job = {
  id: string
  /** For example "Replace the boiler pump". */
  title: string
  address: string
  /** The time window promised to the customer, such as "09:00 to 11:00". */
  window: string
  priority: "normal" | "urgent"
  /** Which technician has it. Leave it out for an unassigned job. */
  assignedTo?: string
  status?: Dispatch1JobStatus
}

type Dispatch1Technician = {
  id: string
  name: string
  /** The area they cover, such as "North". */
  area?: string
  /** What they are doing now, such as "On site at 14 Mill Lane". */
  now?: string
}

type Dispatch1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    jobs?: Dispatch1Job[]
    technicians?: Dispatch1Technician[]
    title?: string
    /** Called to give a job to a technician, or take it back when techId is null. Reject and it is undone with the message. */
    onAssign?: (jobId: string, techId: string | null) => void | Promise<void>
  }

const technicians: Dispatch1Technician[] = [
  { id: "t1", name: "Marcus Bell", area: "North", now: "On site at 14 Mill Lane" },
  { id: "t2", name: "Aisha Rahman", area: "Centre", now: "Driving to Unit 9, Dock Road" },
  { id: "t3", name: "Piotr Nowak", area: "South", now: "Free" },
]
const sample: Dispatch1Job[] = [
  { id: "j1", title: "Replace the boiler pump", address: "14 Mill Lane", window: "09:00 to 11:00", priority: "normal", assignedTo: "t1", status: "on-site" },
  { id: "j2", title: "Fix a leaking radiator valve", address: "3 Harbour View", window: "12:00 to 14:00", priority: "normal", assignedTo: "t1", status: "scheduled" },
  { id: "j3", title: "No heating or hot water", address: "Unit 9, Dock Road", window: "10:00 to 12:00", priority: "urgent", assignedTo: "t2", status: "en-route" },
  { id: "j4", title: "Annual boiler service", address: "22 Orchard Close", window: "14:00 to 16:00", priority: "normal", assignedTo: "t2", status: "scheduled" },
  { id: "j5", title: "Gas smell reported", address: "8 Kiln Street", window: "As soon as possible", priority: "urgent" },
  { id: "j6", title: "Fit a thermostat", address: "51 Ropewalk", window: "13:00 to 15:00", priority: "normal" },
]
const STATUS: Record<Dispatch1JobStatus, string> = { scheduled: "Scheduled", "en-route": "On the way", "on-site": "On site", done: "Done" }

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <Skeleton className="h-96 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-96 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

/**
 * A dispatch board for field work: jobs waiting for someone, with urgent ones first and named as urgent, and a lane for each technician with what they are doing
 * now and their jobs in time order. Giving a job to someone is a labelled select, not a drag, so it works from the keyboard; a job can be taken back, and
 * a change that fails is undone with the reason.
 */
function Dispatch1({ jobs: jobsProp = sample, technicians: techs = technicians, title = "Dispatch", onAssign, state = "ready", onRetry, emptyState, errorState, className, ...props }: Dispatch1Props) {
  const id = React.useId()
  const [jobs, setJobs] = React.useState<Dispatch1Job[]>(jobsProp)
  React.useEffect(() => setJobs(jobsProp), [jobsProp])
  const [note, setNote] = React.useState<{ ok: boolean; text: string } | null>(null)
  const view = state === "ready" && jobs.length === 0 ? "empty" : state
  const waiting = jobs.filter((j) => !j.assignedTo).sort((a, b) => Number(b.priority === "urgent") - Number(a.priority === "urgent"))
  const urgentWaiting = waiting.filter((j) => j.priority === "urgent").length

  async function assign(job: Dispatch1Job, techId: string | null) {
    setNote(null)
    const tech = techs.find((t) => t.id === techId)
    setJobs((l) => l.map((j) => (j.id === job.id ? { ...j, assignedTo: techId ?? undefined, status: techId ? "scheduled" : undefined } : j)))
    try {
      await onAssign?.(job.id, techId)
      setNote({ ok: true, text: techId ? `${job.title} is now ${tech?.name}'s.` : `${job.title} is back in the waiting list.` })
    } catch (e) {
      setJobs((l) => l.map((j) => (j.id === job.id ? job : j)))
      setNote({ ok: false, text: e instanceof Error ? e.message : `${job.title} could not be changed, so it is as it was.` })
    }
  }

  return (
    <section data-slot="dispatch-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p aria-live="polite" className="text-muted-foreground mt-2">
          {waiting.length === 0 ? "Every job has someone." : <>{waiting.length} {waiting.length === 1 ? "job is" : "jobs are"} waiting{urgentWaiting ? <> · <strong className="text-foreground">{urgentWaiting} urgent</strong></> : ""}</>}
        </p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading jobs" loading={<Skel />} empty={{ title: "No jobs today", description: "New jobs appear here until someone is given them.", ...emptyState }} error={{ title: "Jobs could not be loaded", description: "Nothing was assigned or changed. Check your connection and try again.", ...errorState }}>
        {note && <p role={note.ok ? "status" : "alert"} className={cn("mb-4 text-sm font-medium", !note.ok && "text-destructive")}>{note.text}</p>}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <section aria-labelledby={`${id}-wait`} className="min-w-0">
            <h2 id={`${id}-wait`} className="bg-muted/50 mb-3 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold">Waiting for someone <span className="text-muted-foreground font-mono text-xs tabular-nums">{waiting.length}</span></h2>
            <ul className="grid gap-3">
              {waiting.map((j) => (
                <li key={j.id} data-priority={j.priority} className={cn("bg-card rounded-xl border p-4", j.priority === "urgent" && "border-destructive border-2")}>
                  {j.priority === "urgent" && <p className="text-destructive mb-1.5 flex items-center gap-1.5 text-xs font-semibold"><CircleAlert aria-hidden="true" className="size-3.5" /> Urgent</p>}
                  <p className="font-medium">{j.title}</p>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs"><MapPin aria-hidden="true" className="size-3.5" /> {j.address}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">{j.window}</p>
                  <label className="mt-3 grid gap-1 text-xs font-medium">
                    Give to
                    <select value="" aria-label={`Give ${j.title} to`} onChange={(e) => e.target.value && void assign(j, e.target.value)} className="bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-2 text-sm font-normal outline-none focus-visible:ring-[3px]">
                      <option value="">Choose a technician</option>
                      {techs.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}{t.area ? `, ${t.area}` : ""}</option>
                      ))}
                    </select>
                  </label>
                </li>
              ))}
            </ul>
            {waiting.length === 0 && <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm">All jobs are assigned.</p>}
          </section>

          <div className="grid min-w-0 gap-5 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
            {techs.map((t) => {
              const mine = jobs.filter((j) => j.assignedTo === t.id).sort((a, b) => a.window.localeCompare(b.window))
              return (
                <section key={t.id} aria-label={`${t.name}'s jobs`} className="min-w-0">
                  <h2 className="bg-muted/50 mb-3 rounded-lg px-3 py-2 text-sm font-semibold">
                    <span className="flex items-center justify-between">{t.name} <span className="text-muted-foreground font-mono text-xs tabular-nums">{mine.length}</span></span>
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-normal"><Truck aria-hidden="true" className="size-3" /> {t.now ?? t.area ?? ""}</span>
                  </h2>
                  <ul className="grid gap-3">
                    {mine.map((j) => (
                      <li key={j.id} data-status={j.status} className={cn("bg-card rounded-xl border p-3.5", j.priority === "urgent" && "border-destructive")}>
                        <p className="flex items-center justify-between gap-2 text-xs"><span className="text-muted-foreground tabular-nums">{j.window}</span><span className="font-medium">{j.status ? STATUS[j.status] : ""}</span></p>
                        {j.priority === "urgent" && <p className="text-destructive mt-1 flex items-center gap-1 text-xs font-semibold"><CircleAlert aria-hidden="true" className="size-3" /> Urgent</p>}
                        <p className="mt-1 text-sm font-medium">{j.title}</p>
                        <p className="text-muted-foreground text-xs">{j.address}</p>
                        {j.status === "scheduled" && (
                          <Button size="sm" variant="ghost" className="mt-2 -ms-2" aria-label={`Take ${j.title} back from ${t.name}`} onClick={() => void assign(j, null)}>
                            <UserMinus aria-hidden="true" /> Take back
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {mine.length === 0 && <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm">Free.</p>}
                </section>
              )
            })}
          </div>
        </div>
      </StateView>
    </section>
  )
}

export { Dispatch1, type Dispatch1Job, type Dispatch1JobStatus, type Dispatch1Props, type Dispatch1Technician }
