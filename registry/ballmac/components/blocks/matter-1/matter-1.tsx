// Ballmac UI: Matter 1. https://ui.ballmac.com/blocks/matter-1
"use client"

import * as React from "react"
import { CalendarClock, CircleAlert, Search } from "lucide-react"

import { MatchHighlight, matchesAll, queryTokens } from "@/components/ballmac/match-highlight"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Matter1Matter = {
  id: string
  /** The client, for example "Harlow Logistics Ltd". */
  client: string
  /** The matter, for example "Lease renewal, Unit 4". */
  title: string
  area: string
  /** The lawyer in charge. */
  lead: string
  status: "open" | "waiting" | "closed"
  /** The next date that cannot be missed, with what it is. */
  deadline?: { label: string; date: string; /** Days from today; negative is overdue. */ days: number }
  /** Hours recorded this month. */
  hours: number
  /** Hours budgeted for this month, if the matter has a budget. */
  budget?: number
}

type Matter1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    matters?: Matter1Matter[]
    title?: string
    /** Show matters with a deadline within this many days as "soon". */
    soonDays?: number
  }

const sample: Matter1Matter[] = [
  { id: "m1", client: "Harlow Logistics Ltd", title: "Lease renewal, Unit 4", area: "Property", lead: "A. Okafor", status: "open", deadline: { label: "Reply to landlord's notice", date: "Mon 27 Oct", days: 3 }, hours: 14.5, budget: 20 },
  { id: "m2", client: "Dr. Elena Marsh", title: "Employment tribunal response", area: "Employment", lead: "J. Weber", status: "open", deadline: { label: "File the response (ET3)", date: "Thu 23 Oct", days: -1 }, hours: 31, budget: 28 },
  { id: "m3", client: "Brightwater Foods", title: "Supplier contract review", area: "Commercial", lead: "L. Rossi", status: "waiting", deadline: { label: "Counterparty's comments due", date: "Fri 31 Oct", days: 7 }, hours: 6.25 },
  { id: "m4", client: "The Okonkwo family", title: "Estate administration", area: "Probate", lead: "A. Okafor", status: "open", deadline: { label: "Inheritance tax payment", date: "Fri 28 Nov", days: 35 }, hours: 9, budget: 12 },
  { id: "m5", client: "Northpoint Dental", title: "Data protection policy", area: "Commercial", lead: "L. Rossi", status: "open", hours: 3.5, budget: 8 },
  { id: "m6", client: "M. Petrov", title: "Boundary dispute", area: "Property", lead: "J. Weber", status: "closed", hours: 0 },
]

const STATUS = { open: "Open", waiting: "Waiting on others", closed: "Closed" } as const
const hrs = (n: number) => `${+n.toFixed(2)} h`

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-3">
      <Skeleton className="h-20 rounded-xl" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  )
}

/**
 * A law firm's matters: the dates that cannot be missed come first and say overdue or due soon in words, then the list with client, lead, status and hours
 * against the month's budget. Search and the practice area filter narrow it, and a matter over its budget says so instead of just turning red.
 */
function Matter1({ matters = sample, title = "Matters", soonDays = 7, state = "ready", onRetry, emptyState, errorState, className, ...props }: Matter1Props) {
  const id = React.useId()
  const [query, setQuery] = React.useState("")
  const [area, setArea] = React.useState("all")
  const [showClosed, setShowClosed] = React.useState(false)
  const tokens = queryTokens(query)
  const view = state === "ready" && matters.length === 0 ? "empty" : state
  const areas = [...new Set(matters.map((m) => m.area))]
  const shown = matters.filter((m) => (showClosed || m.status !== "closed") && (area === "all" || m.area === area) && (!tokens.length || matchesAll(`${m.client} ${m.title} ${m.lead} ${m.area}`, tokens)))
  const dated = matters.filter((m) => m.deadline && m.status !== "closed").sort((a, b) => a.deadline!.days - b.deadline!.days)
  const urgent = dated.filter((m) => m.deadline!.days <= soonDays)
  const when = (days: number) => (days < 0 ? `${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} overdue` : days === 0 ? "Due today" : `In ${days} ${days === 1 ? "day" : "days"}`)

  return (
    <section data-slot="matter-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-pretty">The dates that cannot be missed first, then every matter and how its hours are going.</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading matters" loading={<Skel />} empty={{ title: "No matters yet", description: "Open a matter for a client and it will appear here with its deadlines and hours.", ...emptyState }} error={{ title: "Matters could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <section aria-labelledby={`${id}-dates`} className="bg-card rounded-xl border p-4 sm:p-5">
          <h2 id={`${id}-dates`} className="text-muted-foreground flex items-center gap-2 text-xs font-medium"><CalendarClock aria-hidden="true" className="size-3.5" /> Dates that cannot be missed</h2>
          {dated.length ? (
            <ol className="mt-3 divide-y">
              {dated.slice(0, 4).map((m) => {
                const over = m.deadline!.days < 0
                return (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm">
                    <span className="min-w-0">
                      <span className="font-medium">{m.deadline!.label}</span>
                      <span className="text-muted-foreground"> · {m.client}</span>
                    </span>
                    <span className={cn("flex items-center gap-1.5 tabular-nums", over ? "text-destructive font-semibold" : m.deadline!.days <= soonDays ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {(over || m.deadline!.days <= soonDays) && <CircleAlert aria-hidden="true" className="size-3.5" />}
                      {m.deadline!.date} · {when(m.deadline!.days)}
                    </span>
                  </li>
                )
              })}
            </ol>
          ) : (
            <p className="text-muted-foreground mt-2 text-sm">No deadlines are set.</p>
          )}
          {urgent.length > 0 && <p role="status" className="mt-2 text-xs font-medium">{urgent.length} {urgent.length === 1 ? "date is" : "dates are"} overdue or due within {soonDays} days.</p>}
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="bg-background focus-within:ring-ring/50 flex h-10 flex-1 items-center gap-2 rounded-lg border px-3 focus-within:ring-[3px]">
            <Search aria-hidden="true" className="text-muted-foreground size-4" />
            <input type="search" aria-label="Search matters" placeholder="Search by client, matter, lead or area" value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </div>
          <select aria-label="Practice area" value={area} onChange={(e) => setArea(e.target.value)} className="bg-background focus-visible:ring-ring/50 h-10 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]">
            <option value="all">All areas</option>
            {areas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} className="accent-foreground size-4" /> Show closed
          </label>
        </div>
        <p aria-live="polite" className="text-muted-foreground mt-4 text-sm">{shown.length} {shown.length === 1 ? "matter" : "matters"}</p>

        {shown.length ? (
          <div tabIndex={0} role="region" aria-label={`${title}, scrollable`} className="mt-3 focus-visible:ring-ring/50 overflow-x-auto rounded-xl border outline-none focus-visible:ring-[3px]">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <caption className="sr-only">{title}</caption>
              <thead className="bg-muted/40 text-muted-foreground text-xs">
                <tr>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">Matter</th>
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">Lead</th>
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">Status</th>
                  <th scope="col" className="px-4 py-2.5 text-end font-medium">Hours this month</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {shown.map((m) => {
                  const over = m.budget !== undefined && m.hours > m.budget
                  return (
                    <tr key={m.id} data-status={m.status}>
                      <th scope="row" className="px-4 py-3 text-start font-normal">
                        <span className="block font-medium"><MatchHighlight text={m.title} query={tokens} /></span>
                        <span className="text-muted-foreground block text-xs"><MatchHighlight text={m.client} query={tokens} /> · {m.area}</span>
                      </th>
                      <td className="text-muted-foreground px-3 py-3"><MatchHighlight text={m.lead} query={tokens} /></td>
                      <td className="px-3 py-3">{STATUS[m.status]}</td>
                      <td className="px-4 py-3 text-end tabular-nums">
                        <span className="font-medium">{hrs(m.hours)}</span>
                        {m.budget !== undefined && <span className="text-muted-foreground"> of {hrs(m.budget)}</span>}
                        {over && <span className="text-destructive block text-xs font-medium">Over budget by {hrs(m.hours - m.budget!)}</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground mt-3 rounded-xl border border-dashed px-4 py-12 text-center text-sm">No matters match. Try another search or area.</p>
        )}
      </StateView>
    </section>
  )
}

export { Matter1, type Matter1Matter, type Matter1Props }
