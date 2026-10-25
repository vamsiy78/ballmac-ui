// Ballmac UI: Cited Answer. https://ui.ballmac.com/components/cited-answer
"use client"

import * as React from "react"
import { ExternalLink, Quote } from "lucide-react"

import { SourceFavicon, type CitationSource } from "@/components/ballmac/citation"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type CitedAnswerProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The answer, one string per paragraph. Write [1] or [2, 3] after a claim to cite the sources in that order. */
  paragraphs: string[]
  /** The sources the numbers point to, in order. */
  sources: CitationSource[]
  /** Shown above the answer, for example the question that was asked. */
  question?: string
  /** Show how many sentences are cited. Defaults to true. */
  showCoverage?: boolean
}

type Piece = { text: string; cites: number[] }

const MARK = /\s*\[(\d+(?:\s*,\s*\d+)*)\]/g

/** Splits a paragraph into pieces: each is the text before a [n] marker and the sources it cites. Text after the last marker has no cites. */
function parseParagraph(text: string, count: number): Piece[] {
  const out: Piece[] = []
  let last = 0
  for (const m of text.matchAll(MARK)) {
    const cites = m[1].split(",").map((n) => Number(n.trim()) - 1).filter((n) => n >= 0 && n < count)
    const body = text.slice(last, m.index)
    last = (m.index ?? 0) + m[0].length
    if (out.length > 0 && body === "" && cites.length > 0) out[out.length - 1].cites.push(...cites)
    else out.push({ text: body, cites })
  }
  const rest = text.slice(last)
  if (rest.trim() !== "") out.push({ text: rest, cites: [] })
  return out
}

/**
 * An AI answer you can check. Numbers in the text are real buttons; choosing one (or hovering it) lights up every claim that source supports and opens its
 * excerpt in the list beside it, and choosing a source in the list does the same the other way round. The count of cited sentences is said in words.
 */
function CitedAnswer({ paragraphs, sources, question, showCoverage = true, className, ...props }: CitedAnswerProps) {
  const msg = useMessages()
  const id = React.useId()
  const [pinned, setPinned] = React.useState<number | null>(null)
  const [hover, setHover] = React.useState<number | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const shown = hover ?? pinned
  const parsed = React.useMemo(() => paragraphs.map((p) => parseParagraph(p, sources.length)), [paragraphs, sources.length])

  const stats = React.useMemo(() => {
    const uses = sources.map(() => 0)
    let cited = 0
    let total = 0
    for (const para of parsed) {
      for (const piece of para) {
        const sentences = piece.cites.length > 0 ? 1 : (piece.text.match(/[^.!?]+[.!?]*/g) ?? []).filter((s) => s.trim().length > 3).length
        total += sentences
        if (piece.cites.length > 0) {
          cited += 1
          for (const c of new Set(piece.cites)) uses[c] += 1
        }
      }
    }
    return { uses, cited, total }
  }, [parsed, sources])

  function pick(i: number) {
    const next = pinned === i ? null : i
    setPinned(next)
    setAnnounce(
      next === null
        ? msg("cited-answer.cleared", "Showing the whole answer")
        : msg("cited-answer.picked", "Highlighting {count} claims from {title}", { count: stats.uses[i], title: sources[i].title })
    )
  }

  return (
    <div
      data-slot="cited-answer"
      className={cn("grid min-w-0 gap-5 rounded-xl border bg-card p-5 text-card-foreground md:grid-cols-[minmax(0,1fr)_17rem] md:gap-6 md:p-6", className)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && pinned !== null) {
          setPinned(null)
          setHover(null)
          setAnnounce(msg("cited-answer.cleared", "Showing the whole answer"))
        }
      }}
      {...props}
    >
      <div className="min-w-0">
        {question && (
          <p className="mb-3 flex items-start gap-2 text-sm font-medium text-foreground text-balance">
            <Quote aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground rtl:-scale-x-100" />
            {question}
          </p>
        )}
        <div className="grid gap-3 text-[15px] leading-[1.7] text-foreground/90 text-pretty">
          {parsed.map((para, pi) => (
            <p key={pi}>
              {para.map((piece, i) => {
                const on = shown !== null && piece.cites.includes(shown)
                const unique = [...new Set(piece.cites)]
                return (
                  <React.Fragment key={i}>
                    <span
                      data-claim={piece.cites.length > 0 ? "" : undefined}
                      className={cn(
                        "rounded-[3px] transition-colors duration-200 motion-reduce:transition-none",
                        piece.cites.length > 0 && "box-decoration-clone decoration-foreground/25 underline decoration-dotted underline-offset-4",
                        on && "bg-accent text-foreground decoration-transparent",
                        shown !== null && piece.cites.length > 0 && !on && "text-muted-foreground"
                      )}
                    >
                      {piece.text}
                    </span>
                    {unique.length > 0 && (
                      <span className="ms-1 inline-flex gap-1 align-baseline">
                        {unique.map((c) => (
                          <button
                            key={c}
                            type="button"
                            aria-pressed={pinned === c}
                            aria-label={msg("cited-answer.chip", "Source {n}: {title}", { n: c + 1, title: sources[c].title })}
                            onClick={() => pick(c)}
                            onMouseEnter={() => setHover(c)}
                            onMouseLeave={() => setHover(null)}
                            onFocus={() => setHover(c)}
                            onBlur={() => setHover(null)}
                            className={cn(
                              "inline-flex h-[1.3rem] min-w-[1.3rem] -translate-y-px items-center justify-center rounded-full border px-1 text-[11px] font-medium leading-none tabular-nums outline-none transition-colors motion-reduce:transition-none",
                              "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                              shown === c ? "border-foreground bg-foreground text-background" : "bg-background text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                            )}
                          >
                            {c + 1}
                          </button>
                        ))}
                      </span>
                    )}
                  </React.Fragment>
                )
              })}
            </p>
          ))}
        </div>
        {showCoverage && stats.total > 0 && (
          <p className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
            <span aria-hidden="true" className="h-1 w-16 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-foreground" style={{ width: `${Math.round((stats.cited / stats.total) * 100)}%` }} />
            </span>
            {msg("cited-answer.coverage", "{cited} of {total} sentences are cited", { cited: stats.cited, total: stats.total })}
          </p>
        )}
      </div>

      <div className="min-w-0 border-t pt-4 md:border-s md:border-t-0 md:pt-0 md:ps-6">
        <h3 id={`${id}-sources`} className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
          {msg("cited-answer.sources", "Sources")}
          <span className="rounded-full bg-muted px-1.5 text-[11px] tabular-nums">{sources.length}</span>
        </h3>
        <ol aria-labelledby={`${id}-sources`} className="grid grid-cols-[minmax(0,1fr)] gap-1.5">
          {sources.map((s, i) => {
            const on = shown === i
            return (
              <li key={i} className={cn("grid min-w-0 gap-2 rounded-lg border p-2 transition-colors motion-reduce:transition-none", on ? "border-foreground/40 bg-accent/50" : "border-transparent")}>
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    aria-pressed={pinned === i}
                    aria-label={msg("cited-answer.row", "{title}, cited {count} times. Highlight its claims", { title: s.title, count: stats.uses[i] })}
                    onClick={() => pick(i)}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium tabular-nums">{i + 1}</span>
                    <SourceFavicon source={s} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium leading-tight">{s.title}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{[s.site, s.date].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span aria-hidden="true" className="shrink-0 text-[11px] text-muted-foreground tabular-nums">{msg("cited-answer.times", "×{count}", { count: stats.uses[i] })}</span>
                  </button>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={msg("cited-answer.open", "Open {title}", { title: s.title })}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <ExternalLink aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
                  </a>
                </div>
                {on && s.snippet && <p className="border-s-2 border-foreground/30 ps-2.5 text-xs leading-relaxed text-muted-foreground text-pretty">{s.snippet}</p>}
              </li>
            )
          })}
        </ol>
      </div>
      <p aria-live="polite" className="sr-only">{announce}</p>
    </div>
  )
}

export { CitedAnswer, parseParagraph, type CitedAnswerProps }
