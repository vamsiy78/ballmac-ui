"use client"

import { Command } from "cmdk"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"

export type MenuEntry = { name: string; title: string; description: string; group: string; href: string }

export function CommandMenu({ entries }: { entries: MenuEntry[] }) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])
  const groups = [...new Set(entries.map((e) => e.group))]
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted focus-visible:ring-ring/50 inline-flex h-8 w-8 items-center justify-center gap-2 rounded-lg text-[13px] sm:w-full sm:justify-start sm:px-2.5 outline-none transition-colors focus-visible:ring-[3px] dark:bg-white/[0.06] dark:hover:bg-white/10"
      >
        <Search className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate text-left max-sm:sr-only">Search documentation…</span>
        <kbd className="bg-background text-muted-foreground hidden rounded border px-1.5 font-sans text-[10px] font-medium sm:inline">⌘K</kbd>
      </button>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Search Ballmac UI"
        overlayClassName="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
        contentClassName="fixed top-[18vh] left-1/2 z-50 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="text-muted-foreground size-4" />
          <Command.Input placeholder="Search components, blocks, docs…" className="h-12 w-full bg-transparent text-sm outline-none" />
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
                      setOpen(false)
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
      </Command.Dialog>
    </>
  )
}
