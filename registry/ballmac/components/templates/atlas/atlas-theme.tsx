// Ballmac UI: Atlas template shell. https://ui.ballmac.com/templates/template-atlas
"use client"

import * as React from "react"
import { Bell, ChevronsUpDown, CircleHelp, LayoutDashboard, Menu, Package, Receipt, Search, Settings, Users } from "lucide-react"

import { Badge } from "@/components/ballmac/badge"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ballmac/command"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ballmac/sheet"
import { atlasMono, atlasSans } from "@/components/ballmac/templates/atlas/atlas-fonts"
import { cn } from "@/lib/utils"

type AtlasPage = "dashboard" | "orders" | "products" | "customers" | "settings"
/** Where each page lives. `order` is the order detail page. */
type AtlasHrefs = Record<AtlasPage | "order", string>

const defaultHrefs: AtlasHrefs = {
  dashboard: "/atlas",
  orders: "/atlas/orders",
  order: "/atlas/orders/ORD-10479",
  products: "/atlas/products",
  customers: "/atlas/customers",
  settings: "/atlas/settings",
}

/** Atlas's palette: warm stone neutrals with one teal. Dense, quiet and easy to read all day. */
const atlasCss = `
.atlas-theme,body:has(.atlas-theme){--background:oklch(0.985 0.004 90);--foreground:oklch(0.2 0.012 80);--card:oklch(1 0 0);--card-foreground:oklch(0.2 0.012 80);--popover:oklch(1 0 0);--popover-foreground:oklch(0.2 0.012 80);--primary:oklch(0.26 0.012 80);--primary-foreground:oklch(0.985 0.004 90);--secondary:oklch(0.955 0.006 90);--secondary-foreground:oklch(0.2 0.012 80);--muted:oklch(0.955 0.006 90);--muted-foreground:oklch(0.47 0.015 85);--accent:oklch(0.94 0.008 90);--accent-foreground:oklch(0.2 0.012 80);--border:oklch(0.2 0.012 80 / 11%);--input:oklch(0.2 0.012 80 / 16%);--ring:oklch(0.5 0.1 190);--surface:oklch(0.968 0.006 90);--destructive:oklch(0.55 0.21 27);--chart-1:oklch(0.5 0.1 190);--chart-2:oklch(0.5 0.13 150);--chart-3:oklch(0.62 0.14 70);--chart-4:oklch(0.5 0.14 320);--chart-5:oklch(0.52 0.12 250);--radius:0.625rem}
.dark .atlas-theme,.dark body:has(.atlas-theme){--background:oklch(0.165 0.008 80);--foreground:oklch(0.95 0.006 90);--card:oklch(0.2 0.009 80);--card-foreground:oklch(0.95 0.006 90);--popover:oklch(0.22 0.01 80);--popover-foreground:oklch(0.95 0.006 90);--primary:oklch(0.95 0.006 90);--primary-foreground:oklch(0.2 0.012 80);--secondary:oklch(0.25 0.01 80);--secondary-foreground:oklch(0.95 0.006 90);--muted:oklch(0.24 0.01 80);--muted-foreground:oklch(0.72 0.015 85);--accent:oklch(0.27 0.012 80);--accent-foreground:oklch(0.95 0.006 90);--border:oklch(1 0 0 / 10%);--input:oklch(1 0 0 / 14%);--ring:oklch(0.74 0.11 190);--surface:oklch(0.185 0.009 80);--destructive:oklch(0.7 0.19 25);--chart-1:oklch(0.78 0.11 190);--chart-2:oklch(0.78 0.14 150);--chart-3:oklch(0.82 0.14 80);--chart-4:oklch(0.76 0.13 320);--chart-5:oklch(0.76 0.11 250)}
`

/** Dialogs, sheets and menus render in a portal on <body>, so the font is set there too while an Atlas page is mounted. */
const atlasBodyCss = `body:has(.atlas-theme){font-family:var(--atlas-sans),ui-sans-serif,system-ui,sans-serif}`

const nav: { key: AtlasPage; label: string; icon: typeof Receipt; badge?: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: Receipt, badge: "8" },
  { key: "products", label: "Products", icon: Package },
  { key: "customers", label: "Customers", icon: Users },
  { key: "settings", label: "Settings", icon: Settings },
]

function AtlasMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className={cn("size-7", className)} fill="none">
      <rect width="28" height="28" rx="8" fill="var(--chart-1)" />
      <path d="M8 19 14 8l6 11M10.5 15h7" stroke="var(--card)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SidebarNav({ page, hrefs, onNavigate }: { page: AtlasPage; hrefs: AtlasHrefs; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <AtlasMark />
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">Atlas</p>
          <p className="text-muted-foreground text-[11px]">Fieldnote Goods</p>
        </div>
      </div>
      <nav aria-label="Main" className="flex-1 space-y-0.5 px-2.5 py-3">
        {nav.map((n) => (
          <a
            key={n.key}
            href={hrefs[n.key]}
            onClick={onNavigate}
            aria-current={page === n.key ? "page" : undefined}
            className="text-muted-foreground hover:text-foreground hover:bg-accent aria-[current=page]:bg-accent aria-[current=page]:text-foreground focus-visible:ring-ring/50 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]"
          >
            <n.icon className="size-4" aria-hidden="true" />
            {n.label}
            {n.badge && <span className="bg-chart-1 text-primary-foreground ml-auto rounded-full px-1.5 text-[11px] font-semibold tabular-nums">{n.badge}</span>}
          </a>
        ))}
      </nav>
      <div className="border-t p-2.5">
        <button type="button" className="hover:bg-accent focus-visible:ring-ring/50 flex w-full items-center gap-2.5 rounded-lg p-2 text-left outline-none focus-visible:ring-[3px]">
          <span className="bg-chart-4/25 flex size-8 items-center justify-center rounded-full text-xs font-bold" aria-hidden="true">MK</span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold">Mina Kovac</span>
            <span className="text-muted-foreground block truncate text-xs">Owner</span>
          </span>
          <ChevronsUpDown className="text-muted-foreground size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

type AtlasShellProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** The page being shown, so its nav link is marked current. */
  page: AtlasPage
  /** Page title shown in the top bar. */
  title: string
  /** Override where pages live (used by previews). */
  hrefs?: Partial<AtlasHrefs>
  /** Controls on the right of the top bar. */
  actions?: React.ReactNode
}

/** Atlas's frame: sidebar, top bar with a command menu (⌘K), and a drawer on phones. Wrap every Atlas page in it. */
function AtlasShell({ page, title, hrefs: overrides, actions, className, style, children, ...props }: AtlasShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [drawer, setDrawer] = React.useState(false)
  const [palette, setPalette] = React.useState(false)
  // Portaled UI (command menu, sheet) lives outside this element; give <body> the font variables too.
  React.useEffect(() => {
    const classes = [atlasSans.variable, atlasMono.variable].filter(Boolean)
    document.body.classList.add(...classes)
    return () => document.body.classList.remove(...classes)
  }, [])
  return (
    <div
      data-slot="atlas"
      className={cn("atlas-theme bg-background text-foreground relative min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]", atlasSans.variable, atlasMono.variable, className)}
      style={{ fontFamily: "var(--atlas-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{atlasCss + atlasBodyCss}</style>
      <aside className="bg-surface sticky top-0 hidden h-dvh border-r lg:block">
        <SidebarNav page={page} hrefs={hrefs} />
      </aside>
      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" className="w-72 p-0" closeLabel="Close navigation">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Pages in the Fieldnote Goods store</SheetDescription>
          <SidebarNav page={page} hrefs={hrefs} onNavigate={() => setDrawer(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0">
        <header className="bg-background/85 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-lg sm:px-6">
          <button type="button" aria-label="Open navigation" onClick={() => setDrawer(true)} className="hover:bg-accent focus-visible:ring-ring/50 -ml-1 inline-flex size-9 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px] lg:hidden">
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <h1 className="min-w-0 truncate text-[15px] font-bold tracking-tight">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPalette(true)}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 bg-card flex h-9 items-center gap-2 rounded-lg border px-2.5 text-sm outline-none transition-colors focus-visible:ring-[3px] sm:w-56"
            >
              <Search className="size-4" aria-hidden="true" />
              <span className="hidden flex-1 text-left sm:block">Search</span>
              <kbd className="bg-muted hidden rounded px-1.5 py-0.5 text-[11px] sm:block" style={{ fontFamily: "var(--atlas-mono)" }}>⌘K</kbd>
              <span className="sr-only sm:hidden">Search the store</span>
            </button>
            {actions}
            <button type="button" aria-label="Notifications, 3 unread" className="hover:bg-accent focus-visible:ring-ring/50 relative inline-flex size-9 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px]">
              <Bell className="size-[18px]" aria-hidden="true" />
              <span className="bg-chart-3 absolute top-2 right-2.5 size-1.5 rounded-full" aria-hidden="true" />
            </button>
          </div>
        </header>
        {children}
      </div>

      <CommandDialog open={palette} onOpenChange={setPalette} title="Search the store">
        <CommandInput placeholder="Search pages, orders, products…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Go to">
            {nav.map((n) => (
              <CommandItem key={n.key} value={n.label} onSelect={() => { setPalette(false); window.location.assign(hrefs[n.key]) }}>
                <n.icon aria-hidden="true" /> {n.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Recent orders">
            {["ORD-10479", "ORD-10479", "ORD-10476"].map((id) => (
              <CommandItem key={id} value={id} onSelect={() => { setPalette(false); window.location.assign(hrefs.order) }}>
                <Receipt aria-hidden="true" /> {id}
                <CommandShortcut>Order</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Help">
            <CommandItem value="Help center"><CircleHelp aria-hidden="true" /> Help center</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}

/** The heading row of a page: title text, a description and actions. */
function AtlasPageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-2xl font-extrabold tracking-[-0.03em]">{title}</h2>
        {description && <p className="text-muted-foreground mt-1 text-sm text-pretty">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

const buttonBase = "focus-visible:ring-ring/50 inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4"
/** Class names for Atlas buttons, so links and buttons match. */
const atlasButton = {
  primary: cn(buttonBase, "bg-primary text-primary-foreground hover:opacity-90"),
  outline: cn(buttonBase, "bg-card hover:bg-accent border"),
  ghost: cn(buttonBase, "hover:bg-accent"),
  danger: cn(buttonBase, "bg-card text-destructive border-destructive/40 hover:bg-destructive/10 border"),
}

const paymentTone = { paid: "success", pending: "warning", refunded: "neutral" } as const
const fulfilmentTone = { unfulfilled: "warning", shipped: "neutral", delivered: "success" } as const
const label = (s: string) => s[0].toUpperCase() + s.slice(1)

/** Payment status as a badge. */
function PaymentBadge({ value }: { value: keyof typeof paymentTone }) {
  return <Badge status={paymentTone[value]} variant="outline">{label(value)}</Badge>
}
/** Fulfilment status as a badge. */
function FulfilmentBadge({ value }: { value: keyof typeof fulfilmentTone }) {
  return <Badge status={fulfilmentTone[value]} variant="outline">{label(value)}</Badge>
}

/** A small painted tile standing in for a product photo. */
function ProductTile({ hue, className }: { hue: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative block overflow-hidden rounded-lg", className)}
      style={{ background: `linear-gradient(135deg, oklch(0.9 0.06 ${hue}), oklch(0.78 0.1 ${hue + 30}))` }}
    >
      <span className="absolute inset-x-[22%] bottom-0 h-[58%] rounded-t-md" style={{ background: `oklch(0.55 0.1 ${hue} / 0.55)` }} />
    </span>
  )
}

export { AtlasMark, AtlasPageHeader, AtlasShell, FulfilmentBadge, PaymentBadge, ProductTile, atlasButton, defaultHrefs as atlasDefaultHrefs, type AtlasHrefs, type AtlasPage, type AtlasShellProps }
