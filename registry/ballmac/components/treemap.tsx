// Ballmac UI: Treemap. https://ui.ballmac.com/components/treemap
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useDirection } from "@/lib/ballmac/direction"
import { useMessages } from "@/lib/ballmac/i18n"

type TreemapItem = {
  id: string
  label: string
  /** The size, in any unit. Items with a value of zero or less are left out. */
  value: number
  /** Items in the same group share a colour and a line in the legend. */
  group?: string
  /** A line shown under the chart when the item is selected. */
  detail?: string
}

type Rect = { x: number; y: number; w: number; h: number }

/** The squarified layout (Bruls, Huizing and van Wijk): rows of items kept as close to square as the shape allows. Sizes are in the units of w and h. */
function squarify(items: { id: string; value: number }[], w: number, h: number): Record<string, Rect> {
  const total = items.reduce((n, i) => n + i.value, 0)
  const out: Record<string, Rect> = {}
  if (total <= 0 || w <= 0 || h <= 0) return out
  const scale = (w * h) / total
  const rest = [...items].sort((a, b) => b.value - a.value).map((i) => ({ id: i.id, area: i.value * scale }))
  let x = 0
  let y = 0
  let rw = w
  let rh = h
  let row: typeof rest = []
  const worst = (r: typeof rest, side: number) => {
    const s = r.reduce((n, i) => n + i.area, 0)
    const max = Math.max(...r.map((i) => i.area))
    const min = Math.min(...r.map((i) => i.area))
    return Math.max((side * side * max) / (s * s), (s * s) / (side * side * min))
  }
  const place = (r: typeof rest) => {
    const s = r.reduce((n, i) => n + i.area, 0)
    if (rw >= rh) {
      const colW = s / rh
      let cy = y
      for (const i of r) {
        const ih = i.area / colW
        out[i.id] = { x, y: cy, w: colW, h: ih }
        cy += ih
      }
      x += colW
      rw -= colW
    } else {
      const rowH = s / rw
      let cx = x
      for (const i of r) {
        const iw = i.area / rowH
        out[i.id] = { x: cx, y, w: iw, h: rowH }
        cx += iw
      }
      y += rowH
      rh -= rowH
    }
  }
  while (rest.length) {
    const side = Math.min(rw, rh)
    const next = rest[0]
    if (row.length === 0 || worst([...row, next], side) <= worst(row, side)) {
      row.push(next)
      rest.shift()
    } else {
      place(row)
      row = []
    }
  }
  if (row.length) place(row)
  return out
}

const TINTS = [1, 2, 3, 4, 5]

type TreemapProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  items: TreemapItem[]
  /** Turns a value into text. */
  format?: (value: number) => string
  /** Width divided by height of the chart. */
  aspect?: number
  /** The selected item id. Controlled. */
  selected?: string | null
  /** The selected item id for uncontrolled use. */
  defaultSelected?: string | null
  /** Called when an item is chosen, or null when it is cleared. */
  onSelectedChange?: (id: string | null) => void
  /** What the sizes mean, for assistive technology, for example "tokens". */
  unit?: string
}

/**
 * A treemap: every item is a rectangle whose area is its share of the whole, laid out so the rectangles stay close to square. Cells are buttons with real
 * text (name, value and share), the arrow keys move to the nearest cell in that direction, and groups get a colour and a legend line with their total.
 */
function Treemap({ items, format = (v) => v.toLocaleString("en-US"), aspect = 16 / 9, selected: selectedProp, defaultSelected = null, onSelectedChange, unit, dir, className, ...props }: TreemapProps) {
  const msg = useMessages()
  const direction = useDirection(dir === "rtl" || dir === "ltr" ? dir : undefined)
  const [inner, setInner] = React.useState<string | null>(defaultSelected)
  const selected = selectedProp !== undefined ? selectedProp : inner
  const data = React.useMemo(() => items.filter((i) => i.value > 0), [items])
  const total = data.reduce((n, i) => n + i.value, 0)
  const W = 100 * aspect
  const H = 100
  const rects = React.useMemo(() => squarify(data, W, H), [data, W])
  const groups = React.useMemo(() => {
    const list: string[] = []
    for (const i of data) if (i.group && !list.includes(i.group)) list.push(i.group)
    return list
  }, [data])
  const tint = (i: TreemapItem) => (i.group ? TINTS[groups.indexOf(i.group) % TINTS.length] : 1)
  const ordered = [...data].sort((a, b) => b.value - a.value)
  const [focus, setFocus] = React.useState<string | null>(null)
  const tabbable = (focus && data.some((i) => i.id === focus) ? focus : selected && data.some((i) => i.id === selected) ? selected : ordered[0]?.id) ?? null
  const refs = React.useRef(new Map<string, HTMLButtonElement>())
  const chosen = data.find((i) => i.id === selected)

  function pick(id: string) {
    const next = id === selected ? null : id
    if (selectedProp === undefined) setInner(next)
    onSelectedChange?.(next)
  }
  function onKeyDown(e: React.KeyboardEvent, id: string) {
    const me = rects[id]
    if (!me) return
    const cx = me.x + me.w / 2
    const cy = me.y + me.h / 2
    const rtl = direction === "rtl"
    const dirs: Record<string, [number, number]> = { ArrowRight: [rtl ? -1 : 1, 0], ArrowLeft: [rtl ? 1 : -1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault()
      const to = e.key === "Home" ? ordered[0] : ordered[ordered.length - 1]
      setFocus(to.id)
      refs.current.get(to.id)?.focus()
      return
    }
    const d = dirs[e.key]
    if (!d) return
    e.preventDefault()
    // The nearest cell whose centre lies in that direction, preferring ones that line up with this cell.
    let best: { id: string; score: number } | null = null
    for (const o of data) {
      if (o.id === id) continue
      const r = rects[o.id]
      const dx = r.x + r.w / 2 - cx
      const dy = r.y + r.h / 2 - cy
      const along = dx * d[0] + dy * d[1]
      if (along <= 0.001) continue
      const across = Math.abs(dx * d[1]) + Math.abs(dy * d[0])
      const score = along + across * 2
      if (!best || score < best.score) best = { id: o.id, score }
    }
    if (best) {
      setFocus(best.id)
      refs.current.get(best.id)?.focus()
    }
  }

  return (
    <div data-slot="treemap" dir={dir} className={cn("grid w-full min-w-0 gap-3", className)} {...props}>
      <div className="relative w-full overflow-hidden rounded-xl border bg-card" style={{ aspectRatio: String(aspect) }} role="group" aria-label={msg("treemap.label", "Share of the total by item")}>
        {data.map((i) => {
          const r = rects[i.id]
          if (!r) return null
          const share = (i.value / total) * 100
          const on = selected === i.id
          const big = (r.w * r.h) / (W * H) > 0.045
          const mid = (r.w * r.h) / (W * H) > 0.015
          return (
            <button
              key={i.id}
              ref={(el) => {
                if (el) refs.current.set(i.id, el)
                else refs.current.delete(i.id)
              }}
              type="button"
              aria-pressed={on}
              tabIndex={tabbable === i.id ? 0 : -1}
              aria-label={msg("treemap.cell", "{label}: {value}{unit}, {share}% of the total{group}", { label: i.label, value: format(i.value), unit: unit ? ` ${unit}` : "", share: Math.round(share * 10) / 10, group: i.group ? `, ${i.group}` : "" })}
              onClick={() => pick(i.id)}
              onFocus={() => setFocus(i.id)}
              onKeyDown={(e) => onKeyDown(e, i.id)}
              className={cn("absolute flex flex-col items-start justify-between overflow-hidden rounded-md p-2 text-start text-foreground outline-none transition-shadow focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none", on ? "z-10 shadow-[inset_0_0_0_2px_var(--foreground)]" : "hover:shadow-[inset_0_0_0_1.5px_var(--foreground)]")}
              style={{
                insetInlineStart: `calc(${(r.x / W) * 100}% + 1.5px)`,
                top: `calc(${(r.y / H) * 100}% + 1.5px)`,
                width: `calc(${(r.w / W) * 100}% - 3px)`,
                height: `calc(${(r.h / H) * 100}% - 3px)`,
                backgroundColor: `color-mix(in oklab, var(--chart-${tint(i)}) 30%, var(--card))`,
              }}
            >
              {mid && <span className={cn("w-full truncate font-medium", big ? "text-sm" : "text-xs")}>{i.label}</span>}
              {big && (
                <span className="text-xs tabular-nums text-foreground/80">
                  {format(i.value)} <span>· {Math.round(share)}%</span>
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div aria-live="polite" className="min-h-[2.5rem] text-sm">
        {chosen ? (
          <p>
            <span className="font-medium">{chosen.label}</span> <span className="text-muted-foreground tabular-nums">· {format(chosen.value)}{unit ? ` ${unit}` : ""} · {msg("treemap.share", "{percent}% of the total", { percent: Math.round((chosen.value / total) * 1000) / 10 })}</span>
            {chosen.detail && <span className="mt-0.5 block text-muted-foreground">{chosen.detail}</span>}
          </p>
        ) : (
          <p className="text-muted-foreground">{msg("treemap.hint", "Select a block to see its share.")}</p>
        )}
      </div>

      {groups.length > 0 && (
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs" aria-label={msg("treemap.groups", "Groups")}>
          {groups.map((g, gi) => {
            const sum = data.filter((i) => i.group === g).reduce((n, i) => n + i.value, 0)
            return (
              <li key={g} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-3 rounded-sm border" style={{ backgroundColor: `color-mix(in oklab, var(--chart-${TINTS[gi % TINTS.length]}) 30%, var(--card))` }} />
                <span className="font-medium">{g}</span>
                <span className="text-muted-foreground tabular-nums">{format(sum)} · {Math.round((sum / total) * 100)}%</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export { Treemap, squarify, type Rect, type TreemapItem, type TreemapProps }
