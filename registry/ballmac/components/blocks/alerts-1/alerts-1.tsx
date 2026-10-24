// Ballmac UI: Alerts 1. https://ui.ballmac.com/blocks/alerts-1
"use client"

import * as React from "react"
import { BellOff, BellRing, CircleAlert, Info, Loader2, Send, TriangleAlert, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Switch } from "@/components/ballmac/switch"
import { cn } from "@/lib/utils"

type Alerts1Severity = "critical" | "warning" | "info"
type Alerts1Status = "firing" | "ok" | "muted"

type Alerts1Rule = {
  id: string
  name: string
  /** The condition, as code, for example "error_rate > 2% for 5m". */
  condition: string
  severity: Alerts1Severity
  /** Where it notifies: "Pager", "Slack #oncall", "Email". */
  channel: string
  status: Alerts1Status
  enabled: boolean
  /** For a firing rule, since when, already formatted. */
  since?: string
  /** For a muted rule, until when, already formatted. */
  until?: string
}

type Alerts1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    rules?: Alerts1Rule[]
    title?: string
    /** Called when a rule is switched on or off. Reject and it goes back with the message. */
    onToggle?: (rule: Alerts1Rule, enabled: boolean) => void | Promise<void>
    /** Called to mute a rule for a while, or unmute it when `hours` is 0. */
    onMute?: (rule: Alerts1Rule, hours: number) => void | Promise<void>
    /** Called to send a test notification to the rule's channel. */
    onTest?: (rule: Alerts1Rule) => void | Promise<void>
  }

const sample: Alerts1Rule[] = [
  { id: "a1", name: "Checkout error rate", condition: "checkout.error_rate > 2% for 5m", severity: "critical", channel: "Pager", status: "firing", enabled: true, since: "14:02" },
  { id: "a2", name: "API latency (p95)", condition: "api.latency.p95 > 800ms for 10m", severity: "warning", channel: "Slack #oncall", status: "ok", enabled: true },
  { id: "a3", name: "Queue depth: email", condition: "queue.email.depth > 5000 for 15m", severity: "warning", channel: "Slack #platform", status: "firing", enabled: true, since: "13:40" },
  { id: "a4", name: "Disk above 85%", condition: "disk.used_percent > 85", severity: "warning", channel: "Email", status: "muted", enabled: true, until: "tomorrow 09:00" },
  { id: "a5", name: "Certificate expires soon", condition: "tls.days_left < 14", severity: "info", channel: "Email", status: "ok", enabled: true },
  { id: "a6", name: "Signup drop", condition: "signups.rate < 40% of last week", severity: "info", channel: "Slack #growth", status: "ok", enabled: false },
]

const SEV: Record<Alerts1Severity, { icon: LucideIcon; label: string }> = {
  critical: { icon: CircleAlert, label: "Critical" },
  warning: { icon: TriangleAlert, label: "Warning" },
  info: { icon: Info, label: "Info" },
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  )
}

/**
 * The alert rules of a monitoring setup: what each watches for, how serious it is, where it notifies and whether it is firing, muted or fine, all in words. Firing
 * rules come first. Each can be switched off, muted for an hour, four hours or a day, and tested, and every change is undone with the reason if it fails.
 */
function Alerts1({ rules: rulesProp = sample, title = "Alert rules", onToggle, onMute, onTest, state = "ready", onRetry, emptyState, errorState, className, ...props }: Alerts1Props) {
  const id = React.useId()
  const [rules, setRules] = React.useState(rulesProp)
  React.useEffect(() => setRules(rulesProp), [rulesProp])
  const [filter, setFilter] = React.useState<"all" | Alerts1Status | "off">("all")
  const [hours, setHours] = React.useState<Record<string, number>>({})
  const [busy, setBusy] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<{ id: string; ok: boolean; text: string } | null>(null)
  const view = state === "ready" && rules.length === 0 ? "empty" : state
  const rank: Record<string, number> = { firing: 0, ok: 1, muted: 2 }
  const count = (f: typeof filter) => rules.filter((r) => (f === "all" ? true : f === "off" ? !r.enabled : r.enabled && r.status === f)).length
  const shown = rules.filter((r) => (filter === "all" ? true : filter === "off" ? !r.enabled : r.enabled && r.status === filter)).sort((a, b) => (a.enabled === b.enabled ? rank[a.status] - rank[b.status] : a.enabled ? -1 : 1) || ["critical", "warning", "info"].indexOf(a.severity) - ["critical", "warning", "info"].indexOf(b.severity))
  const firing = rules.filter((r) => r.enabled && r.status === "firing")

  async function run(r: Alerts1Rule, work: () => void | Promise<void>, apply: (x: Alerts1Rule) => Alerts1Rule, ok: string) {
    setBusy(r.id)
    setNote(null)
    setRules((l) => l.map((x) => (x.id === r.id ? apply(x) : x)))
    try {
      await work()
      setNote({ id: r.id, ok: true, text: ok })
    } catch (e) {
      setRules((l) => l.map((x) => (x.id === r.id ? r : x)))
      setNote({ id: r.id, ok: false, text: e instanceof Error ? e.message : "That did not go through, so nothing changed." })
    } finally {
      setBusy(null)
    }
  }
  const h = (r: Alerts1Rule) => hours[r.id] ?? 1

  return (
    <section data-slot="alerts-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p aria-live="polite" className="text-muted-foreground mt-2 max-w-xl text-pretty">
          {firing.length ? <><strong className="text-foreground">{firing.length} {firing.length === 1 ? "rule is" : "rules are"} firing.</strong> They are listed first.</> : "Nothing is firing."}
        </p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading alert rules" loading={<Skel />} empty={{ title: "No alert rules yet", description: "A rule watches a measurement and tells someone when it crosses a line.", ...emptyState }} error={{ title: "Alert rules could not be loaded", description: "Nothing was changed or muted. Check your connection and try again.", ...errorState }}>
        <div role="group" aria-label="Filter rules" className="mb-4 flex flex-wrap gap-2">
          {(["all", "firing", "muted", "off"] as const).map((k) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={cn("focus-visible:ring-ring/50 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", filter === k ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
              {k === "all" ? "All" : k === "firing" ? "Firing" : k === "muted" ? "Muted" : "Switched off"} <span className={cn("tabular-nums", filter === k ? "opacity-70" : "text-muted-foreground")}>{count(k)}</span>
            </button>
          ))}
        </div>
        {shown.length ? (
          <ul className="grid gap-3">
            {shown.map((r) => {
              const S = SEV[r.severity]
              const firingNow = r.enabled && r.status === "firing"
              return (
                <li key={r.id} data-status={r.enabled ? r.status : "off"} className={cn("bg-card rounded-xl border p-4 sm:p-5", firingNow && "border-destructive/60", !r.enabled && "bg-muted/30")}>
                  <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="font-medium">{r.name}</span>
                        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-px text-[11px]", r.severity === "critical" && "border-destructive/60 text-destructive")}><S.icon aria-hidden="true" className="size-3" />{S.label}</span>
                      </p>
                      <code className="bg-muted mt-1.5 inline-block rounded px-1.5 py-0.5 font-mono text-xs" dir="ltr">{r.condition}</code>
                      <p className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 text-xs">
                        <span>Notifies {r.channel}</span>
                        {!r.enabled ? <span className="text-foreground font-medium">Switched off</span> : r.status === "firing" ? <span className="text-foreground flex items-center gap-1 font-medium"><BellRing aria-hidden="true" className="text-destructive size-3.5" /> Firing{r.since ? ` since ${r.since}` : ""}</span> : r.status === "muted" ? <span className="text-foreground flex items-center gap-1 font-medium"><BellOff aria-hidden="true" className="size-3.5" /> Muted{r.until ? ` until ${r.until}` : ""}</span> : <span>Fine</span>}
                      </p>
                    </div>
                    <Switch aria-label={`${r.name} is on`} checked={r.enabled} disabled={busy === r.id} onCheckedChange={(v) => void run(r, () => onToggle?.(r, v), (x) => ({ ...x, enabled: v }), `${r.name} is ${v ? "on" : "switched off"}.`)} />
                  </div>
                  {r.enabled && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                      {r.status === "muted" ? (
                        <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => void run(r, () => onMute?.(r, 0), (x) => ({ ...x, status: "ok", until: undefined }), `${r.name} is unmuted.`)}><BellRing aria-hidden="true" /> Unmute</Button>
                      ) : (
                        <>
                          <label className="flex items-center gap-2 text-sm">
                            <span className="sr-only">Mute {r.name} for</span>
                            <select value={h(r)} onChange={(e) => setHours({ ...hours, [r.id]: Number(e.target.value) })} aria-label={`Mute ${r.name} for`} className="bg-background focus-visible:ring-ring/50 h-8 rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px]">
                              <option value={1}>1 hour</option>
                              <option value={4}>4 hours</option>
                              <option value={24}>1 day</option>
                            </select>
                          </label>
                          <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => void run(r, () => onMute?.(r, h(r)), (x) => ({ ...x, status: "muted", until: `${h(r)} ${h(r) === 1 ? "hour" : "hours"} from now` }), `${r.name} is muted for ${h(r) === 24 ? "a day" : `${h(r)} ${h(r) === 1 ? "hour" : "hours"}`}.`)} aria-label={`Mute ${r.name}`}><BellOff aria-hidden="true" /> Mute</Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" disabled={busy === r.id} onClick={() => void run(r, () => onTest?.(r), (x) => x, `A test was sent to ${r.channel}.`)} aria-label={`Send a test for ${r.name}`}>{busy === r.id ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Send aria-hidden="true" className="rtl:-scale-x-100" />} Send test</Button>
                    </div>
                  )}
                  {note?.id === r.id && <p role={note.ok ? "status" : "alert"} className={cn("mt-2 text-sm font-medium", !note.ok && "text-destructive")}>{note.text}</p>}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-12 text-center text-sm">No rules here.</p>
        )}
      </StateView>
    </section>
  )
}

export { Alerts1, type Alerts1Props, type Alerts1Rule, type Alerts1Severity, type Alerts1Status }
