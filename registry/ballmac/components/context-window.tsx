// Ballmac UI: Context Window. https://ui.ballmac.com/components/context-window
"use client"

import * as React from "react"
import { Loader2, Minimize2, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type ContextSegment = {
  id: string
  /** What fills this part, for example "System prompt" or "Files". */
  label: string
  /** Tokens it takes. */
  tokens: number
}

type ContextWindowProps = Omit<React.ComponentProps<"section">, "title"> & {
  segments: ContextSegment[]
  /** The model's context window, in tokens. */
  limit: number
  /** Tokens kept free for the answer. Drawn hatched at the end of the bar. */
  reserved?: number
  /** From this share of the limit (0 to 1), the card warns that it is nearly full. */
  warnAt?: number
  /** Heading. */
  title?: string
  /** What happens when it is full, in a sentence. Shown under the legend. */
  fullNote?: string
  /** Called by the Compact button, which summarises the conversation to free space. Reject and the card says why. */
  onCompact?: () => void | Promise<void>
}

const TONES = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"] as const

/** 142000 → "142K", 1500000 → "1.5M", 950 → "950". */
function formatTokens(n: number) {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${Math.round(n / 1000)}K`
  if (n >= 1000) return `${+(n / 1000).toFixed(1)}K`
  return String(Math.round(n))
}

/**
 * How full an agent's context window is and what is filling it: a stacked bar by part (system prompt, tools, files, messages), the tokens and share of each in
 * a legend, a hatched stretch for the room kept for the answer, and a warning in words when it is nearly full or over. Compact asks the app to summarise and
 * free space, and says so when it cannot. The bar is a meter with a spoken value.
 */
function ContextWindow({ segments, limit, reserved = 0, warnAt = 0.8, title, fullNote, onCompact, className, ...props }: ContextWindowProps) {
  const msg = useMessages()
  const id = React.useId()
  title ??= msg("context-window.title", "Context")
  const used = segments.reduce((n, s) => n + Math.max(0, s.tokens), 0)
  const share = limit > 0 ? used / limit : 0
  const over = used > limit
  const warn = !over && share >= warnAt
  const pct = (n: number) => `${Math.min(100, Math.max(0, (n / Math.max(limit, 1)) * 100))}%`
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const status = over ? msg("context-window.over", "Over the limit") : warn ? msg("context-window.nearly", "Nearly full") : null
  const spoken = msg("context-window.spoken", "{used} of {limit} tokens, {percent}% used", { used: formatTokens(used), limit: formatTokens(limit), percent: Math.round(share * 100) })

  async function compact() {
    setBusy(true)
    setError(null)
    try {
      await onCompact?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : msg("context-window.compactFailed", "It could not be compacted. Nothing was changed."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section data-slot="context-window" data-state={over ? "over" : warn ? "warn" : "ok"} aria-labelledby={`${id}-t`} className={cn("bg-card text-card-foreground grid gap-4 rounded-xl border p-4 sm:p-5", className)} {...props}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 id={`${id}-t`} className="text-sm font-semibold">{title}</h3>
        <p className="flex items-center gap-2 text-sm tabular-nums">
          {status && (
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-px text-[11px] font-medium", over ? "border-destructive/50 text-destructive" : "text-foreground")}>
              <TriangleAlert aria-hidden="true" className="size-3" />
              {status}
            </span>
          )}
          <span className="font-mono text-base font-semibold">{formatTokens(used)}</span>
          <span className="text-muted-foreground">{msg("context-window.of", "of {limit}", { limit: formatTokens(limit) })}</span>
        </p>
      </div>

      <div role="meter" aria-labelledby={`${id}-t`} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={Math.min(used, limit)} aria-valuetext={spoken} className="bg-muted relative flex h-3 overflow-hidden rounded-full">
        {segments.map((s, i) => (
          <span key={s.id} aria-hidden="true" className={cn("h-full border-e border-card transition-[width] duration-500 last:border-e-0 motion-reduce:transition-none", TONES[i % TONES.length])} style={{ width: pct(s.tokens) }} />
        ))}
        {reserved > 0 && <span aria-hidden="true" className="ms-auto h-full bg-[repeating-linear-gradient(135deg,var(--muted-foreground)_0_2px,transparent_2px_6px)] opacity-40" style={{ width: pct(reserved) }} />}
      </div>

      <ul className="grid gap-1.5 text-[13px]">
        {segments.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2.5">
            <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-sm", TONES[i % TONES.length])} />
            <span className="min-w-0 flex-1 truncate">{s.label}</span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{formatTokens(s.tokens)}</span>
            <span className="w-10 text-end font-mono text-xs tabular-nums text-muted-foreground">{limit > 0 ? `${Math.round((s.tokens / limit) * 100)}%` : "–"}</span>
          </li>
        ))}
        {reserved > 0 && (
          <li className="flex items-center gap-2.5 text-muted-foreground">
            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-sm bg-[repeating-linear-gradient(135deg,var(--muted-foreground)_0_2px,transparent_2px_4px)] opacity-60" />
            <span className="min-w-0 flex-1 truncate">{msg("context-window.reserved", "Kept free for the answer")}</span>
            <span className="font-mono text-xs tabular-nums">{formatTokens(reserved)}</span>
            <span className="w-10 text-end font-mono text-xs tabular-nums">{limit > 0 ? `${Math.round((reserved / limit) * 100)}%` : "–"}</span>
          </li>
        )}
      </ul>

      {(fullNote || onCompact) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          {fullNote ? <p className="max-w-md text-xs leading-snug text-muted-foreground">{fullNote}</p> : <span />}
          {onCompact && (
            <button type="button" disabled={busy} onClick={() => void compact()} className={cn("inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60 motion-reduce:transition-none", warn || over ? "border-foreground bg-foreground text-background hover:bg-foreground/90" : "bg-background hover:bg-accent")}>
              {busy ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <Minimize2 aria-hidden="true" className="size-3.5" />}
              {msg("context-window.compact", "Compact conversation")}
            </button>
          )}
        </div>
      )}
      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
    </section>
  )
}

export { ContextWindow, formatTokens as formatContextTokens, type ContextSegment, type ContextWindowProps }
