// Ballmac UI: Parcel workspace template shell. https://ui.ballmac.com/templates/template-workspace
"use client"

import * as React from "react"
import { CalendarDays, CheckSquare, Command as CommandIcon, Inbox, LayoutGrid, Plus, Search, Settings } from "lucide-react"

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ballmac/command"
import { workspaceSans } from "@/components/ballmac/templates/workspace/workspace-fonts"
import { cn } from "@/lib/utils"

type WorkspacePage = "today" | "mail" | "calendar" | "board" | "settings"
type WorkspaceHrefs = Record<WorkspacePage, string>

const defaultHrefs: WorkspaceHrefs = { today: "/workspace", mail: "/workspace/mail", calendar: "/workspace/calendar", board: "/workspace/board", settings: "/workspace/settings" }

/** Parcel's palette: cool paper and navy ink with one blue and a touch of amber. */
const workspaceCss = `
.workspace-theme,body:has(.workspace-theme){--background:oklch(0.982 0.004 250);--foreground:oklch(0.21 0.03 262);--card:oklch(1 0 0);--card-foreground:oklch(0.21 0.03 262);--popover:oklch(1 0 0);--popover-foreground:oklch(0.21 0.03 262);--primary:oklch(0.28 0.05 262);--primary-foreground:oklch(0.985 0.004 250);--secondary:oklch(0.958 0.008 250);--secondary-foreground:oklch(0.21 0.03 262);--muted:oklch(0.958 0.008 250);--muted-foreground:oklch(0.48 0.03 258);--accent:oklch(0.94 0.012 250);--accent-foreground:oklch(0.21 0.03 262);--border:oklch(0.21 0.03 262 / 11%);--input:oklch(0.21 0.03 262 / 16%);--ring:oklch(0.5 0.17 258);--surface:oklch(0.966 0.007 250);--destructive:oklch(0.54 0.21 25);--chart-1:oklch(0.5 0.17 258);--chart-2:oklch(0.5 0.12 165);--chart-3:oklch(0.62 0.14 72);--chart-4:oklch(0.5 0.16 310);--chart-5:oklch(0.52 0.15 25);--radius:0.75rem}
.dark .workspace-theme,.dark body:has(.workspace-theme){--background:oklch(0.17 0.02 262);--foreground:oklch(0.95 0.008 250);--card:oklch(0.21 0.024 262);--card-foreground:oklch(0.95 0.008 250);--popover:oklch(0.23 0.026 262);--popover-foreground:oklch(0.95 0.008 250);--primary:oklch(0.95 0.008 250);--primary-foreground:oklch(0.21 0.03 262);--secondary:oklch(0.26 0.026 262);--secondary-foreground:oklch(0.95 0.008 250);--muted:oklch(0.25 0.026 262);--muted-foreground:oklch(0.73 0.025 255);--accent:oklch(0.28 0.03 262);--accent-foreground:oklch(0.95 0.008 250);--border:oklch(1 0 0 / 10%);--input:oklch(1 0 0 / 14%);--ring:oklch(0.72 0.14 258);--surface:oklch(0.19 0.022 262);--destructive:oklch(0.7 0.19 25);--chart-1:oklch(0.74 0.13 258);--chart-2:oklch(0.78 0.13 165);--chart-3:oklch(0.82 0.13 80);--chart-4:oklch(0.75 0.13 310);--chart-5:oklch(0.76 0.13 25)}
body:has(.workspace-theme){font-family:var(--workspace-sans),ui-sans-serif,system-ui,sans-serif}
`

const apps: { key: WorkspacePage; label: string; icon: typeof Inbox }[] = [
  { key: "today", label: "Today", icon: LayoutGrid },
  { key: "mail", label: "Mail", icon: Inbox },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "board", label: "Board", icon: CheckSquare },
  { key: "settings", label: "Settings", icon: Settings },
]

function ParcelMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className={cn("size-7", className)} fill="none">
      <rect width="28" height="28" rx="8" fill="var(--chart-1)" />
      <path d="M14 6 21 10v8l-7 4-7-4v-8z" stroke="var(--card)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 10l7 4 7-4M14 14v8" stroke="var(--card)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

type WorkspaceShellProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** The app being shown, so its icon is marked current. */
  page: WorkspacePage
  /** Override where pages live (used by previews). */
  hrefs?: Partial<WorkspaceHrefs>
  /** Let the content fill the window height (mail, calendar and board do). */
  fill?: boolean
}

/** Parcel's frame: an app rail (a tab bar on phones), a search and quick-create bar, and a command menu on ⌘K. */
function WorkspaceShell({ page, hrefs: overrides, fill, className, style, children, ...props }: WorkspaceShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [palette, setPalette] = React.useState(false)
  React.useEffect(() => {
    const cls = workspaceSans.variable
    if (!cls) return
    document.body.classList.add(cls)
    return () => document.body.classList.remove(cls)
  }, [])
  const current = apps.find((a) => a.key === page)!
  return (
    <div
      data-slot="workspace"
      className={cn("workspace-theme bg-background text-foreground flex min-h-dvh flex-col md:flex-row", fill && "h-dvh overflow-hidden", workspaceSans.variable, className)}
      style={{ fontFamily: "var(--workspace-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{workspaceCss}</style>
      <nav aria-label="Apps" className="bg-surface order-last flex shrink-0 items-center justify-around border-t px-2 py-1.5 md:order-none md:w-[4.5rem] md:flex-col md:justify-start md:gap-1 md:border-t-0 md:border-e md:py-3">
        <a href={hrefs.today} aria-label="Parcel home" className="focus-visible:ring-ring/50 mb-3 hidden rounded-xl outline-none focus-visible:ring-[3px] md:block"><ParcelMark /></a>
        {apps.map((a) => (
          <a key={a.key} href={hrefs[a.key]} aria-current={page === a.key ? "page" : undefined} className="text-muted-foreground hover:text-foreground hover:bg-accent aria-[current=page]:bg-card aria-[current=page]:text-foreground aria-[current=page]:shadow-sm focus-visible:ring-ring/50 flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium outline-none transition-colors focus-visible:ring-[3px] md:w-14">
            <a.icon className="size-5" aria-hidden="true" />
            {a.label}
          </a>
        ))}
      </nav>
      <div className={cn("flex min-w-0 flex-1 flex-col", fill && "min-h-0")}>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
          <h1 className="text-[15px] font-semibold tracking-tight">{current.label}</h1>
          <button type="button" onClick={() => setPalette(true)} className="text-muted-foreground bg-card hover:bg-accent focus-visible:ring-ring/50 mx-auto flex h-9 w-full max-w-md items-center gap-2.5 rounded-xl border px-3 text-sm outline-none transition-colors focus-visible:ring-[3px]">
            <Search className="size-4" aria-hidden="true" />
            <span className="flex-1 text-start">Search or jump to…</span>
            <kbd className="bg-muted hidden items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] sm:flex"><CommandIcon className="size-3" aria-hidden="true" />K</kbd>
          </button>
          <a href={hrefs.mail} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]"><Plus className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Compose</span><span className="sr-only sm:hidden">Compose</span></a>
          <span className="bg-chart-4/25 flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold" aria-hidden="true">MK</span>
        </header>
        <div className={cn("flex-1", fill && "min-h-0 overflow-hidden")}>{children}</div>
      </div>
      <CommandDialog open={palette} onOpenChange={setPalette} title="Search or jump to">
        <CommandInput placeholder="Search mail, events and tasks…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Apps">
            {apps.map((a) => <CommandItem key={a.key} value={a.label} onSelect={() => { setPalette(false); window.location.assign(hrefs[a.key]) }}><a.icon aria-hidden="true" /> {a.label}</CommandItem>)}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}

export { ParcelMark, WorkspaceShell, defaultHrefs as workspaceDefaultHrefs, type WorkspaceHrefs, type WorkspacePage, type WorkspaceShellProps }
