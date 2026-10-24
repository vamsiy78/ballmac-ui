// Ballmac UI: Trace Waterfall. https://ui.ballmac.com/components/trace-waterfall
"use client"

import * as React from "react"
import { ChevronRight, CircleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type SpanKind = "model" | "tool" | "retrieval" | "agent" | "other"

type TraceSpan = {
  id: string
  /** The span this one runs inside. Leave it out for a top-level span. */
  parentId?: string
  name: string
  kind?: SpanKind
  /** Start, in milliseconds from the beginning of the run. */
  start: number
  /** Length, in milliseconds. */
  duration: number
  status?: "ok" | "error"
  /** Tokens used, shown in the detail. */
  tokens?: number
  /** More detail, shown when the span is selected: an input, an output, an error message. */
  detail?: string
}

const KINDS: Record<SpanKind, { label: string; bar: string }> = {
  model: { label: "Model call", bar: "bg-chart-1" },
  tool: { label: "Tool call", bar: "bg-chart-2" },
  retrieval: { label: "Retrieval", bar: "bg-chart-4" },
  agent: { label: "Agent step", bar: "bg-chart-5" },
  other: { label: "Other", bar: "bg-muted-foreground/60" },
}

/** 420 → "420 ms", 1240 → "1.24 s", 75000 → "1 min 15 s". */
function formatMs(ms: number) {
  if (!Number.isFinite(ms) || ms < 0) return "0 ms"
  if (ms < 1000) return `${Math.round(ms)} ms`
  const s = ms / 1000
  if (s < 60) return `${+s.toFixed(2)} s`
  const m = Math.floor(s / 60)
  const r = Math.round(s - m * 60)
  return r === 0 ? `${m} min` : `${m} min ${r} s`
}

type Row = { span: TraceSpan; level: number; setsize: number; pos: number; hasChildren: boolean }

/** Spans as a depth-first list: each span followed by its children in start order. A span whose parent is missing counts as top level. */
function flatten(spans: TraceSpan[], collapsed: Set<string>): Row[] {
  const ids = new Set(spans.map((s) => s.id))
  const kids = new Map<string | undefined, TraceSpan[]>()
  for (const s of spans) {
    const p = s.parentId && ids.has(s.parentId) && s.parentId !== s.id ? s.parentId : undefined
    kids.set(p, [...(kids.get(p) ?? []), s])
  }
  for (const [, list] of kids) list.sort((a, b) => a.start - b.start)
  const rows: Row[] = []
  const seen = new Set<string>()
  const walk = (parent: string | undefined, level: number) => {
    const list = kids.get(parent) ?? []
    list.forEach((span, i) => {
      if (seen.has(span.id)) return
      seen.add(span.id)
      const has = (kids.get(span.id) ?? []).length > 0
      rows.push({ span, level, setsize: list.length, pos: i + 1, hasChildren: has })
      if (has && !collapsed.has(span.id)) walk(span.id, level + 1)
    })
  }
  walk(undefined, 1)
  return rows
}

type TraceWaterfallProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  spans: TraceSpan[]
  /** Length of the whole run in milliseconds. Defaults to the end of the last span. */
  total?: number
  /** The selected span id. Controlled. */
  selected?: string | null
  /** The selected span id for uncontrolled use. */
  defaultSelected?: string | null
  /** Called when a span is selected. */
  onSelectedChange?: (id: string) => void
  /** Spans that start collapsed. */
  defaultCollapsed?: string[]
}

/**
 * A trace as a waterfall: spans nested under the span that ran them, each a bar on a shared time axis, with its duration beside it. It is a real tree: Up and Down
 * move, Right opens or goes in, Left closes or goes out, Enter selects. Failed spans say "Failed" and show an icon. The bars are drawn with the theme's chart colours.
 */
function TraceWaterfall({ spans, total: totalProp, selected: selectedProp, defaultSelected = null, onSelectedChange, defaultCollapsed = [], className, ...props }: TraceWaterfallProps) {
  const msg = useMessages()
  const [collapsed, setCollapsed] = React.useState(() => new Set(defaultCollapsed))
  const [inner, setInner] = React.useState<string | null>(defaultSelected)
  const selected = selectedProp !== undefined ? selectedProp : inner
  const total = Math.max(totalProp ?? 0, ...spans.map((s) => s.start + s.duration), 1)
  const rows = React.useMemo(() => flatten(spans, collapsed), [spans, collapsed])
  const [focus, setFocus] = React.useState<string | null>(null)
  const tabbable = (focus && rows.some((r) => r.span.id === focus) ? focus : selected && rows.some((r) => r.span.id === selected) ? selected : rows[0]?.span.id) ?? null
  const refs = React.useRef(new Map<string, HTMLDivElement>())
  const chosen = spans.find((s) => s.id === selected)
  const kindText = (k: SpanKind | undefined) => msg(`trace-waterfall.kind.${k ?? "other"}`, KINDS[k ?? "other"].label)
  const parentOf = (s: TraceSpan) => rows.find((r) => r.span.id === s.parentId)

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
    if (e.key === "ArrowDown") go(rows[i + 1]?.span.id)
    else if (e.key === "ArrowUp") go(rows[i - 1]?.span.id)
    else if (e.key === "Home") go(rows[0]?.span.id)
    else if (e.key === "End") go(rows[rows.length - 1]?.span.id)
    else if (e.key === "ArrowRight") {
      if (row.hasChildren && collapsed.has(row.span.id)) toggle(row.span.id, true)
      else if (row.hasChildren) go(rows[i + 1]?.span.id)
    } else if (e.key === "ArrowLeft") {
      if (row.hasChildren && !collapsed.has(row.span.id)) toggle(row.span.id, false)
      else go(parentOf(row.span)?.span.id)
    } else if (e.key === "Enter" || e.key === " ") select(row.span.id)
    else return
    e.preventDefault()
  }

  const ticks = [0, 0.25, 0.5, 0.75, 1]
  return (
    <div data-slot="trace-waterfall" className={cn("grid w-full min-w-0 gap-3", className)} {...props}>
      <div className="overflow-x-auto rounded-xl border bg-card text-card-foreground" dir="ltr">
        <div className="min-w-[36rem]">
          <div className="grid grid-cols-[minmax(12rem,2fr)_3fr] border-b bg-muted/30 text-[11px] text-muted-foreground">
            <div className="px-3 py-2 font-medium">{msg("trace-waterfall.span", "Step")}</div>
            <div className="relative h-8" aria-hidden="true">
              {ticks.map((t) => (
                <span key={t} className="absolute top-0 flex h-full items-center font-mono tabular-nums" style={{ left: `${t * 100}%`, transform: t === 0 ? undefined : t === 1 ? "translateX(-100%)" : "translateX(-50%)", paddingInline: t === 0 || t === 1 ? 8 : 0 }}>
                  {formatMs(total * t)}
                </span>
              ))}
            </div>
          </div>
          <div role="tree" aria-label={msg("trace-waterfall.label", "Spans of the run")} className="divide-y">
            {rows.map((r, i) => {
              const s = r.span
              const k = KINDS[s.kind ?? "other"]
              const on = selected === s.id
              const failed = s.status === "error"
              const open = r.hasChildren && !collapsed.has(s.id)
              return (
                <div
                  key={s.id}
                  ref={(el) => {
                    if (el) refs.current.set(s.id, el)
                    else refs.current.delete(s.id)
                  }}
                  role="treeitem"
                  aria-level={r.level}
                  aria-setsize={r.setsize}
                  aria-posinset={r.pos}
                  aria-expanded={r.hasChildren ? open : undefined}
                  aria-selected={on}
                  aria-label={msg("trace-waterfall.item", "{name}, {kind}, {duration}, starts at {start}{failed}", { name: s.name, kind: kindText(s.kind).toLowerCase(), duration: formatMs(s.duration), start: formatMs(s.start), failed: failed ? `, ${msg("trace-waterfall.failed", "failed").toLowerCase()}` : "" })}
                  tabIndex={tabbable === s.id ? 0 : -1}
                  onClick={() => select(s.id)}
                  onFocus={() => setFocus(s.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn("grid cursor-default grid-cols-[minmax(12rem,2fr)_3fr] items-center outline-none transition-colors hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset motion-reduce:transition-none", on && "bg-accent/60")}
                >
                  <div className="flex min-w-0 items-center gap-1 py-2 pe-2 text-[13px]" style={{ paddingInlineStart: 8 + (r.level - 1) * 16 }}>
                    {r.hasChildren ? (
                      <button type="button" tabIndex={-1} aria-hidden="true" onClick={(e) => { e.stopPropagation(); toggle(s.id, !open) }} className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent">
                        <ChevronRight className={cn("size-3.5 transition-transform motion-reduce:transition-none rtl:rotate-180", open && "rotate-90 rtl:rotate-90")} />
                      </button>
                    ) : (
                      <span aria-hidden="true" className="size-5 shrink-0" />
                    )}
                    <span className="truncate font-medium text-foreground">{s.name}</span>
                    {failed && <CircleAlert aria-hidden="true" className="size-3.5 shrink-0 text-destructive" />}
                  </div>
                  <div className="relative h-9" aria-hidden="true">
                    {ticks.slice(1, -1).map((t) => (
                      <span key={t} className="absolute inset-y-0 w-px bg-border/60" style={{ left: `${t * 100}%` }} />
                    ))}
                    <span className={cn("absolute top-2 bottom-2 min-w-[3px] rounded-[3px]", failed ? "bg-destructive" : k.bar)} style={{ left: `${(s.start / total) * 100}%`, width: `${Math.max((s.duration / total) * 100, 0.4)}%` }} />
                    <span className="absolute top-1/2 -translate-y-1/2 ms-1.5 rounded-sm bg-card px-1 font-mono text-[11px] whitespace-nowrap tabular-nums text-muted-foreground" style={{ left: `${Math.min(((s.start + s.duration) / total) * 100, 86)}%` }}>
                      {failed ? `${msg("trace-waterfall.failedShort", "Failed")} · ` : ""}{formatMs(s.duration)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div aria-live="polite" className="min-h-[3.5rem] rounded-xl border bg-card p-4 text-sm">
        {chosen ? (
          <div className="grid gap-1">
            <p className="flex flex-wrap items-center gap-x-2 font-medium">
              {chosen.name}
              <span className="rounded-full border px-2 py-0.5 text-[11px] font-normal text-muted-foreground">{kindText(chosen.kind)}</span>
              {chosen.status === "error" && <span className="text-[11px] font-medium text-destructive">{msg("trace-waterfall.failedShort", "Failed")}</span>}
            </p>
            <p className="font-mono text-xs tabular-nums text-muted-foreground">
              {formatMs(chosen.start)} → {formatMs(chosen.start + chosen.duration)} · {formatMs(chosen.duration)} · {msg("trace-waterfall.share", "{percent}% of the run", { percent: Math.round((chosen.duration / total) * 1000) / 10 })}{chosen.tokens !== undefined ? ` · ${chosen.tokens.toLocaleString("en-US")} tokens` : ""}
            </p>
            {chosen.detail && <p className="text-muted-foreground" dir="auto">{chosen.detail}</p>}
          </div>
        ) : (
          <p className="text-muted-foreground">{msg("trace-waterfall.hint", "Select a span to see its timing. Right opens a span, Left closes it.")}</p>
        )}
      </div>
    </div>
  )
}

export { TraceWaterfall, flatten, formatMs, type SpanKind, type TraceSpan, type TraceWaterfallProps }
