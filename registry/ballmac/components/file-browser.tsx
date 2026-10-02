// Ballmac UI: File Browser. https://ui.ballmac.com/components/file-browser
"use client"

import * as React from "react"
import { Archive, ArrowDown, ArrowUp, ChevronRight, File, FileCode2, FileText, Film, Folder, Image as ImageIcon, LayoutGrid, List, Music, Search, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"
import { useDirection } from "@/lib/ballmac/direction"

type FileEntry = {
  /** Unique id. */
  id: string
  /** File or folder name. */
  name: string
  /** What it is. */
  kind: "folder" | "file"
  /** Size in bytes (files). */
  size?: number
  /** Last change, as an ISO string. Shown in UTC. */
  modified?: string
  /** Who owns it. */
  owner?: string
  /** Contents of a folder. */
  children?: FileEntry[]
}

type SortKey = "name" | "modified" | "size"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatDate(iso?: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

function itemCount(n: number) {
  return `${n} ${n === 1 ? "item" : "items"}`
}

function formatSize(bytes?: number) {
  if (bytes === undefined) return "—"
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB"]
  let v = bytes / 1024
  let u = 0
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024
    u++
  }
  return `${v >= 10 || Number.isInteger(v) ? Math.round(v) : v.toFixed(1)} ${units[u]}`
}

const EXT_ICON: [RegExp, React.ComponentType<{ className?: string }>, string][] = [
  [/\.(png|jpe?g|gif|webp|svg|avif)$/i, ImageIcon, "bg-chart-2/15 text-chart-2"],
  [/\.(mp4|mov|webm|mkv)$/i, Film, "bg-chart-5/15 text-chart-5"],
  [/\.(mp3|wav|flac|m4a)$/i, Music, "bg-chart-4/15 text-chart-4"],
  [/\.(zip|gz|tar|rar|7z)$/i, Archive, "bg-chart-3/15 text-chart-3"],
  [/\.(ts|tsx|js|jsx|json|py|go|rs|css|html|sh)$/i, FileCode2, "bg-chart-1/15 text-chart-1"],
  [/\.(pdf|docx?|txt|md|rtf)$/i, FileText, "bg-destructive/10 text-destructive"],
]

function TypeIcon({ entry, className }: { entry: FileEntry; className?: string }) {
  const hit = entry.kind === "file" ? EXT_ICON.find(([re]) => re.test(entry.name)) : null
  const Glyph = entry.kind === "folder" ? Folder : (hit?.[1] ?? File)
  return (
    <span aria-hidden="true" className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", entry.kind === "folder" ? "bg-chart-1/15 text-chart-1" : (hit?.[2] ?? "bg-muted text-muted-foreground"), className)}>
      <Glyph className="size-4" />
    </span>
  )
}

function sortEntries(list: FileEntry[], key: SortKey, dir: "asc" | "desc") {
  const sign = dir === "asc" ? 1 : -1
  return [...list].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1
    const cmp =
      key === "name" ? a.name.localeCompare(b.name, "en", { numeric: true }) : key === "size" ? (a.size ?? 0) - (b.size ?? 0) : (a.modified ?? "").localeCompare(b.modified ?? "")
    return cmp * sign || a.name.localeCompare(b.name, "en")
  })
}

type FileBrowserProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  /** The top-level entries. Folders can hold more through `children`. */
  entries: FileEntry[]
  /** Name of the top level in the breadcrumb. */
  rootLabel?: string
  /** "list" is a sortable table, "grid" is a card grid. */
  view?: "list" | "grid"
  /** Called when a file is opened (double-click or Enter). */
  onOpenFile?: (file: FileEntry) => void
  /** Adds a Delete button to the selection bar. */
  onDelete?: (ids: string[]) => void
  /** Adds a Download button to the selection bar. */
  onDownload?: (ids: string[]) => void
}

/** A file manager: breadcrumb navigation, search, sortable columns, multi-select with a bulk-action bar, and list or grid views. */
function FileBrowser({ entries, rootLabel, view: viewProp = "list", onOpenFile, onDelete, onDownload, className, ...props }: FileBrowserProps) {
  const dir = useDirection()
  const msg = useMessages()
  rootLabel ??= msg("file-browser.rootLabel", "All files")
  const uid = React.useId()
  const [trail, setTrail] = React.useState<FileEntry[]>([])
  const [view, setView] = React.useState(viewProp)
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" })
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [focusIndex, setFocusIndex] = React.useState(0)
  const rowRefs = React.useRef<(HTMLElement | null)[]>([])
  const allRef = React.useRef<HTMLInputElement>(null)

  const current = trail.length ? (trail[trail.length - 1]!.children ?? []) : entries
  const visible = sortEntries(current.filter((e) => !query || e.name.toLowerCase().includes(query.toLowerCase())), sort.key, sort.dir)
  const allSelected = visible.length > 0 && visible.every((e) => selected.has(e.id))
  const someSelected = visible.some((e) => selected.has(e.id))

  React.useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someSelected && !allSelected
  }, [someSelected, allSelected])

  function enter(entry: FileEntry) {
    if (entry.kind === "folder") {
      setTrail((t) => [...t, entry])
      setSelected(new Set())
      setQuery("")
      setFocusIndex(0)
    } else onOpenFile?.(entry)
  }
  function toggle(id: string, on?: boolean) {
    setSelected((s) => {
      const next = new Set(s)
      if (on ?? !next.has(id)) next.add(id)
      else next.delete(id)
      return next
    })
  }
  function setSortKey(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))
  }
  function move(next: number) {
    const i = Math.min(visible.length - 1, Math.max(0, next))
    setFocusIndex(i)
    rowRefs.current[i]?.focus()
  }
  function onRowKey(event: React.KeyboardEvent, entry: FileEntry, i: number) {
    const cols = view === "grid" ? Math.max(1, Math.floor((event.currentTarget.parentElement?.clientWidth ?? 1) / ((event.currentTarget as HTMLElement).offsetWidth || 1))) : 1
    if (event.key === "ArrowDown") { event.preventDefault(); move(i + cols) }
    else if (event.key === "ArrowUp") { event.preventDefault(); move(i - cols) }
    else if (view === "grid" && event.key === (dir === "rtl" ? "ArrowLeft" : "ArrowRight")) { event.preventDefault(); move(i + 1) }
    else if (view === "grid" && event.key === (dir === "rtl" ? "ArrowRight" : "ArrowLeft")) { event.preventDefault(); move(i - 1) }
    else if (event.key === "Home") { event.preventDefault(); move(0) }
    else if (event.key === "End") { event.preventDefault(); move(visible.length - 1) }
    else if (event.key === " ") { event.preventDefault(); toggle(entry.id) }
    else if (event.key === "Enter") { event.preventDefault(); enter(entry) }
  }

  const count = selected.size

  return (
    <div data-slot="file-browser" className={cn("@container flex w-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground", className)} {...props}>
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2.5">
        <nav aria-label={msg("file-browser.folderPath", "Folder path")} className="min-w-0 flex-1">
          <ol className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
            {[{ id: "root", name: rootLabel } as FileEntry, ...trail].map((crumb, i, all) => (
              <li key={crumb.id} className="flex min-w-0 items-center gap-1">
                {i > 0 && <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground rtl:rotate-180" />}
                <button
                  type="button"
                  aria-current={i === all.length - 1 ? "location" : undefined}
                  onClick={() => { if (i < all.length - 1) { setTrail(trail.slice(0, i)); setSelected(new Set()); setQuery("") } }}
                  className="truncate rounded-md px-1.5 py-0.5 text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=location]:font-semibold aria-[current=location]:text-foreground"
                >
                  {crumb.name}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="relative w-full @md:w-52">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" aria-label={msg("file-browser.searchFiles", "Search files")} placeholder={msg("file-browser.searchFiles", "Search files")} value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 w-full rounded-md border bg-background pe-2 ps-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" />
        </div>
        <div role="group" aria-label={msg("file-browser.view", "View")} className="inline-flex rounded-lg bg-muted p-0.5">
          {([["list", List, "List view"], ["grid", LayoutGrid, "Grid view"]] as const).map(([v, Glyph, label]) => (
            <button key={v} type="button" aria-label={label} aria-pressed={view === v} onClick={() => setView(v)} className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-xs">
              <Glyph aria-hidden="true" className="size-4" />
            </button>
          ))}
        </div>
      </div>

      {count > 0 && (
        <div role="region" aria-label={msg("file-browser.selectionActions", "Selection actions")} className="flex items-center gap-2 border-b bg-accent/50 px-3 py-1.5 text-sm">
          <span className="font-medium tabular-nums">{msg("file-browser.selectedCount", "{count} selected", { count })}</span>
          <span className="ms-auto flex items-center gap-1">
            {onDownload && <button type="button" onClick={() => onDownload([...selected])} className="h-7 rounded-md border bg-background px-2.5 text-[13px] font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">{msg("file-browser.download", "Download")}</button>}
            {onDelete && (
              <button type="button" onClick={() => { onDelete([...selected]); setSelected(new Set()) }} className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2.5 text-[13px] font-medium outline-none hover:bg-destructive/10 focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <Trash2 aria-hidden="true" className="size-3.5" />
                {msg("file-browser.delete", "Delete")}
              </button>
            )}
            <button type="button" onClick={() => setSelected(new Set())} className="h-7 rounded-md px-2.5 text-[13px] text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">{msg("file-browser.clear", "Clear")}</button>
          </span>
        </div>
      )}

      {view === "list" ? (
        <div className="max-h-96 overflow-auto" tabIndex={0} role="region" aria-label={msg("file-browser.files", "Files")}>
          <table className="w-full min-w-[30rem] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-card text-start text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="w-10 py-2 ps-3 font-normal">
                  <input ref={allRef} type="checkbox" aria-label={msg("file-browser.selectAllFiles", "Select all files")} checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(visible.map((e) => e.id)))} className="size-4 rounded accent-primary" />
                </th>
                {([["name", "Name"], ["modified", "Modified"], ["size", "Size"]] as const).map(([key, label]) => (
                  <th key={key} aria-sort={sort.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={cn("py-2 pe-3 font-normal", key === "size" && "text-end", key === "modified" && "hidden @md:table-cell")}>
                    <button type="button" onClick={() => setSortKey(key)} className="inline-flex items-center gap-1 rounded px-1 py-0.5 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
                      {label}
                      {sort.key === key && (sort.dir === "asc" ? <ArrowUp aria-hidden="true" className="size-3" /> : <ArrowDown aria-hidden="true" className="size-3" />)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((e, i) => (
                <tr
                  key={e.id}
                  ref={(el) => { rowRefs.current[i] = el }}
                  tabIndex={focusIndex === i ? 0 : -1}
                  aria-selected={selected.has(e.id)}
                  onFocus={() => setFocusIndex(i)}
                  onKeyDown={(ev) => onRowKey(ev, e, i)}
                  onDoubleClick={() => enter(e)}
                  className={cn("border-b outline-none last:border-0 hover:bg-accent/40 focus-visible:bg-accent/60 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50", selected.has(e.id) && "bg-accent/70")}
                >
                  <td className="py-2 ps-3">
                    <input type="checkbox" aria-label={msg("file-browser.select", "Select {name}", { name: e.name })} checked={selected.has(e.id)} onChange={(ev) => toggle(e.id, ev.target.checked)} className="size-4 rounded accent-primary" />
                  </td>
                  <td className="py-2 pe-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <TypeIcon entry={e} />
                      {e.kind === "folder" ? (
                        <button type="button" onClick={() => enter(e)} className="truncate rounded text-start font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50">{e.name}</button>
                      ) : (
                        <span className="truncate font-medium">{e.name}</span>
                      )}
                    </span>
                  </td>
                  <td className="hidden py-2 pe-3 text-muted-foreground @md:table-cell">{formatDate(e.modified)}</td>
                  <td className="py-2 pe-3 text-end text-muted-foreground tabular-nums">{e.kind === "folder" ? itemCount(e.children?.length ?? 0) : formatSize(e.size)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div role="region" aria-label={msg("file-browser.files", "Files")} tabIndex={0} className="max-h-96 overflow-auto p-3">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2.5">
            {visible.map((e, i) => (
              <div
                key={e.id}
                ref={(el) => { rowRefs.current[i] = el }}
                role="button"
                tabIndex={focusIndex === i ? 0 : -1}
                aria-pressed={selected.has(e.id)}
                aria-label={msg("file-browser.rowLabel", "{name}, {detail}", { name: e.name, detail: e.kind === "folder" ? msg("file-browser.folder", "folder") : formatSize(e.size) })}
                onFocus={() => setFocusIndex(i)}
                onKeyDown={(ev) => onRowKey(ev, e, i)}
                onClick={() => toggle(e.id)}
                onDoubleClick={() => enter(e)}
                className={cn("flex flex-col gap-2 rounded-xl border p-3 outline-none hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50", selected.has(e.id) && "border-primary bg-accent/60")}
              >
                <TypeIcon entry={e} className="size-10 rounded-xl [&_svg]:size-5" />
                <span className="truncate text-sm font-medium" aria-hidden="true">{e.name}</span>
                <span className="text-xs text-muted-foreground" aria-hidden="true">{e.kind === "folder" ? itemCount(e.children?.length ?? 0) : formatSize(e.size)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {visible.length === 0 && (
        <p className="px-4 py-12 text-center text-sm text-muted-foreground">{query ? `Nothing matches “${query}”.` : "This folder is empty."}</p>
      )}
      <p id={`${uid}-status`} role="status" className="border-t px-3 py-1.5 text-xs text-muted-foreground tabular-nums">
        {visible.length} {visible.length === 1 ? "item" : "items"}
        {count ? `, ${count} selected` : ""}
      </p>
    </div>
  )
}

export { FileBrowser, formatSize, type FileBrowserProps, type FileEntry }
