// Ballmac UI: Token Meter. https://ui.ballmac.com/components/token-meter
"use client"

import * as React from "react"
import { AlertTriangle, Info } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ballmac/popover"
import { cn } from "@/lib/utils"
import { useMessages, type Msg } from "@/lib/ballmac/i18n"

type TokenSegment = {
  /** What these tokens are, for example "Conversation". */
  label: string
  /** Token count. */
  tokens: number
  /** Reserved space, like room kept for the reply. Drawn hatched and not counted as used. */
  reserved?: boolean
}

/** 12400 → "12.4k", 1_250_000 → "1.25M". */
function formatTokens(tokens: number) {
  if (!Number.isFinite(tokens)) return "0"
  const abs = Math.abs(tokens)
  if (abs >= 1_000_000) return `${+(tokens / 1_000_000).toFixed(2)}M`
  if (abs >= 10_000) return `${+(tokens / 1000).toFixed(1)}k`
  if (abs >= 1000) return `${+(tokens / 1000).toFixed(2)}k`
  return String(Math.round(tokens))
}

/** A fast rough estimate: about one token per four characters of English text. */
function estimateTokens(text: string) {
  return Math.ceil(text.length / 4)
}

const FILLS = ["bg-chart-1", "bg-chart-2", "bg-chart-4", "bg-chart-5", "bg-chart-3"]

type TokenMeterProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Where the tokens go. Order sets the stacking order and the legend. */
  segments: TokenSegment[]
  /** Size of the context window in tokens. */
  limit: number
  /** Heading. */
  title?: string
  /** Percent used at which the meter turns to a warning. */
  warnAt?: number
  /** Cost of the current context, already formatted, such as "$0.21". */
  cost?: string
  /** Adds a button in the warning and full states, such as "Compact conversation". */
  action?: React.ReactNode
}

function summarize(segments: TokenSegment[], limit: number, warnAt: number) {
  const used = segments.filter((s) => !s.reserved).reduce((n, s) => n + Math.max(0, s.tokens), 0)
  const reserved = segments.filter((s) => s.reserved).reduce((n, s) => n + Math.max(0, s.tokens), 0)
  const percent = limit > 0 ? (used / limit) * 100 : 0
  const state = percent >= 100 ? "full" : percent >= warnAt ? "warning" : "ok"
  return { used, reserved, percent, state } as const
}

function stateText(msg: Msg, state: "ok" | "warning" | "full", left: number) {
  if (state === "full") return msg("token-meter.full", "Context is full")
  if (state === "warning") return msg("token-meter.nearingLimit", "Nearing the limit, {left} left", { left: formatTokens(left) })
  return msg("token-meter.left", "{left} left", { left: formatTokens(left) })
}

function Track({
  segments,
  limit,
  label,
  valueText,
  className,
}: {
  segments: TokenSegment[]
  limit: number
  label: string
  valueText: string
  className?: string
}) {
  const reduce = useReducedMotion()
  const total = Math.max(limit, segments.reduce((n, s) => n + Math.max(0, s.tokens), 0), 1)
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-valuenow={Math.min(limit, segments.filter((s) => !s.reserved).reduce((n, s) => n + s.tokens, 0))}
      aria-valuetext={valueText}
      className={cn("flex h-2.5 w-full gap-px overflow-hidden rounded-full bg-muted", className)}
    >
      {segments.map((s, i) => {
        const fillIndex = segments.slice(0, i).filter((x) => !x.reserved).length
        const width = (Math.max(0, s.tokens) / total) * 100
        return (
          <motion.span
            key={s.label}
            aria-hidden="true"
            className={cn(
              "block h-full first:rounded-s-full last:rounded-e-full",
              s.reserved
                ? "bg-[repeating-linear-gradient(135deg,var(--border)_0_3px,transparent_3px_6px)]"
                : FILLS[fillIndex % FILLS.length]
            )}
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${width}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
          />
        )
      })}
    </div>
  )
}

function Legend({ segments }: { segments: TokenSegment[] }) {
  return (
    <ul className="grid gap-1.5">
      {segments.map((s, i) => {
        const fillIndex = segments.slice(0, i).filter((x) => !x.reserved).length
        return (
          <li key={s.label} className="flex items-center gap-2 text-[13px]">
            <span
              aria-hidden="true"
              className={cn(
                "size-2.5 shrink-0 rounded-[3px]",
                s.reserved
                  ? "border bg-[repeating-linear-gradient(135deg,var(--border)_0_2px,transparent_2px_4px)]"
                  : FILLS[fillIndex % FILLS.length]
              )}
            />
            <span className="text-foreground">{s.label}</span>
            {s.reserved && <span className="text-xs text-muted-foreground">reserved</span>}
            <span className="ms-auto font-mono text-xs text-muted-foreground tabular-nums">{formatTokens(s.tokens)}</span>
          </li>
        )
      })}
    </ul>
  )
}

function TokenMeter({ segments, limit, title, warnAt = 80, cost, action, className, ...props }: TokenMeterProps) {
  const msg = useMessages()
  title ??= msg("token-meter.title", "Context window")
  const { used, percent, state } = summarize(segments, limit, warnAt)
  const left = Math.max(0, limit - used)
  const text = msg("token-meter.summary", "{used} of {limit} tokens used, {percent}%. {state}.", { used: formatTokens(used), limit: formatTokens(limit), percent: Math.round(percent), state: stateText(msg, state, left) })
  return (
    <div
      data-slot="token-meter"
      data-state={state}
      className={cn("grid w-full gap-3 rounded-xl border bg-card p-4 text-card-foreground", className)}
      {...props}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          <span className="text-foreground">{formatTokens(used)}</span> / {formatTokens(limit)}
        </p>
      </div>
      <Track segments={segments} limit={limit} label={title} valueText={text} />
      <Legend segments={segments} />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[13px]">
        <p
          className="flex items-center gap-1.5 text-foreground"
          role={state === "ok" ? undefined : "status"}
        >
          {state === "ok" ? (
            <Info aria-hidden="true" className="size-3.5 text-muted-foreground" />
          ) : (
            <AlertTriangle aria-hidden="true" className={cn("size-3.5", state === "full" ? "text-destructive" : "text-chart-3")} />
          )}
          {stateText(msg, state, left)}
        </p>
        {cost && <p className="text-muted-foreground tabular-nums">≈ {cost}</p>}
        {state !== "ok" && action}
      </div>
    </div>
  )
}

type TokenMeterPillProps = Omit<React.ComponentProps<"button">, "title"> &
  Pick<TokenMeterProps, "segments" | "limit" | "warnAt" | "cost" | "action" | "title"> & {
    /** Which side of the pill the details open on. */
    side?: "top" | "bottom"
  }

/** A compact ring and percentage for the composer toolbar. Opens the full meter in a popover. */
function TokenMeterPill({
  segments,
  limit,
  warnAt = 80,
  cost,
  action,
  title,
  side = "top",
  className,
  ...props
}: TokenMeterPillProps) {
  const msg = useMessages()
  title ??= msg("token-meter.title", "Context window")
  const { used, percent, state } = summarize(segments, limit, warnAt)
  const shown = Math.min(100, Math.round(percent))
  const r = 7
  const c = 2 * Math.PI * r
  return (
    <Popover>
      <PopoverTrigger
        data-slot="token-meter-pill"
        data-state-meter={state}
        aria-label={msg("token-meter.pill", "{title}: {percent}% used. {state}.", { title, percent: shown, state: stateText(msg, state, Math.max(0, limit - used)) })}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-full border bg-background px-2.5 text-xs font-medium text-foreground tabular-nums outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-accent",
          className
        )}
        {...props}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 -rotate-90">
          <circle cx="10" cy="10" r={r} fill="none" strokeWidth="3" className="stroke-muted" />
          <circle
            cx="10"
            cy="10"
            r={r}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - Math.min(1, percent / 100))}
            className={cn(
              "transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none",
              state === "full" ? "stroke-destructive" : state === "warning" ? "stroke-chart-3" : "stroke-foreground"
            )}
          />
        </svg>
        {shown}%
        {state !== "ok" && <AlertTriangle aria-hidden="true" className="size-3 text-muted-foreground" />}
      </PopoverTrigger>
      <PopoverContent label={title} side={side} align="end" className="w-[min(22rem,calc(100vw-1.5rem))] p-0">
        <TokenMeter segments={segments} limit={limit} title={title} warnAt={warnAt} cost={cost} action={action} className="border-0 bg-transparent" />
      </PopoverContent>
    </Popover>
  )
}

export {
  TokenMeter,
  TokenMeterPill,
  formatTokens,
  estimateTokens,
  type TokenMeterProps,
  type TokenMeterPillProps,
  type TokenSegment,
}
