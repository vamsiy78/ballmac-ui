// Ballmac UI: Fan-out Grid. https://ui.ballmac.com/components/fan-out-grid
"use client"

import * as React from "react"
import { Check, CircleAlert, Loader2, Minus, RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"
import { useLoopsPaused } from "@/lib/ballmac/motion"

type FanStatus = "queued" | "running" | "done" | "failed" | "skipped"

type FanItem = {
  id: string
  /** What the item is, for example a file name or an invoice number. */
  label: string
  status: FanStatus
  /** What happened, shown when the item is selected: an output summary or an error message. */
  detail?: string
  /** How long it took, already formatted. */
  duration?: string
}

type FanOutGridProps = Omit<React.ComponentProps<"section">, "title" | "onSelect"> & {
  items: FanItem[]
  title?: string
  /** The selected item id. Controlled. */
  selected?: string | null
  defaultSelected?: string | null
  onSelectedChange?: (id: string | null) => void
  /** Called by Retry with the ids of the failed items it should run again. Reject and the card says why. */
  onRetry?: (ids: string[]) => void | Promise<void>
}

const ORDER: FanStatus[] = ["running", "failed", "done", "queued", "skipped"]
const STATUS = {
  queued: { icon: null, label: "Queued" },
  running: { icon: Loader2, label: "Running" },
  done: { icon: Check, label: "Done" },
  failed: { icon: CircleAlert, label: "Failed" },
  skipped: { icon: Minus, label: "Skipped" },
} as const

const TILE: Record<FanStatus, string> = {
  queued: "bg-muted border-transparent text-muted-foreground",
  running: "bg-chart-1/15 border-chart-1/60 text-foreground",
  done: "bg-foreground border-foreground text-background",
  failed: "bg-destructive/10 border-destructive text-destructive",
  skipped: "border-dashed border-border bg-transparent text-muted-foreground",
}

/**
 * Many things being done at once, as a grid of tiles: one per file, invoice or record, coloured and marked by what happened to it (done, running, failed,
 * queued, skipped). A header adds it up in words and a segmented bar, filters narrow the grid to what you care about, and Retry runs the failed ones again.
 * The tiles are buttons you reach with the arrow keys in any direction; a selected tile says what happened to it underneath. Failures are marked with an
 * icon and a word, never only a colour.
 */
function FanOutGrid({ items, title, selected: selectedProp, defaultSelected = null, onSelectedChange, onRetry, className, ...props }: FanOutGridProps) {
  const msg = useMessages()
  const paused = useLoopsPaused()
  const id = React.useId()
  title ??= msg("fan-out-grid.title", "Items")
  const [inner, setInner] = React.useState<string | null>(defaultSelected)
  const selected = selectedProp !== undefined ? selectedProp : inner
  const [filter, setFilter] = React.useState<FanStatus | "all">("all")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [focus, setFocus] = React.useState<string | null>(null)
  const refs = React.useRef(new Map<string, HTMLButtonElement>())
  const word = (s: FanStatus) => msg(`fan-out-grid.status.${s}`, STATUS[s].label)

  const counts = React.useMemo(() => {
    const c: Record<FanStatus, number> = { queued: 0, running: 0, done: 0, failed: 0, skipped: 0 }
    for (const i of items) c[i.status]++
    return c
  }, [items])
  const shown = filter === "all" ? items : items.filter((i) => i.status === filter)
  const finished = counts.done + counts.failed + counts.skipped
  const chosen = items.find((i) => i.id === selected)
  const tabbable = (focus && shown.some((i) => i.id === focus) ? focus : selected && shown.some((i) => i.id === selected) ? selected : shown[0]?.id) ?? null

  function choose(itemId: string) {
    const next = selected === itemId ? null : itemId
    if (selectedProp === undefined) setInner(next)
    onSelectedChange?.(next)
  }
  function go(itemId: string | undefined) {
    if (!itemId) return
    setFocus(itemId)
    refs.current.get(itemId)?.focus()
  }
  /** The tile one row up or down that sits closest to this one horizontally, found from where the tiles are on screen. */
  function vertical(from: string, dir: 1 | -1) {
    const here = refs.current.get(from)?.getBoundingClientRect()
    if (!here) return undefined
    let best: { id: string; dx: number; dy: number } | undefined
    for (const t of shown) {
      const r = refs.current.get(t.id)?.getBoundingClientRect()
      if (!r) continue
      const dy = (r.top - here.top) * dir
      if (dy < here.height / 2) continue
      const dx = Math.abs(r.left - here.left)
      if (!best || dy < best.dy - 2 || (Math.abs(dy - best.dy) <= 2 && dx < best.dx)) best = { id: t.id, dx, dy }
    }
    return best?.id
  }
  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl"
    let next: string | undefined
    if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) next = shown[i + 1]?.id
    else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) next = shown[i - 1]?.id
    else if (e.key === "ArrowDown") next = vertical(shown[i].id, 1)
    else if (e.key === "ArrowUp") next = vertical(shown[i].id, -1)
    else if (e.key === "Home") next = shown[0]?.id
    else if (e.key === "End") next = shown[shown.length - 1]?.id
    else return
    e.preventDefault()
    go(next)
  }

  async function retry(ids: string[]) {
    setBusy(true)
    setError(null)
    try {
      await onRetry?.(ids)
    } catch (e) {
      setError(e instanceof Error ? e.message : msg("fan-out-grid.retryFailed", "They could not be retried. Nothing was changed."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section data-slot="fan-out-grid" aria-labelledby={`${id}-t`} className={cn("bg-card text-card-foreground grid gap-4 rounded-xl border p-4 sm:p-5", className)} {...props}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 id={`${id}-t`} className="text-sm font-semibold">{title}</h3>
        <p className="text-xs tabular-nums text-muted-foreground">
          {msg("fan-out-grid.summary", "{done} of {total} finished", { done: finished, total: items.length })}
          {counts.running > 0 ? ` · ${msg("fan-out-grid.runningCount", "{count} running", { count: counts.running })}` : ""}
          {counts.failed > 0 ? ` · ${msg("fan-out-grid.failedCount", "{count} failed", { count: counts.failed })}` : ""}
        </p>
      </div>

      <div role="img" aria-label={msg("fan-out-grid.barLabel", "{done} done, {running} running, {failed} failed, {queued} queued", { done: counts.done, running: counts.running, failed: counts.failed, queued: counts.queued })} className="flex h-1.5 gap-px overflow-hidden rounded-full bg-muted">
        {([["done", "bg-foreground"], ["running", "bg-chart-1"], ["failed", "bg-destructive"]] as const).map(([s, tone]) => counts[s] > 0 && <span key={s} aria-hidden="true" className={cn("h-full transition-[width] duration-500 motion-reduce:transition-none", tone, s === "running" && !paused && "animate-pulse")} style={{ width: `${(counts[s] / Math.max(items.length, 1)) * 100}%` }} />)}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label={msg("fan-out-grid.filter", "Show")} className="flex flex-wrap gap-1.5">
          {(["all", ...ORDER.filter((s) => counts[s] > 0)] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cn("h-7 rounded-full border px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none", filter === f ? "border-foreground bg-foreground text-background" : "hover:bg-accent")}>
              {f === "all" ? msg("fan-out-grid.all", "All") : word(f)} <span className="tabular-nums opacity-70">{f === "all" ? items.length : counts[f]}</span>
            </button>
          ))}
        </div>
        {onRetry && counts.failed > 0 && (
          <button type="button" disabled={busy} onClick={() => void retry(items.filter((i) => i.status === "failed").map((i) => i.id))} className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60 motion-reduce:transition-none">
            {busy ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <RotateCcw aria-hidden="true" className="size-3.5" />}
            {msg("fan-out-grid.retry", "Retry {count} failed", { count: counts.failed })}
          </button>
        )}
      </div>
      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}

      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">{msg("fan-out-grid.none", "No items match.")}</p>
      ) : (
        <div role="group" aria-label={title} className="grid gap-1.5 [grid-template-columns:repeat(auto-fill,minmax(2.25rem,1fr))]">
          {shown.map((it, i) => {
            const S = STATUS[it.status]
            const on = selected === it.id
            return (
              <button
                key={it.id}
                ref={(el) => {
                  if (el) refs.current.set(it.id, el)
                  else refs.current.delete(it.id)
                }}
                type="button"
                data-status={it.status}
                aria-pressed={on}
                aria-label={msg("fan-out-grid.tile", "{label}, {status}", { label: it.label, status: word(it.status).toLowerCase() })}
                tabIndex={tabbable === it.id ? 0 : -1}
                onClick={() => choose(it.id)}
                onFocus={() => setFocus(it.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cn("flex aspect-square min-h-9 items-center justify-center rounded-md border outline-none transition-[transform,box-shadow] duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none", TILE[it.status], on && "ring-2 ring-foreground ring-offset-2 ring-offset-card", "hover:scale-105 motion-reduce:hover:scale-100")}
              >
                {S.icon ? <S.icon aria-hidden="true" className={cn("size-3.5", it.status === "running" && !paused && "animate-spin")} /> : null}
              </button>
            )
          })}
        </div>
      )}

      <div aria-live="polite" className="min-h-[3rem] rounded-lg border bg-background/60 px-3 py-2.5 text-sm">
        {chosen ? (
          <div className="grid gap-0.5">
            <p className="flex flex-wrap items-center gap-x-2 font-medium">
              {chosen.label}
              <span className={cn("rounded-full border px-2 py-px text-[11px] font-normal", chosen.status === "failed" ? "border-destructive/50 text-destructive" : "text-muted-foreground")}>{word(chosen.status)}</span>
              {chosen.duration && <span className="font-mono text-xs font-normal tabular-nums text-muted-foreground">{chosen.duration}</span>}
            </p>
            {chosen.detail && <p className="text-muted-foreground">{chosen.detail}</p>}
            {onRetry && chosen.status === "failed" && (
              <button type="button" disabled={busy} onClick={() => void retry([chosen.id])} className="mt-1 inline-flex h-7 w-fit items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60">
                <RotateCcw aria-hidden="true" className="size-3" />
                {msg("fan-out-grid.retryOne", "Retry this one")}
              </button>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">{msg("fan-out-grid.hint", "Select a tile to see what happened. Arrow keys move between tiles.")}</p>
        )}
      </div>
    </section>
  )
}

export { FanOutGrid, type FanItem, type FanOutGridProps, type FanStatus }
