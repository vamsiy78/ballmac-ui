"use client"

import { Search } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Category chips and instant search over a server-rendered catalog. Filters by toggling `hidden`
 * on children marked with data-category (sections) and data-search (cards), and keeps the category
 * in ?category= so it's shareable. Reads the URL after mount (not useSearchParams) so the catalog
 * stays in the static HTML.
 */
export function CatalogFilter({ options, children }: { options: { value: string; label: string; count: number }[]; children: React.ReactNode }) {
  const [active, setActive] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [empty, setEmpty] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const sync = () => setActive(new URLSearchParams(window.location.search).get("category") ?? "all")
    sync()
    window.addEventListener("popstate", sync)
    return () => window.removeEventListener("popstate", sync)
  }, [])

  React.useEffect(() => {
    const root = ref.current
    if (!root) return
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    let shown = 0
    root.querySelectorAll<HTMLElement>("[data-category]").forEach((section) => {
      let visible = 0
      section.querySelectorAll<HTMLElement>("[data-search]").forEach((card) => {
        const match = words.every((w) => (card.dataset.search ?? "").includes(w))
        card.hidden = !match
        if (match) visible++
      })
      const featured = section.dataset.category === "featured"
      // The featured row only shows on the unfiltered view.
      const show = featured ? active === "all" && words.length === 0 : active === "all" || section.dataset.category === active
      section.hidden = !show || visible === 0
      if (!section.hidden && !featured) shown += visible
    })
    setEmpty(shown === 0)
  }, [active, query])

  const select = (value: string) => {
    const url = new URL(window.location.href)
    if (value === "all") url.searchParams.delete("category")
    else url.searchParams.set("category", value)
    window.history.replaceState(null, "", url)
    setActive(value)
  }
  const total = options.reduce((n, o) => n + o.count, 0)
  return (
    <div ref={ref}>
      <div className="bg-background/85 sticky top-14 z-20 -mx-4 mt-8 flex flex-col gap-3 border-b px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:flex-row lg:items-center">
        <label className="relative block shrink-0 lg:w-72">
          <span className="sr-only">Search components</span>
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${total} components…`}
            className="bg-card focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border pr-3 pl-9 text-sm outline-none focus-visible:ring-[3px]"
          />
        </label>
        <div role="toolbar" aria-label="Filter by category" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5 [scrollbar-width:none]">
          {[{ value: "all", label: "All", count: total }, ...options].map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={active === o.value}
              onClick={() => select(o.value)}
              className={cn(
                "focus-visible:ring-ring/50 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]",
                active === o.value ? "bg-foreground text-background border-foreground" : "text-muted-foreground hover:text-foreground hover:border-foreground/30"
              )}
            >
              {o.label}
              <span className="font-mono text-[11px] tabular-nums opacity-80">{o.count}</span>
            </button>
          ))}
        </div>
      </div>
      {children}
      {empty && (
        <p className="text-muted-foreground py-24 text-center" role="status">
          No components match “{query}”.
        </p>
      )}
    </div>
  )
}
