"use client"

import * as React from "react"

import { SourcesList } from "@/components/ballmac/sources-list"
import type { CitationSource } from "@/components/ballmac/citation"

const sources: CitationSource[] = [
  { title: "How sea ice extent is measured from satellites", url: "https://example.org/climate/sea-ice-extent", site: "Polar Data Center", date: "Mar 4, 2026" },
  { title: "Arctic summer minimum reaches the second lowest on record", url: "https://example.com/news/arctic-minimum", site: "Example News", date: "Sep 21, 2026" },
  { title: "Changes in multi-year ice since 1985", url: "https://example.net/research/multiyear-ice", site: "Journal of Polar Science" },
  { title: "Sea ice and coastal communities", url: "https://example.edu/arctic/communities", site: "Northern University" },
  { title: "Monthly extent series, 1979 to today", url: "https://example.gov/data/sea-ice-index", site: "National Ice Archive" },
  { title: "Explainer: why ice loss speeds up warming", url: "https://example.org/explainers/albedo", site: "Climate Explained" },
]

export default function SourcesListDemo() {
  const [hover, setHover] = React.useState<number | null>(null)
  return (
    <div className="w-full max-w-md" onMouseLeave={() => setHover(null)}>
      <SourcesList sources={sources} defaultOpen highlight={hover} visibleCount={4} />
      <p className="mt-2 px-1 text-xs text-muted-foreground">
        <button
          type="button"
          onFocus={() => setHover(2)}
          onBlur={() => setHover(null)}
          onMouseEnter={() => setHover(2)}
          className="rounded-sm underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Hover or focus this
        </button>{" "}
        to highlight source 2.
      </p>
    </div>
  )
}
