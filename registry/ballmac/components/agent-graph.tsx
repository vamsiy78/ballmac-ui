// Ballmac UI: Agent Graph. https://ui.ballmac.com/components/agent-graph
"use client"

import * as React from "react"
import { Bot, Brain, CircleAlert, CircleCheck, CircleDot, Hourglass, Network, User, Wrench, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type GraphKind = "agent" | "tool" | "human" | "memory"
type GraphStatus = "idle" | "working" | "waiting" | "blocked" | "done"

type GraphNode = {
  id: string
  label: string
  kind?: GraphKind
  status?: GraphStatus
  /** A line shown under the graph when the node is selected. */
  detail?: string
  /** A small second line, such as the model it runs on: "Sonnet 5.5". */
  subtitle?: string
  /** An icon or logo shown instead of the one for its kind. */
  icon?: React.ReactNode
}

type GraphEdge = {
  from: string
  to: string
  /** Short text on the edge, such as "plan" or "asks". */
  label?: string
  /** Draws the edge heavier, for the path the work is taking now. */
  active?: boolean
}

type Placed = GraphNode & { col: number; row: number; x: number; y: number }

const NODE_W = 168
const NODE_H = 58
const COL_GAP = 84
const ROW_GAP = 22
const PAD = 12

/** Finds the edges that point back to a node still being explored (the ones that close a loop), so layering can ignore them. Returns their indexes. */
function backEdges(ids: string[], edges: { from: string; to: string }[]) {
  const state = new Map<string, 1 | 2>()
  const back = new Set<number>()
  const visit = (id: string) => {
    state.set(id, 1)
    edges.forEach((e, i) => {
      if (e.from !== id) return
      const s = state.get(e.to)
      if (s === 1) back.add(i)
      else if (!s) visit(e.to)
    })
    state.set(id, 2)
  }
  const hasIn = new Set(edges.map((e) => e.to))
  for (const id of [...ids.filter((x) => !hasIn.has(x)), ...ids]) if (!state.has(id)) visit(id)
  return back
}

/**
 * Places nodes in columns left to right (a node goes after everything that feeds it) and spreads each column evenly, then returns the nodes with pixel
 * positions and the curve for every edge. Pure, so it can be tested and reused. Edges that loop back are drawn as curves under the nodes.
 */
function layoutGraph(nodes: GraphNode[], edges: GraphEdge[]) {
  const ids = new Set(nodes.map((n) => n.id))
  const good = edges.filter((e) => ids.has(e.from) && ids.has(e.to) && e.from !== e.to)
  const loops = backEdges(nodes.map((n) => n.id), good)
  const forward = good.filter((_, i) => !loops.has(i))
  const col = new Map<string, number>(nodes.map((n) => [n.id, 0]))
  const indeg = new Map<string, number>(nodes.map((n) => [n.id, forward.filter((e) => e.to === n.id).length]))
  const queue = nodes.filter((n) => indeg.get(n.id) === 0).map((n) => n.id)
  const seen = new Set<string>()
  while (queue.length) {
    const id = queue.shift()!
    seen.add(id)
    for (const e of forward.filter((x) => x.from === id)) {
      col.set(e.to, Math.max(col.get(e.to) ?? 0, (col.get(id) ?? 0) + 1))
      indeg.set(e.to, (indeg.get(e.to) ?? 1) - 1)
      if (indeg.get(e.to) === 0) queue.push(e.to)
    }
  }
  const depth = Math.max(0, ...col.values())
  const cols: string[][] = Array.from({ length: depth + 1 }, () => [])
  for (const n of nodes) cols[col.get(n.id) ?? 0].push(n.id)
  const rows = Math.max(...cols.map((c) => c.length), 1)
  const height = PAD * 2 + rows * NODE_H + (rows - 1) * ROW_GAP
  const width = PAD * 2 + (depth + 1) * NODE_W + depth * COL_GAP
  const placed = new Map<string, Placed>()
  cols.forEach((c, ci) => {
    const used = c.length * NODE_H + (c.length - 1) * ROW_GAP
    const top = PAD + (height - PAD * 2 - used) / 2
    c.forEach((id, ri) => {
      const n = nodes.find((x) => x.id === id)!
      placed.set(id, { ...n, col: ci, row: ri, x: PAD + ci * (NODE_W + COL_GAP), y: top + ri * (NODE_H + ROW_GAP) })
    })
  })
  const paths = good.map((e) => {
    const a = placed.get(e.from)!
    const b = placed.get(e.to)!
    const back = b.col <= a.col
    const x0 = back ? a.x + NODE_W / 2 : a.x + NODE_W
    const y0 = back ? a.y + NODE_H : a.y + NODE_H / 2
    const x1 = back ? b.x + NODE_W / 2 : b.x
    const y1 = back ? b.y + NODE_H : b.y + NODE_H / 2
    const mid = (x0 + x1) / 2
    const d = back ? `M ${x0} ${y0} C ${x0} ${y0 + 56}, ${x1} ${y1 + 56}, ${x1} ${y1}` : `M ${x0} ${y0} C ${mid} ${y0}, ${mid} ${y1}, ${x1} ${y1}`
    const lx = back ? (x0 + x1) / 2 : mid
    const ly = back ? Math.max(y0, y1) + 42 : (y0 + y1) / 2
    return { ...e, d, lx, ly }
  })
  return { nodes: [...placed.values()], edges: paths, width, height, depth }
}

const KINDS: Record<GraphKind, { icon: LucideIcon; label: string }> = {
  agent: { icon: Bot, label: "Agent" },
  tool: { icon: Wrench, label: "Tool" },
  human: { icon: User, label: "Person" },
  memory: { icon: Brain, label: "Memory" },
}
const STATUS: Record<GraphStatus, { icon: LucideIcon; label: string }> = {
  idle: { icon: CircleDot, label: "Idle" },
  working: { icon: CircleDot, label: "Working" },
  waiting: { icon: Hourglass, label: "Waiting" },
  blocked: { icon: CircleAlert, label: "Blocked" },
  done: { icon: CircleCheck, label: "Done" },
}

type AgentGraphProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  nodes: GraphNode[]
  edges: GraphEdge[]
  /** The selected node id. Controlled. */
  selected?: string | null
  /** The selected node id for uncontrolled use. */
  defaultSelected?: string | null
  /** Called when a node is chosen, or null when it is cleared. */
  onSelectedChange?: (id: string | null) => void
  /** A heading for a strip above the graph, which also counts how many nodes are working, waiting or blocked. */
  title?: string
  /** Shrink the graph to fit its box when it is only a little too wide (down to 70%), instead of scrolling. On by default. */
  fit?: boolean
}

/**
 * How a team of agents and tools is wired: who sends work to whom. Nodes are buttons showing what they are and what they are doing in words; the arrow keys
 * follow the edges (Right to what a node sends to, Left to what feeds it, Up and Down within a column), and the connections of the chosen node are listed
 * in a sentence. The graph reads left to right and scrolls sideways on a narrow screen.
 */
function AgentGraph({ nodes, edges, selected: selectedProp, defaultSelected = null, onSelectedChange, title, fit = true, className, ...props }: AgentGraphProps) {
  const msg = useMessages()
  const box = React.useRef<HTMLDivElement>(null)
  const [boxWidth, setBoxWidth] = React.useState(0)
  React.useEffect(() => {
    const el = box.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => setBoxWidth(el.clientWidth))
    ro.observe(el)
    setBoxWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  const layout = React.useMemo(() => layoutGraph(nodes, edges), [nodes, edges])
  const byId = new Map(layout.nodes.map((n) => [n.id, n]))
  const counts = React.useMemo(() => ({ working: nodes.filter((n) => n.status === "working").length, waiting: nodes.filter((n) => n.status === "waiting").length, blocked: nodes.filter((n) => n.status === "blocked").length }), [nodes])
  const scale = fit && boxWidth > 0 && layout.width > boxWidth - 2 && (boxWidth - 2) / layout.width >= 0.7 ? (boxWidth - 2) / layout.width : 1
  const [inner, setInner] = React.useState<string | null>(defaultSelected)
  const selected = selectedProp !== undefined ? selectedProp : inner
  const chosen = selected ? byId.get(selected) : undefined
  const [focus, setFocus] = React.useState<string | null>(null)
  const ordered = [...layout.nodes].sort((a, b) => a.col - b.col || a.row - b.row)
  const tabbable = (focus && byId.has(focus) ? focus : selected && byId.has(selected) ? selected : ordered[0]?.id) ?? null
  const refs = React.useRef(new Map<string, HTMLButtonElement>())
  const outOf = (id: string) => layout.edges.filter((e) => e.from === id).map((e) => byId.get(e.to)!).filter(Boolean)
  const into = (id: string) => layout.edges.filter((e) => e.to === id).map((e) => byId.get(e.from)!).filter(Boolean)
  const names = (l: Placed[]) => l.map((n) => n.label).join(", ")
  const lit = (id: string) => !chosen || id === chosen.id || outOf(chosen.id).some((n) => n.id === id) || into(chosen.id).some((n) => n.id === id)

  function pick(id: string) {
    const next = id === selected ? null : id
    if (selectedProp === undefined) setInner(next)
    onSelectedChange?.(next)
  }
  function onKeyDown(e: React.KeyboardEvent, n: Placed) {
    const near = (list: Placed[]) => [...list].sort((a, b) => Math.abs(a.y - n.y) - Math.abs(b.y - n.y))[0]
    const sameCol = ordered.filter((o) => o.col === n.col)
    const i = sameCol.indexOf(n)
    const to = e.key === "ArrowRight" ? near(outOf(n.id)) : e.key === "ArrowLeft" ? near(into(n.id)) : e.key === "ArrowDown" ? sameCol[i + 1] : e.key === "ArrowUp" ? sameCol[i - 1] : e.key === "Home" ? ordered[0] : e.key === "End" ? ordered[ordered.length - 1] : undefined
    if (to) {
      e.preventDefault()
      setFocus(to.id)
      refs.current.get(to.id)?.focus()
    }
  }

  return (
    <div data-slot="agent-graph" className={cn("grid w-full min-w-0 gap-3", className)} {...props}>
      <div ref={box} dir="ltr" tabIndex={-1} className="overflow-x-auto rounded-xl border bg-card">
        {(title || counts.working > 0 || counts.waiting > 0 || counts.blocked > 0) && (
          <div data-slot="agent-graph-header" className="sticky start-0 flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-3 py-2.5 text-[13px]">
            <Network aria-hidden="true" className="size-4 text-muted-foreground" />
            {title && <span className="font-semibold text-foreground">{title}</span>}
            {counts.working > 0 && <span className="flex items-center gap-1.5 text-muted-foreground"><span aria-hidden="true" className="size-1.5 rounded-full bg-chart-2" />{msg("agent-graph.working", "{count} working", { count: counts.working })}</span>}
            {counts.waiting > 0 && <span className="flex items-center gap-1.5 text-muted-foreground"><span aria-hidden="true" className="size-1.5 rounded-full bg-muted-foreground" />{msg("agent-graph.waiting", "{count} waiting", { count: counts.waiting })}</span>}
            {counts.blocked > 0 && <span className="flex items-center gap-1.5 font-medium text-foreground"><span aria-hidden="true" className="size-1.5 rounded-full bg-destructive" />{msg("agent-graph.blocked", "{count} blocked", { count: counts.blocked })}</span>}
          </div>
        )}
        <div style={{ width: layout.width * scale, height: layout.height * scale }} className="mx-auto">
        <div className="relative origin-top-left" style={{ width: layout.width, height: layout.height, transform: scale < 1 ? `scale(${scale})` : undefined }} role="group" aria-label={msg("agent-graph.label", "How the agents and tools are connected")}>
          <svg aria-hidden="true" width={layout.width} height={layout.height} className="absolute inset-0 text-foreground">
            <defs>
              <marker id="ag-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>
            {layout.edges.map((e) => {
              const dim = chosen && !(e.from === chosen.id || e.to === chosen.id)
              return <path key={`${e.from}-${e.to}`} d={e.d} fill="none" stroke="currentColor" strokeWidth={e.active ? 2.5 : 1.5} strokeOpacity={dim ? 0.12 : e.active ? 0.9 : 0.4} markerEnd="url(#ag-arrow)" strokeLinecap="round" />
            })}
          </svg>
          {layout.edges.filter((e) => e.label).map((e) => (
            <span key={`l-${e.from}-${e.to}`} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground" style={{ left: e.lx, top: e.ly }}>
              {e.label}
            </span>
          ))}
          {layout.nodes.map((n) => {
            const K = KINDS[n.kind ?? "agent"]
            const S = n.status ? STATUS[n.status] : null
            const on = selected === n.id
            return (
              <button
                key={n.id}
                ref={(el) => {
                  if (el) refs.current.set(n.id, el)
                  else refs.current.delete(n.id)
                }}
                type="button"
                aria-pressed={on}
                tabIndex={tabbable === n.id ? 0 : -1}
                aria-label={msg("agent-graph.node", "{label}, {kind}{status}", { label: n.label, kind: msg(`agent-graph.kind.${n.kind ?? "agent"}`, K.label).toLowerCase(), status: `${S ? `, ${msg(`agent-graph.status.${n.status}`, S.label).toLowerCase()}` : ""}${n.subtitle ? `, ${n.subtitle}` : ""}` })}
                onClick={() => pick(n.id)}
                onFocus={() => setFocus(n.id)}
                onKeyDown={(e) => onKeyDown(e, n)}
                className={cn(
                  "absolute flex items-center gap-2.5 rounded-xl border bg-card px-3 text-start outline-none transition-[box-shadow,opacity,border-color] duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
                  n.status === "blocked" && "border-destructive/60",
                  on ? "border-foreground shadow-[0_0_0_1px_var(--foreground)]" : "hover:border-foreground/40",
                  !lit(n.id) && "opacity-45"
                )}
                style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H }}
              >
                <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted [&>svg]:size-4">
                  {n.icon ?? <K.icon className="size-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-foreground">{n.label}</span>
                  <span className={cn("flex items-center gap-1 text-[11px]", n.status === "blocked" ? "font-medium text-destructive" : "text-muted-foreground")}>
                    {S ? <S.icon aria-hidden="true" className="size-3 shrink-0" /> : null}
                    <span className="truncate">{S ? msg(`agent-graph.status.${n.status}`, S.label) : msg(`agent-graph.kind.${n.kind ?? "agent"}`, K.label)}{n.subtitle ? ` · ${n.subtitle}` : ""}</span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        </div>
      </div>

      <div aria-live="polite" className="min-h-[3rem] rounded-xl border bg-card p-4 text-sm">
        {chosen ? (
          <div className="grid gap-1">
            <p className="font-medium">{chosen.label} <span className="font-normal text-muted-foreground">· {msg(`agent-graph.kind.${chosen.kind ?? "agent"}`, KINDS[chosen.kind ?? "agent"].label)}{chosen.status ? `, ${msg(`agent-graph.status.${chosen.status}`, STATUS[chosen.status].label).toLowerCase()}` : ""}</span></p>
            {chosen.detail && <p className="text-muted-foreground">{chosen.detail}</p>}
            <p className="text-muted-foreground">
              {into(chosen.id).length ? msg("agent-graph.receives", "Receives from {names}.", { names: names(into(chosen.id)) }) : msg("agent-graph.starts", "Starts the work.")}{" "}
              {outOf(chosen.id).length ? msg("agent-graph.sends", "Sends to {names}.", { names: names(outOf(chosen.id)) }) : msg("agent-graph.ends", "Nothing follows it.")}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">{msg("agent-graph.hint", "Select a node to see its connections. The arrow keys follow the edges.")}</p>
        )}
      </div>
    </div>
  )
}

export { AgentGraph, layoutGraph, type AgentGraphProps, type GraphEdge, type GraphKind, type GraphNode, type GraphStatus }
