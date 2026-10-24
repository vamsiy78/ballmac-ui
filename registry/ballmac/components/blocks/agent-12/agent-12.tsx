// Ballmac UI: Agent 12. https://ui.ballmac.com/blocks/agent-12
"use client"

import * as React from "react"
import { Check, CircleCheck, Loader2, ShieldAlert, X } from "lucide-react"

import { AgentTree, type AgentNode } from "@/components/ballmac/agent-tree"
import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Agent12Request = {
  id: string
  /** The agent that is waiting, by id in `agents`. */
  agentId?: string
  /** What it wants to do, for example "Send 340 USD to Maria Lopez". */
  title: string
  /** Why, and what happens if it is approved. */
  detail?: string
  risk?: "low" | "high"
}

type Agent12Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    agents?: AgentNode[]
    /** Things agents are waiting on a person for. */
    requests?: Agent12Request[]
    /** ISO currency code for costs. */
    currency?: string
    /** Called to approve a request. Reject and it comes back with the message. */
    onApprove?: (request: Agent12Request) => void | Promise<void>
    /** Called to deny a request. Reject and it comes back with the message. */
    onDeny?: (request: Agent12Request) => void | Promise<void>
  }

const sampleAgents: AgentNode[] = [
  { id: "o", name: "Support lead", model: "Opus 5.5", status: "running", task: "Clear today's refund backlog.", cost: 0.31, tokens: 41800, duration: "12 min" },
  { id: "t", parentId: "o", name: "Triage", model: "Haiku 5.5", status: "done", task: "Sort 48 tickets into refund, shipping and other.", cost: 0.04, tokens: 12900, duration: "2 min 10 s" },
  { id: "r", parentId: "o", name: "Refunds", model: "Sonnet 5.5", status: "running", task: "Work through 19 refund requests.", progress: 58, cost: 0.17, tokens: 20100, duration: "9 min" },
  { id: "r1", parentId: "r", name: "Policy checker", model: "Haiku 5.5", status: "done", task: "Check each request against the refund policy.", cost: 0.02, tokens: 7400, duration: "3 min" },
  { id: "r2", parentId: "r", name: "Payments", model: "Sonnet 5.5", status: "waiting", task: "Issue the approved refunds through Stripe.", cost: 0.06, tokens: 6800, duration: "5 min" },
  { id: "s", parentId: "o", name: "Shipping", model: "Sonnet 5.5", status: "running", task: "Chase 12 late parcels with the carrier.", progress: 33, cost: 0.06, tokens: 8800, duration: "6 min" },
  { id: "w", parentId: "o", name: "Daily summary", model: "Sonnet 5.5", status: "queued", task: "Write the end-of-day report." },
]
const sampleRequests: Agent12Request[] = [
  { id: "q1", agentId: "r2", title: "Refund $340.00 to Maria Lopez", detail: "Order A-9914 arrived damaged twice. It is above the $250 an agent may approve alone.", risk: "high" },
  { id: "q2", agentId: "r2", title: "Refund $58.20 to Tomás Reyes", detail: "A late delivery the carrier has confirmed. Within policy, but the customer has asked three times.", risk: "low" },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  )
}

const fmtTokens = (n: number) => (n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${+(n / 1000).toFixed(1)}K` : String(n))

/**
 * Mission control for a team of agents: the totals at the top (spend, tokens, how many are running, how many need you), the delegation tree below, and an inbox of
 * the decisions agents are waiting on. Approve and Deny act at once and come back with the reason if they fail; a high-risk request says so in words. When nothing
 * needs a person, the inbox says that instead of showing an empty box.
 */
function Agent12({ title = "Support team", agents = sampleAgents, requests: requestsProp = sampleRequests, currency = "USD", onApprove, onDeny, state = "ready", onRetry, emptyState, errorState, className, ...props }: Agent12Props) {
  const id = React.useId()
  const [requests, setRequests] = React.useState(requestsProp)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<{ id: string; text: string } | null>(null)
  const [done, setDone] = React.useState<string | null>(null)
  const view = state === "ready" && agents.length === 0 ? "empty" : state
  const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: n < 1 ? 2 : 2 }).format(n)
  const cost = agents.reduce((n, a) => n + (a.cost ?? 0), 0)
  const tokens = agents.reduce((n, a) => n + (a.tokens ?? 0), 0)
  const running = agents.filter((a) => a.status === "running").length
  const nameOf = (agentId?: string) => agents.find((a) => a.id === agentId)?.name

  async function act(r: Agent12Request, approve: boolean) {
    setBusy(r.id)
    setError(null)
    setDone(null)
    try {
      await (approve ? onApprove : onDeny)?.(r)
      setRequests((list) => list.filter((x) => x.id !== r.id))
      setDone(`${approve ? "Approved" : "Denied"}: ${r.title}.`)
    } catch (e) {
      setError({ id: r.id, text: e instanceof Error ? e.message : `It could not be ${approve ? "approved" : "denied"}. Nothing was changed.` })
    } finally {
      setBusy(null)
    }
  }

  const kpis: [string, string, string][] = [
    ["Spend", money(cost), "so far this run"],
    ["Tokens", fmtTokens(tokens), "across all agents"],
    ["Agents", `${running} of ${agents.length}`, "running now"],
    ["Needs you", String(requests.length), requests.length === 1 ? "decision waiting" : "decisions waiting"],
  ]

  return (
    <section data-slot="agent-12" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6">
        <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em] text-balance">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Who is doing what, what it costs, and what is waiting for you.</p>
      </header>

      <StateView state={view} onRetry={onRetry} label="Loading the agents" loading={<Skel />} empty={{ title: "No agents running", description: "Start a task and the agents it delegates to appear here.", ...emptyState }} error={{ title: "The agents could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <div className="grid gap-6">
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map(([label, value, note]) => (
              <div key={label} className={cn("rounded-xl border bg-card p-4", label === "Needs you" && requests.length > 0 && "border-foreground")}>
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold tracking-tight tabular-nums">{value}</dd>
                <dd className="mt-0.5 text-xs text-muted-foreground">{note}</dd>
              </div>
            ))}
          </dl>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <AgentTree agents={agents} title="Agents" currency={currency} defaultSelected="r2" />

            <aside aria-labelledby={`${id}-needs`} className="grid gap-3 lg:sticky lg:top-6">
              <h2 id={`${id}-needs`} className="flex items-center gap-2 text-sm font-semibold">
                Needs you
                <span className="rounded-full bg-muted px-2 py-px text-xs font-medium tabular-nums">{requests.length}</span>
              </h2>
              {requests.length === 0 ? (
                <p className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-8 text-sm text-muted-foreground"><CircleCheck aria-hidden="true" className="size-4" />Nothing is waiting for you.</p>
              ) : (
                <ul className="grid gap-3">
                  {requests.map((r) => (
                    <li key={r.id} className="grid gap-3 rounded-xl border bg-card p-4">
                      <div>
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
                          {r.title}
                          {r.risk === "high" && <span className="inline-flex items-center gap-1 rounded-full border border-destructive/50 px-2 py-px text-[11px] font-medium text-destructive"><ShieldAlert aria-hidden="true" className="size-3" />High risk</span>}
                        </p>
                        {nameOf(r.agentId) && <p className="mt-0.5 text-xs text-muted-foreground">Asked by {nameOf(r.agentId)}</p>}
                        {r.detail && <p className="mt-2 text-[13px] leading-snug text-muted-foreground text-pretty">{r.detail}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" disabled={busy === r.id} onClick={() => void act(r, true)}>{busy === r.id ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Check aria-hidden="true" />} Approve</Button>
                        <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => void act(r, false)}><X aria-hidden="true" /> Deny</Button>
                      </div>
                      {error?.id === r.id && <p role="alert" className="text-sm font-medium text-destructive">{error.text}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <p aria-live="polite" className="min-h-4 text-xs text-muted-foreground">{done}</p>
            </aside>
          </div>
        </div>
      </StateView>
    </section>
  )
}

export { Agent12, type Agent12Props, type Agent12Request }
