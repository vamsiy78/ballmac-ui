"use client"

import { Search, X } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

import { filterGroups, filtersFromQuery, filtersToQuery, type Access, type BrowserGroup, type BrowserItem, type Filters } from "@/lib/blocks-filter"

export type { BrowserGroup, BrowserItem }

const ACCESS: { id: Access; label: string }[] = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "pro", label: "Pro" },
]

// The filters live in the address (?q=chat&access=free&new=1), so a filtered view can be shared and survives a reload. The page is built unfiltered;
// the browser reads the address after hydrating.
const listeners = new Set<() => void>()
const subscribe = (cb: () => void) => {
  listeners.add(cb)
  window.addEventListener("popstate", cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener("popstate", cb)
  }
}
const readSearch = () => window.location.search

function useUrlFilters() {
  const search = React.useSyncExternalStore(subscribe, readSearch, () => "")
  return React.useMemo(() => filtersFromQuery(search), [search])
}

function updateFilters(change: Partial<Filters>) {
  const next = { ...filtersFromQuery(window.location.search), ...change }
  const qs = filtersToQuery(next)
  window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`)
  listeners.forEach((l) => l())
}

/**
 * The blocks gallery with a search box, a Free / Pro switch and a New filter. The cards are drawn on the server and handed in by name, so this
 * component only decides which of them to show. Without JavaScript every block is listed.
 */
export function BlocksBrowser({
  groups,
  items,
  cards,
  featured,
  interlude,
}: {
  groups: BrowserGroup[]
  items: BrowserItem[]
  cards: Record<string, React.ReactNode>
  /** Shown above the list while no filter is set. */
  featured: React.ReactNode
  /** Shown after the first group while no filter is set (the Pro call to action). */
  interlude: React.ReactNode
}) {
  const searchId = React.useId()
  const { q, access, onlyNew, motion } = useUrlFilters()
  const setQ = (v: string) => updateFilters({ q: v })
  const setAccess = (v: Access) => updateFilters({ access: v })
  const setOnlyNew = (fn: (v: boolean) => boolean) => updateFilters({ onlyNew: fn(onlyNew) })
  const setMotion = (fn: (v: boolean) => boolean) => updateFilters({ motion: fn(motion) })

  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  const filtered = React.useMemo(() => filterGroups(groups, items, { q, access, onlyNew, motion }), [groups, items, q, access, onlyNew, motion])
  const total = filtered.reduce((n, g) => n + g.sections.reduce((m, s) => m + s.items.length, 0), 0)
  const active = words.length > 0 || access !== "all" || onlyNew || motion
  const clear = () => updateFilters({ q: "", access: "all", onlyNew: false, motion: false })
  const counts = { free: items.filter((i) => !i.pro).length, pro: items.filter((i) => i.pro).length }
  const motionCount = items.filter((i) => i.motion).length

  return (
    <>
      {!active && featured}
      <div className="bg-background/85 sticky top-14 z-20 -mx-4 mt-10 border-b px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
          <div className="relative min-w-0 flex-1 basis-56">
            <label htmlFor={searchId} className="sr-only">
              Search blocks
            </label>
            <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
            <input
              id={searchId}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search blocks…"
              autoComplete="off"
              className="bg-muted/50 focus-visible:ring-ring/50 placeholder:text-muted-foreground h-9 w-full rounded-lg border ps-9 pe-3 text-sm outline-none focus-visible:ring-[3px]"
            />
          </div>
          <div role="group" aria-label="Show" className="bg-muted/50 flex rounded-lg border p-0.5">
            {ACCESS.map((a) => (
              <button
                key={a.id}
                type="button"
                aria-pressed={access === a.id}
                onClick={() => setAccess(a.id)}
                className={cn(
                  "focus-visible:ring-ring/50 h-8 rounded-md px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]",
                  access === a.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {a.label}
                {a.id !== "all" && <span className="ms-1.5 text-[11px] tabular-nums">{counts[a.id]}</span>}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-pressed={onlyNew}
            onClick={() => setOnlyNew((v) => !v)}
            className={cn(
              "focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]",
              onlyNew ? "bg-foreground text-background border-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            New
          </button>
          {motionCount > 0 && (
            <button
              type="button"
              aria-pressed={motion}
              onClick={() => setMotion((v) => !v)}
              className={cn(
                "focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]",
                motion ? "bg-foreground text-background border-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              3D &amp; motion
              <span className="ms-1.5 text-[11px] tabular-nums">{motionCount}</span>
            </button>
          )}
        </div>
        <ul className="mt-2.5 flex gap-1.5 overflow-x-auto [scrollbar-width:none] md:flex-wrap" aria-label="Jump to a group">
          {filtered.map((g) => (
            <li key={g.id} className="shrink-0">
              <a
                href={`#${g.id}`}
                className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium outline-none transition-colors focus-visible:ring-[3px]"
              >
                {g.label}
                <span className="text-[11px] tabular-nums">{g.sections.reduce((n, s) => n + s.items.length, 0)}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p role="status" className="text-muted-foreground mt-4 text-sm">
        {active ? `${total} ${total === 1 ? "block matches" : "blocks match"}` : `${total} blocks`}
        {active && (
          <button type="button" onClick={clear} className="text-foreground focus-visible:ring-ring/50 ms-3 inline-flex items-center gap-1 rounded underline underline-offset-4 outline-none focus-visible:ring-[3px]">
            <X className="size-3" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </p>
      {total === 0 && (
        <p className="text-muted-foreground mt-16 text-center">
          No blocks match. Try fewer words, or <button type="button" onClick={clear} className="text-foreground underline underline-offset-4">clear the filters</button>.
        </p>
      )}
      {filtered.map((g, n) => (
        <React.Fragment key={g.id}>
          {n === 1 && !active && interlude}
          <section id={g.id} className="mt-16 scroll-mt-44 first-of-type:mt-10">
            <header className="mb-2 max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">{g.label}</h2>
              <p className="text-muted-foreground mt-1.5 text-[15px] leading-relaxed text-pretty">{g.description}</p>
            </header>
            {g.sections.map((s) => (
              <div key={s.id} id={s.id} className="mt-10 scroll-mt-44">
                <h3 className="mb-5 flex items-baseline gap-2 border-b pb-3 text-[15px] font-semibold tracking-tight">
                  {s.label}
                  <span className="text-muted-foreground text-sm font-normal tabular-nums">{s.items.length}</span>
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
                  {s.items.map((name) => (
                    <React.Fragment key={name}>{cards[name]}</React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </React.Fragment>
      ))}
    </>
  )
}
