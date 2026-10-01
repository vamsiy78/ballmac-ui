// Ballmac UI: Muse library page. https://ui.ballmac.com/templates/template-muse
"use client"

import * as React from "react"
import { Database, FileCode2, FileText, Search } from "lucide-react"

import { CopyButton } from "@/components/ballmac/copy-button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ballmac/dialog"
import { artifacts, type MuseArtifact } from "@/components/ballmac/templates/muse/muse-data"
import { MuseShell, type MuseHrefs } from "@/components/ballmac/templates/muse/muse-theme"
import { cn } from "@/lib/utils"

type Filter = "All" | MuseArtifact["kind"]
const filters: Filter[] = ["All", "Document", "Code", "Data"]
const icons = { Document: FileText, Code: FileCode2, Data: Database }

type MuseLibraryProps = React.ComponentProps<"div"> & { hrefs?: Partial<MuseHrefs> }

/** The Muse library: everything Muse has written for you, filterable by type, with a preview you can copy from. */
function MuseLibrary({ hrefs, ...props }: MuseLibraryProps) {
  const [filter, setFilter] = React.useState<Filter>("All")
  const [query, setQuery] = React.useState("")
  const [openId, setOpenId] = React.useState<string | null>(null)
  const q = query.trim().toLowerCase()
  const shown = artifacts.filter((a) => (filter === "All" || a.kind === filter) && (!q || a.title.toLowerCase().includes(q)))
  const open = artifacts.find((a) => a.id === openId)

  return (
    <MuseShell page="library" title="Library" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
        <p className="text-muted-foreground max-w-xl text-pretty">Documents, code and data Muse has made for you, kept together so you can find them again.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Filter by type" className="flex gap-1.5">
            {filters.map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cn("focus-visible:ring-ring/50 h-9 rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]", filter === f ? "bg-primary text-primary-foreground border-transparent" : "bg-card hover:bg-accent")}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative ml-auto w-full sm:w-64">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" aria-hidden="true" />
            <input type="search" aria-label="Search the library" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="bg-card focus-visible:ring-ring/50 placeholder:text-muted-foreground h-9 w-full rounded-full border pr-4 pl-10 text-sm outline-none focus-visible:ring-[3px]" />
          </div>
        </div>
        <p className="sr-only" role="status">{shown.length} items</p>

        {shown.length === 0 ? (
          <div className="bg-card text-muted-foreground mt-8 rounded-3xl border border-dashed px-6 py-20 text-center text-sm">Nothing here yet. Ask Muse to write something and it will land in your library.</div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((a) => {
              const Icon = icons[a.kind]
              return (
                <li key={a.id}>
                  <button type="button" onClick={() => setOpenId(a.id)} className="bg-card hover:border-foreground/25 focus-visible:ring-ring/50 group flex h-full w-full flex-col overflow-hidden rounded-3xl border text-left outline-none transition-all hover:shadow-md focus-visible:ring-[3px]">
                    <div aria-hidden="true" className={cn("bg-surface h-36 overflow-hidden border-b p-5 text-[11px] leading-5", a.kind === "Code" || a.kind === "Data" ? "font-mono" : "[font-family:var(--muse-serif),ui-serif,Georgia,serif] text-[13px]")}>
                      {a.lines.map((l, i) => <p key={i} className={cn("truncate", i === 0 && a.kind === "Document" ? "text-foreground font-semibold" : "text-muted-foreground")}>{l}</p>)}
                    </div>
                    <div className="flex flex-1 items-center gap-3 p-4">
                      <span className="bg-chart-1/12 text-chart-1 flex size-9 shrink-0 items-center justify-center rounded-xl"><Icon className="size-4" aria-hidden="true" /></span>
                      <span className="min-w-0"><span className="block truncate text-sm font-medium">{a.title}</span><span className="text-muted-foreground block text-xs">{a.kind} · {a.updated}</span></span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </main>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-2xl">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.title}</DialogTitle>
                <DialogDescription>{open.kind} · {open.filename} · updated {open.updated.toLowerCase()}</DialogDescription>
              </DialogHeader>
              <div className="relative">
                <pre tabIndex={0} aria-label={`${open.title} contents`} className={cn("bg-surface focus-visible:ring-ring/50 max-h-[50dvh] overflow-auto rounded-2xl border p-5 text-sm leading-7 whitespace-pre-wrap outline-none focus-visible:ring-[3px]", open.kind === "Document" ? "[font-family:var(--muse-serif),ui-serif,Georgia,serif] text-[15px]" : "font-mono text-[13px] leading-6")}>{open.body}</pre>
                <CopyButton value={open.body} ariaLabel="Copy contents" className="absolute top-2 right-2" />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MuseShell>
  )
}

export { MuseLibrary, type MuseLibraryProps }
