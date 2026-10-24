// Ballmac UI: Agent Roster. https://ui.ballmac.com/components/agent-roster
"use client"

import * as React from "react"
import { AlertOctagon, CheckCircle2, CircleSlash, Hourglass, Loader2, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type AgentStatus = "working" | "idle" | "waiting" | "blocked" | "offline"

type RosterAgent = {
  id: string
  name: string
  /** What it is for, for example "Writes the code". */
  role?: string
  status: AgentStatus
  /** What it is doing right now, or last did. */
  task?: string
  /** How busy it is, 0 to 100. */
  load?: number
  /** When it was last active, already formatted, such as "just now". */
  lastActive?: string
}

const STATUS: Record<AgentStatus, { icon: LucideIcon; fallback: string; tone: string }> = {
  working: { icon: Loader2, fallback: "Working", tone: "text-foreground" },
  idle: { icon: CheckCircle2, fallback: "Idle", tone: "text-muted-foreground" },
  waiting: { icon: Hourglass, fallback: "Waiting", tone: "text-foreground" },
  blocked: { icon: AlertOctagon, fallback: "Blocked", tone: "text-destructive" },
  offline: { icon: CircleSlash, fallback: "Offline", tone: "text-muted-foreground" },
}
const ORDER: AgentStatus[] = ["working", "waiting", "blocked", "idle", "offline"]

const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()

type AgentRosterProps = Omit<React.ComponentProps<"section">, "onSelect" | "title"> & {
  /** The agents to show. */
  agents: RosterAgent[]
  /** The selected agent id. Controlled. */
  selected?: string | null
  /** The selected agent id for uncontrolled use. */
  defaultSelected?: string | null
  /** Called when an agent is picked, or null when it is cleared. */
  onSelectedChange?: (id: string | null) => void
  /** Heading. */
  title?: string
}

/**
 * Every agent on a team of agents as a card: who it is, whether it is working, waiting or blocked, what it is doing and how busy it is. Status counts
 * are filters, a card is a toggle button, and a blocked agent is called out in words. A selection is yours to use, for example to open its run.
 */
function AgentRoster({ agents, selected: selectedProp, defaultSelected = null, onSelectedChange, title, className, ...props }: AgentRosterProps) {
  const msg = useMessages()
  const uid = React.useId()
  title ??= msg("agent-roster.title", "Agents")
  const [inner, setInner] = React.useState<string | null>(defaultSelected)
  const selected = selectedProp !== undefined ? selectedProp : inner
  const [filter, setFilter] = React.useState<AgentStatus | "all">("all")
  const count = (s: AgentStatus) => agents.filter((a) => a.status === s).length
  const shown = filter === "all" ? agents : agents.filter((a) => a.status === filter)
  const text = (s: AgentStatus) => msg(`agent-roster.${s}`, STATUS[s].fallback)

  function pick(id: string) {
    const next = id === selected ? null : id
    if (selectedProp === undefined) setInner(next)
    onSelectedChange?.(next)
  }

  return (
    <section data-slot="agent-roster" aria-labelledby={`${uid}-t`} className={cn("grid w-full min-w-0 gap-4", className)} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={`${uid}-t`} className="text-sm font-medium text-foreground">{title}</h3>
        <div role="group" aria-label={msg("agent-roster.filter", "Filter by status")} className="flex max-w-full flex-wrap gap-1.5">
          {(["all", ...ORDER] as const).map((k) => {
            const n = k === "all" ? agents.length : count(k)
            if (k !== "all" && n === 0) return null
            return (
              <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={cn("h-8 rounded-full border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none", filter === k ? "border-foreground bg-foreground text-background" : "hover:bg-accent")}>
                {k === "all" ? msg("agent-roster.all", "All") : text(k)} <span className={cn("tabular-nums", filter === k ? "opacity-70" : "text-muted-foreground")}>{n}</span>
              </button>
            )
          })}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">{msg("agent-roster.count", "{count} agents shown", { count: shown.length })}</p>

      <ul className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))]">
        {shown.map((a) => {
          const s = STATUS[a.status]
          const Icon = s.icon
          const on = selected === a.id
          return (
            <li key={a.id}>
              <button
                type="button"
                data-status={a.status}
                aria-pressed={on}
                onClick={() => pick(a.id)}
                className={cn("flex h-full w-full flex-col gap-3 rounded-xl border bg-card p-4 text-start text-card-foreground outline-none transition-[border-color,background-color] duration-150 hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none", on && "border-foreground bg-accent/40", a.status === "blocked" && !on && "border-destructive/50")}
              >
                <span className="flex items-start gap-3">
                  <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{initials(a.name)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">{a.name}</span>
                    {a.role && <span className="block truncate text-xs text-muted-foreground">{a.role}</span>}
                  </span>
                  <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-xs font-medium", s.tone)}>
                    <Icon aria-hidden="true" className={cn("size-3.5", a.status === "working" && "motion-safe:animate-spin")} style={a.status === "working" ? { animationPlayState: "var(--bm-ambient-state, running)" } : undefined} />
                    {text(a.status)}
                  </span>
                </span>
                {a.task && <span className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">{a.task}</span>}
                <span className="mt-auto flex items-center gap-3">
                  {typeof a.load === "number" && (
                    <span className="flex flex-1 items-center gap-2">
                      <span role="meter" aria-label={msg("agent-roster.load", "{name} load", { name: a.name })} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(a.load)} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <span className="block h-full rounded-full bg-foreground" style={{ width: `${Math.min(100, Math.max(0, a.load))}%` }} />
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{Math.round(a.load)}%</span>
                    </span>
                  )}
                  {a.lastActive && <span className="ms-auto text-[11px] text-muted-foreground">{a.lastActive}</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export { AgentRoster, type AgentRosterProps, type AgentStatus, type RosterAgent }
