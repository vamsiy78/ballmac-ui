// Ballmac UI: Desktop 7. https://ui.ballmac.com/blocks/desktop-7
"use client"

import * as React from "react"
import { FolderClock, FolderOpen, GitBranch, Plus, Search, Sparkles, X } from "lucide-react"

import { AppWindow, AppWindowContent, AppWindowTitleBar } from "@/components/ballmac/app-window"
import { Button } from "@/components/ballmac/button"
import { Checkbox } from "@/components/ballmac/checkbox"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { useFeel, type FeelId } from "@/lib/ballmac/feel"
import { formatShortcut, usesMacKeys } from "@/lib/ballmac/shortcut"
import { cn } from "@/lib/utils"

type Desktop7Action = { id: string; label: string; description?: string; icon?: React.ReactNode; shortcut?: string }

type Desktop7Recent = {
  id: string
  name: string
  /** Where it lives, shown under the name. */
  path: string
  /** When it was last opened, already written for people ("2 hours ago"). */
  opened?: string
}

type Desktop7Props = Omit<React.ComponentProps<"div">, "children"> &
  StateProps & {
    /** Which platform the window handles like. Defaults to the page's feel. */
    feel?: FeelId
    /** Draw the window frame. Turn off inside a real Tauri or Electron window that already has one. */
    frame?: boolean
    appName?: string
    version?: string
    /** The app icon. A generated one is drawn when you leave it out. */
    icon?: React.ReactNode
    /** The ways to start: new, open, clone. */
    actions?: Desktop7Action[]
    /** Recently opened projects or documents, most recent first. */
    recents?: Desktop7Recent[]
    /** Called by an action. */
    onAction?: (id: string) => void
    /** Called when a recent item is opened with a click, double-click or Enter. */
    onOpenRecent?: (id: string) => void
    /** Called when a recent item is removed from the list. Without it, removing is not offered. */
    onRemoveRecent?: (id: string) => void
    /** Whether "Show this window when the app opens" is ticked (controlled). */
    showOnLaunch?: boolean
    onShowOnLaunchChange?: (show: boolean) => void
    onClose?: () => void
  }

const defaultActions: Desktop7Action[] = [
  { id: "new", label: "New project", description: "Start from an empty folder", icon: <Plus />, shortcut: "Mod+N" },
  { id: "open", label: "Open…", description: "A folder already on this computer", icon: <FolderOpen />, shortcut: "Mod+O" },
  { id: "clone", label: "Clone repository", description: "Copy a project from a Git URL", icon: <GitBranch />, shortcut: "Mod+Shift+C" },
]

const sampleRecents: Desktop7Recent[] = [
  { id: "1", name: "acme-web", path: "~/Code/acme-web", opened: "12 minutes ago" },
  { id: "2", name: "design-tokens", path: "~/Code/design-tokens", opened: "Yesterday" },
  { id: "3", name: "release-notes", path: "~/Documents/release-notes", opened: "3 days ago" },
  { id: "4", name: "billing-service", path: "~/Code/billing-service", opened: "Last week" },
  { id: "5", name: "onboarding-research", path: "~/Documents/onboarding-research", opened: "2 weeks ago" },
]

function RecentSkeleton() {
  return (
    <div className="grid gap-1 p-2" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2">
          <Skeleton className="size-8 rounded-md" />
          <div className="grid flex-1 gap-1.5">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * The window a desktop app opens with when nothing is open: the app's name and version, ways to start (new, open, clone) with their
 * shortcuts, and recent projects to search, open with Enter and remove with Delete.
 */
function Desktop7({
  feel: feelProp,
  frame = true,
  appName = "Acme Studio",
  version = "3.2.0",
  icon,
  actions = defaultActions,
  recents: recentsProp = sampleRecents,
  onAction,
  onOpenRecent,
  onRemoveRecent,
  showOnLaunch: showProp,
  onShowOnLaunchChange,
  onClose,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Desktop7Props) {
  const page = useFeel().feel
  const feel = feelProp ?? page
  const mac = usesMacKeys(feel)
  const win = feel === "windows"
  const id = React.useId()
  const [recents, setRecents] = React.useState(recentsProp)
  React.useEffect(() => setRecents(recentsProp), [recentsProp])
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const [showLocal, setShowLocal] = React.useState(true)
  const show = showProp ?? showLocal
  const q = query.trim().toLowerCase()
  const visible = recents.filter((r) => !q || `${r.name} ${r.path}`.toLowerCase().includes(q))
  const current = visible[Math.min(active, visible.length - 1)]
  React.useEffect(() => setActive(0), [q])

  const remove = (r: Desktop7Recent) => {
    setRecents((list) => list.filter((x) => x.id !== r.id))
    onRemoveRecent?.(r.id)
  }

  const listKeys = (e: React.KeyboardEvent) => {
    if (!visible.length) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, visible.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter" && current) {
      e.preventDefault()
      onOpenRecent?.(current.id)
    } else if ((e.key === "Delete" || e.key === "Backspace") && current && onRemoveRecent && e.currentTarget.tagName !== "INPUT") {
      e.preventDefault()
      remove(current)
    }
  }

  const content = (
    <div className={cn("grid min-h-0 flex-1", "sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]")}>
      <div className={cn("flex flex-col gap-6 p-6", mac && "items-center text-center sm:justify-center")}>
        <div className={cn("flex gap-4", mac ? "flex-col items-center" : "items-center")}>
          <span
            aria-hidden="true"
            className={cn(
              "from-primary to-primary/70 text-primary-foreground flex shrink-0 items-center justify-center rounded-[22%] bg-linear-to-b shadow-[0_2px_6px_rgb(0_0_0/0.18),inset_0_1px_0_rgb(255_255_255/0.25)] [&_svg]:size-1/2",
              mac ? "size-20" : "size-12"
            )}
          >
            {icon ?? <Sparkles />}
          </span>
          <div>
            <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight">
              {win ? `Welcome to ${appName}` : appName}
            </h2>
            <p className="text-muted-foreground text-xs tabular-nums">Version {version}</p>
          </div>
        </div>
        <ul aria-label="Start" className={cn("grid w-full gap-1", mac && "max-w-64")}>
          {actions.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onAction?.(a.id)}
                className="hover:bg-accent focus-visible:ring-ring/50 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start outline-none focus-visible:ring-[3px]"
              >
                <span aria-hidden="true" className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md border [&_svg]:size-4">
                  {a.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{a.label}</span>
                  {a.description ? <span className="text-muted-foreground block truncate text-xs">{a.description}</span> : null}
                </span>
                {a.shortcut ? (
                  <kbd dir="ltr" className="text-muted-foreground hidden font-sans text-xs sm:block">
                    {formatShortcut(a.shortcut, feel)}
                  </kbd>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-muted/40 flex min-h-0 flex-col border-t sm:border-s sm:border-t-0">
        <div className="flex items-center gap-2 p-3">
          <h3 className="flex-1 text-xs font-semibold">Recent</h3>
        </div>
        <div className="px-3 pb-2">
          <div className="bg-background focus-within:ring-ring/50 flex h-8 items-center gap-2 rounded-md border px-2 focus-within:ring-[3px]">
            <Search aria-hidden="true" className="text-muted-foreground size-3.5" />
            <input
              role="combobox"
              aria-label="Search recent projects"
              aria-expanded={state === "ready" && visible.length > 0}
              aria-controls={`${id}-recents`}
              aria-activedescendant={state === "ready" && current ? `${id}-r-${current.id}` : undefined}
              aria-autocomplete="list"
              value={query}
              disabled={state !== "ready"}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={listKeys}
              placeholder="Search"
              className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-[13px] outline-none"
            />
          </div>
        </div>
        <StateView
          state={state === "ready" && !recents.length ? "empty" : state}
          onRetry={onRetry}
          bare
          label="Loading recent projects"
          loading={<RecentSkeleton />}
          empty={{ title: emptyState?.title ?? "Nothing opened yet", description: emptyState?.description ?? "Projects you open will be listed here.", icon: emptyState?.icon ?? <FolderClock />, action: emptyState?.action }}
          error={{ title: errorState?.title ?? "Recent projects could not be read", ...errorState }}
          className="min-h-0 flex-1 overflow-hidden"
        >
          {visible.length ? (
            <ul
              id={`${id}-recents`}
              role="listbox"
              aria-label="Recent projects"
              tabIndex={0}
              aria-activedescendant={current ? `${id}-r-${current.id}` : undefined}
              onKeyDown={listKeys}
              className="grid h-full content-start gap-0.5 overflow-y-auto rounded-md px-2 pb-2 outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50"
            >
              {visible.map((r, i) => {
                const sel = current?.id === r.id
                return (
                  <li
                    key={r.id}
                    id={`${id}-r-${r.id}`}
                    role="option"
                    aria-selected={sel}
                    onMouseMove={() => setActive(i)}
                    onClick={() => onOpenRecent?.(r.id)}
                    className={cn("flex cursor-default items-center gap-3 rounded-md px-2 py-1.5", sel && (mac ? "bg-primary text-primary-foreground" : "bg-foreground/[0.07]"))}
                  >
                    <span aria-hidden="true" className={cn("flex size-8 shrink-0 items-center justify-center rounded-md border text-xs font-semibold uppercase", sel && mac ? "border-primary-foreground/30" : "bg-background")}>
                      {r.name.slice(0, 2)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{r.name}</span>
                      <span dir="ltr" className={cn("block truncate text-start text-[11px]", sel && mac ? "text-primary-foreground/75" : "text-muted-foreground")}>
                        {r.path}
                      </span>
                    </span>
                    {r.opened ? <span className={cn("hidden shrink-0 text-[11px] md:block", sel && mac ? "text-primary-foreground/75" : "text-muted-foreground")}>{r.opened}</span> : null}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground px-4 py-8 text-center text-sm">No recent projects match “{query}”.</p>
          )}
        </StateView>
        {onRemoveRecent && current && state === "ready" ? (
          <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
            <p className="text-muted-foreground truncate text-xs">
              <span className="sr-only">Selected:</span>{" "}
              {current.name}
            </p>
            <Button variant="ghost" size="sm" onClick={() => remove(current)}>
              <X aria-hidden="true" />
              Remove from list
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )

  const footer = (
    <div className="flex items-center gap-2 border-t px-4 py-2.5">
      <Checkbox
        id={`${id}-show`}
        checked={show}
        onCheckedChange={(c) => {
          setShowLocal(c === true)
          onShowOnLaunchChange?.(c === true)
        }}
      />
      <label htmlFor={`${id}-show`} className="text-muted-foreground text-xs">
        Show this window when {appName} opens
      </label>
    </div>
  )

  if (!frame)
    return (
      <div data-slot="desktop-7" data-state={state} data-feel={feelProp} role="region" aria-labelledby={`${id}-title`} className={cn("bg-card flex flex-col overflow-hidden rounded-xl border", className)} {...frameProps(props)}>
        {content}
        {footer}
      </div>
    )
  return (
    <AppWindow data-slot="desktop-7" data-state={state} feel={feel} onClose={onClose} role="region" aria-labelledby={`${id}-title`} className={cn("h-[30rem] w-full max-w-3xl", className)} {...frameProps(props)}>
      <AppWindowTitleBar title={win ? "Welcome" : ""} icon={<Sparkles />} className={cn(!win && "border-b-0")} />
      <AppWindowContent className="flex flex-col overflow-hidden">
        {content}
        {footer}
      </AppWindowContent>
    </AppWindow>
  )
}

export { Desktop7, type Desktop7Props, type Desktop7Action, type Desktop7Recent }
