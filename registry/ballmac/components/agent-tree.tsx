// Ballmac UI: Agent Tree. https://ui.ballmac.com/components/agent-tree
"use client"

import * as React from "react"
import { Check, ChevronRight, CircleAlert, CircleDashed, Hourglass, Network, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"
import { useLoopsPaused } from "@/lib/ballmac/motion"

type AgentStatus = "queued" | "running" | "waiting" | "done" | "failed"

type AgentNode = {
  id: string
  /** The agent that handed this one its work. Leave it out for the top agent. */
  parentId?: string
  name: string
  /** What it was asked to do. */
  task?: string
  status: AgentStatus
  /** 0 to 100. A parent without its own number shows the average of its sub-agents. */
  progress?: number
  /** The model it runs on, for example "Sonnet 5.5". */
  model?: string
  tokens?: number
  /** What it has cost so far, in `currency`. */
  cost?: number
  /** How long it has run, already formatted, such as "1 min 20 s". */
  duration?: string
}

type AgentTreeProps = Omit<React.ComponentProps<"div">, "onSelect" | "title"> & {
  agents: AgentNode[]
  /** The selected agent id. Controlled. */
  selected?: string | null
  defaultSelected?: string | null
  onSelectedChange?: (id: string) => void
  /** Agents whose sub-agents start hidden. */
  defaultCollapsed?: string[]
  /** Heading in the strip above the tree. */
  title?: string
  /** ISO currency code for costs. */
  currency?: string
}

const STATUS: Record<AgentStatus, { icon: typeof Check; label: string }> = {
  queued: { icon: CircleDashed, label: "Queued" },
  running: { icon: Loader2, label: "Running" },
  waiting: { icon: Hourglass, label: "Waiting" },
  done: { icon: Check, label: "Done" },
  failed: { icon: CircleAlert, label: "Failed" },
}

type Row = { node: AgentNode; level: number; setsize: number; pos: number; hasChildren: boolean }

/** Agents as a depth-first list, each followed by its sub-agents. An agent whose parent is missing counts as top level, and a loop is cut. */
function flattenAgents(agents: AgentNode[], collapsed: Set<string>): Row[] {
  const ids = new Set(agents.map((a) => a.id))
  const kids = new Map<string | undefined, AgentNode[]>()
  for (const a of agents) {
    const p = a.parentId && ids.has(a.parentId) && a.parentId !== a.id ? a.parentId : undefined
    kids.set(p, [...(kids.get(p) ?? []), a])
  }
  const rows: Row[] = []
  const seen = new Set<string>()
  const walk = (parent: string | undefined, level: number) => {
    const list = kids.get(parent) ?? []
    list.forEach((node, i) => {
      if (seen.has(node.id)) return
      seen.add(node.id)
      const has = (kids.get(node.id) ?? []).length > 0
      rows.push({ node, level, setsize: list.length, pos: i + 1, hasChildren: has })
      if (has && !collapsed.has(node.id)) walk(node.id, level + 1)
    })
  }
  walk(undefined, 1)
  // Agents caught in a loop (each the parent of the other) have no top-level ancestor, so show them as top level rather than losing them.
  const reachable = new Set<string>()
  const reach = (parent: string | undefined) => (kids.get(parent) ?? []).forEach((n) => { if (!reachable.has(n.id)) { reachable.add(n.id); reach(n.id) } })
  reach(undefined)
  const rest = agents.filter((n) => !reachable.has(n.id))
  rest.forEach((node, i) => {
    if (seen.has(node.id)) return
    seen.add(node.id)
    const has = (kids.get(node.id) ?? []).some((k) => !seen.has(k.id))
    rows.push({ node, level: 1, setsize: rest.length, pos: i + 1, hasChildren: has })
    if (has && !collapsed.has(node.id)) walk(node.id, 2)
  })
  return rows
}

/** An agent's own progress, or the average of its sub-agents' (done counts as 100), or undefined when neither is known. */
function rollup(agents: AgentNode[], id: string, seen = new Set<string>()): number | undefined {
  const a = agents.find((x) => x.id === id)
  if (!a || seen.has(id)) return undefined
  if (a.progress !== undefined) return a.progress
  if (a.status === "done") return 100
  seen.add(id)
  const subs = agents.filter((x) => x.parentId === id).map((x) => rollup(agents, x.id, seen)).filter((x): x is number => x !== undefined)
  return subs.length ? subs.reduce((n, x) => n + x, 0) / subs.length : undefined
}

function formatCost(value: number, currency: string): string {
  const digits = value > 0 && value < 0.1 ? 3 : 2
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)
}

/**
 * Who handed work to whom: an orchestrator and the agents it delegated to, as a tree you can open and close. Each agent shows what it is doing in words,
 * its model, how far along it is (a parent shows the average of its sub-agents), and what it has cost; the header adds it all up. It is a real tree:
 * Up and Down move, Right opens or goes in, Left closes or goes out, Enter selects, and the chosen agent's task is written out underneath.
 */
function AgentTree({ agents, selected: selectedProp, defaultSelected = null, onSelectedChange, defaultCollapsed = [], title, currency = "USD", className, ...props }: AgentTreeProps) {
  const msg = useMessages()
  const paused = useLoopsPaused()
  const [collapsed, setCollapsed] = React.useState(() => new Set(defaultCollapsed))
  const [inner, setInner] = React.useState<string | null>(defaultSelected)
  const selected = selectedProp !== undefined ? selectedProp : inner
  const rows = React.useMemo(() => flattenAgents(agents, collapsed), [agents, collapsed])
  const [focus, setFocus] = React.useState<string | null>(null)
  const tabbable = (focus && rows.some((r) => r.node.id === focus) ? focus : selected && rows.some((r) => r.node.id === selected) ? selected : rows[0]?.node.id) ?? null
  const refs = React.useRef(new Map<string, HTMLDivElement>())
  const chosen = agents.find((a) => a.id === selected)
  const word = (s: AgentStatus) => msg(`agent-tree.status.${s}`, STATUS[s].label)
  const running = agents.filter((a) => a.status === "running").length
  const failed = agents.filter((a) => a.status === "failed").length
  const waiting = agents.filter((a) => a.status === "waiting").length
  const priced = agents.filter((a) => a.cost !== undefined)
  const total = priced.reduce((n, a) => n + (a.cost ?? 0), 0)
  const parentRow = (a: AgentNode) => rows.find((r) => r.node.id === a.parentId)

  function select(id: string) {
    if (selectedProp === undefined) setInner(id)
    onSelectedChange?.(id)
  }
  function go(id: string | undefined) {
    if (!id) return
    setFocus(id)
    refs.current.get(id)?.focus()
  }
  function toggle(id: string, open: boolean) {
    setCollapsed((c) => {
      const n = new Set(c)
      if (open) n.delete(id)
      else n.add(id)
      return n
    })
  }
  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const row = rows[i]
    if (e.key === "ArrowDown") go(rows[i + 1]?.node.id)
    else if (e.key === "ArrowUp") go(rows[i - 1]?.node.id)
    else if (e.key === "Home") go(rows[0]?.node.id)
    else if (e.key === "End") go(rows[rows.length - 1]?.node.id)
    else if (e.key === "ArrowRight") {
      if (row.hasChildren && collapsed.has(row.node.id)) toggle(row.node.id, true)
      else if (row.hasChildren) go(rows[i + 1]?.node.id)
    } else if (e.key === "ArrowLeft") {
      if (row.hasChildren && !collapsed.has(row.node.id)) toggle(row.node.id, false)
      else go(parentRow(row.node)?.node.id)
    } else if (e.key === "Enter" || e.key === " ") select(row.node.id)
    else return
    e.preventDefault()
  }

  return (
    <div data-slot="agent-tree" className={cn("grid w-full min-w-0 gap-3", className)} {...props}>
      <div className="bg-card text-card-foreground overflow-hidden rounded-xl border">
        <div data-slot="agent-tree-header" className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-3.5 py-2.5 text-[13px]">
          <Network aria-hidden="true" className="size-4 text-muted-foreground" />
          <span className="font-semibold">{title ?? msg("agent-tree.title", "Agents")}</span>
          <span className="text-muted-foreground">{msg("agent-tree.count", "{count} agents", { count: agents.length })}</span>
          {running > 0 && <span className="flex items-center gap-1.5 text-muted-foreground"><span aria-hidden="true" className="size-1.5 rounded-full bg-chart-2" />{msg("agent-tree.running", "{count} running", { count: running })}</span>}
          {waiting > 0 && <span className="text-muted-foreground">{msg("agent-tree.waiting", "{count} waiting", { count: waiting })}</span>}
          {failed > 0 && <span className="flex items-center gap-1.5 font-medium text-destructive"><span aria-hidden="true" className="size-1.5 rounded-full bg-destructive" />{msg("agent-tree.failed", "{count} failed", { count: failed })}</span>}
          {priced.length > 0 && <span className="ms-auto font-mono text-xs tabular-nums text-muted-foreground">{formatCost(total, currency)}</span>}
        </div>

        <div role="tree" aria-label={msg("agent-tree.label", "Agents and who they delegated to")} className="divide-y">
          {rows.map((r, i) => {
            const a = r.node
            const S = STATUS[a.status]
            const on = selected === a.id
            const open = r.hasChildren && !collapsed.has(a.id)
            const pct = rollup(agents, a.id)
            return (
              <div
                key={a.id}
                ref={(el) => {
                  if (el) refs.current.set(a.id, el)
                  else refs.current.delete(a.id)
                }}
                role="treeitem"
                aria-level={r.level}
                aria-setsize={r.setsize}
                aria-posinset={r.pos}
                aria-expanded={r.hasChildren ? open : undefined}
                aria-selected={on}
                aria-label={msg("agent-tree.item", "{name}, {status}{task}", { name: a.name, status: word(a.status).toLowerCase(), task: a.task ? `, ${a.task}` : "" })}
                tabIndex={tabbable === a.id ? 0 : -1}
                onClick={() => select(a.id)}
                onFocus={() => setFocus(a.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cn("flex min-h-12 cursor-default items-center gap-2 py-2 pe-3.5 text-[13px] outline-none transition-colors hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset motion-reduce:transition-none", on && "bg-accent/60")}
                style={{ paddingInlineStart: 10 }}
              >
                {Array.from({ length: r.level - 1 }, (_, k) => (
                  <span key={k} aria-hidden="true" className="h-6 w-4 shrink-0 border-s border-border" />
                ))}
                {r.hasChildren ? (
                  <button type="button" tabIndex={-1} aria-hidden="true" onClick={(e) => { e.stopPropagation(); toggle(a.id, !open) }} className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent">
                    <ChevronRight className={cn("size-3.5 transition-transform motion-reduce:transition-none rtl:rotate-180", open && "rotate-90 rtl:rotate-90")} />
                  </button>
                ) : (
                  <span aria-hidden="true" className="size-5 shrink-0" />
                )}
                <span aria-hidden="true" className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border", a.status === "done" && "border-foreground bg-foreground text-background", a.status === "running" && "border-foreground", a.status === "failed" && "border-destructive text-destructive", (a.status === "queued" || a.status === "waiting") && "text-muted-foreground")}>
                  <S.icon className={cn("size-3.5", a.status === "running" && !paused && "animate-spin")} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="truncate font-medium text-foreground">{a.name}</span>
                    {a.model && <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{a.model}</span>}
                  </span>
                  {a.task && <span className="block truncate text-xs text-muted-foreground">{a.task}</span>}
                </span>
                {pct !== undefined && a.status !== "failed" && (
                  <span aria-hidden="true" className="hidden w-20 shrink-0 sm:block">
                    <span className="block h-1 overflow-hidden rounded-full bg-muted"><span className={cn("block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", a.status === "done" ? "bg-foreground" : "bg-chart-1")} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} /></span>
                  </span>
                )}
                {a.cost !== undefined && <span className="hidden w-16 shrink-0 text-end font-mono text-xs tabular-nums text-muted-foreground md:inline">{formatCost(a.cost, currency)}</span>}
                <span className={cn("w-16 shrink-0 text-end text-xs font-medium", a.status === "failed" || a.status === "done" || a.status === "running" ? "text-foreground" : "text-muted-foreground")}>{word(a.status)}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div aria-live="polite" className="min-h-[3.5rem] rounded-xl border bg-card p-4 text-sm">
        {chosen ? (
          <div className="grid gap-1">
            <p className="flex flex-wrap items-center gap-x-2 font-medium">
              {chosen.name}
              <span className="rounded-full border px-2 py-0.5 text-[11px] font-normal text-muted-foreground">{word(chosen.status)}</span>
              {chosen.model && <span className="text-xs font-normal text-muted-foreground">{chosen.model}</span>}
            </p>
            {chosen.task && <p className="text-muted-foreground">{chosen.task}</p>}
            <p className="font-mono text-xs tabular-nums text-muted-foreground">
              {[chosen.duration, chosen.tokens !== undefined ? msg("agent-tree.tokens", "{count} tokens", { count: chosen.tokens.toLocaleString("en-US") }) : undefined, chosen.cost !== undefined ? formatCost(chosen.cost, currency) : undefined].filter(Boolean).join(" · ")}
            </p>
            {agents.some((x) => x.parentId === chosen.id) && <p className="text-muted-foreground">{msg("agent-tree.delegated", "Delegated to {count} agents.", { count: agents.filter((x) => x.parentId === chosen.id).length })}</p>}
          </div>
        ) : (
          <p className="text-muted-foreground">{msg("agent-tree.hint", "Select an agent to see its task. Right opens an agent, Left closes it.")}</p>
        )}
      </div>
    </div>
  )
}

export { AgentTree, flattenAgents, rollup as agentProgress, type AgentNode, type AgentStatus, type AgentTreeProps }
