// Ballmac UI: Ledger template shell. https://ui.ballmac.com/templates/template-ledger
"use client"

import * as React from "react"
import { Menu, X } from "lucide-react"

import { AppIcon } from "@/components/ballmac/mac-icons"
import { ledgerSans, ledgerSerif } from "@/components/ballmac/templates/ledger/ledger-fonts"
import { cn } from "@/lib/utils"

type LedgerPage = "home" | "download" | "pricing" | "changelog" | "support"
type LedgerHrefs = Record<LedgerPage, string>

const defaultHrefs: LedgerHrefs = { home: "/ledger", download: "/ledger/download", pricing: "/ledger/pricing", changelog: "/ledger/changelog", support: "/ledger/support" }

/** Ledger's palette: Apple-calm. Cool white, soft grey surfaces, one blue. Dark mode follows the system. */
const ledgerCss = `
.ledger-theme{--background:oklch(0.99 0.002 250);--foreground:oklch(0.2 0.01 255);--card:oklch(1 0 0);--card-foreground:oklch(0.2 0.01 255);--popover:oklch(1 0 0);--popover-foreground:oklch(0.2 0.01 255);--primary:oklch(0.2 0.01 255);--primary-foreground:oklch(0.99 0.002 250);--secondary:oklch(0.965 0.004 250);--secondary-foreground:oklch(0.2 0.01 255);--muted:oklch(0.965 0.004 250);--muted-foreground:oklch(0.5 0.012 255);--accent:oklch(0.955 0.006 250);--accent-foreground:oklch(0.2 0.01 255);--border:oklch(0.2 0.01 255 / 10%);--input:oklch(0.2 0.01 255 / 14%);--ring:oklch(0.6 0.19 255);--surface:oklch(0.975 0.003 250);--chart-1:oklch(0.52 0.2 255);--ledger-on-accent:oklch(1 0 0);--chart-2:oklch(0.48 0.14 155);--chart-3:oklch(0.78 0.16 75);--chart-4:oklch(0.62 0.2 305);--chart-5:oklch(0.68 0.19 25);--radius:1rem}
.dark .ledger-theme{--background:oklch(0.16 0.006 255);--foreground:oklch(0.96 0.004 250);--card:oklch(0.2 0.008 255);--card-foreground:oklch(0.96 0.004 250);--popover:oklch(0.22 0.008 255);--popover-foreground:oklch(0.96 0.004 250);--primary:oklch(0.96 0.004 250);--primary-foreground:oklch(0.2 0.01 255);--secondary:oklch(0.25 0.009 255);--secondary-foreground:oklch(0.96 0.004 250);--muted:oklch(0.24 0.009 255);--muted-foreground:oklch(0.72 0.012 250);--accent:oklch(0.27 0.01 255);--accent-foreground:oklch(0.96 0.004 250);--border:oklch(1 0 0 / 11%);--input:oklch(1 0 0 / 15%);--ring:oklch(0.7 0.17 255);--surface:oklch(0.18 0.007 255);--chart-1:oklch(0.72 0.15 255);--ledger-on-accent:oklch(0.16 0.01 255);--chart-2:oklch(0.76 0.16 160);--chart-3:oklch(0.83 0.15 80);--chart-4:oklch(0.72 0.17 305);--chart-5:oklch(0.76 0.16 25)}
`

const links: { key: LedgerPage; label: string }[] = [
  { key: "home", label: "Overview" },
  { key: "pricing", label: "Pricing" },
  { key: "changelog", label: "What’s new" },
  { key: "support", label: "Support" },
]

type LedgerShellProps = React.ComponentProps<"div"> & {
  /** The page being shown, so its nav link is marked current. */
  page: LedgerPage
  /** Override where pages live (used by previews). */
  hrefs?: Partial<LedgerHrefs>
}

/** Ledger's frame: a frosted, centred header like a Mac app’s site, and a quiet footer. Wrap every Ledger page in it. */
function LedgerShell({ page, hrefs: overrides, className, style, children, ...props }: LedgerShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [open, setOpen] = React.useState(false)
  return (
    <div
      data-slot="ledger"
      className={cn("ledger-theme bg-background text-foreground relative min-h-dvh overflow-x-clip antialiased", ledgerSerif.variable, ledgerSans.variable, className)}
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', var(--ledger-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{ledgerCss}</style>
      <header className="bg-background/72 sticky top-0 z-40 border-b backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href={hrefs.home} className="focus-visible:ring-ring/50 flex items-center gap-2 rounded-md text-sm font-semibold outline-none focus-visible:ring-[3px]">
            <AppIcon size={22} tone="blue"><span className="text-[11px] font-bold">L</span></AppIcon> Ledger
          </a>
          <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <a key={l.key} href={hrefs[l.key]} aria-current={page === l.key ? "page" : undefined} className="text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground focus-visible:ring-ring/50 rounded text-[13px] outline-none transition-colors focus-visible:ring-[3px]">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={hrefs.download} className="bg-chart-1 focus-visible:ring-ring/50 inline-flex h-7 items-center rounded-full px-3.5 text-[13px] font-medium text-[var(--ledger-on-accent)] outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">Download</a>
            <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="ledger-mobile-menu" onClick={() => setOpen((v) => !v)} className="text-muted-foreground focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] md:hidden">
              {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
        {open && (
          <nav id="ledger-mobile-menu" aria-label="Mobile" className="border-t px-4 py-2 md:hidden">
            {links.map((l) => <a key={l.key} href={hrefs[l.key]} className="hover:bg-accent block rounded-lg px-3 py-2.5 text-sm">{l.label}</a>)}
          </nav>
        )}
      </header>
      {children}
      <footer className="bg-surface border-t">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Ledger", items: [["Overview", "home"], ["What’s new", "changelog"], ["Pricing", "pricing"], ["Download", "download"]] },
              { title: "Support", items: [["Help center", "support"], ["Keyboard shortcuts", "support"], ["Contact us", "support"], ["System status", "support"]] },
              { title: "Company", items: [["About", "home"], ["Press kit", "home"], ["Privacy", "home"], ["Terms", "home"]] },
              { title: "Elsewhere", items: [["Mastodon", "home"], ["GitHub", "home"], ["RSS", "changelog"], ["Newsletter", "home"]] },
            ].map((c) => (
              <div key={c.title}>
                <h2 className="text-xs font-semibold">{c.title}</h2>
                <ul className="mt-3 space-y-2">
                  {c.items.map(([label, key]) => <li key={label}><a href={hrefs[key as LedgerPage]} className="text-muted-foreground hover:text-foreground text-xs transition-colors">{label}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-10 border-t pt-5 text-xs text-pretty">Ledger requires macOS 13 Ventura or later. Apple, Mac, macOS and iCloud are trademarks of Apple Inc. © 2026 Ledger Software, made in Portland.</p>
        </div>
      </footer>
    </div>
  )
}

/** A heading with one italic serif word, the template's signature. Wrap the word to emphasise in `<em>`. */
function LedgerHeading({ className, children, as: Tag = "h2", ...props }: React.ComponentProps<"h2"> & { as?: "h1" | "h2" | "h3" }) {
  return (
    <Tag className={cn("font-semibold tracking-[-0.035em] text-balance [&_em]:font-normal [&_em]:tracking-[-0.02em] [&_em]:[font-family:var(--ledger-serif),ui-serif,Georgia,serif]", className)} {...props}>
      {children}
    </Tag>
  )
}

export { LedgerHeading, LedgerShell, defaultHrefs as ledgerDefaultHrefs, type LedgerHrefs, type LedgerPage, type LedgerShellProps }
