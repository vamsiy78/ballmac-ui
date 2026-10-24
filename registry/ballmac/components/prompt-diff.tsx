// Ballmac UI: Prompt Diff. https://ui.ballmac.com/components/prompt-diff
"use client"

import * as React from "react"
import { History, Rows2, Columns2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type DiffPart = { type: "same" | "add" | "del"; text: string }

/** Splits text into words, {{variables}}, punctuation marks and the spaces between them, so spacing survives and a full stop never makes a word look changed. */
const tokenize = (s: string) => s.match(/\s+|\{\{[^}]*\}\}|[\p{L}\p{N}_'’-]+|[^\s\p{L}\p{N}]/gu) ?? []

/**
 * A word-by-word comparison of two texts using the longest common subsequence. Each part is kept, added or deleted. Very large inputs (over 200,000 word pairs)
 * fall back to "everything deleted, everything added" rather than freezing the page.
 */
function diffWords(before: string, after: string): DiffPart[] {
  const a = tokenize(before)
  const b = tokenize(after)
  if (a.length * b.length > 200_000) return [...(before ? [{ type: "del" as const, text: before }] : []), ...(after ? [{ type: "add" as const, text: after }] : [])]
  const n = a.length
  const m = b.length
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
  const out: DiffPart[] = []
  const push = (type: DiffPart["type"], text: string) => {
    const last = out[out.length - 1]
    if (last && last.type === type) last.text += text
    else out.push({ type, text })
  }
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) (push("same", a[i]), i++, j++)
    else if (lcs[i + 1][j] >= lcs[i][j + 1]) push("del", a[i++])
    else push("add", b[j++])
  }
  while (i < n) push("del", a[i++])
  while (j < m) push("add", b[j++])
  return out
}

/** How many words (and variables) a text holds: runs of letters or digits, and {{variables}}. */
const words = (s: string) => s.match(/\{\{[^}]*\}\}|[\p{L}\p{N}_'’-]+/gu)?.length ?? 0

/** Wraps {{variables}} in a quiet chip so they stand out from the prose. */
function Text({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\{\{[^}]+\}\})/g).map((p, i) =>
        p.startsWith("{{") ? (
          <code key={i} className="rounded bg-muted px-1 py-px font-mono text-[0.85em]" dir="ltr">{p}</code>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  )
}

type PromptDiffProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** The earlier version. */
  before: string
  /** The later version. */
  after: string
  /** Name of the earlier version, for example "v12, 3 Oct". */
  beforeLabel?: string
  /** Name of the later version. */
  afterLabel?: string
  /** Layout: side by side, or one text with changes marked inline. */
  mode?: "split" | "unified"
  /** Called when the person asks to go back to the earlier version. Adds the button. */
  onRestore?: () => void
}

/**
 * Two versions of a prompt compared word by word. Removed words are struck through and added words are underlined, so the difference never depends on colour;
 * a summary counts the words each way. {{variables}} are marked so a change to one is easy to see. Side by side or inline, and an optional Restore button.
 */
function PromptDiff({ before, after, beforeLabel, afterLabel, mode: modeProp = "split", onRestore, className, ...props }: PromptDiffProps) {
  const msg = useMessages()
  const [mode, setMode] = React.useState(modeProp)
  beforeLabel ??= msg("prompt-diff.before", "Before")
  afterLabel ??= msg("prompt-diff.after", "After")
  const parts = React.useMemo(() => diffWords(before, after), [before, after])
  const added = parts.filter((p) => p.type === "add").reduce((n, p) => n + words(p.text), 0)
  const removed = parts.filter((p) => p.type === "del").reduce((n, p) => n + words(p.text), 0)
  const same = before === after
  const del = (t: string, k: number) => (
    <del key={k} className="rounded-sm bg-destructive/15 text-foreground line-through decoration-destructive decoration-1">
      <span className="sr-only">{msg("prompt-diff.removedMark", "[removed:")} </span>
      <Text text={t} />
      <span className="sr-only">]</span>
    </del>
  )
  const ins = (t: string, k: number) => (
    <ins key={k} className="rounded-sm bg-chart-2/20 text-foreground underline decoration-chart-2 decoration-2 underline-offset-2">
      <span className="sr-only">{msg("prompt-diff.addedMark", "[added:")} </span>
      <Text text={t} />
      <span className="sr-only">]</span>
    </ins>
  )

  return (
    <section data-slot="prompt-diff" className={cn("grid w-full min-w-0 gap-4 rounded-xl border bg-card p-4 text-card-foreground sm:p-5", className)} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm tabular-nums">
          {same ? <span className="text-muted-foreground">{msg("prompt-diff.same", "The two versions are the same.")}</span> : (
            <>
              <span className="font-medium">{msg("prompt-diff.added", "+{count} words", { count: added })}</span>
              <span className="mx-2 text-muted-foreground">·</span>
              <span className="font-medium">{msg("prompt-diff.removed", "−{count} words", { count: removed })}</span>
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <div role="group" aria-label={msg("prompt-diff.view", "View")} className="inline-flex rounded-full border p-0.5">
            {([["split", Columns2, msg("prompt-diff.split", "Side by side")], ["unified", Rows2, msg("prompt-diff.unified", "Inline")]] as const).map(([k, Icon, l]) => (
              <button key={k} type="button" aria-pressed={mode === k} onClick={() => setMode(k)} className={cn("inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none", mode === k ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                <Icon aria-hidden="true" className="size-3.5" /> {l}
              </button>
            ))}
          </div>
          {onRestore && (
            <button type="button" onClick={onRestore} className="inline-flex h-8 items-center gap-1.5 rounded-full border bg-background px-3 text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none">
              <History aria-hidden="true" className="size-3.5" /> {msg("prompt-diff.restore", "Restore {label}", { label: beforeLabel })}
            </button>
          )}
        </div>
      </div>

      {mode === "split" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {([[beforeLabel, "del"], [afterLabel, "add"]] as const).map(([label, side]) => (
            <div key={label} className="min-w-0 rounded-lg border">
              <p className="border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">{label}</p>
              <p className="whitespace-pre-wrap p-3 text-[13px] leading-relaxed [overflow-wrap:anywhere]" dir="auto">
                {parts.map((p, i) => (p.type === "same" ? <Text key={i} text={p.text} /> : p.type === side ? (side === "del" ? del(p.text, i) : ins(p.text, i)) : null))}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="min-w-0 rounded-lg border">
          <p className="border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">{beforeLabel} → {afterLabel}</p>
          <p className="whitespace-pre-wrap p-3 text-[13px] leading-relaxed [overflow-wrap:anywhere]" dir="auto">
            {parts.map((p, i) => (p.type === "same" ? <Text key={i} text={p.text} /> : p.type === "del" ? del(p.text, i) : ins(p.text, i)))}
          </p>
        </div>
      )}
    </section>
  )
}

export { PromptDiff, diffWords, type DiffPart, type PromptDiffProps }
