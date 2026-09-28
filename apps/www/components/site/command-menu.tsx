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
        className="text-muted-foreground hover:text-foreground bg-card inline-flex h-8 w-full max-w-60 items-center gap-2 rounded-lg border px-2.5 text-[13px] transition-colors"
      >
        <Search className="size-3.5" />
        <span className="flex-1 text-left">Search components…</span>
        <kbd className="bg-muted rounded px-1.5 font-mono text-[10px]">⌘K</kbd>
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
            <Command.Group key={g} heading={g} className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:uppercase">
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
