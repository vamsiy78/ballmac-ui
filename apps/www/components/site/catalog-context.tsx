"use client"

import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Columns3, Copy, Eye, LayoutGrid, List, X } from "lucide-react"
import Link from "next/link"
import { Dialog as DialogPrimitive } from "radix-ui"
import * as React from "react"

import { InstallTabs } from "@/components/site/install-tabs"
import { usePackageManager, type PM } from "@/components/site/use-package-manager"
import { cn } from "@/lib/utils"

export type CatalogEntry = {
  name: string
  title: string
  description: string
  category: string
  categoryLabel: string
  isNew: boolean
  commands: Record<PM, string>
}

type View = "gallery" | "list" | "index"
const VIEW_KEY = "bm-catalog-view"

type CatalogState = {
  view: View
  setView: (view: View) => void
  open: (name: string) => void
  entry: (name: string) => CatalogEntry | undefined
}

// The remembered view, read like the package-manager preference: server HTML is the gallery,
// the client switches to the saved choice without a state-in-effect round trip.
const viewListeners = new Set<() => void>()
let memoryView: View | null = null
function subscribeView(cb: () => void) {
  viewListeners.add(cb)
  return () => viewListeners.delete(cb)
}
function readView(): View {
  if (memoryView) return memoryView
  try {
    const saved = localStorage.getItem(VIEW_KEY)
    return saved === "list" || saved === "index" ? saved : "gallery"
  } catch {
    return "gallery"
  }
}

const CatalogContext = React.createContext<CatalogState | null>(null)

function useCatalog() {
  const ctx = React.useContext(CatalogContext)
  if (!ctx) throw new Error("Catalog components must be inside <CatalogProvider>")
  return ctx
}

/** Visible items in page order, so Quick Look's previous/next follow the current search. */
function visibleNames() {
  return [...document.querySelectorAll<HTMLElement>("[data-ql][data-kind=card]")]
    .filter((el) => !el.hidden && !el.closest("[data-category]")?.hasAttribute("hidden"))
    .map((el) => el.dataset.ql!)
}

/**
 * Holds the catalog's view (gallery or list, remembered per visitor) and Quick Look: a live,
 * interactive preview of any component in a panel over the page, opened from a card's button or
 * with Space on a focused card, stepping through items with the arrow keys.
 */
export function CatalogProvider({
  entries,
  previews,
  children,
}: {
  entries: CatalogEntry[]
  previews: Record<string, React.ReactNode>
  children: React.ReactNode
}) {
  const view = React.useSyncExternalStore(subscribeView, readView, () => "gallery" as View)
  const [current, setCurrent] = React.useState<string | null>(null)
  const byName = React.useMemo(() => new Map(entries.map((e) => [e.name, e])), [entries])

  const setView = React.useCallback((next: View) => {
    try {
      localStorage.setItem(VIEW_KEY, next)
    } catch {
      // Storage unavailable: nothing to remember.
    }
    memoryView = next
    viewListeners.forEach((l) => l())
  }, [])

  // Space on a focused card opens Quick Look, like Finder.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== " " || e.repeat || current) return
      const card = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>("[data-ql]")
      if (!card || (document.activeElement as HTMLElement).tagName === "INPUT") return
      e.preventDefault()
      setCurrent(card.dataset.ql!)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [current])

  const state = React.useMemo<CatalogState>(() => ({ view, setView, open: setCurrent, entry: (n) => byName.get(n) }), [view, setView, byName])

  const step = (dir: 1 | -1) => {
    if (!current) return
    const names = visibleNames()
    const at = names.indexOf(current)
    if (at < 0 || names.length < 2) return
    setCurrent(names[(at + dir + names.length) % names.length])
  }
  const item = current ? byName.get(current) : undefined

  return (
    <CatalogContext.Provider value={state}>
      <div data-view={view} className="group/catalog">
        {children}
      </div>
      <DialogPrimitive.Root open={!!item} onOpenChange={(o) => !o && setCurrent(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px]" />
          <DialogPrimitive.Content
            className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-[0.97] data-[state=closed]:zoom-out-[0.97] fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[min(1040px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border shadow-2xl outline-none duration-200"
            onKeyDown={(e) => {
              // Arrows step through items, unless the preview itself wants them (a dock, tabs, a slider).
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
              if ((e.target as HTMLElement).closest("[data-ql-stage]")) return
              e.preventDefault()
              step(e.key === "ArrowRight" ? 1 : -1)
            }}
          >
            {item && (
              <>
                <div className="flex items-center gap-3 border-b py-3 pr-3 pl-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <DialogPrimitive.Title className="truncate font-semibold tracking-tight">{item.title}</DialogPrimitive.Title>
                      <span className="text-muted-foreground shrink-0 text-xs">{item.categoryLabel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => step(-1)} aria-label="Previous component" title="Previous (←)" className={iconButton}>
                      <ArrowLeft />
                    </button>
                    <button type="button" onClick={() => step(1)} aria-label="Next component" title="Next (→)" className={iconButton}>
                      <ArrowRight />
                    </button>
                    <Link
                      href={`/components/${item.name}`}
                      className="hover:bg-accent focus-visible:ring-ring/50 ml-1 inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]"
                    >
                      Open page <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </Link>
                    <DialogPrimitive.Close aria-label="Close Quick Look" className={iconButton}>
                      <X />
                    </DialogPrimitive.Close>
                  </div>
                </div>
                <div data-ql-stage className="bm-stage flex min-h-[380px] flex-1 items-center justify-center overflow-auto p-6 sm:p-10">
                  {/* Keyed so each item mounts fresh and its intro animation plays. */}
                  <React.Fragment key={item.name}>{previews[item.name]}</React.Fragment>
                </div>
                <div className="grid gap-4 border-t p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center">
                  <DialogPrimitive.Description className="text-muted-foreground text-sm leading-relaxed">{item.description}</DialogPrimitive.Description>
                  <InstallTabs commands={item.commands} />
                </div>
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </CatalogContext.Provider>
  )
}

const iconButton =
  "text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-[3px] [&_svg]:size-4"

/** Opens Quick Look for one item. */
export function QuickLookButton({ name, className, label = true }: { name: string; className?: string; label?: boolean }) {
  const { open, entry } = useCatalog()
  return (
    <button
      type="button"
      onClick={() => open(name)}
      aria-label={`Quick Look: ${entry(name)?.title ?? name}`}
      title="Quick Look (Space)"
      className={cn(
        "bg-background/90 hover:bg-background focus-visible:ring-ring/50 inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs font-medium shadow-sm outline-none backdrop-blur transition-colors focus-visible:ring-[3px] [&_svg]:size-3.5",
        className
      )}
    >
      <Eye aria-hidden="true" />
      {label && "Quick Look"}
    </button>
  )
}

/** Copies the item's install command in the visitor's package manager. */
export function CopyInstallButton({ name, className }: { name: string; className?: string }) {
  const { entry } = useCatalog()
  const [pm] = usePackageManager()
  const [copied, setCopied] = React.useState(false)
  const command = entry(name)?.commands[pm] ?? ""
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(command)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // Clipboard unavailable.
        }
      }}
      aria-label={copied ? "Copied install command" : `Copy install command for ${entry(name)?.title ?? name}`}
      title={command}
      className={cn(
        "bg-background/90 hover:bg-background focus-visible:ring-ring/50 inline-flex size-7 items-center justify-center rounded-md border shadow-sm outline-none backdrop-blur transition-colors focus-visible:ring-[3px] [&_svg]:size-3.5",
        className
      )}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </button>
  )
}

/** Gallery / List / Index switch. */
export function ViewToggle() {
  const { view, setView } = useCatalog()
  const options = [
    { value: "gallery", label: "Gallery", icon: LayoutGrid },
    { value: "list", label: "List", icon: List },
    { value: "index", label: "Index", icon: Columns3 },
  ] as const
  return (
    <div role="radiogroup" aria-label="Catalog view" data-view-toggle className="bg-muted flex shrink-0 gap-0.5 rounded-lg p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={view === o.value}
          aria-label={o.label}
          title={o.label}
          onClick={() => setView(o.value)}
          className={cn(
            "focus-visible:ring-ring/50 inline-flex h-7 w-8 items-center justify-center rounded-md outline-none transition-all focus-visible:ring-[3px] [&_svg]:size-4",
            view === o.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <o.icon aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
