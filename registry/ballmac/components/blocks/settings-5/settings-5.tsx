// Ballmac UI: Settings 5. https://ui.ballmac.com/blocks/settings-5
"use client"

import * as React from "react"
import { Bot, ChevronRight, Download, KeyRound, Loader2, ScrollText, Search, Server, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { DiffViewer } from "@/components/ballmac/diff-viewer"
import { JsonViewer } from "@/components/ballmac/json-viewer"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Settings5ActorKind = "user" | "agent" | "api" | "system"

type Settings5Event = {
  id: string
  actor: { name: string; email?: string; kind?: Settings5ActorKind }
  /** A machine name such as "member.role_changed". The part before the dot is its area, used by the area filter. */
  action: string
  /** What happened, as a sentence people can read. */
  summary: string
  /** The group heading, already written for people ("Today", "14 October"). Events with the same day are grouped. */
  day: string
  /** Already written for people ("09:42"). */
  time: string
  target?: string
  ip?: string
  location?: string
  severity?: "info" | "warning" | "critical"
  /** A setting's value before and after, shown as a diff. */
  changes?: { before: string; after: string }
  /** Anything else recorded, shown as JSON. */
  metadata?: unknown
}

type Settings5Range = "24h" | "7d" | "30d" | "90d"

type Settings5Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    /** Events, newest first. */
    events?: Settings5Event[]
    title?: string
    description?: string
    /** The time range (controlled). Fetch the events for it in onRangeChange. */
    range?: Settings5Range
    onRangeChange?: (range: Settings5Range) => void
    /** Whether older events can be loaded. */
    hasMore?: boolean
    /** Loads the next page. */
    onLoadMore?: () => void | Promise<void>
    /** Called by Export with the events that match the filters. Defaults to downloading them as a CSV file. */
    onExport?: (events: Settings5Event[]) => void
  }

const sample: Settings5Event[] = [
  { id: "a1", actor: { name: "Priya Shah", email: "priya@acme.com", kind: "user" }, action: "member.role_changed", summary: "Changed Alex Kim’s role from Member to Admin", day: "Today", time: "09:42", target: "alex@acme.com", ip: "203.0.113.24", location: "Lisbon, PT", severity: "warning", changes: { before: "role: member", after: "role: admin" } },
  { id: "a2", actor: { name: "Support agent", kind: "agent" }, action: "billing.refund_issued", summary: "Refunded $129.00 on order 4821, approved by Priya Shah", day: "Today", time: "09:15", target: "ch_2", metadata: { approvedBy: "priya@acme.com", amount: 12900, currency: "usd" } },
  { id: "a3", actor: { name: "Deploy key", kind: "api" }, action: "integration.connected", summary: "Connected the Code hosting integration", day: "Today", time: "08:03", ip: "198.51.100.7" },
  { id: "a4", actor: { name: "Jordan Lee", email: "jordan@acme.com", kind: "user" }, action: "security.sso_enforced", summary: "Required single sign-on for everyone", day: "Yesterday", time: "17:20", ip: "203.0.113.51", location: "New York, US", severity: "critical", changes: { before: "sso:\n  required: false", after: "sso:\n  required: true\n  provider: okta" } },
  { id: "a5", actor: { name: "Jordan Lee", email: "jordan@acme.com", kind: "user" }, action: "member.invited", summary: "Invited sam@acme.com as a Member", day: "Yesterday", time: "11:02", target: "sam@acme.com" },
  { id: "a6", actor: { name: "System", kind: "system" }, action: "security.session_revoked", summary: "Signed out 3 sessions after a password change", day: "14 October", time: "22:47", target: "alex@acme.com" },
]

const kindIcon = { agent: Bot, api: KeyRound, system: Server } as const
const rangeLabel: Record<Settings5Range, string> = { "24h": "Last 24 hours", "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days" }

function csv(events: Settings5Event[]) {
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
  const head = ["day", "time", "actor", "email", "kind", "action", "summary", "target", "ip", "location"]
  const rows = events.map((e) => [e.day, e.time, e.actor.name, e.actor.email, e.actor.kind ?? "user", e.action, e.summary, e.target, e.ip, e.location].map(cell).join(","))
  return [head.join(","), ...rows].join("\n")
}

function LogSkeleton() {
  return (
    <div className="grid gap-2" aria-hidden="true">
      <Skeleton className="h-3 w-16" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="hidden h-5 w-32 rounded-md sm:block" />
        </div>
      ))}
    </div>
  )
}

function Row({ e }: { e: Settings5Event }) {
  const [open, setOpen] = React.useState(false)
  const id = React.useId()
  const kind = e.actor.kind ?? "user"
  const KindIcon = kind === "user" ? null : kindIcon[kind]
  const initials = e.actor.name.split(" ").map((w) => w[0]).join("").slice(0, 2)
  const hasDetail = !!(e.target || e.ip || e.location || e.changes || e.metadata !== undefined)
  // a row with nothing more to show is plain text, not a button that does nothing
  const Head = hasDetail ? "button" : "div"
  return (
    <li className={cn("bg-card rounded-lg border", e.severity === "critical" && "border-destructive/40")}>
      <Head
        {...(hasDetail ? { type: "button" as const, "aria-expanded": open, "aria-controls": id, onClick: () => setOpen((o) => !o) } : {})}
        className={cn("flex w-full items-center gap-3 rounded-lg p-3 text-start", hasDetail && "outline-none hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50")}
      >
        <span className="text-muted-foreground w-10 shrink-0 text-xs tabular-nums">{e.time}</span>
        <span aria-hidden="true" className="bg-muted relative flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold">
          {KindIcon ? <KindIcon className="size-3.5" /> : initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-pretty">
            {e.severity && e.severity !== "info" ? (
              <TriangleAlert aria-label={e.severity === "critical" ? "Critical" : "Warning"} className={cn("me-1.5 inline size-3.5 align-[-2px]", e.severity === "critical" ? "text-destructive" : "text-chart-3")} />
            ) : null}
            <span className="font-medium">{e.actor.name}</span>
            {kind !== "user" ? <span className="text-muted-foreground text-xs"> ({kind === "agent" ? "agent" : kind === "api" ? "API key" : "system"})</span> : null}{" "}
            <span className="text-muted-foreground">·</span> {e.summary}
          </span>
        </span>
        <code dir="ltr" className="bg-muted text-muted-foreground hidden shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] md:block">
          {e.action}
        </code>
        {hasDetail ? <ChevronRight aria-hidden="true" className={cn("text-muted-foreground size-4 shrink-0 transition-transform duration-150", open ? "rotate-90" : "rtl:rotate-180")} /> : <span className="w-4 shrink-0" />}
      </Head>
      {open && hasDetail ? (
        <div id={id} className="grid gap-3 border-t p-3 ps-16">
          <dl className="grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-[auto_1fr]">
            <dt className="text-muted-foreground">Action</dt>
            <dd dir="ltr" className="text-start font-mono">{e.action}</dd>
            {e.actor.email ? (
              <>
                <dt className="text-muted-foreground">By</dt>
                <dd className="break-all">{e.actor.email}</dd>
              </>
            ) : null}
            {e.target ? (
              <>
                <dt className="text-muted-foreground">Target</dt>
                <dd className="break-all">{e.target}</dd>
              </>
            ) : null}
            {e.ip ? (
              <>
                <dt className="text-muted-foreground">IP address</dt>
                <dd dir="ltr" className="text-start font-mono">{e.ip}{e.location ? <span className="text-muted-foreground font-sans"> · {e.location}</span> : null}</dd>
              </>
            ) : null}
          </dl>
          {e.changes ? <DiffViewer before={e.changes.before} after={e.changes.after} label={`Change made by ${e.actor.name}`} /> : null}
          {e.metadata !== undefined ? <JsonViewer value={e.metadata} label="Details" /> : null}
        </div>
      ) : null}
    </li>
  )
}

/**
 * An audit log: who did what and when, by people, agents, API keys and the system, grouped by day, filtered by who and by area,
 * searched, each event expandable to its target, IP address, a before-and-after diff and raw details, exported as CSV.
 */
function Settings5({
  events = sample,
  title = "Audit log",
  description = "Every change to this workspace, by people, agents and API keys.",
  range: rangeProp,
  onRangeChange,
  hasMore = false,
  onLoadMore,
  onExport,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Settings5Props) {
  const id = React.useId()
  const [rangeLocal, setRangeLocal] = React.useState<Settings5Range>("7d")
  const range = rangeProp ?? rangeLocal
  const [who, setWho] = React.useState<"all" | "user" | "agent" | "api">("all")
  const [area, setArea] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [loadingMore, setLoadingMore] = React.useState(false)
  const areas = [...new Set(events.map((e) => e.action.split(".")[0]!))].sort()
  const q = query.trim().toLowerCase()
  const visible = events.filter(
    (e) =>
      (who === "all" || (e.actor.kind ?? "user") === who) &&
      (area === "all" || e.action.split(".")[0] === area) &&
      (!q || `${e.summary} ${e.actor.name} ${e.actor.email ?? ""} ${e.action} ${e.target ?? ""} ${e.ip ?? ""}`.toLowerCase().includes(q))
  )
  const days = visible.reduce<{ day: string; events: Settings5Event[] }[]>((acc, e) => {
    const last = acc[acc.length - 1]
    if (last && last.day === e.day) last.events.push(e)
    else acc.push({ day: e.day, events: [e] })
    return acc
  }, [])
  const ready = state === "ready"

  function exportCsv() {
    if (onExport) return onExport(visible)
    const url = URL.createObjectURL(new Blob([csv(visible)], { type: "text/csv" }))
    const a = document.createElement("a")
    a.href = url
    a.download = "audit-log.csv"
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <section data-slot="settings-5" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1">
          <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em]">
            {title}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!ready || !visible.length}>
          <Download aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="bg-background focus-within:ring-ring/50 flex h-9 min-w-0 flex-1 basis-56 items-center gap-2 rounded-md border px-2.5 focus-within:ring-[3px]">
          <Search aria-hidden="true" className="text-muted-foreground size-4" />
          <input type="search" aria-label="Search the audit log" placeholder="Search people, actions, IP addresses" value={query} onChange={(e) => setQuery(e.target.value)} disabled={!ready} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
        <SegmentedControl value={who} onValueChange={(v) => setWho(v as typeof who)} aria-label="Who" size="sm" disabled={!ready}>
          <SegmentedControlItem value="all">Everyone</SegmentedControlItem>
          <SegmentedControlItem value="user">People</SegmentedControlItem>
          <SegmentedControlItem value="agent">Agents</SegmentedControlItem>
          <SegmentedControlItem value="api">API</SegmentedControlItem>
        </SegmentedControl>
        <Select value={area} onValueChange={setArea} disabled={!ready}>
          <SelectTrigger size="sm" className="w-36" aria-label="Area">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All areas</SelectItem>
            {areas.map((a) => (
              <SelectItem key={a} value={a}>
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={range}
          onValueChange={(r) => {
            setRangeLocal(r as Settings5Range)
            onRangeChange?.(r as Settings5Range)
          }}
          disabled={!ready}
        >
          <SelectTrigger size="sm" className="w-40" aria-label="Time range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(rangeLabel) as Settings5Range[]).map((r) => (
              <SelectItem key={r} value={r}>
                {rangeLabel[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <StateView
        state={ready && !events.length ? "empty" : state}
        onRetry={onRetry}
        label="Loading the audit log"
        loading={<LogSkeleton />}
        empty={{ title: emptyState?.title ?? "Nothing recorded yet", description: emptyState?.description ?? `No changes in the ${rangeLabel[range].toLowerCase()}.`, icon: emptyState?.icon ?? <ScrollText />, action: emptyState?.action }}
        error={{ title: errorState?.title ?? "The audit log could not be loaded", ...errorState }}
        className="mt-6"
      >
        <div className="grid gap-6">
          {days.map((d) => (
            <section key={d.day} aria-label={d.day} className="grid gap-2">
              <h3 className="text-muted-foreground text-xs font-medium">{d.day}</h3>
              <ul className="grid gap-1.5">
                {d.events.map((e) => (
                  <Row key={e.id} e={e} />
                ))}
              </ul>
            </section>
          ))}
          {!visible.length ? <p className="text-muted-foreground py-10 text-center text-sm">No events match these filters.</p> : null}
          {hasMore && onLoadMore ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                disabled={loadingMore}
                onClick={async () => {
                  setLoadingMore(true)
                  try {
                    await onLoadMore()
                  } finally {
                    setLoadingMore(false)
                  }
                }}
              >
                {loadingMore ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
                {loadingMore ? "Loading…" : "Load older events"}
              </Button>
            </div>
          ) : null}
        </div>
      </StateView>
    </section>
  )
}

export { Settings5, type Settings5Props, type Settings5Event, type Settings5ActorKind, type Settings5Range }
