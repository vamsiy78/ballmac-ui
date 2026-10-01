// Ballmac UI: Relay template shell. https://ui.ballmac.com/templates/template-relay
"use client"

import * as React from "react"
import { ArrowUpRight, Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { relayMono, relaySans } from "@/components/ballmac/templates/relay/relay-fonts"

type RelayPage = "home" | "docs" | "pricing" | "status"
type RelayHrefs = Record<RelayPage, string>

const defaultHrefs: RelayHrefs = { home: "/relay", docs: "/relay/docs", pricing: "/relay/pricing", status: "/relay/status" }

/** Relay's palette: warm paper and black ink with a single orange signal. Dark mode inverts to ink. */
const relayCss = `
.relay-theme{--background:oklch(0.975 0.008 85);--foreground:oklch(0.17 0.01 60);--card:oklch(0.99 0.006 85);--card-foreground:oklch(0.17 0.01 60);--popover:oklch(0.99 0.006 85);--popover-foreground:oklch(0.17 0.01 60);--primary:oklch(0.17 0.01 60);--primary-foreground:oklch(0.975 0.008 85);--secondary:oklch(0.94 0.012 85);--secondary-foreground:oklch(0.17 0.01 60);--muted:oklch(0.94 0.012 85);--muted-foreground:oklch(0.48 0.02 70);--accent:oklch(0.93 0.016 80);--accent-foreground:oklch(0.17 0.01 60);--border:oklch(0.17 0.01 60 / 14%);--input:oklch(0.17 0.01 60 / 20%);--ring:oklch(0.62 0.2 45);--surface:oklch(0.96 0.01 85);--destructive:oklch(0.55 0.22 27);--chart-1:oklch(0.52 0.19 42);--chart-2:oklch(0.46 0.12 160);--chart-3:oklch(0.7 0.15 85);--chart-4:oklch(0.5 0.17 265);--chart-5:oklch(0.55 0.2 330);--radius:0.375rem}
.dark .relay-theme{--background:oklch(0.15 0.008 60);--foreground:oklch(0.95 0.01 85);--card:oklch(0.185 0.01 60);--card-foreground:oklch(0.95 0.01 85);--popover:oklch(0.2 0.01 60);--popover-foreground:oklch(0.95 0.01 85);--primary:oklch(0.95 0.01 85);--primary-foreground:oklch(0.17 0.01 60);--secondary:oklch(0.24 0.012 60);--secondary-foreground:oklch(0.95 0.01 85);--muted:oklch(0.23 0.012 60);--muted-foreground:oklch(0.72 0.02 80);--accent:oklch(0.27 0.014 60);--accent-foreground:oklch(0.95 0.01 85);--border:oklch(0.95 0.01 85 / 14%);--input:oklch(0.95 0.01 85 / 20%);--ring:oklch(0.72 0.19 50);--surface:oklch(0.17 0.009 60);--destructive:oklch(0.7 0.19 25);--chart-1:oklch(0.74 0.18 50);--chart-2:oklch(0.78 0.14 165);--chart-3:oklch(0.83 0.14 90);--chart-4:oklch(0.72 0.14 265);--chart-5:oklch(0.74 0.17 335)}
`

function RelayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" className={cn("size-6", className)}>
      <rect x="1.5" y="1.5" width="25" height="25" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 14h6l3-5 3 10 3-5h2" stroke="var(--chart-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const links: { key: RelayPage; label: string }[] = [
  { key: "docs", label: "Docs" },
  { key: "pricing", label: "Pricing" },
  { key: "status", label: "Status" },
]

type RelayShellProps = React.ComponentProps<"div"> & {
  /** The page being shown, so its nav link is marked current. */
  page: RelayPage
  /** Override where pages live (used by previews). */
  hrefs?: Partial<RelayHrefs>
}

/** Relay's frame: paper-and-ink theme, fonts, a ruled header and footer. Wrap every Relay page in it. */
function RelayShell({ page, hrefs: overrides, className, style, children, ...props }: RelayShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [open, setOpen] = React.useState(false)
  return (
    <div
      data-slot="relay"
      className={cn("relay-theme bg-background text-foreground relative min-h-dvh overflow-x-clip", relaySans.variable, relayMono.variable, className)}
      style={{ fontFamily: "var(--relay-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{relayCss}</style>
      <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href={hrefs.home} className="focus-visible:ring-ring/50 flex items-center gap-2.5 rounded-sm font-semibold tracking-tight outline-none focus-visible:ring-[3px]">
            <RelayMark /> <span style={{ fontFamily: "var(--relay-mono)" }}>relay</span>
          </a>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.key}
                href={hrefs[l.key]}
                aria-current={page === l.key ? "page" : undefined}
                className="text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:bg-accent focus-visible:ring-ring/50 rounded-md px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-[3px]"
              >
                {l.label}
              </a>
            ))}
            <a href="#" className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-[3px]">
              GitHub <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="#" className="text-muted-foreground hover:text-foreground hidden px-2 text-sm sm:block">Log in</a>
            <a href="#" className="bg-foreground text-background focus-visible:ring-ring/50 inline-flex h-9 items-center rounded-md px-3.5 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]" style={{ fontFamily: "var(--relay-mono)" }}>
              Get API key
            </a>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="relay-mobile-menu"
              onClick={() => setOpen((v) => !v)}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex size-9 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] md:hidden"
            >
              {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
        {open && (
          <nav id="relay-mobile-menu" aria-label="Mobile" className="border-t px-4 py-2 md:hidden">
            {links.map((l) => (
              <a key={l.key} href={hrefs[l.key]} className="hover:bg-accent block rounded-md px-3 py-2.5 text-sm">{l.label}</a>
            ))}
          </nav>
        )}
      </header>
      {children}
      <footer className="border-t">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <a href={hrefs.home} className="flex items-center gap-2.5 font-semibold"><RelayMark /> <span style={{ fontFamily: "var(--relay-mono)" }}>relay</span></a>
            <p className="text-muted-foreground mt-3 max-w-xs text-sm text-pretty">Reliable webhook delivery for teams that can’t afford to drop an event.</p>
          </div>
          {[
            { title: "Product", items: [["Delivery", "home"], ["Retries", "home"], ["Replay", "home"], ["Pricing", "pricing"]] },
            { title: "Developers", items: [["Documentation", "docs"], ["API reference", "docs"], ["SDKs", "docs"], ["Status", "status"]] },
            { title: "Company", items: [["About", "home"], ["Security", "home"], ["Careers", "home"], ["Contact", "home"]] },
          ].map((c) => (
            <div key={c.title}>
              <h2 className="text-xs font-semibold tracking-wider uppercase" style={{ fontFamily: "var(--relay-mono)" }}>{c.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {c.items.map(([label, key]) => (
                  <li key={label}><a href={hrefs[key as RelayPage]} className="text-muted-foreground hover:text-foreground text-sm transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-6xl border-t px-4 py-5 sm:px-6">
          <p className="text-muted-foreground text-xs" style={{ fontFamily: "var(--relay-mono)" }}>© 2026 Relay, Inc. · SOC 2 Type II · 99.99% delivery SLA</p>
        </div>
      </footer>
    </div>
  )
}

export { RelayMark, RelayShell, defaultHrefs as relayDefaultHrefs, type RelayHrefs, type RelayPage, type RelayShellProps }
