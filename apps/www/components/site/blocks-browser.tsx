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
      {/* Where each group starts. Not sticky: the filters live in the dock at the bottom of the window. */}
      <ul className="mt-10 flex gap-1.5 overflow-x-auto [scrollbar-width:none] md:flex-wrap" aria-label="Jump to a group">
        {filtered.map((g) => (
          <li key={g.id} className="shrink-0">
            <a
              href={`#${g.id}`}
              className="bg-frame text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none"
            >
              {g.label}
              <span className="text-[11px] tabular-nums">{g.sections.reduce((n, s) => n + s.items.length, 0)}</span>
            </a>
          </li>
        ))}
      </ul>

      {/* The filter dock: fixed to the bottom of the window, so it is always in reach and never covers the headings. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-30 flex justify-center px-3 sm:bottom-5">
        <div role="search" aria-label="Filter blocks" className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1.5 sm:flex-nowrap sm:gap-2">
          <div className="bg-frame/90 relative min-w-0 flex-1 basis-full rounded-xl shadow-[0_10px_30px_-12px_rgb(0_0_0/0.3)] ring-1 ring-black/[0.05] backdrop-blur-xl sm:w-72 sm:basis-auto dark:ring-white/[0.08]">
            <label htmlFor={searchId} className="sr-only">
              Search blocks
            </label>
            <Search className="text-muted-foreground pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
            <input
              id={searchId}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              autoComplete="off"
              className="focus-visible:ring-ring/50 placeholder:text-muted-foreground h-11 w-full rounded-xl bg-transparent ps-10 pe-3 text-[15px] outline-none focus-visible:ring-[3px]"
            />
          </div>
          <div role="group" aria-label="Show" className="bg-frame/90 flex h-11 items-center rounded-xl p-1 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.3)] ring-1 ring-black/[0.05] backdrop-blur-xl dark:ring-white/[0.08]">
            {ACCESS.map((a) => (
              <button
                key={a.id}
                type="button"
                aria-pressed={access === a.id}
                onClick={() => setAccess(a.id)}
                className={cn(
                  "focus-visible:ring-ring/50 h-9 rounded-lg px-3 text-[14px] font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none",
                  access === a.id ? "bg-background text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {a.label}
                {a.id !== "all" && <span className="ms-1.5 text-[11px] tabular-nums">{counts[a.id]}</span>}
              </button>
            ))}
          </div>
          <div className="bg-frame/90 flex h-11 items-center gap-1 rounded-xl p-1 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.3)] ring-1 ring-black/[0.05] backdrop-blur-xl dark:ring-white/[0.08]">
            <button
              type="button"
              aria-pressed={onlyNew}
              onClick={() => setOnlyNew((v) => !v)}
              className={cn(
                "focus-visible:ring-ring/50 h-9 rounded-lg px-3 text-[14px] font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none",
                onlyNew ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
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
                  "focus-visible:ring-ring/50 h-9 rounded-lg px-3 text-[14px] font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none",
                  motion ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Motion
                <span className="ms-1.5 text-[11px] tabular-nums">{motionCount}</span>
              </button>
            )}
            {active && (
              <button type="button" onClick={clear} aria-label="Clear filters" className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex size-9 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px]">
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
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
          <section id={g.id} className="mt-24 scroll-mt-24 first-of-type:mt-12">
            <header className="mb-2 max-w-2xl">
              <h2 className="text-[1.75rem] font-semibold tracking-[-0.045em]">
                {g.label}
                <sup className="text-muted-foreground ms-1.5 align-super text-[13px] font-normal tracking-normal tabular-nums">[{g.sections.reduce((n, s) => n + s.items.length, 0)}]</sup>
              </h2>
              <p className="text-muted-foreground mt-1 text-[15px] leading-relaxed text-pretty">{g.description}</p>
            </header>
            {g.sections.map((s) => (
              <div key={s.id} id={s.id} className="mt-10 scroll-mt-24">
                <h3 className="mb-4 flex items-baseline gap-2 text-[15px] font-medium tracking-tight">
                  {s.label}
                  <span className="text-muted-foreground text-sm font-normal tabular-nums">{s.items.length}</span>
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
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
