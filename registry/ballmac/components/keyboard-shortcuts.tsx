// Ballmac UI: Keyboard Shortcuts. https://ui.ballmac.com/components/keyboard-shortcuts
"use client"

import * as React from "react"
import { Keyboard, Search } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ballmac/dialog"
import { Kbd, KbdGroup } from "@/components/ballmac/kbd"
import { cn } from "@/lib/utils"

type ShortcutPlatform = "mac" | "other"

type Shortcut = {
  /** What the shortcut does. */
  label: string
  /**
   * The keys. Use "Mod" for Command on Mac and Ctrl elsewhere, plus "Alt", "Shift", "Enter", "Esc",
   * "Up", "Down", "Left", "Right", "Backspace", "Tab" and "Space". Anything else is shown as typed.
   */
  keys: string[]
  /** Keys are pressed one after another ("G" then "I") instead of together. */
  sequence?: boolean
  /** A second line of detail. */
  description?: string
}

type ShortcutGroup = {
  /** Group heading, such as "Navigation". */
  title: string
  shortcuts: Shortcut[]
}

const MAC: Record<string, string> = { Mod: "⌘", Alt: "⌥", Shift: "⇧", Ctrl: "⌃", Enter: "↵", Esc: "Esc", Up: "↑", Down: "↓", Left: "←", Right: "→", Backspace: "⌫", Tab: "⇥", Space: "Space" }
const OTHER: Record<string, string> = { ...MAC, Mod: "Ctrl", Alt: "Alt", Shift: "Shift", Ctrl: "Ctrl", Enter: "Enter", Backspace: "Backspace", Tab: "Tab" }
const SPOKEN: Record<string, string> = { "⌘": "Command", "⌥": "Option", "⇧": "Shift", "⌃": "Control", "↵": "Enter", "↑": "Up arrow", "↓": "Down arrow", "←": "Left arrow", "→": "Right arrow", "⌫": "Backspace", "⇥": "Tab" }

const noop = () => () => {}

function usePlatform(platform: ShortcutPlatform | "auto"): ShortcutPlatform {
  // The server cannot know the platform, so it renders the non-Mac keys and corrects after hydration.
  const detected = React.useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "mac" : "other"),
    () => "other" as ShortcutPlatform
  )
  return platform === "auto" ? detected : platform
}

function label(key: string, platform: ShortcutPlatform) {
  return (platform === "mac" ? MAC : OTHER)[key] ?? (key.length === 1 ? key.toUpperCase() : key)
}

function ShortcutKeys({ shortcut, platform }: { shortcut: Shortcut; platform: ShortcutPlatform }) {
  const shown = shortcut.keys.map((k) => label(k, platform))
  const spoken = shown.map((k) => SPOKEN[k] ?? k).join(shortcut.sequence ? " then " : " plus ")
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <span className="sr-only">{spoken}</span>
      <span aria-hidden="true" className="flex items-center gap-1.5">
        {shortcut.sequence ? (
          shown.map((k, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-[11px] text-muted-foreground">then</span>}
              <Kbd>{k}</Kbd>
            </React.Fragment>
          ))
        ) : (
          <KbdGroup>
            {shown.map((k, i) => (
              <Kbd key={i}>{k}</Kbd>
            ))}
          </KbdGroup>
        )}
      </span>
    </span>
  )
}

type KeyboardShortcutsProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Shortcuts, grouped. */
  groups: ShortcutGroup[]
  /** Show a search box that filters by action or key. */
  searchable?: boolean
  /** Which key labels to draw. "auto" picks Mac or other after hydration. */
  platform?: ShortcutPlatform | "auto"
  /** Placeholder of the search box. */
  searchPlaceholder?: string
  /** Number of columns on wide containers. */
  columns?: 1 | 2
}

function KeyboardShortcuts({
  groups,
  searchable = true,
  platform: platformProp = "auto",
  searchPlaceholder = "Search shortcuts",
  columns = 2,
  className,
  ...props
}: KeyboardShortcutsProps) {
  const platform = usePlatform(platformProp)
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const filtered = groups
    .map((g) => ({
      ...g,
      shortcuts: g.shortcuts.filter(
        (s) =>
          !q ||
          s.label.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.keys.some((k) => label(k, platform).toLowerCase().includes(q) || k.toLowerCase().includes(q))
      ),
    }))
    .filter((g) => g.shortcuts.length > 0)
  const count = filtered.reduce((n, g) => n + g.shortcuts.length, 0)

  return (
    <div data-slot="keyboard-shortcuts" className={cn("@container w-full", className)} {...props}>
      {searchable && (
        <div className="relative mb-4">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-lg border bg-background pr-3 pl-9 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <span className="sr-only" role="status" aria-live="polite">
            {q ? `${count} ${count === 1 ? "shortcut" : "shortcuts"} found` : ""}
          </span>
        </div>
      )}
      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No shortcut matches “{query}”.
        </p>
      ) : (
        <div className={cn("grid gap-x-10 gap-y-6", columns === 2 && "@xl:grid-cols-2")}>
          {filtered.map((group) => (
            <section key={group.title} aria-label={group.title} className="min-w-0">
              <h3 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.title}</h3>
              <ul className="divide-y">
                {group.shortcuts.map((s) => (
                  <li key={s.label} className="flex min-h-10 items-center justify-between gap-4 py-1.5">
                    <span className="min-w-0">
                      <span className="block text-sm text-foreground">{s.label}</span>
                      {s.description && <span className="block text-xs text-muted-foreground">{s.description}</span>}
                    </span>
                    <ShortcutKeys shortcut={s} platform={platform} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

type KeyboardShortcutsDialogProps = Omit<KeyboardShortcutsProps, "className"> & {
  /** Controlled open state. */
  open?: boolean
  /** Initial open state. */
  defaultOpen?: boolean
  /** Called when the dialog opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Key that opens the dialog from anywhere outside a text field. Set to `null` to turn it off. */
  hotkey?: string | null
  /** Dialog heading. */
  title?: string
  /** Line under the heading. */
  description?: string
  /** Classes for the dialog panel. */
  className?: string
}

/** The cheat sheet in a dialog, opened by pressing "?" (or another `hotkey`) anywhere on the page. */
function KeyboardShortcutsDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  hotkey = "?",
  title = "Keyboard shortcuts",
  description = "Work faster without leaving the keyboard.",
  className,
  ...props
}: KeyboardShortcutsDialogProps) {
  const [internal, setInternal] = React.useState(defaultOpen)
  const open = openProp ?? internal
  const onOpenChangeRef = React.useRef(onOpenChange)
  React.useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  })
  const setOpen = React.useCallback((next: boolean) => {
    setInternal(next)
    onOpenChangeRef.current?.(next)
  }, [])

  React.useEffect(() => {
    if (!hotkey) return
    function onKey(event: KeyboardEvent) {
      if (event.key !== hotkey || event.metaKey || event.ctrlKey || event.altKey) return
      const el = event.target as HTMLElement | null
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return
      event.preventDefault()
      setOpen(!open)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hotkey, open, setOpen])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={cn("max-h-[85dvh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-3xl sm:p-0", className)}>
        <DialogHeader className="border-b px-5 py-4 pr-12">
          <DialogTitle className="flex items-center gap-2">
            <Keyboard aria-hidden="true" className="size-4 text-muted-foreground" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto p-5">
          <KeyboardShortcuts {...props} />
        </div>
        {hotkey && (
          <p className="border-t bg-muted/40 px-5 py-2.5 text-xs text-muted-foreground">
            Press <Kbd size="sm">{hotkey}</Kbd> anywhere to open this list.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

export {
  KeyboardShortcuts,
  KeyboardShortcutsDialog,
  type KeyboardShortcutsProps,
  type KeyboardShortcutsDialogProps,
  type Shortcut,
  type ShortcutGroup,
  type ShortcutPlatform,
}
