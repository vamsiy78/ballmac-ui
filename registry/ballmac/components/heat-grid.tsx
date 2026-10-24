// Ballmac UI: Heat Grid. https://ui.ballmac.com/components/heat-grid
"use client"

import * as React from "react"
import { Check, CircleAlert, Minus, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { useDirection } from "@/lib/ballmac/direction"
import { useMessages } from "@/lib/ballmac/i18n"

type HeatTone = "good" | "warn" | "bad"

type HeatAxis = {
  id: string
  label: string
}

type HeatGridProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  /** The rows, top to bottom. */
  rows: HeatAxis[]
  /** The columns, left to right. */
  columns: HeatAxis[]
  /** The value of each cell, by row then column. Use null for no data. */
  values: (number | null)[][]
  /** What the rows are, read by assistive technology, for example "Models". */
  rowLabel?: string
  /** What the columns are, for example "Test cases". */
  columnLabel?: string
  /** The lowest and highest value for the colour scale. Defaults to the data's own range. */
  domain?: [number, number]
  /** Turns a value into text. */
  format?: (value: number) => string
  /**
   * Classify a value instead of shading it: good, warn or bad cells get a check, a triangle or a cross as well as a tint, so the meaning is never colour alone.
   */
  tone?: (value: number) => HeatTone
  /** The selected cell, as "row,column" indexes. Controlled. */
  selected?: [number, number] | null
  /** Called when a cell is chosen. */
  onSelectedChange?: (cell: [number, number]) => void
  /** Shows the colour scale under the grid. */
  legend?: boolean
}

const TONES: Record<HeatTone, { icon: typeof Check; word: string; tint: string }> = {
  good: { icon: Check, word: "Good", tint: "color-mix(in oklab, var(--chart-2) 32%, var(--card))" },
  warn: { icon: TriangleAlert, word: "Warning", tint: "color-mix(in oklab, var(--chart-3) 38%, var(--card))" },
  bad: { icon: CircleAlert, word: "Problem", tint: "color-mix(in oklab, var(--destructive) 30%, var(--card))" },
}

/**
 * A matrix of values shaded by size, such as models against test cases or services against regions. Cells are a real ARIA grid: Tab enters once, the arrow
 * keys, Home and End move between cells, Enter or Space chooses one. Every cell shows its value as text; with `tone` it also shows an icon and the word, so
 * colour is only ever a second signal. Cells with no data are hatched and say so.
 */
function HeatGrid({
  rows,
  columns,
  values,
  rowLabel,
  columnLabel,
  domain,
  format = (v) => String(Math.round(v * 100) / 100),
  tone,
  selected: selectedProp,
  onSelectedChange,
  legend = true,
  dir,
  className,
  ...props
}: HeatGridProps) {
  const msg = useMessages()
  const direction = useDirection(dir === "rtl" || dir === "ltr" ? dir : undefined)
  const [inner, setInner] = React.useState<[number, number] | null>(null)
  const selected = selectedProp !== undefined ? selectedProp : inner
  const [focus, setFocus] = React.useState<[number, number]>([0, 0])
  const refs = React.useRef(new Map<string, HTMLButtonElement>())
  const flat = values.flat().filter((v): v is number => typeof v === "number")
  const [lo, hi] = domain ?? [Math.min(...flat, 0), Math.max(...flat, 1)]
  const span = hi - lo || 1
  const key = (r: number, c: number) => `${r},${c}`

  function choose(r: number, c: number) {
    const cell: [number, number] = [r, c]
    if (selectedProp === undefined) setInner(cell)
    onSelectedChange?.(cell)
  }
  function move(r: number, c: number) {
    const rr = Math.min(Math.max(r, 0), rows.length - 1)
    const cc = Math.min(Math.max(c, 0), columns.length - 1)
    setFocus([rr, cc])
    refs.current.get(key(rr, cc))?.focus()
  }
  function onKeyDown(e: React.KeyboardEvent, r: number, c: number) {
    const rtl = direction === "rtl"
    const map: Record<string, [number, number]> = {
      ArrowRight: [r, c + (rtl ? -1 : 1)],
      ArrowLeft: [r, c + (rtl ? 1 : -1)],
      ArrowDown: [r + 1, c],
      ArrowUp: [r - 1, c],
      Home: e.ctrlKey ? [0, 0] : [r, 0],
      End: e.ctrlKey ? [rows.length - 1, columns.length - 1] : [r, columns.length - 1],
    }
    const to = map[e.key]
    if (to) {
      e.preventDefault()
      move(to[0], to[1])
    }
  }

  return (
    <div data-slot="heat-grid" dir={dir} className={cn("grid w-full min-w-0 gap-3", className)} {...props}>
      <div className="overflow-x-auto rounded-xl border bg-card text-card-foreground">
        <div role="grid" aria-label={[rowLabel, columnLabel].filter(Boolean).join(" by ") || msg("heat-grid.label", "Values")} aria-rowcount={rows.length + 1} aria-colcount={columns.length + 1} className="grid min-w-max" style={{ gridTemplateColumns: `minmax(7rem, auto) repeat(${columns.length}, minmax(4.5rem, 1fr))` }}>
          <div role="row" className="contents">
            <div role="columnheader" className="sticky start-0 z-10 border-b border-e bg-card px-3 py-2 text-xs font-medium text-muted-foreground">{rowLabel}</div>
            {columns.map((c) => (
              <div key={c.id} role="columnheader" className="border-b px-2 py-2 text-center text-xs font-medium text-muted-foreground">{c.label}</div>
            ))}
          </div>
          {rows.map((row, r) => (
            <div key={row.id} role="row" className="contents">
              <div role="rowheader" className="sticky start-0 z-10 flex items-center border-e bg-card px-3 py-2 text-sm font-medium [&:not(:last-child)]:border-b">{row.label}</div>
              {columns.map((col, c) => {
                const v = values[r]?.[c] ?? null
                const t = v !== null && tone ? tone(v) : undefined
                const on = selected?.[0] === r && selected[1] === c
                const share = v === null ? 0 : Math.round(((v - lo) / span) * 70)
                const bg = v === null ? undefined : t ? TONES[t].tint : `color-mix(in oklab, var(--chart-1) ${share}%, var(--card))`
                const Icon = t ? TONES[t].icon : v === null ? Minus : null
                const text = v === null ? msg("heat-grid.none", "No data") : format(v)
                return (
                  <div key={col.id} role="gridcell" aria-selected={on} className="border-b p-1">
                    <button
                      ref={(el) => {
                        if (el) refs.current.set(key(r, c), el)
                        else refs.current.delete(key(r, c))
                      }}
                      type="button"
                      tabIndex={focus[0] === r && focus[1] === c ? 0 : -1}
                      data-tone={t}
                      aria-label={msg("heat-grid.cell", "{row}, {column}: {value}", { row: row.label, column: col.label, value: t ? `${text}, ${msg(`heat-grid.${t}`, TONES[t].word)}` : text })}
                      onClick={() => choose(r, c)}
                      onFocus={() => setFocus([r, c])}
                      onKeyDown={(e) => onKeyDown(e, r, c)}
                      className={cn(
                        "flex h-11 w-full items-center justify-center gap-1.5 rounded-md text-sm font-medium tabular-nums text-foreground outline-none transition-shadow motion-reduce:transition-none",
                        "hover:shadow-[inset_0_0_0_1.5px_var(--foreground)] focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        v === null && "bg-[repeating-linear-gradient(135deg,var(--muted)_0_4px,transparent_4px_8px)] font-normal text-muted-foreground",
                        on && "shadow-[inset_0_0_0_2px_var(--foreground)]"
                      )}
                      style={{ backgroundColor: bg }}
                    >
                      {Icon && <Icon aria-hidden="true" className="size-3.5 shrink-0" />}
                      {v !== null && <span>{text}</span>}
                      {v === null && <span className="sr-only">{text}</span>}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      {legend && !tone && flat.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums" aria-hidden="true">
          <span>{format(lo)}</span>
          <span className="h-2 w-40 rounded-full" style={{ background: "linear-gradient(to right, color-mix(in oklab, var(--chart-1) 0%, var(--card)), color-mix(in oklab, var(--chart-1) 70%, var(--card)))", boxShadow: "inset 0 0 0 1px var(--border)" }} />
          <span>{format(hi)}</span>
        </div>
      )}
      {legend && tone && (
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label={msg("heat-grid.legend", "Legend")}>
          {(Object.keys(TONES) as HeatTone[]).map((t) => {
            const I = TONES[t].icon
            return (
              <li key={t} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="flex size-5 items-center justify-center rounded" style={{ backgroundColor: TONES[t].tint }}><I className="size-3 text-foreground" /></span>
                {msg(`heat-grid.${t}`, TONES[t].word)}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export { HeatGrid, type HeatAxis, type HeatGridProps, type HeatTone }
