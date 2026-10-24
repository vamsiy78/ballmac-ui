// Ballmac UI: Citation Coverage. https://ui.ballmac.com/components/citation-coverage
"use client"

import * as React from "react"
import { CircleAlert, ExternalLink, Link2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type CoverageSource = {
  /** The number shown on the claims that use it. */
  id: number
  title: string
  /** Where it lives. Shown as a link when given. */
  url?: string
  /** A passage from it, shown when a claim that uses it is selected. */
  quote?: string
}

type CoverageClaim = {
  id: string
  /** One sentence or statement from the answer. */
  text: string
  /** The ids of the sources behind it. Empty means nothing backs it. */
  sources: number[]
}

type CitationCoverageProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  /** The answer, split into claims in reading order. */
  claims: CoverageClaim[]
  /** Everything the answer could cite. */
  sources: CoverageSource[]
  /** The selected claim id. Controlled. */
  selected?: string | null
  /** The selected claim id for uncontrolled use. */
  defaultSelected?: string | null
  /** Called when a claim is selected, or null when it is cleared. */
  onSelectedChange?: (id: string | null) => void
}

/**
 * An answer shown claim by claim, so a reader can see which statements are backed by a source and which are not. Unsupported claims are underlined and
 * marked in words; selecting a claim lights up its sources and shows the passage. A switch narrows the answer to the unsupported claims.
 */
function CitationCoverage({ claims, sources, selected: selectedProp, defaultSelected = null, onSelectedChange, className, ...props }: CitationCoverageProps) {
  const msg = useMessages()
  const uid = React.useId()
  const [inner, setInner] = React.useState<string | null>(defaultSelected)
  const selected = selectedProp !== undefined ? selectedProp : inner
  const [onlyGaps, setOnlyGaps] = React.useState(false)
  const supported = claims.filter((c) => c.sources.length > 0).length
  const percent = claims.length ? Math.round((supported / claims.length) * 100) : 0
  const chosen = claims.find((c) => c.id === selected)
  const lit = new Set(chosen?.sources ?? [])
  const shown = onlyGaps ? claims.filter((c) => c.sources.length === 0) : claims

  function select(id: string) {
    const next = id === selected ? null : id
    if (selectedProp === undefined) setInner(next)
    onSelectedChange?.(next)
  }

  return (
    <div data-slot="citation-coverage" className={cn("grid w-full min-w-0 gap-5 rounded-xl border bg-card p-4 text-card-foreground sm:p-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]", className)} {...props}>
      <div className="grid content-start gap-4">
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-foreground">{msg("citation-coverage.title", "Source coverage")}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{msg("citation-coverage.summary", "{supported} of {total} claims have a source", { supported, total: claims.length })}</p>
          </div>
          <div role="meter" aria-label={msg("citation-coverage.title", "Source coverage")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${percent}%`} className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-chart-2 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${percent}%` }} />
          </div>
          <label className="mt-1 flex w-fit cursor-pointer items-center gap-2 text-[13px]">
            <input type="checkbox" checked={onlyGaps} onChange={(e) => setOnlyGaps(e.target.checked)} className="size-4 accent-foreground" />
            {msg("citation-coverage.onlyGaps", "Show only claims without a source")}
          </label>
        </div>

        <p className="text-[15px] leading-8" aria-live="polite">
          {shown.length === 0 ? (
            <span className="text-muted-foreground">{msg("citation-coverage.none", "Every claim has a source.")}</span>
          ) : (
            shown.map((c) => {
              const gap = c.sources.length === 0
              const active = c.id === selected
              return (
                <React.Fragment key={c.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-describedby={gap ? `${uid}-gap` : undefined}
                    onClick={() => select(c.id)}
                    className={cn(
                      "rounded-sm px-0.5 text-start outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
                      gap ? "underline decoration-destructive decoration-wavy decoration-1 underline-offset-4 hover:bg-destructive/10" : "hover:bg-accent",
                      active && "bg-accent"
                    )}
                  >
                    {c.text}
                    {gap && " "}
                    {gap && <span className="sr-only">({msg("citation-coverage.noSource", "no source")})</span>}
                  </button>
                  {c.sources.map((s) => (
                    <sup key={s} className={cn("mx-px inline-flex min-w-4 items-center justify-center rounded px-1 font-mono text-[10px] font-medium tabular-nums", lit.has(s) ? "bg-foreground text-background" : "bg-muted text-muted-foreground")}>
                      <span className="sr-only">{msg("citation-coverage.source", "source")} </span>
                      {s}
                    </sup>
                  ))}{" "}
                </React.Fragment>
              )
            })
          )}
        </p>
        <p id={`${uid}-gap`} className="hidden">{msg("citation-coverage.gapHelp", "This claim has no source.")}</p>
        {claims.some((c) => c.sources.length === 0) && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CircleAlert aria-hidden="true" className="size-3.5 text-destructive" />
            {msg("citation-coverage.legend", "A wavy underline means no source backs the claim.")}
          </p>
        )}
      </div>

      <div className="grid content-start gap-2">
        <p className="text-sm font-medium text-foreground">{msg("citation-coverage.sources", "Sources")}</p>
        <ol className="grid gap-2">
          {sources.map((s) => {
            const on = lit.has(s.id)
            return (
              <li key={s.id} data-lit={on || undefined} className={cn("rounded-lg border p-3 text-[13px] transition-colors motion-reduce:transition-none", on && "border-foreground bg-accent/50")}>
                <p className="flex items-start gap-2">
                  <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded bg-muted font-mono text-[11px] tabular-nums">{s.id}</span>
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">{s.title}</span>
                    {s.url && (
                      <a href={s.url} className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-xs text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50" dir="ltr">
                        <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
                        <span className="truncate">{s.url.replace(/^https?:\/\//, "")}</span>
                      </a>
                    )}
                  </span>
                </p>
                {on && s.quote && (
                  <blockquote className="mt-2 flex gap-2 border-s-2 ps-3 text-xs leading-relaxed text-muted-foreground">
                    <Link2 aria-hidden="true" className="mt-0.5 size-3 shrink-0" />
                    {s.quote}
                  </blockquote>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

export { CitationCoverage, type CitationCoverageProps, type CoverageClaim, type CoverageSource }
