// Ballmac UI: Muse template shell. https://ui.ballmac.com/templates/template-muse
"use client"

import * as React from "react"
import { Library, MessageSquarePlus, Menu, FolderKanban, Settings } from "lucide-react"

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ballmac/sheet"
import { history } from "@/components/ballmac/templates/muse/muse-data"
import { museSans, museSerif } from "@/components/ballmac/templates/muse/muse-fonts"
import { cn } from "@/lib/utils"

type MusePage = "chat" | "new" | "projects" | "library" | "settings"
type MuseHrefs = Record<MusePage, string>

const defaultHrefs: MuseHrefs = { chat: "/muse", new: "/muse/new", projects: "/muse/projects", library: "/muse/library", settings: "/muse/settings" }

/** Muse's palette: lilac-tinted paper with plum ink and one coral. Calm, roomy and easy on the eyes. */
const museCss = `
.muse-theme,body:has(.muse-theme){--background:oklch(0.978 0.008 300);--foreground:oklch(0.24 0.03 300);--card:oklch(0.995 0.004 300);--card-foreground:oklch(0.24 0.03 300);--popover:oklch(0.995 0.004 300);--popover-foreground:oklch(0.24 0.03 300);--primary:oklch(0.3 0.04 300);--primary-foreground:oklch(0.98 0.006 300);--secondary:oklch(0.95 0.012 300);--secondary-foreground:oklch(0.24 0.03 300);--muted:oklch(0.95 0.012 300);--muted-foreground:oklch(0.48 0.025 300);--accent:oklch(0.935 0.018 300);--accent-foreground:oklch(0.24 0.03 300);--border:oklch(0.24 0.03 300 / 12%);--input:oklch(0.24 0.03 300 / 17%);--ring:oklch(0.55 0.16 28);--surface:oklch(0.962 0.01 300);--destructive:oklch(0.54 0.21 25);--chart-1:oklch(0.52 0.16 28);--chart-2:oklch(0.5 0.12 160);--chart-3:oklch(0.62 0.13 75);--chart-4:oklch(0.5 0.15 300);--chart-5:oklch(0.5 0.1 240);--radius:0.875rem}
.dark .muse-theme,.dark body:has(.muse-theme){--background:oklch(0.18 0.014 300);--foreground:oklch(0.95 0.008 300);--card:oklch(0.215 0.016 300);--card-foreground:oklch(0.95 0.008 300);--popover:oklch(0.235 0.018 300);--popover-foreground:oklch(0.95 0.008 300);--primary:oklch(0.95 0.008 300);--primary-foreground:oklch(0.22 0.02 300);--secondary:oklch(0.26 0.018 300);--secondary-foreground:oklch(0.95 0.008 300);--muted:oklch(0.25 0.018 300);--muted-foreground:oklch(0.73 0.02 300);--accent:oklch(0.285 0.02 300);--accent-foreground:oklch(0.95 0.008 300);--border:oklch(1 0 0 / 10%);--input:oklch(1 0 0 / 14%);--ring:oklch(0.74 0.14 30);--surface:oklch(0.2 0.015 300);--destructive:oklch(0.7 0.19 25);--chart-1:oklch(0.76 0.13 30);--chart-2:oklch(0.78 0.13 160);--chart-3:oklch(0.83 0.13 80);--chart-4:oklch(0.75 0.13 300);--chart-5:oklch(0.76 0.1 240)}
body:has(.muse-theme){font-family:var(--muse-sans),ui-sans-serif,system-ui,sans-serif}
`

const nav: { key: MusePage; label: string; icon: typeof Library }[] = [
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "library", label: "Library", icon: Library },
  { key: "settings", label: "Settings", icon: Settings },
]
const groups = ["Today", "Yesterday", "Previous 7 days"] as const

function MuseMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className={cn("size-7", className)} fill="none">
      <circle cx="14" cy="14" r="13" fill="var(--chart-1)" />
      <path d="M8 18c1.5-5 3-8 6-8s4.5 3 6 8" stroke="var(--card)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="14" cy="9" r="1.6" fill="var(--card)" />
    </svg>
  )
}

function SidebarBody({ page, hrefs, activeChat, onNavigate }: { page: MusePage; hrefs: MuseHrefs; activeChat?: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <MuseMark />
        <span className="text-lg font-semibold tracking-tight">Muse</span>
      </div>
      <div className="px-3">
        <a href={hrefs.new} onClick={onNavigate} aria-current={page === "new" ? "page" : undefined} className="bg-card hover:bg-accent focus-visible:ring-ring/50 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-xs outline-none transition-colors focus-visible:ring-[3px]">
          <MessageSquarePlus className="text-chart-1 size-4" aria-hidden="true" /> New chat
        </a>
        <nav aria-label="Main" className="mt-3 space-y-0.5">
          {nav.map((n) => (
            <a key={n.key} href={hrefs[n.key]} onClick={onNavigate} aria-current={page === n.key ? "page" : undefined} className="text-muted-foreground hover:text-foreground hover:bg-accent aria-[current=page]:bg-accent aria-[current=page]:text-foreground focus-visible:ring-ring/50 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-[3px]">
              <n.icon className="size-4" aria-hidden="true" /> {n.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {groups.map((g) => (
          <section key={g} aria-label={g} className="mb-4">
            <h2 className="text-muted-foreground px-3 pb-1.5 text-xs font-medium">{g}</h2>
            <ul>
              {history.filter((h) => h.group === g).map((h) => (
                <li key={h.id}>
                  <a href={hrefs.chat} onClick={onNavigate} aria-current={h.id === activeChat ? "page" : undefined} className="text-foreground/85 hover:bg-accent aria-[current=page]:bg-accent focus-visible:ring-ring/50 block truncate rounded-xl px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-[3px]">
                    {h.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="border-t p-3">
        <div className="flex items-center gap-2.5 rounded-xl p-2">
          <span className="bg-chart-4/25 flex size-8 items-center justify-center rounded-full text-xs font-semibold" aria-hidden="true">MK</span>
          <span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-sm font-medium">Mina Kovac</span><span className="text-muted-foreground block text-xs">Pro plan</span></span>
        </div>
      </div>
    </div>
  )
}

type MuseShellProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** The page being shown, so its nav link is marked current. */
  page: MusePage
  /** Heading in the top bar. */
  title: React.ReactNode
  /** The chat to mark current in the history list. */
  activeChat?: string
  /** Override where pages live (used by previews). */
  hrefs?: Partial<MuseHrefs>
  /** Controls on the right of the top bar. */
  actions?: React.ReactNode
  /** Lets the content fill the height of the window (the chat does), instead of scrolling the page. */
  fill?: boolean
}

/** Muse's frame: a history sidebar, a quiet top bar and room to read. Wrap every Muse page in it. */
function MuseShell({ page, title, activeChat, hrefs: overrides, actions, fill, className, style, children, ...props }: MuseShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [drawer, setDrawer] = React.useState(false)
  // Portaled UI (menus, dialogs, sheets) lives outside this element, so <body> gets the font variables too.
  React.useEffect(() => {
    const classes = [museSans.variable, museSerif.variable].filter(Boolean)
    document.body.classList.add(...classes)
    return () => document.body.classList.remove(...classes)
  }, [])
  return (
    <div
      data-slot="muse"
      className={cn("muse-theme bg-background text-foreground flex min-h-dvh", fill && "h-dvh overflow-hidden", museSans.variable, museSerif.variable, className)}
      style={{ fontFamily: "var(--muse-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{museCss}</style>
      <aside className="bg-surface hidden w-64 shrink-0 border-r lg:block">
        <SidebarBody page={page} hrefs={hrefs} activeChat={activeChat} />
      </aside>
      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" className="w-72 p-0" closeLabel="Close menu">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Chats, projects and settings</SheetDescription>
          <SidebarBody page={page} hrefs={hrefs} activeChat={activeChat} onNavigate={() => setDrawer(false)} />
        </SheetContent>
      </Sheet>
      <div className={cn("flex min-w-0 flex-1 flex-col", fill && "min-h-0")}>
        <header className="flex h-14 shrink-0 items-center gap-2 px-3 sm:px-5">
          <button type="button" aria-label="Open menu" onClick={() => setDrawer(true)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-9 items-center justify-center rounded-xl outline-none focus-visible:ring-[3px] lg:hidden">
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <h1 className="min-w-0 truncate text-[15px] font-medium">{title}</h1>
          <div className="ml-auto flex items-center gap-1.5">{actions}</div>
        </header>
        <div className={cn("flex-1", fill && "flex min-h-0")}>{children}</div>
      </div>
    </div>
  )
}

const buttonBase = "focus-visible:ring-ring/50 inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4"
/** Class names for Muse buttons, so links and buttons match. */
const museButton = {
  primary: cn(buttonBase, "bg-primary text-primary-foreground hover:opacity-90"),
  outline: cn(buttonBase, "bg-card hover:bg-accent border"),
  ghost: cn(buttonBase, "hover:bg-accent"),
  danger: cn(buttonBase, "bg-card text-destructive border-destructive/40 hover:bg-destructive/10 border"),
}

export { MuseMark, MuseShell, defaultHrefs as museDefaultHrefs, museButton, type MuseHrefs, type MusePage, type MuseShellProps }
