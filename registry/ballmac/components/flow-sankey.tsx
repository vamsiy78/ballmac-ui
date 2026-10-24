// Ballmac UI: Flow Sankey. https://ui.ballmac.com/components/flow-sankey
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type SankeyNode = {
  id: string
  label: string
  /** Nodes in the same group share a colour. */
  group?: string
}

type SankeyLink = {
  source: string
  target: string
  /** How much flows from source to target. Zero or less is left out. */
  value: number
}

type Placed = { id: string; label: string; group?: string; col: number; x: number; y: number; h: number; inV: number; outV: number }
type PlacedLink = SankeyLink & { path: string; width: number }

const W = 900
const H = 480
const NODE_W = 14
const GAP = 14

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
 * Lays out a flow diagram: each node goes in a column after everything that feeds it, columns are ordered to reduce crossings, node heights follow the
 * larger of what flows in and out, and each link is a curve as thick as its value. Pure, so it can be tested and reused.
 */
function layoutSankey(nodes: SankeyNode[], links: SankeyLink[]) {
  const ids = new Set(nodes.map((n) => n.id))
  const valid = links.filter((l) => l.value > 0 && ids.has(l.source) && ids.has(l.target) && l.source !== l.target)
  // A flow diagram cannot show a loop: a link that points back to an earlier step is left out.
  const loops = backEdges(nodes.map((n) => n.id), valid.map((l) => ({ from: l.source, to: l.target })))
  const good = valid.filter((_, i) => !loops.has(i))
  const used = new Set(good.flatMap((l) => [l.source, l.target]))
  const list = nodes.filter((n) => used.has(n.id))
  // Column = the longest chain of links leading to the node. A node caught in a loop falls back to column 0.
  const col = new Map<string, number>(list.map((n) => [n.id, 0]))
  const indeg = new Map<string, number>(list.map((n) => [n.id, good.filter((l) => l.target === n.id).length]))
  const queue = list.filter((n) => indeg.get(n.id) === 0).map((n) => n.id)
  while (queue.length) {
    const id = queue.shift()!
    for (const l of good.filter((x) => x.source === id)) {
      col.set(l.target, Math.max(col.get(l.target) ?? 0, (col.get(id) ?? 0) + 1))
      indeg.set(l.target, (indeg.get(l.target) ?? 1) - 1)
      if (indeg.get(l.target) === 0) queue.push(l.target)
    }
  }
  const depth = Math.max(0, ...col.values())
  const cols: string[][] = Array.from({ length: depth + 1 }, () => [])
  for (const n of list) cols[col.get(n.id) ?? 0].push(n.id)
  const inV = (id: string) => good.filter((l) => l.target === id).reduce((s, l) => s + l.value, 0)
  const outV = (id: string) => good.filter((l) => l.source === id).reduce((s, l) => s + l.value, 0)
  const size = (id: string) => Math.max(inV(id), outV(id))
  const k = Math.min(...cols.filter((c) => c.length).map((c) => (H - GAP * (c.length - 1)) / c.reduce((s, id) => s + size(id), 0)), Infinity)

  // Reduce crossings: order each column by the average position of what it connects to, a few passes each way.
  const pos = new Map<string, number>()
  const stack = () => {
    for (const c of cols) {
      let y = 0
      for (const id of c) {
        pos.set(id, y + (size(id) * k) / 2)
        y += size(id) * k + GAP
      }
    }
  }
  stack()
  const bary = (id: string, side: "source" | "target") => {
    const ls = good.filter((l) => l[side === "source" ? "target" : "source"] === id)
    const w = ls.reduce((s, l) => s + l.value, 0)
    return w ? ls.reduce((s, l) => s + (pos.get(l[side]) ?? 0) * l.value, 0) / w : (pos.get(id) ?? 0)
  }
  for (let pass = 0; pass < 4; pass++) {
    for (let c = 1; c < cols.length; c++) {
      cols[c].sort((a, b) => bary(a, "source") - bary(b, "source"))
      stack()
    }
    for (let c = cols.length - 2; c >= 0; c--) {
      cols[c].sort((a, b) => bary(a, "target") - bary(b, "target"))
      stack()
    }
  }

  const placed = new Map<string, Placed>()
  for (let c = 0; c < cols.length; c++) {
    const total = cols[c].reduce((s, id) => s + size(id) * k, 0) + GAP * Math.max(cols[c].length - 1, 0)
    let y = (H - total) / 2
    for (const id of cols[c]) {
      const n = list.find((x) => x.id === id)!
      const h = size(id) * k
      placed.set(id, { id, label: n.label, group: n.group, col: c, x: depth ? (c * (W - NODE_W)) / depth : 0, y, h, inV: inV(id), outV: outV(id) })
      y += h + GAP
    }
  }
  const outOff = new Map<string, number>()
  const inOff = new Map<string, number>()
  const result: PlacedLink[] = []
  const byTarget = [...good].sort((a, b) => placed.get(a.target)!.y - placed.get(b.target)!.y)
  const bySource = [...good].sort((a, b) => placed.get(a.source)!.y - placed.get(b.source)!.y)
  const sy = new Map<SankeyLink, number>()
  const ty = new Map<SankeyLink, number>()
  for (const l of byTarget) {
    const s = placed.get(l.source)!
    const o = outOff.get(l.source) ?? 0
    sy.set(l, s.y + o + (l.value * k) / 2)
    outOff.set(l.source, o + l.value * k)
  }
  for (const l of bySource) {
    const t = placed.get(l.target)!
    const o = inOff.get(l.target) ?? 0
    ty.set(l, t.y + o + (l.value * k) / 2)
    inOff.set(l.target, o + l.value * k)
  }
  for (const l of good) {
    const s = placed.get(l.source)!
    const t = placed.get(l.target)!
    const x0 = s.x + NODE_W
    const x1 = t.x
    const xm = (x0 + x1) / 2
    result.push({ ...l, width: l.value * k, path: `M ${x0} ${sy.get(l)} C ${xm} ${sy.get(l)}, ${xm} ${ty.get(l)}, ${x1} ${ty.get(l)}` })
  }
  return { nodes: [...placed.values()], links: result, depth }
}

type FlowSankeyProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  nodes: SankeyNode[]
  links: SankeyLink[]
  /** Turns a value into text. */
  format?: (value: number) => string
  /** The selected node id. Controlled. */
  selected?: string | null
  /** The selected node id for uncontrolled use. */
  defaultSelected?: string | null
  /** Called when a node is chosen, or null when it is cleared. */
  onSelectedChange?: (id: string | null) => void
}

const TINTS = [1, 2, 3, 4, 5]

/**
 * A flow diagram: where something comes from and where it goes, with every link as thick as its value. Nodes are buttons, so hovering or focusing one lights
 * up its flows and the arrow keys move between nodes; the same flows are available as a table for screen readers. The diagram always reads left to right.
 */
function FlowSankey({ nodes, links, format = (v) => v.toLocaleString("en-US"), selected: selectedProp, defaultSelected = null, onSelectedChange, className, ...props }: FlowSankeyProps) {
  const msg = useMessages()
  const uid = React.useId()
  const layout = React.useMemo(() => layoutSankey(nodes, links), [nodes, links])
  const [inner, setInner] = React.useState<string | null>(defaultSelected)
  const selected = selectedProp !== undefined ? selectedProp : inner
  const [hover, setHover] = React.useState<string | null>(null)
  const active = hover ?? selected
  const groups = React.useMemo(() => {
    const g: string[] = []
    for (const n of layout.nodes) if (n.group && !g.includes(n.group)) g.push(n.group)
    return g
  }, [layout.nodes])
  const color = (n: Placed) => `var(--chart-${TINTS[(n.group ? groups.indexOf(n.group) : layout.nodes.indexOf(n)) % TINTS.length]})`
  const byId = new Map(layout.nodes.map((n) => [n.id, n]))
  const [focus, setFocus] = React.useState<string | null>(null)
  const ordered = [...layout.nodes].sort((a, b) => a.col - b.col || a.y - b.y)
  const tabbable = (focus && byId.has(focus) ? focus : selected && byId.has(selected) ? selected : ordered[0]?.id) ?? null
  const refs = React.useRef(new Map<string, HTMLButtonElement>())
  const chosen = selected ? byId.get(selected) : undefined
  const related = (id: string) => (active ? active === id || layout.links.some((l) => (l.source === active && l.target === id) || (l.target === active && l.source === id)) : true)

  function pick(id: string) {
    const next = id === selected ? null : id
    if (selectedProp === undefined) setInner(next)
    onSelectedChange?.(next)
  }
  function onKeyDown(e: React.KeyboardEvent, n: Placed) {
    let to: Placed | undefined
    const sameCol = ordered.filter((o) => o.col === n.col)
    const i = sameCol.indexOf(n)
    if (e.key === "ArrowDown") to = sameCol[i + 1]
    else if (e.key === "ArrowUp") to = sameCol[i - 1]
    else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const next = ordered.filter((o) => o.col === n.col + (e.key === "ArrowRight" ? 1 : -1))
      to = [...next].sort((a, b) => Math.abs(a.y - n.y) - Math.abs(b.y - n.y))[0]
    } else if (e.key === "Home") to = ordered[0]
    else if (e.key === "End") to = ordered[ordered.length - 1]
    if (to) {
      e.preventDefault()
      setFocus(to.id)
      refs.current.get(to.id)?.focus()
    }
  }

  return (
    <div data-slot="flow-sankey" className={cn("grid w-full min-w-0 gap-3", className)} {...props}>
      <div dir="ltr" className="relative w-full rounded-xl border bg-card p-3 sm:p-5" role="group" aria-label={msg("flow-sankey.label", "Flows between steps")}>
        <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
          <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            {layout.links.map((l) => {
              const s = byId.get(l.source)!
              const dim = active && !(l.source === active || l.target === active)
              return <path key={`${l.source}-${l.target}`} d={l.path} fill="none" stroke={color(s)} strokeWidth={l.width} strokeOpacity={dim ? 0.08 : active ? 0.55 : 0.32} className="transition-[stroke-opacity] duration-200 motion-reduce:transition-none" vectorEffect="none" />
            })}
          </svg>
          {layout.nodes.map((n) => {
            const last = n.col === layout.depth && layout.depth > 0
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
                aria-label={msg("flow-sankey.node", "{label}: {inV} in, {outV} out", { label: n.label, inV: format(n.inV), outV: format(n.outV) })}
                onClick={() => pick(n.id)}
                onFocus={() => {
                  setFocus(n.id)
                  setHover(n.id)
                }}
                onBlur={() => setHover(null)}
                onPointerEnter={() => setHover(n.id)}
                onPointerLeave={() => setHover(null)}
                onKeyDown={(e) => onKeyDown(e, n)}
                className="group absolute outline-none"
                style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%`, width: `${(NODE_W / W) * 100}%`, height: `${(n.h / H) * 100}%`, minHeight: 6 }}
              >
                <span aria-hidden="true" className={cn("absolute inset-0 rounded-sm transition-shadow group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50 motion-reduce:transition-none", on && "shadow-[0_0_0_2px_var(--foreground)]")} style={{ backgroundColor: color(n) }} />
                <span className={cn("pointer-events-none absolute top-1/2 w-max max-w-[11rem] -translate-y-1/2 text-xs leading-tight transition-opacity motion-reduce:transition-none", last ? "end-full me-2 text-end" : "start-full ms-2 text-start", !related(n.id) && "opacity-35")}>
                  <span className="block truncate font-medium text-foreground">{n.label}</span>
                  <span className="block tabular-nums text-muted-foreground">{format(Math.max(n.inV, n.outV))}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div aria-live="polite" className="min-h-[1.5rem] text-sm">
        {chosen ? (
          <p>
            <span className="font-medium">{chosen.label}</span> <span className="tabular-nums text-muted-foreground">· {msg("flow-sankey.inout", "{inV} in · {outV} out", { inV: format(chosen.inV), outV: format(chosen.outV) })}{chosen.inV > 0 && chosen.outV > 0 && chosen.outV !== chosen.inV ? ` · ${format(Math.abs(chosen.inV - chosen.outV))} ${chosen.outV < chosen.inV ? "does not continue" : "starts here"}` : ""}</span>
          </p>
        ) : (
          <p className="text-muted-foreground">{msg("flow-sankey.hint", "Select a step to follow its flows.")}</p>
        )}
      </div>

      <table className="sr-only">
        <caption>{msg("flow-sankey.table", "Flows, from one step to the next")}</caption>
        <thead>
          <tr>
            <th scope="col">{msg("flow-sankey.from", "From")}</th>
            <th scope="col">{msg("flow-sankey.to", "To")}</th>
            <th scope="col">{msg("flow-sankey.value", "Amount")}</th>
          </tr>
        </thead>
        <tbody>
          {layout.links.map((l) => (
            <tr key={`${uid}-${l.source}-${l.target}`}>
              <th scope="row">{byId.get(l.source)?.label}</th>
              <td>{byId.get(l.target)?.label}</td>
              <td>{format(l.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { FlowSankey, layoutSankey, type FlowSankeyProps, type SankeyLink, type SankeyNode }
