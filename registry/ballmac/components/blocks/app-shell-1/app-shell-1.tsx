// Ballmac UI: App Shell 1. https://ui.ballmac.com/blocks/app-shell-1
"use client"

import * as React from "react"
import { Bell, ChevronsUpDown, FolderKanban, Home, Inbox, LayoutDashboard, PanelLeft, Search, Settings, Sparkles, Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ballmac/avatar"
import { Button, buttonVariants } from "@/components/ballmac/button"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ballmac/command"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ballmac/dropdown-menu"
import { Kbd } from "@/components/ballmac/kbd"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ballmac/sheet"
import { cn } from "@/lib/utils"

type AppShell1Item = {
  id: string
  label: string
  icon?: React.ReactNode
  /** Small count or label at the end, e.g. unread items. */
  badge?: string
}

type AppShell1Group = {
  /** Small heading above the group. */
  label?: string
  items: AppShell1Item[]
}

type AppShell1Props = Omit<React.ComponentProps<"div">, "children"> & {
  /** Workspace name in the switcher. */
  workspace?: string
  /** Other workspaces offered in the switcher menu. */
  workspaces?: string[]
  /** Navigation groups. */
  nav?: AppShell1Group[]
  /** The signed-in person. */
  user?: { name: string; email: string }
  /** Controlled id of the open page. */
  value?: string
  /** Id of the open page when uncontrolled. */
  defaultValue?: string
  /** Called when another page is picked from the sidebar or the command menu. */
  onValueChange?: (id: string) => void
  /** Whether the sidebar starts collapsed to icons. */
  defaultCollapsed?: boolean
  /** Height of the frame. Use "100svh" for a full-screen app. */
  height?: string
  /** The page. Receives the title of the open item. Defaults to a sample page. */
  children?: (page: AppShell1Item) => React.ReactNode
}

const defaultNav: AppShell1Group[] = [
  {
    items: [
      { id: "overview", label: "Overview", icon: <Home /> },
      { id: "inbox", label: "Inbox", icon: <Inbox />, badge: "4" },
      { id: "projects", label: "Projects", icon: <FolderKanban /> },
      { id: "reports", label: "Reports", icon: <LayoutDashboard /> },
    ],
  },
  {
    label: "Workspace",
    items: [
      { id: "team", label: "Team", icon: <Users /> },
      { id: "settings", label: "Settings", icon: <Settings /> },
    ],
  },
]

function SamplePage({ page }: { page: AppShell1Item }) {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-[-0.03em]">{page.label}</h1>
      <p className="text-muted-foreground mt-1 text-sm">Your page goes here. The sidebar, top bar and command menu stay put around it.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Open tasks", "24"],
          ["Shipped this week", "9"],
          ["Due soon", "6"],
        ].map(([label, value]) => (
          <div key={label} className="bg-card rounded-2xl border p-4">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card mt-4 rounded-2xl border p-5">
        <p className="text-sm font-medium">Recent activity</p>
        <ul className="divide-y">
          {["Ana closed 3 tasks in Launch plan", "Kofi commented on Pricing page", "Mei joined the workspace"].map((t) => (
            <li key={t} className="text-muted-foreground py-3 text-sm first:pt-3 last:pb-0">{t}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function SidebarBody({
  nav,
  value,
  onPick,
  collapsed,
  workspace,
  workspaces,
  user,
}: {
  nav: AppShell1Group[]
  value: string
  onPick: (id: string) => void
  collapsed: boolean
  workspace: string
  workspaces: string[]
  user: { name: string; email: string }
}) {
  const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2)
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Workspace: ${workspace}`}
            className="hover:bg-accent focus-visible:ring-ring/50 flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left outline-none focus-visible:ring-[3px]"
          >
            <span aria-hidden="true" className="bg-foreground text-background flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold">{workspace[0]}</span>
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{workspace}</span>
                <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
            {workspaces.map((w) => (
              <DropdownMenuItem key={w}>{w}</DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>Create workspace</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav aria-label="Main" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-3">
        {nav.map((g, gi) => (
          <div key={g.label ?? gi}>
            {g.label && !collapsed && <p className="text-muted-foreground px-2.5 pb-1.5 text-xs font-medium">{g.label}</p>}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = item.id === value
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={active ? "page" : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      title={collapsed ? item.label : undefined}
                      onClick={(e) => {
                        e.preventDefault()
                        onPick(item.id)
                      }}
                      className={cn(
                        "focus-visible:ring-ring/50 relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] [&_svg]:size-4 [&_svg]:shrink-0",
                        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {item.badge && !collapsed && <span className="bg-foreground text-background rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums">{item.badge}</span>}
                      {item.badge && collapsed && <span aria-hidden="true" className="bg-foreground ring-background absolute top-1.5 right-2.5 size-2 rounded-full ring-2" />}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="bg-muted/60 rounded-xl border p-3.5">
            <p className="flex items-center gap-1.5 text-sm font-semibold"><Sparkles className="size-4" aria-hidden="true" />Try Pro free</p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">Unlimited projects and advanced reports for 14 days.</p>
            <a href="#upgrade" className={buttonVariants({ size: "sm", className: "mt-3 w-full" })}>Start trial</a>
          </div>
        </div>
      )}

      <div className="border-t p-3">
        <div className={cn("flex items-center gap-2.5 rounded-xl p-1.5", collapsed && "justify-center")}>
          <Avatar size="sm"><AvatarFallback className="bg-chart-1/25 text-foreground text-xs font-semibold">{initials}</AvatarFallback></Avatar>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="text-muted-foreground truncate text-xs">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AppShell1({
  workspace = "Acme",
  workspaces = ["Acme", "Northwind Studio", "Personal"],
  nav = defaultNav,
  user = { name: "Jordan Lee", email: "jordan@acme.com" },
  value: valueProp,
  defaultValue,
  onValueChange,
  defaultCollapsed = false,
  height = "44rem",
  children,
  className,
  style,
  ...props
}: AppShell1Props) {
  const all = nav.flatMap((g) => g.items)
  const [internal, setInternal] = React.useState(defaultValue ?? all[0]?.id ?? "")
  const value = valueProp ?? internal
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const [drawer, setDrawer] = React.useState(false)
  const [palette, setPalette] = React.useState(false)
  const page = all.find((i) => i.id === value) ?? all[0]
  const mainId = React.useId()

  const pick = React.useCallback(
    (id: string) => {
      if (valueProp === undefined) setInternal(id)
      onValueChange?.(id)
      setDrawer(false)
      setPalette(false)
    },
    [onValueChange, valueProp]
  )

  // ⌘B / Ctrl+B collapses the sidebar while focus is inside the frame. ⌘K / Ctrl+K is handled by the command menu itself.
  const rootRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || !rootRef.current?.contains(document.activeElement)) return
      if (e.key.toLowerCase() === "b") {
        e.preventDefault()
        setCollapsed((c) => !c)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  if (!page) return null
  return (
    <div
      ref={rootRef}
      data-slot="app-shell-1"
      className={cn("bg-background @container relative flex overflow-hidden rounded-2xl border shadow-[0_30px_80px_-50px_rgb(0_0_0/0.4)]", className)}
      style={{ height, ...style }}
      {...props}
    >
      <a href={`#${mainId}`} className="bg-background focus-visible:ring-ring/50 sr-only z-50 rounded-md px-3 py-2 text-sm focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus-visible:ring-[3px]">Skip to content</a>

      <aside
        aria-label="Sidebar"
        className={cn("bg-muted/30 hidden shrink-0 border-r transition-[width] duration-200 ease-out motion-reduce:transition-none md:block", collapsed ? "w-[4.25rem]" : "w-60")}
      >
        <SidebarBody nav={nav} value={value} onPick={pick} collapsed={collapsed} workspace={workspace} workspaces={workspaces} user={user} />
      </aside>

      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" className="w-72 p-0" closeLabel="Close navigation">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Pages in {workspace}</SheetDescription>
          <SidebarBody nav={nav} value={value} onPick={pick} collapsed={false} workspace={workspace} workspaces={workspaces} user={user} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation" onClick={() => setDrawer(true)}><PanelLeft /></Button>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-pressed={collapsed} onClick={() => setCollapsed((c) => !c)}><PanelLeft /></Button>
          <h2 className="truncate text-sm font-medium"><span className="text-muted-foreground hidden sm:inline">{workspace} / </span>{page.label}</h2>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPalette(true)}
              className="text-muted-foreground hover:bg-accent focus-visible:ring-ring/50 hidden h-9 w-56 items-center gap-2 rounded-lg border px-3 text-sm outline-none transition-colors focus-visible:ring-[3px] sm:flex"
            >
              <Search className="size-4" aria-hidden="true" />
              <span className="flex-1 text-left">Search</span>
              <Kbd>⌘K</Kbd>
            </button>
            <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Search" onClick={() => setPalette(true)}><Search /></Button>
            <Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button>
          </div>
        </header>
        <main id={mainId} tabIndex={0} aria-label={page.label} className="focus-visible:ring-ring/50 min-h-0 flex-1 overflow-auto p-4 outline-none focus-visible:ring-[3px] focus-visible:ring-inset sm:p-6">
          {children ? children(page) : <SamplePage page={page} />}
        </main>
      </div>

      <CommandDialog open={palette} onOpenChange={setPalette} title="Command menu">
        <CommandInput placeholder="Jump to a page…" />
        <CommandList>
          <CommandEmpty>No matching pages.</CommandEmpty>
          <CommandGroup heading="Go to">
            {all.map((item) => (
              <CommandItem key={item.id} value={item.label} onSelect={() => pick(item.id)}>
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
                {item.id === value && <CommandShortcut>Current</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}

export { AppShell1, type AppShell1Props, type AppShell1Group, type AppShell1Item }
