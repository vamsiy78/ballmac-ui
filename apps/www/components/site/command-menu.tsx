"use client"

import { Command, Search } from "lucide-react"
import * as React from "react"

import type { MenuEntry } from "@/lib/search-index"

const CommandDialog = React.lazy(() => import("@/components/site/command-dialog"))

// The search index and the dialog's code are fetched on first use (click, shortcut, hover or focus), not with every page.
let indexPromise: Promise<MenuEntry[]> | null = null
const loadIndex = () => (indexPromise ??= fetch("/search-index.json").then((r) => (r.ok ? (r.json() as Promise<MenuEntry[]>) : []))).catch(() => (indexPromise = null, []))
const warm = () => {
  void loadIndex()
  void import("@/components/site/command-dialog")
}

/** `compact` is the header's square ⌘ button; the default is the wide search field used in the docs. */
export function CommandMenu({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const [entries, setEntries] = React.useState<MenuEntry[] | null>(null)
  const show = React.useCallback(() => {
    setOpen(true)
    void loadIndex().then(setEntries)
  }, [])
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (open) setOpen(false)
        else show()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, show])
  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={show}
          onPointerEnter={warm}
          onFocus={warm}
          aria-label="Search docs, blocks and components (⌘K)"
          title="Search (⌘K)"
          className="bg-background text-foreground hover:bg-background/70 focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-lg shadow-[0_1px_2px_rgb(0_0_0/0.06)] outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none"
        >
          <Command className="size-3.5" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={show}
          onPointerEnter={warm}
          onFocus={warm}
          className="text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted focus-visible:ring-ring/50 inline-flex h-8 w-8 items-center justify-center gap-2 rounded-lg text-[13px] sm:w-full sm:justify-start sm:px-2.5 outline-none transition-colors focus-visible:ring-[3px] dark:bg-white/[0.06] dark:hover:bg-white/10"
        >
          <Search className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="flex-1 truncate text-left max-sm:sr-only">Search docs, blocks, components…</span>
          <kbd className="bg-background text-muted-foreground hidden rounded border px-1.5 font-sans text-[10px] font-medium sm:inline">⌘K</kbd>
        </button>
      )}
      {open && entries ? (
        <React.Suspense fallback={null}>
          <CommandDialog open={open} onOpenChange={setOpen} entries={entries} />
        </React.Suspense>
      ) : null}
    </>
  )
}
