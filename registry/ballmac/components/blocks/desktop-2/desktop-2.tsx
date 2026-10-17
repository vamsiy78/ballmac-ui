// Ballmac UI: Desktop 2. https://ui.ballmac.com/blocks/desktop-2
"use client"

import * as React from "react"
import { Check, ClipboardList, Code2, Link2, Pin, Power, Search, Settings, Trash2, Type, Wifi } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Kbd } from "@/components/ballmac/kbd"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Switch } from "@/components/ballmac/switch"
import { useFeel, type FeelId } from "@/lib/ballmac/feel"
import { cn } from "@/lib/utils"

type Desktop2Item = {
  id: string
  /** What was copied, as text. */
  text: string
  kind?: "text" | "link" | "code" | "color"
  /** The app it was copied from. */
  source?: string
  /** When, already written for people ("2 min ago"). */
  time?: string
  pinned?: boolean
}

type Desktop2Props = Omit<React.ComponentProps<"div">, "children"> &
  StateProps & {
    /** Which platform the panel handles like. Defaults to the page's feel. */
    feel?: FeelId
    /** Draw the menu bar (macOS) or taskbar (Windows) the panel opens from. Turn off inside the real tray window. */
    frame?: boolean
    /** The app name, used in the header and the Quit item. */
    appName?: string
    /** The clipboard history, newest first. Pinned items are listed first. */
    items?: Desktop2Item[]
    /** Whether recording is paused (controlled). */
    paused?: boolean
    /** Called when the pause switch changes. */
    onPausedChange?: (paused: boolean) => void
    /** Called when an item is chosen with a click or Enter. Defaults to writing the text to the clipboard. */
    onCopy?: (item: Desktop2Item) => void | Promise<void>
    /** Called when an item's pin is toggled. Without it the panel keeps pins itself. */
    onTogglePin?: (item: Desktop2Item) => void
    /** Called by "Clear history". */
    onClear?: () => void
    /** Called by the Preferences item. */
    onOpenPreferences?: () => void
    /** Called by the Quit item. */
    onQuit?: () => void
    /** A fixed clock for the menu bar, as text. */
    clock?: string
  }

const sample: Desktop2Item[] = [
  { id: "1", text: "https://acme.com/changelog/2-4", kind: "link", source: "Safari", time: "Just now" },
  { id: "2", text: "Ship the release notes before the 4 pm call.", kind: "text", source: "Notes", time: "2 min ago", pinned: true },
  { id: "3", text: "pnpm tauri build --target universal-apple-darwin", kind: "code", source: "Terminal", time: "12 min ago" },
  { id: "4", text: "oklch(0.62 0.19 259)", kind: "color", source: "Figma", time: "25 min ago" },
  { id: "5", text: "Invoice 2026-118 is attached; payment is due on the 30th.", kind: "text", source: "Mail", time: "1 hr ago" },
  { id: "6", text: "ssh deploy@build-01.internal", kind: "code", source: "Terminal", time: "Yesterday" },
]

const kindIcon = { text: Type, link: Link2, code: Code2 } as const

function KindIcon({ item, className }: { item: Desktop2Item; className?: string }) {
  const kind = item.kind ?? "text"
  // the swatch shows the copied value itself, so it is data rather than a design colour
  if (kind === "color")
    return <span aria-hidden="true" className="size-4 shrink-0 rounded-[5px] border border-black/10" style={{ background: item.text }} />
  const Icon = kindIcon[kind]
  return <Icon aria-hidden="true" className={cn("text-muted-foreground size-4 shrink-0", className)} />
}

function PanelSkeleton() {
  return (
    <div className="grid gap-1 p-2" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2">
          <Skeleton className="size-4 rounded-[5px]" />
          <div className="grid flex-1 gap-1.5">
            <Skeleton className="h-3.5" style={{ width: `${88 - i * 9}%` }} />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** The panel itself: header with the pause switch, search, the history as a listbox, and the footer menu. */
function Panel({
  feel,
  appName,
  items: itemsProp,
  paused: pausedProp,
  onPausedChange,
  onCopy,
  onTogglePin,
  onClear,
  onOpenPreferences,
  onQuit,
  state,
  onRetry,
  emptyState,
  errorState,
}: Required<Pick<Desktop2Props, "feel" | "appName">> & Omit<Desktop2Props, "feel" | "appName" | "frame" | "clock">) {
  const mac = feel === "macos" || feel === "ios"
  const id = React.useId()
  const [localItems, setLocalItems] = React.useState(itemsProp ?? sample)
  React.useEffect(() => setLocalItems(itemsProp ?? sample), [itemsProp])
  const [localPaused, setLocalPaused] = React.useState(false)
  const paused = pausedProp ?? localPaused
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const [copied, setCopied] = React.useState<string | null>(null)

  const q = query.trim().toLowerCase()
  const visible = localItems
    .filter((i) => !q || i.text.toLowerCase().includes(q) || i.source?.toLowerCase().includes(q))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
  const current = visible[Math.min(active, visible.length - 1)]
  React.useEffect(() => setActive(0), [q])
  // keep the selected item in view while the arrow keys move through a long history; only the list scrolls, never the page
  const listRef = React.useRef<HTMLUListElement>(null)
  React.useEffect(() => {
    const list = listRef.current
    const el = current && list?.querySelector<HTMLElement>(`[id="${id}-${current.id}"]`)
    if (!list || !el) return
    if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop - 6
    else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight + 6
  }, [current, id])
  React.useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(null), 1600)
    return () => clearTimeout(t)
  }, [copied])

  async function copy(item: Desktop2Item) {
    try {
      if (onCopy) await onCopy(item)
      else await navigator.clipboard?.writeText(item.text)
      setCopied(item.id)
    } catch {
      setCopied(null)
    }
  }
  function togglePin(item: Desktop2Item) {
    if (onTogglePin) onTogglePin(item)
    else setLocalItems((list) => list.map((i) => (i.id === item.id ? { ...i, pinned: !i.pinned } : i)))
  }

  const ready = state === "ready"
  const modKey = mac ? "⌘" : "Ctrl+"
  const footerItem =
    "flex h-[var(--bm-menu-item-h,1.75rem)] w-full items-center gap-2 rounded-[var(--bm-menu-item-radius,0.375rem)] px-2 text-start text-[13px] outline-none hover:bg-foreground/[0.06] focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:text-muted-foreground"

  return (
    <div
      data-slot="desktop-2-panel"
      className={cn(
        "bg-popover/[var(--bm-material-alpha,100%)] text-popover-foreground flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden border backdrop-blur-[var(--bm-material-blur,0px)]",
        "shadow-[var(--bm-shadow-popover,0_12px_36px_-10px_rgb(0_0_0/0.25))]",
        mac ? "rounded-xl" : "rounded-lg"
      )}
    >
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span aria-hidden="true" className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md [&_svg]:size-3.5">
          <ClipboardList />
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">{appName}</p>
        <label htmlFor={`${id}-pause`} className="text-muted-foreground text-xs">
          {paused ? "Paused" : "Recording"}
        </label>
        <Switch
          id={`${id}-pause`}
          size="sm"
          checked={!paused}
          onCheckedChange={(on) => {
            setLocalPaused(!on)
            onPausedChange?.(!on)
          }}
          aria-label="Record copied items"
        />
      </div>

      <div className="px-3 pb-2">
        <div className="bg-foreground/[0.05] focus-within:ring-ring/50 flex h-8 items-center gap-2 rounded-md px-2 focus-within:ring-[3px]">
          <Search aria-hidden="true" className="text-muted-foreground size-3.5 shrink-0" />
          <input
            role="combobox"
            aria-label="Search clipboard history"
            aria-expanded={ready && visible.length > 0}
            aria-controls={`${id}-list`}
            aria-activedescendant={ready && current ? `${id}-${current.id}` : undefined}
            aria-autocomplete="list"
            aria-describedby={`${id}-keys`}
            disabled={!ready}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (!visible.length) return
              if (e.key === "ArrowDown") {
                e.preventDefault()
                setActive((a) => (a + 1) % visible.length)
              } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setActive((a) => (a - 1 + visible.length) % visible.length)
              } else if (e.key === "Enter" && current) {
                e.preventDefault()
                copy(current)
              } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p" && current) {
                e.preventDefault()
                togglePin(current)
              }
            }}
            placeholder="Search"
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-[13px] outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <StateView
        state={state ?? "ready"}
        onRetry={onRetry}
        bare
        label="Loading clipboard history"
        loading={<PanelSkeleton />}
        empty={{ title: emptyState?.title ?? "Nothing copied yet", description: emptyState?.description ?? `Copy text, a link or a color in any app and ${appName} keeps it here.`, icon: emptyState?.icon ?? <ClipboardList />, action: emptyState?.action }}
        error={{ title: errorState?.title ?? "History is unavailable", description: errorState?.description ?? "The history file could not be read.", ...errorState }}
        className="min-h-[15rem] border-t"
      >
        {visible.length ? (
          <ul ref={listRef} id={`${id}-list`} role="listbox" aria-label="Clipboard history" className="relative max-h-[21rem] overflow-y-auto p-1.5">
            {visible.map((item, i) => {
              const selected = current?.id === item.id
              return (
                <li
                  key={item.id}
                  id={`${id}-${item.id}`}
                  role="option"
                  aria-selected={selected}
                  onMouseMove={() => setActive(i)}
                  onClick={() => copy(item)}
                  className={cn(
                    "group/item flex cursor-default items-center gap-3 rounded-[var(--bm-menu-item-radius,0.375rem)] px-2 py-1.5",
                    selected && (mac ? "bg-primary text-primary-foreground" : "bg-foreground/[0.07]")
                  )}
                >
                  <KindIcon item={item} className={cn(selected && mac && "text-primary-foreground/80")} />
                  <div className="min-w-0 flex-1">
                    <p dir={item.kind === "code" || item.kind === "link" ? "ltr" : undefined} className={cn("truncate text-[13px]", item.kind === "code" && "font-mono text-xs")}>
                      {item.text}
                    </p>
                    <p className={cn("truncate text-[11px]", selected && mac ? "text-primary-foreground/75" : "text-muted-foreground")}>
                      {[item.source, item.time].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {copied === item.id ? (
                    <Check aria-hidden="true" className="size-4 shrink-0" />
                  ) : (
                    // a pointer shortcut only: an option cannot hold a button, so keyboard users pin with ⌘P or Ctrl+P
                    <span
                      aria-hidden="true"
                      title={item.pinned ? "Unpin" : "Pin"}
                      onClick={(e) => {
                        e.stopPropagation()
                        togglePin(item)
                      }}
                      className={cn("rounded p-0.5 opacity-0 group-hover/item:opacity-100 [&_svg]:size-3.5", (item.pinned || selected) && "opacity-100")}
                    >
                      <Pin className={cn(item.pinned && "fill-current")} />
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground px-4 py-10 text-center text-sm">No matches for “{query}”.</p>
        )}
      </StateView>
      <p id={`${id}-keys`} className="sr-only">
        {`Up and down arrows choose an item, Enter copies it, ${mac ? "Command" : "Control"} P pins it.`}
      </p>
      <p aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </p>

      <div className="border-t p-1.5">
        {mac ? (
          <div className="grid">
            <button type="button" className={footerItem} onClick={onClear} disabled={!ready}>
              <Trash2 aria-hidden="true" />
              <span className="flex-1">Clear history</span>
            </button>
            <button type="button" className={footerItem} onClick={onOpenPreferences}>
              <Settings aria-hidden="true" />
              <span className="flex-1">Preferences…</span>
              <Kbd dir="ltr" className="bg-transparent">{modKey},</Kbd>
            </button>
            <button type="button" className={footerItem} onClick={onQuit}>
              <Power aria-hidden="true" />
              <span className="flex-1">Quit {appName}</span>
              <Kbd dir="ltr" className="bg-transparent">{modKey}Q</Kbd>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onClear} disabled={!ready}>
              <Trash2 aria-hidden="true" />
              Clear
            </Button>
            <span className="flex-1" />
            <Button variant="ghost" size="icon-sm" aria-label="Settings" onClick={onOpenPreferences}>
              <Settings aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label={`Quit ${appName}`} onClick={onQuit}>
              <Power aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * A menu bar app (macOS) or tray flyout (Windows): a clipboard history with search, pins and a pause switch. With frame on it
 * is drawn opening from a menu bar slice on macOS and above a taskbar on Windows, so it reads as a status-item app at a glance.
 */
function Desktop2({
  feel: feelProp,
  frame = true,
  appName = "Clips",
  clock = "Fri 9:41",
  state = "ready",
  className,
  ...props
}: Desktop2Props) {
  const page = useFeel().feel
  const feel = feelProp ?? page
  const win = feel === "windows"
  const {
    items,
    paused,
    onPausedChange,
    onCopy,
    onTogglePin,
    onClear,
    onOpenPreferences,
    onQuit,
    onRetry,
    emptyState,
    errorState,
    ...rest
  } = props
  const panel = (
    <Panel
      feel={feel}
      appName={appName}
      state={state}
      {...{ items, paused, onPausedChange, onCopy, onTogglePin, onClear, onOpenPreferences, onQuit, onRetry, emptyState, errorState }}
    />
  )
  if (!frame)
    return (
      <div data-slot="desktop-2" data-state={state} data-feel={feelProp} className={className} {...frameProps(rest)}>
        {panel}
      </div>
    )

  const statusIcon = (
    <span aria-hidden="true" className={cn("flex items-center justify-center rounded [&_svg]:size-3.5", win ? "bg-foreground/10 size-7" : "bg-foreground/15 h-5 w-7")}>
      <ClipboardList />
    </span>
  )
  return (
    <div
      data-slot="desktop-2"
      data-state={state}
      data-feel={feel}
      className={cn("bg-muted/60 relative flex h-[36rem] w-full max-w-2xl flex-col overflow-hidden rounded-xl border", win ? "justify-end" : "justify-start", className)}
      {...frameProps(rest)}
    >
      {win ? (
        <>
          <div className="flex justify-end px-3 pb-3">{panel}</div>
          <div aria-hidden="true" className="bg-background/80 flex h-11 shrink-0 items-center justify-end gap-2 border-t px-3 backdrop-blur">
            {statusIcon}
            <Wifi className="text-muted-foreground size-3.5" />
            <span dir="ltr" className="text-muted-foreground text-[11px] tabular-nums">{clock}</span>
          </div>
        </>
      ) : (
        <>
          <div aria-hidden="true" className="bg-background/70 flex h-6 shrink-0 items-center justify-end gap-3 px-3 text-[12px] backdrop-blur">
            {statusIcon}
            <Wifi className="size-3.5" />
            <span dir="ltr" className="tabular-nums">{clock}</span>
          </div>
          <div className="flex justify-end px-3 pt-1.5">{panel}</div>
        </>
      )}
    </div>
  )
}

export { Desktop2, type Desktop2Props, type Desktop2Item }
