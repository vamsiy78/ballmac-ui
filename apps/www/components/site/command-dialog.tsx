"use client"

import { Command } from "cmdk"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"

import type { MenuEntry } from "@/lib/search-index"

/** The search dialog itself. Loaded the first time the box opens, with the entries it fetched. */
export default function CommandDialog({ open, onOpenChange, entries }: { open: boolean; onOpenChange: (open: boolean) => void; entries: MenuEntry[] }) {
  const router = useRouter()
  // Docs first, then the changelog, then what you can install.
  const rank = (g: string) => (g.startsWith("Docs") ? 0 : g === "Changelog" ? 1 : 2)
  const groups = [...new Set(entries.map((e) => e.group))].sort((a, b) => rank(a) - rank(b))
  return (
      <Command.Dialog
        open={open}
        onOpenChange={onOpenChange}
        label="Search Ballmac UI"
        overlayClassName="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
        contentClassName="fixed top-[18vh] left-1/2 z-50 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="text-muted-foreground size-4" />
          <Command.Input aria-label="Search" placeholder="Search docs, components, blocks…" className="h-12 w-full bg-transparent text-sm outline-none" />
        </div>
        <Command.List className="max-h-[360px] overflow-y-auto p-2">
          <Command.Empty className="text-muted-foreground px-3 py-8 text-center text-sm">No results.</Command.Empty>
          {groups.map((g) => (
            <Command.Group key={g} heading={g} className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
              {entries
                .filter((e) => e.group === g)
                .map((e) => (
                  <Command.Item
                    key={e.href}
                    value={`${e.title} ${e.name} ${e.description}`}
                    onSelect={() => {
                      onOpenChange(false)
                      router.push(e.href)
                    }}
                    className="data-[selected=true]:bg-accent flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm font-medium">{e.title}</span>
                    <span className="text-muted-foreground line-clamp-1 text-xs">{e.description}</span>
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
