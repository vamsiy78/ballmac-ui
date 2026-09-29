"use client"

import { Search, X } from "lucide-react"
import * as React from "react"

import { ViewToggle } from "@/components/site/catalog-context"
import { cn } from "@/lib/utils"

/**
 * The catalog's sticky bar: instant search, category chips that jump to a section and highlight the
 * one in view (nothing is hidden, so you keep your place), and the Gallery / List switch.
 * `?category=` from links (e.g. the home page) scrolls to that section on load.
 */
export function CatalogFilter({ options, children }: { options: { value: string; label: string; count: number }[]; children: React.ReactNode }) {
  const [query, setQuery] = React.useState("")
  const [shown, setShown] = React.useState<number | null>(null)
  const [active, setActive] = React.useState(options[0]?.value ?? "")
  const ref = React.useRef<HTMLDivElement>(null)
  const bar = React.useRef<HTMLDivElement>(null)
  const chips = React.useRef<HTMLDivElement>(null)

  const jump = React.useCallback((value: string, smooth = true) => {
    const section = ref.current?.querySelector<HTMLElement>(`[data-category="${value}"]`)
    if (!section) return
    const offset = 56 + (bar.current?.offsetHeight ?? 0) + 16
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - offset, behavior: smooth && !reduce ? "smooth" : "auto" })
  }, [])

  // Deep links: /components?category=backgrounds lands on that section.
  React.useEffect(() => {
    const category = new URLSearchParams(window.location.search).get("category")
    if (!category) return
    // After the router's own scroll restoration on load, or it would put us back at the top.
    const go = () => window.setTimeout(() => jump(category, false), 120)
    if (document.readyState === "complete") {
      const id = go()
      return () => window.clearTimeout(id)
    }
    window.addEventListener("load", go, { once: true })
    return () => window.removeEventListener("load", go)
  }, [jump])

  // Scroll-spy: the chip for the section under the bar is the active one.
  React.useEffect(() => {
    const root = ref.current
    if (!root) return
    const update = () => {
      const line = 56 + (bar.current?.offsetHeight ?? 0) + 24
      let current = ""
      for (const s of root.querySelectorAll<HTMLElement>("[data-category]")) {
        if (s.hidden) continue
        if (s.getBoundingClientRect().top <= line) current = s.dataset.category!
        else if (!current) current = s.dataset.category!
      }
      if (current) setActive(current)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    // Layout changes without scrolling (Gallery / List, previews mounting) move the sections too.
    const ro = new ResizeObserver(update)
    ro.observe(root)
    return () => {
      window.removeEventListener("scroll", update)
      ro.disconnect()
    }
  }, [query])

  // Keep the active chip visible in the horizontally scrolling chip row, without moving the page.
  React.useEffect(() => {
    const row = chips.current
    const chip = row?.querySelector<HTMLElement>(`[data-chip="${active}"]`)
    if (!row || !chip) return
    const left = chip.offsetLeft - row.offsetLeft
    if (left < row.scrollLeft || left + chip.offsetWidth > row.scrollLeft + row.clientWidth) row.scrollTo({ left: left - 16, behavior: "smooth" })
  }, [active])

  // Search: hide cards and rows that don't match every word, and sections left empty.
  React.useEffect(() => {
    const root = ref.current
    if (!root) return
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    let count = 0
    root.querySelectorAll<HTMLElement>("[data-category]").forEach((section) => {
      let visible = 0
      section.querySelectorAll<HTMLElement>("[data-search]").forEach((el) => {
        const match = words.every((w) => (el.dataset.search ?? "").includes(w))
        el.hidden = !match
        if (match && el.dataset.kind === "card") visible++
      })
      section.hidden = visible === 0
      count += visible
    })
    setShown(words.length ? count : null)
  }, [query])

  const counts = new Map(options.map((o) => [o.value, o.count]))
  return (
    <div ref={ref}>
      <div
        ref={bar}
        className="bg-background/85 sticky top-14 z-20 -mx-4 mt-8 flex flex-col gap-3 border-b px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-12 lg:flex-row lg:items-center lg:px-12"
      >
        <div className="flex items-center gap-2 lg:w-72 lg:shrink-0">
          <label className="relative block flex-1">
            <span className="sr-only">Search components</span>
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${options.reduce((n, o) => n + o.count, 0)} components…`}
              className="bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border pr-8 pl-9 text-sm outline-none focus-visible:ring-[3px] [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </label>
          <div className="lg:hidden">
            <ViewToggle />
          </div>
        </div>
        <nav
          ref={chips}
          aria-label="Jump to category"
          className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 py-0.5 [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              data-chip={o.value}
              aria-current={active === o.value ? "true" : undefined}
              onClick={() => jump(o.value)}
              className={cn(
                "focus-visible:ring-ring/50 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]",
                active === o.value ? "bg-foreground text-background border-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {o.label}
              <span className="text-[11px] tabular-nums">{counts.get(o.value)}</span>
            </button>
          ))}
        </nav>
        <div className="hidden lg:block">
          <ViewToggle />
        </div>
      </div>
      <p className="sr-only" role="status">
        {shown === null ? "" : `${shown} ${shown === 1 ? "component" : "components"} found`}
      </p>
      {shown !== null && shown > 0 && (
        <p className="text-muted-foreground mt-6 text-sm">
          {shown} {shown === 1 ? "result" : "results"} for “{query}”
        </p>
      )}
      {children}
      {shown === 0 && <p className="text-muted-foreground py-24 text-center">No components match “{query}”.</p>}
    </div>
  )
}
