// Ballmac UI: Docs template shell. https://ui.ballmac.com/templates/template-docs
"use client"

import * as React from "react"
import { ChevronRight, Menu, Search } from "lucide-react"

import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ballmac/command"
import { Kbd } from "@/components/ballmac/kbd"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ballmac/sheet"
import { nav, searchIndex, type DocsKind } from "@/components/ballmac/templates/docs/docs-data"
import { docsMono, docsSans, docsSerif } from "@/components/ballmac/templates/docs/docs-fonts"
import { cn } from "@/lib/utils"

type DocsPage = "home" | "guide" | "reference" | "search" | "changelog"
type DocsHrefs = Record<DocsPage, string>

const defaultHrefs: DocsHrefs = { home: "/docs", guide: "/docs/guides", reference: "/docs/reference", search: "/docs/search", changelog: "/docs/changelog" }

/** Tern's palette: a cool, quiet page with deep teal ink. Dark mode is the same page lit by a terminal. */
const docsCss = `
.docs-theme,body:has(.docs-theme){--background:oklch(0.985 0.006 210);--foreground:oklch(0.2 0.025 235);--card:oklch(1 0 0);--card-foreground:oklch(0.2 0.025 235);--popover:oklch(1 0 0);--popover-foreground:oklch(0.2 0.025 235);--primary:oklch(0.4 0.09 200);--primary-foreground:oklch(0.985 0.006 210);--secondary:oklch(0.955 0.012 210);--secondary-foreground:oklch(0.2 0.025 235);--muted:oklch(0.955 0.012 210);--muted-foreground:oklch(0.46 0.03 235);--accent:oklch(0.945 0.02 200);--accent-foreground:oklch(0.2 0.025 235);--border:oklch(0.2 0.025 235 / 12%);--input:oklch(0.2 0.025 235 / 18%);--ring:oklch(0.5 0.11 195);--surface:oklch(0.97 0.01 210);--destructive:oklch(0.52 0.21 27);--chart-1:oklch(0.5 0.11 190);--chart-2:oklch(0.5 0.15 265);--chart-3:oklch(0.62 0.15 75);--chart-4:oklch(0.55 0.15 150);--chart-5:oklch(0.55 0.2 20);--radius:0.75rem}
.dark .docs-theme,.dark body:has(.docs-theme){--background:oklch(0.165 0.02 235);--foreground:oklch(0.95 0.01 205);--card:oklch(0.2 0.022 235);--card-foreground:oklch(0.95 0.01 205);--popover:oklch(0.22 0.024 235);--popover-foreground:oklch(0.95 0.01 205);--primary:oklch(0.8 0.11 190);--primary-foreground:oklch(0.18 0.03 235);--secondary:oklch(0.25 0.025 235);--secondary-foreground:oklch(0.95 0.01 205);--muted:oklch(0.25 0.025 235);--muted-foreground:oklch(0.72 0.03 215);--accent:oklch(0.28 0.03 225);--accent-foreground:oklch(0.95 0.01 205);--border:oklch(1 0 0 / 10%);--input:oklch(1 0 0 / 15%);--ring:oklch(0.8 0.11 190);--surface:oklch(0.19 0.021 235);--destructive:oklch(0.7 0.19 27);--chart-1:oklch(0.8 0.11 190);--chart-2:oklch(0.76 0.12 265);--chart-3:oklch(0.82 0.13 80);--chart-4:oklch(0.78 0.13 150);--chart-5:oklch(0.74 0.14 20)}
body:has(.docs-theme){font-family:var(--docs-sans),ui-sans-serif,system-ui,sans-serif}
@keyframes docs-packet{0%{transform:translateX(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateX(var(--docs-travel,10rem));opacity:0}}
.docs-packet{animation:docs-packet 2.6s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.docs-packet{animation:none;opacity:1}}
`

const serif = "[font-family:var(--docs-serif),ui-serif,Georgia,serif] font-medium tracking-[-0.015em]"
const mono = "[font-family:var(--docs-mono),ui-monospace,monospace]"

const kindStyle: Record<DocsKind, string> = { Guide: "bg-chart-1/15", API: "bg-chart-2/15", Changelog: "bg-chart-3/20" }

function Logo({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("bg-primary text-primary-foreground inline-flex size-8 items-center justify-center rounded-lg", className)}>
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h9a4 4 0 0 1 0 8H8" /><path d="m11 13-3 3 3 3" /></svg>
    </span>
  )
}

type SidebarProps = { page: DocsPage; hrefs: DocsHrefs; onNavigate?: () => void }
function SidebarNav({ page, hrefs, onNavigate }: SidebarProps) {
  return (
    <nav aria-label="Documentation" className="grid gap-6 text-sm">
      {nav.map((section) => (
        <div key={section.title}>
          <h2 className="text-foreground mb-2 px-2 text-xs font-bold tracking-[0.12em] uppercase">{section.title}</h2>
          <ul className="grid gap-0.5">
            {section.items.map((item) => {
              const current = item.page === page && !!item.current
              return (
                <li key={item.title}>
                  <a
                    href={hrefs[item.page]}
                    onClick={onNavigate}
                    aria-current={current ? "page" : undefined}
                    className="text-muted-foreground hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:text-foreground focus-visible:ring-ring/50 relative block rounded-md px-2 py-1.5 outline-none transition-colors focus-visible:ring-[3px] aria-[current=page]:font-semibold motion-reduce:transition-none"
                  >
                    {item.title}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

type DocsShellProps = React.ComponentProps<"div"> & {
  /** The page being shown, so its nav link is marked current. */
  page: DocsPage
  /** Override where pages live (used by previews). */
  hrefs?: Partial<DocsHrefs>
  /** Show the left navigation. Landing and search pages turn it off. */
  sidebar?: boolean
}

/** Tern's frame: a sticky header with the ⌘K search, a version picker, a sidebar and a footer. */
function DocsShell({ page, hrefs: overrides, sidebar = true, className, style, children, ...props }: DocsShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  React.useEffect(() => {
    const classes = [docsSerif.variable, docsSans.variable, docsMono.variable].filter(Boolean)
    document.body.classList.add(...classes)
    return () => document.body.classList.remove(...classes)
  }, [])
  return (
    <div
      data-slot="docs"
      className={cn("docs-theme bg-background text-foreground relative min-h-dvh overflow-x-clip", docsSerif.variable, docsSans.variable, docsMono.variable, className)}
      style={{ fontFamily: "var(--docs-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{docsCss}</style>
      <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-3 px-4 sm:px-6">
          {sidebar && (
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px] lg:hidden" aria-label="Open navigation"><Menu className="size-5" aria-hidden="true" /></SheetTrigger>
              <SheetContent side="start" className="docs-theme bg-background w-80 overflow-y-auto p-5">
                <SheetHeader className="p-0 pb-4"><SheetTitle>Tern docs</SheetTitle><SheetDescription>Browse every guide and the API reference.</SheetDescription></SheetHeader>
                <SidebarNav page={page} hrefs={hrefs} onNavigate={() => setMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          )}
          <a href={hrefs.home} className="focus-visible:ring-ring/50 flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-[3px]">
            <Logo />
            <span className={cn("text-2xl", serif)}>Tern</span>
            <span className="text-muted-foreground hidden border-s ps-2.5 text-sm font-semibold sm:inline">Docs</span>
          </a>
          <nav aria-label="Main" className="ms-4 hidden items-center gap-1 text-sm font-medium md:flex">
            {([["guide", "Guides"], ["reference", "API reference"], ["changelog", "Changelog"]] as const).map(([key, label]) => (
              <a key={key} href={hrefs[key]} aria-current={page === key ? "page" : undefined} className="text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground focus-visible:ring-ring/50 rounded-md px-3 py-2 outline-none transition-colors focus-visible:ring-[3px] aria-[current=page]:font-semibold motion-reduce:transition-none">{label}</a>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <button type="button" onClick={() => setSearchOpen(true)} className="bg-surface hover:bg-accent focus-visible:ring-ring/50 text-muted-foreground inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm outline-none transition-colors focus-visible:ring-[3px] sm:w-64 motion-reduce:transition-none" aria-label="Search the docs">
              <Search className="size-4 shrink-0" aria-hidden="true" />
              <span className="hidden flex-1 text-start sm:inline">Search the docs</span>
              <span className="hidden items-center gap-1 sm:inline-flex" aria-hidden="true"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
            </button>
            <label className="sr-only" htmlFor="docs-version">API version</label>
            <select id="docs-version" defaultValue="v3" className="bg-background focus-visible:ring-ring/50 h-10 rounded-lg border px-2.5 text-sm font-medium outline-none focus-visible:ring-[3px]">
              <option value="v3">v3.2</option>
              <option value="v2">v2.9</option>
            </select>
          </div>
        </div>
      </header>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen} title="Search the docs" description="Type to search guides, the API reference and the changelog.">
        <Command>
          <CommandInput placeholder="Search guides, endpoints and releases" />
          <CommandList>
            <CommandEmpty>No results. Try “queue” or “retry”.</CommandEmpty>
            {(["Guide", "API", "Changelog"] as const).map((kind) => (
              <CommandGroup key={kind} heading={kind === "API" ? "API reference" : kind === "Guide" ? "Guides" : "Releases"}>
                {searchIndex.filter((e) => e.kind === kind).map((e) => (
                  <CommandItem key={e.title} value={`${e.title} ${e.path} ${e.summary}`} onSelect={() => { setSearchOpen(false); window.location.href = hrefs[e.page] }}>
                    <span className="grid min-w-0"><span className="truncate font-medium">{e.title}</span><span className={cn("text-muted-foreground truncate text-xs", kind === "API" && mono)}>{e.path}</span></span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>

      {sidebar ? (
        <div className="mx-auto grid max-w-[90rem] grid-cols-[minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] overflow-y-auto border-e p-6 pe-4 lg:block" aria-label="Sidebar">
            <SidebarNav page={page} hrefs={hrefs} />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      ) : (
        children
      )}

      <footer className="border-t">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div><a href={hrefs.home} className="flex items-center gap-2.5"><Logo className="size-7" /><span className={cn("text-xl", serif)}>Tern</span></a><p className="text-muted-foreground mt-3 max-w-xs text-sm text-pretty">Queues that never lose a message. Built by people who have been paged at 3 a.m.</p></div>
          {[
            ["Learn", [["Quickstart", hrefs.guide], ["Concepts", hrefs.guide], ["Guides", hrefs.guide]]],
            ["Build", [["API reference", hrefs.reference], ["SDKs", hrefs.reference], ["Changelog", hrefs.changelog]]],
            ["Help", [["Search", hrefs.search], ["Status", hrefs.home], ["Contact support", hrefs.home]]],
          ].map(([title, items]) => (
            <div key={title as string}><h2 className="text-xs font-bold tracking-[0.12em] uppercase">{title as string}</h2><ul className="mt-3 grid gap-2 text-sm">{(items as string[][]).map(([l, h]) => <li key={l}><a href={h} className="text-muted-foreground hover:text-foreground">{l}</a></li>)}</ul></div>
          ))}
        </div>
        <p className="text-muted-foreground mx-auto max-w-[90rem] border-t px-4 py-5 text-xs sm:px-6">© 2026 Tern Systems. All systems operational.</p>
      </footer>
    </div>
  )
}

/** A small crumb row: "Get started › Send your first message". */
function Crumbs({ items }: { items: string[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
      {items.map((it, i) => (
        <React.Fragment key={it}>
          {i > 0 && <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />}
          <span aria-current={i === items.length - 1 ? "page" : undefined} className={i === items.length - 1 ? "text-foreground font-medium" : undefined}>{it}</span>
        </React.Fragment>
      ))}
    </nav>
  )
}

export { Crumbs, DocsShell, Logo as DocsLogo, defaultHrefs as docsDefaultHrefs, kindStyle as docsKindStyle, mono as docsMonoClass, serif as docsSerifClass, type DocsHrefs, type DocsPage, type DocsShellProps }
