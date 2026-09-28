// Ballmac UI: Install Tabs. https://ui.ballmac.com/components/install-tabs
"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type PackageManager = "pnpm" | "npm" | "yarn" | "bun"

const PACKAGE_MANAGERS: PackageManager[] = ["pnpm", "npm", "yarn", "bun"]

/** How each manager runs a package without installing it. */
const RUNNERS: Record<PackageManager, string> = {
  pnpm: "pnpm dlx",
  npm: "npx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
}

const isManager = (value: unknown): value is PackageManager =>
  typeof value === "string" && (PACKAGE_MANAGERS as string[]).includes(value)

/* -------------------------------------------------------------------------------------------------
 * Shared, SSR-safe preference store: localStorage when available, memory otherwise.
 * Instances with the same storageKey stay in sync, including across browser tabs.
 * -----------------------------------------------------------------------------------------------*/

const memory = new Map<string, string>()
const listeners = new Map<string, Set<() => void>>()

function readStored(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStored(key: string, value: string) {
  memory.set(key, value)
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Storage blocked (private mode, sandboxed iframe): the in-memory value still syncs this page.
  }
  listeners.get(key)?.forEach((notify) => notify())
}

function subscribeStored(key: string, notify: () => void) {
  let set = listeners.get(key)
  if (!set) listeners.set(key, (set = new Set()))
  set.add(notify)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== key) return
    if (event.newValue === null) memory.delete(key)
    else memory.set(key, event.newValue)
    notify()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    set.delete(notify)
    window.removeEventListener("storage", onStorage)
  }
}

const noopSubscribe = () => () => {}

function useStoredManager(key: string | undefined) {
  const subscribe = React.useCallback(
    (notify: () => void) => (key ? subscribeStored(key, notify) : () => {}),
    [key]
  )
  const stored = React.useSyncExternalStore(
    key ? subscribe : noopSubscribe,
    () => (key ? readStored(key) : null),
    // The server (and hydration) never sees storage, so markup always matches.
    () => null
  )
  return isManager(stored) ? stored : null
}

/* -------------------------------------------------------------------------------------------------
 * InstallTabs
 * -----------------------------------------------------------------------------------------------*/

type InstallTabsProps = Omit<React.ComponentProps<"div">, "defaultValue" | "dir"> & {
  /** Command to run through each manager's runner, e.g. "shadcn@latest add @ballmac/button". */
  command?: string
  /** Explicit command per manager; overrides `command`. Only the managers listed get a tab. */
  commands?: Partial<Record<PackageManager, string>>
  /** Tab selected before any stored preference is read. */
  defaultValue?: PackageManager
  /** Controlled selected manager. */
  value?: PackageManager
  /** Called when the reader picks another manager. */
  onValueChange?: (manager: PackageManager) => void
  /** Remember the choice in localStorage under this key and sync every instance using it. */
  storageKey?: string
}

function InstallTabs({
  command,
  commands,
  defaultValue = "pnpm",
  value: valueProp,
  onValueChange,
  storageKey,
  className,
  ...props
}: InstallTabsProps) {
  const entries = React.useMemo(() => {
    if (commands) {
      return PACKAGE_MANAGERS.flatMap((m) => (commands[m] ? [[m, commands[m]] as [PackageManager, string]] : []))
    }
    return PACKAGE_MANAGERS.map((m) => [m, command ? `${RUNNERS[m]} ${command}` : ""] as [PackageManager, string])
  }, [command, commands])

  const stored = useStoredManager(storageKey)
  const [internal, setInternal] = React.useState<PackageManager>(defaultValue)
  const wanted = valueProp ?? stored ?? internal
  const available = entries.map(([m]) => m)
  const value = available.includes(wanted) ? wanted : (available[0] ?? defaultValue)
  const current = entries.find(([m]) => m === value)?.[1] ?? ""

  return (
    <TabsPrimitive.Root
      data-slot="install-tabs"
      value={value}
      onValueChange={(next) => {
        if (!isManager(next)) return
        setInternal(next)
        if (storageKey) writeStored(storageKey, next)
        onValueChange?.(next)
      }}
      className={cn("w-full min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground", className)}
      {...props}
    >
      <div className="flex h-10 items-center gap-2 border-b bg-muted/40 pr-1.5 pl-1.5">
        <TabsPrimitive.List aria-label="Package manager" className="flex min-w-0 items-center overflow-x-auto [scrollbar-width:none]">
          {entries.map(([manager]) => (
            <TabsPrimitive.Trigger
              key={manager}
              value={manager}
              className="relative h-10 shrink-0 px-2.5 font-mono text-xs text-muted-foreground outline-none transition-colors duration-150 after:absolute after:inset-x-2.5 after:bottom-0 after:h-px after:bg-transparent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset data-[state=active]:text-foreground data-[state=active]:after:bg-foreground"
            >
              {manager}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
        <CopyCommandButton value={current} />
      </div>
      {entries.map(([manager, cmd]) => (
        <TabsPrimitive.Content
          key={manager}
          value={manager}
          className="overflow-x-auto px-4 py-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
        >
          <code data-slot="install-tabs-command" className="font-mono text-[13px] leading-6 whitespace-pre">
            <span aria-hidden="true" className="mr-2 text-muted-foreground select-none">
              $
            </span>
            {cmd}
          </code>
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  )
}

function CopyCommandButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <>
      <button
        type="button"
        data-slot="install-tabs-copy"
        aria-label={copied ? "Copied" : "Copy command"}
        title="Copy command"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value)
          } catch {
            return
          }
          setCopied(true)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => setCopied(false), 1800)
        }}
        className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {copied ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  )
}

export { InstallTabs, RUNNERS as packageManagerRunners, type InstallTabsProps, type PackageManager }
