// Ballmac UI: Citation. https://ui.ballmac.com/components/citation
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ballmac/hover-card"
import { cn } from "@/lib/utils"

type CitationSource = {
  /** Page title. */
  title: string
  /** Link to the page. */
  url: string
  /** Short excerpt shown in the preview card. */
  snippet?: string
  /** Shown instead of the host name, for example a publisher. */
  site?: string
  /** Icon image URL. When omitted a colored monogram is drawn, so nothing is fetched from a third party. */
  favicon?: string
  /** Publication date as text, for example "Mar 4, 2026". */
  date?: string
}

const TONES = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

function hashOf(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h
}

type SourceFaviconProps = React.ComponentProps<"span"> & {
  source: Pick<CitationSource, "url" | "site" | "favicon">
}

/** A small rounded icon for a source: its favicon when given, otherwise the first letter of its site on a stable color. */
function SourceFavicon({ source, className, ...props }: SourceFaviconProps) {
  const name = source.site ?? hostOf(source.url)
  return (
    <span
      data-slot="source-favicon"
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-[6px] border border-black/5 text-[11px] font-semibold text-background uppercase dark:border-white/10",
        !source.favicon && TONES[hashOf(name) % TONES.length],
        className
      )}
      {...props}
    >
      {source.favicon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={source.favicon} alt="" className="size-full object-cover" />
      ) : (
        name.charAt(0)
      )}
    </span>
  )
}

type CitationProps = Omit<React.ComponentProps<"a">, "href" | "children"> & {
  /** The source, or several sources backing one claim. With several, the card gets a pager. */
  sources: CitationSource | CitationSource[]
  /** Number shown in the marker. Ignored by the "pill" style. */
  index?: number
  /** "number" is a small superscript-style chip like [1]. "pill" shows the site name with a +N count. */
  variant?: "number" | "pill"
}

function Citation({ sources, index = 1, variant = "number", className, ...props }: CitationProps) {
  const list = Array.isArray(sources) ? sources : [sources]
  const [page, setPage] = React.useState(0)
  const active = list[Math.min(page, list.length - 1)]
  if (!active) return null
  const first = list[0]!
  const host = first.site ?? hostOf(first.url)
  const extra = list.length - 1
  const many = list.length > 1

  return (
    <HoverCard openDelay={120} closeDelay={150}>
      <HoverCardTrigger
        data-slot="citation"
        href={first.url}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={
          variant === "pill"
            ? `Source: ${host}${extra ? ` and ${extra} more` : ""}`
            : `Source ${index}: ${first.title}${extra ? ` and ${extra} more` : ""}`
        }
        className={cn(
          "mx-0.5 inline-flex items-center justify-center whitespace-nowrap align-baseline font-medium text-foreground no-underline outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50",
          variant === "number"
            ? "h-[1.25em] min-w-[1.35em] -translate-y-[0.15em] rounded-md bg-muted px-1 text-[0.72em] tabular-nums hover:bg-foreground hover:text-background"
            : "h-6 gap-1 rounded-full border bg-background px-2 text-xs shadow-xs hover:bg-accent",
          className
        )}
        {...props}
      >
        {variant === "number" ? (
          index
        ) : (
          <>
            <span className="max-w-32 truncate">{host}</span>
            {extra > 0 && <span className="text-muted-foreground tabular-nums">+{extra}</span>}
          </>
        )}
      </HoverCardTrigger>
      <HoverCardContent data-slot="citation-card" className="grid w-[min(21rem,calc(100vw-1.5rem))] gap-2.5 p-3.5">
        {many && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="tabular-nums" aria-live="polite">
              Source {page + 1} of {list.length}
            </span>
            <span className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Previous source"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="inline-flex size-6 items-center justify-center rounded-md outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next source"
                disabled={page === list.length - 1}
                onClick={() => setPage((p) => Math.min(list.length - 1, p + 1))}
                className="inline-flex size-6 items-center justify-center rounded-md outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <SourceFavicon source={active} />
          <span className="truncate">{active.site ?? hostOf(active.url)}</span>
          {active.date && <span className="shrink-0 before:mr-2 before:content-['·']">{active.date}</span>}
        </div>
        <p className="line-clamp-2 text-sm leading-5 font-medium text-foreground">{active.title}</p>
        {active.snippet && (
          <p className="line-clamp-3 text-[13px] leading-5 text-muted-foreground">{active.snippet}</p>
        )}
        <a
          href={active.url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex w-fit items-center gap-1 rounded-sm text-xs font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Open source
          <ExternalLink aria-hidden="true" className="size-3" />
        </a>
      </HoverCardContent>
    </HoverCard>
  )
}

export { Citation, SourceFavicon, hostOf, type CitationProps, type CitationSource, type SourceFaviconProps }
