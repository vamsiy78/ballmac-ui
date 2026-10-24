// Ballmac UI: Incident 1. https://ui.ballmac.com/blocks/incident-1
"use client"

import * as React from "react"
import { CircleCheck, Loader2, Megaphone, Send, Siren } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ballmac/alert-dialog"
import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { useReturnFocus } from "@/lib/ballmac/return-focus"
import { cn } from "@/lib/utils"

type Incident1Status = "investigating" | "identified" | "monitoring" | "resolved"
type Incident1Severity = "SEV1" | "SEV2" | "SEV3"

type Incident1Update = {
  id: string
  /** When it was posted, already formatted, such as "14:31". */
  time: string
  author: string
  status: Incident1Status
  body: string
}

type Incident1Data = {
  /** For example "INC-2041". */
  id: string
  title: string
  severity: Incident1Severity
  status: Incident1Status
  /** When it started, such as "14:02". */
  startedAt: string
  /** How long it has run, already formatted, such as "47 min". */
  duration: string
  /** Who or what is affected, in a sentence. */
  impact: string
  roles: { commander?: string; comms?: string; ops?: string }
  updates: Incident1Update[]
}

type Incident1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    incident?: Incident1Data | null
    /** People who can take a role. */
    people?: string[]
    /** The person writing updates. */
    me?: string
    /** Called when an update is posted. Reject and the message says it was not posted. */
    onPostUpdate?: (update: { status: Incident1Status; body: string }) => void | Promise<void>
    /** Called when the incident is resolved after the confirmation. */
    onResolve?: () => void | Promise<void>
    /** Called when a role changes. */
    onAssign?: (role: "commander" | "comms" | "ops", person: string) => void
  }

const STATUS: Record<Incident1Status, string> = { investigating: "Investigating", identified: "Identified", monitoring: "Monitoring", resolved: "Resolved" }
const ROLES: { id: "commander" | "comms" | "ops"; label: string; hint: string }[] = [
  { id: "commander", label: "Incident commander", hint: "Makes the calls" },
  { id: "comms", label: "Communications", hint: "Updates customers" },
  { id: "ops", label: "Operations", hint: "Fixes it" },
]

const sample: Incident1Data = {
  id: "INC-2041",
  title: "Checkout is failing for some customers",
  severity: "SEV2",
  status: "identified",
  startedAt: "14:02",
  duration: "47 min",
  impact: "About one in five card payments fail. Other payment methods and the rest of the app work.",
  roles: { commander: "Priya Shah", ops: "Theo Nakamura" },
  updates: [
    { id: "u3", time: "14:41", author: "Theo Nakamura", status: "identified", body: "The payment provider's EU endpoint is timing out. We are moving traffic to the backup endpoint." },
    { id: "u2", time: "14:20", author: "Priya Shah", status: "investigating", body: "Failures started at 14:02 and only affect cards. We have ruled out the last deploy." },
    { id: "u1", time: "14:08", author: "Priya Shah", status: "investigating", body: "We are looking into reports of failed card payments." },
  ],
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4">
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-56 rounded-xl" />
    </div>
  )
}

/**
 * The page the people fixing an incident share: severity and status in words, what is affected, who holds the three roles, a form to post an update with
 * its new status, the updates newest first, and a Resolve button that asks first. Severity is never colour alone.
 */
function Incident1({ incident: incidentProp = sample, people = ["Priya Shah", "Theo Nakamura", "Noor Haddad", "Kofi Mensah", "Ana Souza"], me = "Priya Shah", onPostUpdate, onResolve, onAssign, state = "ready", onRetry, emptyState, errorState, className, ...props }: Incident1Props) {
  const id = React.useId()
  const [incident, setIncident] = React.useState<Incident1Data | null>(incidentProp)
  React.useEffect(() => setIncident(incidentProp), [incidentProp])
  const [status, setStatus] = React.useState<Incident1Status>(incidentProp?.status === "resolved" ? "resolved" : (incidentProp?.status ?? "investigating"))
  const [body, setBody] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [confirm, setConfirm] = React.useState(false)
  const ret = useReturnFocus(confirm)
  const view = state === "ready" && !incident ? "empty" : state
  const resolved = incident?.status === "resolved"

  async function post(next: { status: Incident1Status; body: string }) {
    if (!incident) return false
    setBusy(true)
    setError(null)
    try {
      await onPostUpdate?.(next)
      const update: Incident1Update = { id: `u${incident.updates.length + 1}-${next.body.length}`, time: "now", author: me, ...next }
      setIncident((i) => (i ? { ...i, status: next.status, updates: [update, ...i.updates] } : i))
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "The update was not posted. Your text is still here.")
      return false
    } finally {
      setBusy(false)
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    if (await post({ status, body: body.trim() })) setBody("")
  }
  async function resolve() {
    try {
      await onResolve?.()
      if (await post({ status: "resolved", body: "This incident is resolved." })) setStatus("resolved")
    } catch (e) {
      setError(e instanceof Error ? e.message : "The incident could not be resolved. It is still open.")
    }
  }

  return (
    <section data-slot="incident-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={view} onRetry={onRetry} label="Loading the incident" loading={<Skel />} empty={{ title: "No incident right now", description: "When something breaks, the incident page opens here with its roles and updates.", icon: <CircleCheck />, ...emptyState }} error={{ title: "The incident could not be loaded", description: "Nothing was posted. Check your connection and try again.", ...errorState }}>
        {incident && (
          <>
            <header className="bg-card rounded-xl border p-5 sm:p-6">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                <span className="text-muted-foreground font-mono text-xs" dir="ltr">{incident.id}</span>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", incident.severity === "SEV1" ? "border-destructive text-destructive" : incident.severity === "SEV2" ? "border-chart-3 text-foreground" : "text-muted-foreground")}>
                  <Siren aria-hidden="true" className="size-3.5" />
                  <span className="sr-only">Severity </span>
                  {incident.severity}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                  {resolved ? <CircleCheck aria-hidden="true" className="size-3.5" /> : <Megaphone aria-hidden="true" className="size-3.5" />}
                  {STATUS[incident.status]}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">Started {incident.startedAt} · {resolved ? "lasted" : "running for"} {incident.duration}</span>
              </p>
              <h1 id={`${id}-title`} className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-balance sm:text-3xl">{incident.title}</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-pretty"><span className="text-foreground font-medium">Impact: </span>{incident.impact}</p>
            </header>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {ROLES.map((r) => (
                <div key={r.id} className="bg-card rounded-xl border p-4">
                  <label htmlFor={`${id}-${r.id}`} className="text-sm font-medium">{r.label}</label>
                  <p className="text-muted-foreground text-xs">{r.hint}</p>
                  <select id={`${id}-${r.id}`} disabled={resolved} value={incident.roles[r.id] ?? ""} onChange={(e) => { setIncident((i) => (i ? { ...i, roles: { ...i.roles, [r.id]: e.target.value } } : i)); onAssign?.(r.id, e.target.value) }} className="bg-background focus-visible:ring-ring/50 mt-2.5 h-9 w-full rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px] disabled:opacity-60">
                    <option value="">Unassigned</option>
                    {people.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {!resolved && (
              <form onSubmit={submit} className="bg-card mt-4 grid gap-3 rounded-xl border p-4 sm:p-5">
                <label htmlFor={`${id}-body`} className="text-sm font-medium">Post an update</label>
                <textarea id={`${id}-body`} value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="What is known, what is being done, and when the next update is" className="bg-background focus-visible:ring-ring/50 min-h-20 w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]" />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <select value={status} onChange={(e) => setStatus(e.target.value as Incident1Status)} className="bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px]">
                      {(["investigating", "identified", "monitoring"] as const).map((s) => (
                        <option key={s} value={s}>{STATUS[s]}</option>
                      ))}
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setConfirm(true)}>Resolve</Button>
                    <Button type="submit" disabled={!body.trim() || busy}>
                      {busy ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Send aria-hidden="true" className="rtl:-scale-x-100" />} Post update
                    </Button>
                  </div>
                </div>
                {error && <p role="alert" className="text-destructive text-sm font-medium">{error}</p>}
              </form>
            )}
            {resolved && <p role="status" className="bg-card mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"><CircleCheck aria-hidden="true" className="size-4" /> This incident is resolved. Updates are closed.</p>}

            <ol aria-label="Updates, newest first" className="mt-6 grid gap-0">
              {incident.updates.map((u, i) => (
                <li key={u.id} className="relative grid grid-cols-[4.5rem_1fr] gap-4 pb-6 last:pb-0">
                  <time className="text-muted-foreground pt-0.5 text-end font-mono text-xs tabular-nums" dir="ltr">{u.time}</time>
                  <div className="border-border relative border-s ps-5">
                    <span aria-hidden="true" className={cn("bg-background absolute top-1 -start-[5px] size-2.5 rounded-full border-2", i === 0 ? "border-foreground" : "border-border")} />
                    <p className="text-sm font-medium">{STATUS[u.status]} <span className="text-muted-foreground font-normal">· {u.author}</span></p>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed text-pretty">{u.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </StateView>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent {...ret}>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve this incident?</AlertDialogTitle>
            <AlertDialogDescription>Customers see it as resolved and updates close. Make sure the fix has held.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it open</AlertDialogCancel>
            <AlertDialogAction onClick={() => void resolve()}>Resolve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

export { Incident1, type Incident1Props, type Incident1Data, type Incident1Update, type Incident1Status, type Incident1Severity }
