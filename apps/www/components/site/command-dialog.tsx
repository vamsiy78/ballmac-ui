"use client"

import { Command } from "cmdk"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"

import { MatchHighlight } from "@/components/ballmac/match-highlight"
import { quickLinks, rank } from "@/lib/search-rank"
import type { MenuEntry } from "@/lib/search-index"

/**
 * The search dialog itself. Loaded the first time the box opens, with the entries it fetched.
 * Before you type it lists where people usually go; once you type it shows the best matches (docs first when they are equally good) with your words marked.
 */
export default function CommandDialog({ open, onOpenChange, entries }: { open: boolean; onOpenChange: (open: boolean) => void; entries: MenuEntry[] }) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const typed = query.trim().length > 0
  const results = React.useMemo(() => (typed ? rank(entries, query) : quickLinks(entries)), [entries, query, typed])
  const groups = [...new Set(results.map((e) => e.group))]
  const pick = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }
  return (
    <Command.Dialog
      shouldFilter={false}
      open={open}
      onOpenChange={onOpenChange}
      label="Search Ballmac UI"
      overlayClassName="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
      contentClassName="fixed top-[18vh] left-1/2 z-50 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl"
    >
      <div className="flex items-center gap-2 border-b px-4">
        <Search className="text-muted-foreground size-4" aria-hidden="true" />
        <Command.Input value={query} onValueChange={setQuery} aria-label="Search" placeholder="Search docs, components, blocks…" className="h-12 w-full bg-transparent text-sm outline-none" />
      </div>
      <Command.List className="max-h-[min(420px,60vh)] overflow-y-auto p-2">
        {typed && results.length === 0 && (
          <div className="text-muted-foreground px-3 py-8 text-center text-sm" role="status">
            Nothing matches “{query.trim()}”. Try fewer words, or browse the <button type="button" onClick={() => pick("/components")} className="text-foreground underline underline-offset-4">components</button> and{" "}
            <button type="button" onClick={() => pick("/blocks")} className="text-foreground underline underline-offset-4">blocks</button>.
          </div>
        )}
        {typed && results.length > 0 && (
          <p role="status" className="sr-only">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
        )}
        {groups.map((g) => (
          <Command.Group key={g} heading={typed ? g : "Jump to"} className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
            {results
              .filter((e) => e.group === g)
              .map((e) => (
                <Command.Item
                  key={e.href}
                  value={e.href}
                  onSelect={() => pick(e.href)}
                  className="data-[selected=true]:bg-accent flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2"
                >
                  <span className="text-sm font-medium">
                    <MatchHighlight text={e.title} query={query} />
                  </span>
                  <span className="text-muted-foreground line-clamp-2 text-xs">
                    {e.description ? <MatchHighlight text={e.description} query={query} /> : e.context}
                  </span>
                </Command.Item>
              ))}
          </Command.Group>
        ))}
      </Command.List>
      <div className="text-muted-foreground flex items-center gap-4 border-t px-4 py-2 text-xs max-sm:hidden" aria-hidden="true">
        <span className="flex items-center gap-1.5">
          <kbd className="bg-muted rounded border px-1.5 font-sans">↑</kbd>
          <kbd className="bg-muted rounded border px-1.5 font-sans">↓</kbd> to move
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="bg-muted rounded border px-1.5 font-sans">↵</kbd> to open
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="bg-muted rounded border px-1.5 font-sans">esc</kbd> to close
        </span>
      </div>
    </Command.Dialog>
  )
}
