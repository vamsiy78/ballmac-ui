// Ballmac UI: Audit 1. https://ui.ballmac.com/blocks/audit-1
"use client"

import * as React from "react"
import { ArrowRight, ChevronDown, CircleX, Download, Search } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { MatchHighlight, matchesAll, queryTokens } from "@/components/ballmac/match-highlight"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Audit1Category = "signin" | "permissions" | "data" | "billing"

type Audit1Event = {
  id: string
  /** When it happened, already formatted, such as "24 Oct, 14:02". */
  time: string
  actor: { name: string; email?: string }
  /** What was done, for example "Changed a role". */
  action: string
  category: Audit1Category
  /** What it was done to, for example "Priya Shah". */
  target: string
  /** Network address the request came from. */
  ip?: string
  /** Where that address is, for example "Lisbon, Portugal". */
  place?: string
  /** Whether it went through. A failed attempt is written out, not just coloured. */
  result?: "success" | "failed"
  /** Values that changed, shown when the row is opened. */
  changes?: { field: string; from: string; to: string }[]
}

type Audit1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    events?: Audit1Event[]
    title?: string
    /** How many events show before "Show more". */
    pageSize?: number
    /** The event whose details are open at first. */
    defaultOpenId?: string
    /** Called with the events that match the current search and filter. Return a promise; reject and the message says it failed. */
    onExport?: (events: Audit1Event[]) => void | Promise<void>
  }

const CATEGORIES: { id: Audit1Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "signin", label: "Sign-in" },
  { id: "permissions", label: "Permissions" },
  { id: "data", label: "Data" },
  { id: "billing", label: "Billing" },
]

const sample: Audit1Event[] = [
  { id: "e1", time: "24 Oct, 14:02", actor: { name: "Priya Shah", email: "priya@acme.example" }, action: "Changed a role", category: "permissions", target: "Theo Nakamura", ip: "203.0.113.24", place: "Lisbon, Portugal", changes: [{ field: "Role", from: "Member", to: "Admin" }] },
  { id: "e2", time: "24 Oct, 13:47", actor: { name: "Theo Nakamura", email: "theo@acme.example" }, action: "Signed in", category: "signin", target: "Dashboard", ip: "198.51.100.7", place: "Osaka, Japan" },
  { id: "e3", time: "24 Oct, 13:31", actor: { name: "Unknown" }, action: "Tried to sign in", category: "signin", target: "noor@acme.example", ip: "192.0.2.88", place: "Unknown location", result: "failed" },
  { id: "e4", time: "24 Oct, 11:12", actor: { name: "Noor Haddad", email: "noor@acme.example" }, action: "Exported customers", category: "data", target: "customers.csv, 4,812 rows", ip: "203.0.113.90", place: "Dubai, UAE" },
  { id: "e5", time: "24 Oct, 10:05", actor: { name: "Ana Souza", email: "ana@acme.example" }, action: "Changed the plan", category: "billing", target: "Workspace plan", ip: "198.51.100.31", place: "Lisbon, Portugal", changes: [{ field: "Plan", from: "Team", to: "Business" }, { field: "Seats", from: "10", to: "25" }] },
  { id: "e6", time: "23 Oct, 18:20", actor: { name: "Kofi Mensah", email: "kofi@acme.example" }, action: "Deleted a project", category: "data", target: "Q3 experiments", ip: "203.0.113.5", place: "Accra, Ghana", changes: [{ field: "Status", from: "Active", to: "Deleted" }] },
  { id: "e7", time: "23 Oct, 16:44", actor: { name: "Priya Shah", email: "priya@acme.example" }, action: "Invited a member", category: "permissions", target: "oliver@acme.example", ip: "203.0.113.24", place: "Lisbon, Portugal", changes: [{ field: "Role", from: "(none)", to: "Member" }] },
  { id: "e8", time: "23 Oct, 09:18", actor: { name: "Oliver Reed", email: "oliver@acme.example" }, action: "Signed in", category: "signin", target: "Dashboard", ip: "198.51.100.12", place: "Leeds, United Kingdom" },
  { id: "e9", time: "22 Oct, 17:02", actor: { name: "Ana Souza", email: "ana@acme.example" }, action: "Updated the billing email", category: "billing", target: "Billing contact", ip: "198.51.100.31", place: "Lisbon, Portugal", changes: [{ field: "Email", from: "ap@acme.example", to: "finance@acme.example" }] },
  { id: "e10", time: "22 Oct, 12:40", actor: { name: "Kofi Mensah", email: "kofi@acme.example" }, action: "Created an API key", category: "permissions", target: "Key ending 4f2a", ip: "203.0.113.5", place: "Accra, Ghana" },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-2">
      <Skeleton className="h-10 rounded-lg" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-14 rounded-lg" />
      ))}
    </div>
  )
}

/**
 * An audit log people can search: who did what to what, when and from where. Filters by kind with counts, a failed attempt written out as
 * "Failed", rows that open to show exactly which values changed, a "Show more" button instead of endless scrolling, and an export of whatever
 * the search and filter currently show.
 */
function Audit1({ events: eventsProp = sample, title = "Audit log", pageSize = 8, defaultOpenId, onExport, state = "ready", onRetry, emptyState, errorState, className, ...props }: Audit1Props) {
  const id = React.useId()
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<Audit1Category | "all">("all")
  const [open, setOpen] = React.useState<string | null>(defaultOpenId ?? null)
  const [visible, setVisible] = React.useState(pageSize)
  const [exported, setExported] = React.useState<{ ok: boolean; text: string } | null>(null)
  const tokens = queryTokens(query)

  const view = state === "ready" && eventsProp.length === 0 ? "empty" : state
  const matched = eventsProp.filter((e) => (category === "all" || e.category === category) && (!tokens.length || matchesAll(`${e.actor.name} ${e.actor.email ?? ""} ${e.action} ${e.target} ${e.ip ?? ""}`, tokens)))
  const shown = matched.slice(0, visible)
  const count = (c: Audit1Category | "all") => (c === "all" ? eventsProp.length : eventsProp.filter((e) => e.category === c).length)

  async function exportCsv() {
    setExported(null)
    try {
      await onExport?.(matched)
      setExported({ ok: true, text: `Exported ${matched.length} ${matched.length === 1 ? "event" : "events"}.` })
    } catch (e) {
      setExported({ ok: false, text: e instanceof Error ? e.message : "The export did not finish. Nothing was downloaded." })
    }
  }

  return (
    <section data-slot="audit-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-pretty">Who did what, to what, when and from where. Open a row to see what changed.</p>
        </div>
        {view === "ready" && (
          <Button variant="outline" onClick={() => void exportCsv()} disabled={matched.length === 0}>
            <Download aria-hidden="true" /> Export {matched.length}
          </Button>
        )}
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the audit log" loading={<Skel />} empty={{ title: "No activity yet", description: "Sign-ins, permission changes, exports and billing changes will appear here as they happen.", ...emptyState }} error={{ title: "The audit log could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="bg-background focus-within:ring-ring/50 flex h-10 flex-1 items-center gap-2 rounded-lg border px-3 focus-within:ring-[3px]">
            <Search aria-hidden="true" className="text-muted-foreground size-4" />
            <input type="search" aria-label="Search the audit log" placeholder="Search by person, action, target or address" value={query} onChange={(e) => { setQuery(e.target.value); setVisible(pageSize) }} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </div>
          <div role="group" aria-label="Filter by kind" className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => { setCategory(c.id); setVisible(pageSize) }} className={cn("focus-visible:ring-ring/50 shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", category === c.id ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
                {c.label} <span className={cn("tabular-nums", category === c.id ? "opacity-70" : "text-muted-foreground")}>{count(c.id)}</span>
              </button>
            ))}
          </div>
        </div>
        <p aria-live="polite" className="text-muted-foreground mt-4 text-sm">
          {matched.length} {matched.length === 1 ? "event" : "events"}
          {exported && (
            <span role={exported.ok ? "status" : "alert"} className={cn("ms-3", exported.ok ? "text-foreground" : "text-destructive font-medium")}>
              {exported.text}
            </span>
          )}
        </p>

        {shown.length ? (
          <div className="mt-3 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <caption className="sr-only">{title}</caption>
              <thead className="bg-muted/40 text-muted-foreground text-xs">
                <tr>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">When</th>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">Who</th>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">What</th>
                  <th scope="col" className="hidden px-4 py-2.5 text-start font-medium md:table-cell">From</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {shown.map((e) => {
                  const isOpen = open === e.id
                  const failed = e.result === "failed"
                  return (
                    <React.Fragment key={e.id}>
                      <tr data-category={e.category} className={cn(isOpen && "bg-muted/30")}>
                        <td className="text-muted-foreground px-4 py-3 align-top font-mono text-xs whitespace-nowrap tabular-nums" dir="ltr">{e.time}</td>
                        <td className="px-4 py-3 align-top">
                          <span className="block font-medium"><MatchHighlight text={e.actor.name} query={tokens} /></span>
                          {e.actor.email && <span className="text-muted-foreground block text-xs" dir="ltr">{e.actor.email}</span>}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <button type="button" aria-expanded={e.changes?.length ? isOpen : undefined} disabled={!e.changes?.length} onClick={() => setOpen(isOpen ? null : e.id)} aria-controls={e.changes?.length ? `${id}-${e.id}` : undefined} className="focus-visible:ring-ring/50 -m-1 flex w-full items-start gap-1.5 rounded-md p-1 text-start outline-none focus-visible:ring-[3px] disabled:cursor-default">
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-x-2">
                                <MatchHighlight text={e.action} query={tokens} />
                                {failed && (
                                  <span className="text-destructive inline-flex items-center gap-1 text-xs font-medium">
                                    <CircleX aria-hidden="true" className="size-3" /> Failed
                                  </span>
                                )}
                              </span>
                              <span className="text-muted-foreground block text-xs"><MatchHighlight text={e.target} query={tokens} /></span>
                            </span>
                            {e.changes?.length ? <ChevronDown aria-hidden="true" className={cn("text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} /> : null}
                          </button>
                        </td>
                        <td className="text-muted-foreground hidden px-4 py-3 align-top text-xs md:table-cell">
                          <span className="block" dir="ltr">{e.ip ?? "—"}</span>
                          {e.place && <span className="block">{e.place}</span>}
                        </td>
                      </tr>
                      {isOpen && e.changes?.length ? (
                        <tr className="bg-muted/30">
                          <td colSpan={4} id={`${id}-${e.id}`} className="px-4 pt-0 pb-4">
                            <dl className="bg-background grid gap-px overflow-hidden rounded-lg border text-sm">
                              {e.changes.map((c) => (
                                <div key={c.field} className="grid grid-cols-[7rem_1fr] items-baseline gap-3 px-3 py-2">
                                  <dt className="text-muted-foreground text-xs font-medium">{c.field}</dt>
                                  <dd className="flex flex-wrap items-center gap-2">
                                    <span className="text-muted-foreground line-through decoration-1">{c.from}</span>
                                    <ArrowRight aria-label="changed to" role="img" className="text-muted-foreground size-3.5 rtl:rotate-180" />
                                    <span className="font-medium">{c.to}</span>
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-card mt-3 rounded-xl border px-6 py-14 text-center">
            <h2 className="text-lg font-semibold tracking-tight">No events match</h2>
            <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm text-pretty">Try a different search, or look at all kinds of activity.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setQuery(""); setCategory("all") }}>
              Clear filters
            </Button>
          </div>
        )}
        {matched.length > shown.length && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={() => setVisible((v) => v + pageSize)}>
              Show {Math.min(pageSize, matched.length - shown.length)} more
            </Button>
          </div>
        )}
      </StateView>
    </section>
  )
}

export { Audit1, type Audit1Props, type Audit1Event, type Audit1Category }
