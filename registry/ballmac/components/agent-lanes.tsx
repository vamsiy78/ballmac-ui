// Ballmac UI: Agent Lanes. https://ui.ballmac.com/components/agent-lanes
"use client"

import * as React from "react"
import { AlertOctagon, ArrowRight, CheckCircle2, Hourglass, Sparkles, Wrench, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useDirection } from "@/lib/ballmac/direction"
import { useMessages, type Msg } from "@/lib/ballmac/i18n"

type LaneKind = "thinking" | "tool" | "waiting" | "blocked" | "done"

type LaneSegment = {
  /** Unique across all lanes. Handoffs and selection refer to it. */
  id: string
  /** Start, in seconds from the beginning of the run. */
  start: number
  /** End, in seconds. */
  end: number
  /** What the agent is doing: thinking, calling a tool, waiting on someone, blocked, or done. */
  kind: LaneKind
  /** Short text shown on the bar and read to assistive technology. */
  label: string
  /** More detail, shown in the panel under the chart when the step is selected. */
  detail?: string
}

type Lane = {
  id: string
  /** The agent's name. */
  name: string
  /** What it is for, for example "Writes the code". */
  role?: string
  segments: LaneSegment[]
}

type Handoff = {
  /** The segment that hands the work over. */
  from: string
  /** The segment that takes it. */
  to: string
  /** Optional note drawn on the connector, such as "plan". */
  label?: string
}

const KINDS: Record<LaneKind, { icon: LucideIcon; bar: string; fallback: string }> = {
  thinking: { icon: Sparkles, bar: "border-chart-1/40 bg-chart-1/15", fallback: "Thinking" },
  tool: { icon: Wrench, bar: "border-chart-2/40 bg-chart-2/15", fallback: "Using a tool" },
  waiting: { icon: Hourglass, bar: "border-border bg-[repeating-linear-gradient(135deg,var(--muted)_0_4px,transparent_4px_8px)]", fallback: "Waiting" },
  blocked: { icon: AlertOctagon, bar: "border-destructive/50 bg-destructive/10", fallback: "Blocked" },
  done: { icon: CheckCircle2, bar: "border-chart-4/40 bg-chart-4/15", fallback: "Done" },
}

const ROW = 44
const HEAD = 32
const NAME_W = "9rem"
const STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1200, 3600]

/** 75 → "1:15", 3725 → "1:02:05". */
function formatClock(seconds: number) {
  const s = Math.max(0, Math.round(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`
}

/** The smallest step that keeps the axis to about eight labels. */
function tickStep(duration: number) {
  return STEPS.find((s) => duration / s <= 8) ?? STEPS[STEPS.length - 1]
}

function kindText(msg: Msg, kind: LaneKind) {
  return msg(`agent-lanes.kind.${kind}`, KINDS[kind].fallback)
}

type AgentLanesProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  /** One row per agent, each with its steps in time order. */
  lanes: Lane[]
  /** Where one agent hands work to another. Drawn as a dashed connector and listed in words. */
  handoffs?: Handoff[]
  /** Length of the run in seconds. The axis ends here. Defaults to the end of the last step. */
  duration?: number
  /** Where the run is now, in seconds. Draws a "Now" line. */
  now?: number
  /** The selected step id. Controlled. */
  selected?: string | null
  /** The selected step id for uncontrolled use. */
  defaultSelected?: string | null
  /** Called when a step is selected. */
  onSelectedChange?: (id: string) => void
  /** Turns seconds into text for the axis and the panel. Defaults to m:ss. */
  formatTime?: (seconds: number) => string
  /** Wider values make the chart scroll sideways earlier on small screens. Rem. */
  minTrackWidth?: number
}

function AgentLanes({
  lanes,
  handoffs = [],
  duration,
  now,
  selected: selectedProp,
  defaultSelected = null,
  onSelectedChange,
  formatTime = formatClock,
  minTrackWidth = 34,
  dir,
  className,
  ...props
}: AgentLanesProps) {
  const msg = useMessages()
  const direction = useDirection(dir === "rtl" || dir === "ltr" ? dir : undefined)
  const [inner, setInner] = React.useState<string | null>(defaultSelected)
  const selected = selectedProp !== undefined ? selectedProp : inner
  const total = Math.max(duration ?? 0, ...lanes.flatMap((l) => l.segments.map((s) => s.end)), 1)
  const pct = (t: number) => `${(Math.min(Math.max(t, 0), total) / total) * 100}%`

  const index = React.useMemo(() => {
    const map = new Map<string, { lane: number; seg: LaneSegment }>()
    lanes.forEach((l, li) => l.segments.forEach((s) => map.set(s.id, { lane: li, seg: s })))
    return map
  }, [lanes])
  const ordered = React.useMemo(() => lanes.map((l) => [...l.segments].sort((a, b) => a.start - b.start)), [lanes])

  // Only one step is in the tab order (roving tabindex); it follows selection and arrow keys.
  const first = ordered.flat()[0]?.id ?? null
  const [focusId, setFocusId] = React.useState<string | null>(null)
  const tabbable = (focusId && index.has(focusId) ? focusId : selected && index.has(selected) ? selected : first) ?? null
  const refs = React.useRef(new Map<string, HTMLButtonElement>())
  const move = (id: string) => {
    setFocusId(id)
    refs.current.get(id)?.focus()
  }

  function select(id: string) {
    if (selectedProp === undefined) setInner(id)
    onSelectedChange?.(id)
  }

  function onKeyDown(e: React.KeyboardEvent, id: string) {
    const at = index.get(id)
    if (!at) return
    const row = ordered[at.lane]
    const i = row.findIndex((s) => s.id === id)
    const rtl = direction === "rtl"
    let next: string | undefined
    if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) next = row[i + 1]?.id
    else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) next = row[i - 1]?.id
    else if (e.key === "Home") next = e.ctrlKey ? ordered.flat()[0]?.id : row[0]?.id
    else if (e.key === "End") next = e.ctrlKey ? ordered.flat().at(-1)?.id : row.at(-1)?.id
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      // The step in the next lane that overlaps this one most, or the one that starts closest to it.
      for (let l = at.lane + (e.key === "ArrowDown" ? 1 : -1); l >= 0 && l < ordered.length; l += e.key === "ArrowDown" ? 1 : -1) {
        const mid = (at.seg.start + at.seg.end) / 2
        const candidates = ordered[l]
        if (!candidates.length) continue
        next = [...candidates].sort((a, b) => Math.abs((a.start + a.end) / 2 - mid) - Math.abs((b.start + b.end) / 2 - mid))[0].id
        break
      }
    }
    if (e.key.startsWith("Arrow") || e.key === "Home" || e.key === "End") e.preventDefault()
    if (next) move(next)
  }

  const step = tickStep(total)
  const ticks: number[] = []
  for (let t = 0; t <= total; t += step) ticks.push(t)

  const sel = selected ? index.get(selected) : undefined
  const handoffsOf = (id: string) => handoffs.filter((h) => h.from === id || h.to === id)
  const nameOf = (id: string) => lanes[index.get(id)?.lane ?? 0]?.name ?? ""

  return (
    <div data-slot="agent-lanes" dir={dir} className={cn("grid w-full min-w-0 gap-3", className)} {...props}>
      <div className="overflow-x-auto rounded-xl border bg-card text-card-foreground">
        <div className="relative" style={{ minWidth: `calc(${NAME_W} + ${minTrackWidth}rem)` }}>
          {/* Axis */}
          <div className="flex border-b" style={{ height: HEAD }}>
            <div className="sticky start-0 z-20 shrink-0 border-e bg-card" style={{ width: NAME_W }} />
            <div aria-hidden="true" className="relative grow">
              {ticks.map((t) => (
                <span
                  key={t}
                  className={cn(
                    "absolute top-0 flex h-full items-center font-mono text-[11px] text-muted-foreground tabular-nums",
                    // The first label starts at the axis and the last ends at it, so neither is clipped by the names column or the edge.
                    t === 0 ? "ps-1.5" : t / total > 0.96 ? "-translate-x-full pe-1.5 rtl:translate-x-full" : "-translate-x-1/2 rtl:translate-x-1/2"
                  )}
                  style={{ insetInlineStart: pct(t) }}
                >
                  {formatTime(t)}
                </span>
              ))}
            </div>
          </div>

          {/* Lanes */}
          {lanes.map((lane, li) => (
            <div key={lane.id} role="group" aria-label={lane.role ? `${lane.name}, ${lane.role}` : lane.name} className="flex border-b last:border-b-0" style={{ height: ROW }}>
              <div className="sticky start-0 z-20 flex shrink-0 flex-col justify-center border-e bg-card px-3" style={{ width: NAME_W }}>
                <span className="truncate text-[13px] font-medium text-foreground">{lane.name}</span>
                {lane.role && <span className="truncate text-[11px] text-muted-foreground">{lane.role}</span>}
              </div>
              <div className="relative grow">
                {/* Grid lines */}
                {ticks.map((t) => (
                  <span key={t} aria-hidden="true" className="absolute inset-y-0 w-px bg-border/60" style={{ insetInlineStart: pct(t) }} />
                ))}
                {lane.segments.map((s) => {
                  const k = KINDS[s.kind]
                  const Icon = k.icon
                  const width = ((Math.max(s.end - s.start, 0)) / total) * 100
                  const active = selected === s.id
                  return (
                    <button
                      key={s.id}
                      ref={(el) => {
                        if (el) refs.current.set(s.id, el)
                        else refs.current.delete(s.id)
                      }}
                      type="button"
                      data-kind={s.kind}
                      data-selected={active || undefined}
                      tabIndex={tabbable === s.id ? 0 : -1}
                      aria-pressed={active}
                      aria-label={msg("agent-lanes.step", "{label}, {lane}, {kind}, {from} to {to}", { label: s.label, lane: lane.name, kind: kindText(msg, s.kind), from: formatTime(s.start), to: formatTime(s.end) })}
                      onClick={() => select(s.id)}
                      onFocus={() => setFocusId(s.id)}
                      onKeyDown={(e) => onKeyDown(e, s.id)}
                      className={cn(
                        "absolute top-1.5 bottom-1.5 flex min-w-1.5 items-center gap-1.5 overflow-hidden rounded-md border px-1.5 text-start text-[12px] text-foreground outline-none transition-[box-shadow,transform] duration-150",
                        "hover:shadow-sm focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        "data-[selected]:z-10 data-[selected]:ring-2 data-[selected]:ring-foreground/70 motion-reduce:transition-none",
                        k.bar
                      )}
                      style={{ insetInlineStart: pct(s.start), width: `${width}%` }}
                    >
                      {width >= 4 && <Icon aria-hidden="true" className="size-3.5 shrink-0" />}
                      {width >= 12 && <span className="truncate">{s.label}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Handoffs and the "Now" line sit over the lanes, to the right of the names column */}
          <div aria-hidden="true" className="pointer-events-none absolute end-0 bottom-0" style={{ insetInlineStart: NAME_W, top: HEAD }}>
            {handoffs.map((h) => {
              const a = index.get(h.from)
              const b = index.get(h.to)
              if (!a || !b || a.lane === b.lane) return null
              const up = b.lane < a.lane
              const top = Math.min(a.lane, b.lane) * ROW + ROW / 2
              const height = Math.abs(b.lane - a.lane) * ROW
              return (
                <span key={`${h.from}-${h.to}`} className="absolute w-0 border-s-2 border-dashed border-foreground/45" style={{ insetInlineStart: pct(b.seg.start), top, height }}>
                  <span className={cn("absolute -translate-x-1/2 border-x-[5px] border-x-transparent rtl:translate-x-1/2", up ? "-top-px border-b-[7px] border-b-foreground/60" : "-bottom-px border-t-[7px] border-t-foreground/60")} />
                  {h.label && <span className="absolute top-1/2 ms-2 -translate-y-1/2 rounded bg-card px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-muted-foreground ring-1 ring-border">{h.label}</span>}
                </span>
              )
            })}
            {now !== undefined && now >= 0 && now <= total && (
              <span className="absolute inset-y-0 w-0 border-s-2 border-primary" style={{ insetInlineStart: pct(now) }}>
                <span className="absolute -top-px -translate-x-1/2 rounded-b bg-primary px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary-foreground rtl:translate-x-1/2">{msg("agent-lanes.now", "Now")}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* The same handoffs in words, for assistive technology and for anyone who prefers reading */}
      {handoffs.length > 0 && (
        <ul className="sr-only">
          {handoffs.map((h) => (
            <li key={`${h.from}-${h.to}`}>{msg("agent-lanes.handoffText", "{from} hands over to {to} at {time}", { from: nameOf(h.from), to: nameOf(h.to), time: formatTime(index.get(h.to)?.seg.start ?? 0) })}</li>
          ))}
        </ul>
      )}

      {/* Legend */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground" aria-label={msg("agent-lanes.legend", "Step kinds")}>
        {(Object.keys(KINDS) as LaneKind[]).map((kind) => {
          const Icon = KINDS[kind].icon
          return (
            <li key={kind} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={cn("flex size-4 items-center justify-center rounded border", KINDS[kind].bar)}>
                <Icon className="size-2.5" />
              </span>
              {kindText(msg, kind)}
            </li>
          )
        })}
      </ul>

      {/* Detail of the selected step */}
      <div aria-live="polite" className="min-h-[5.5rem] rounded-xl border bg-card p-4 text-card-foreground">
        {sel ? (
          <div data-slot="agent-lanes-detail" className="grid gap-1.5">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
              {sel.seg.label}
              <span className="rounded-full border px-2 py-0.5 text-[11px] font-normal text-muted-foreground">{kindText(msg, sel.seg.kind)}</span>
            </p>
            <p className="font-mono text-xs text-muted-foreground tabular-nums">
              {lanes[sel.lane].name} · {formatTime(sel.seg.start)} <ArrowRight aria-hidden="true" className="inline size-3 rtl:rotate-180" /> {formatTime(sel.seg.end)} · {formatTime(sel.seg.end - sel.seg.start)}
            </p>
            {sel.seg.detail && <p className="text-[13px] leading-relaxed text-muted-foreground">{sel.seg.detail}</p>}
            {handoffsOf(sel.seg.id).map((h) => (
              <p key={`${h.from}-${h.to}`} className="text-[13px] text-foreground">
                {h.from === sel.seg.id
                  ? msg("agent-lanes.handsTo", "Hands over to {to}.", { to: nameOf(h.to) })
                  : msg("agent-lanes.handedBy", "Started by {from}.", { from: nameOf(h.from) })}
                {h.label ? ` (${h.label})` : ""}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-muted-foreground">{msg("agent-lanes.hint", "Select a step to see what happened. Arrow keys move between steps.")}</p>
        )}
      </div>
    </div>
  )
}

export { AgentLanes, formatClock, type AgentLanesProps, type Lane, type LaneKind, type LaneSegment, type Handoff }
