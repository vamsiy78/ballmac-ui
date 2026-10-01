// Ballmac UI: Northwind template shell. https://ui.ballmac.com/templates/template-northwind
"use client"

import * as React from "react"
import { Menu, X } from "lucide-react"

import { northwindSans, northwindSerif } from "@/components/ballmac/templates/northwind/northwind-fonts"
import { cn } from "@/lib/utils"

type NorthwindPage = "home" | "pricing" | "customers" | "about" | "contact"
type NorthwindHrefs = Record<NorthwindPage, string>

const defaultHrefs: NorthwindHrefs = { home: "/northwind", pricing: "/northwind/pricing", customers: "/northwind/customers", about: "/northwind/about", contact: "/northwind/contact" }

/** Northwind's palette: cream paper, forest ink and one terracotta. Dark mode turns to deep green. */
const northwindCss = `
.northwind-theme{--background:oklch(0.975 0.014 88);--foreground:oklch(0.24 0.035 155);--card:oklch(0.99 0.01 88);--card-foreground:oklch(0.24 0.035 155);--popover:oklch(0.99 0.01 88);--popover-foreground:oklch(0.24 0.035 155);--primary:oklch(0.36 0.075 158);--primary-foreground:oklch(0.975 0.014 88);--secondary:oklch(0.94 0.02 88);--secondary-foreground:oklch(0.24 0.035 155);--muted:oklch(0.94 0.02 88);--muted-foreground:oklch(0.48 0.03 150);--accent:oklch(0.925 0.025 95);--accent-foreground:oklch(0.24 0.035 155);--border:oklch(0.24 0.035 155 / 13%);--input:oklch(0.24 0.035 155 / 18%);--ring:oklch(0.5 0.1 158);--surface:oklch(0.955 0.018 88);--destructive:oklch(0.55 0.2 28);--chart-1:oklch(0.45 0.09 158);--chart-2:oklch(0.5 0.15 45);--chart-3:oklch(0.76 0.13 85);--chart-4:oklch(0.5 0.12 330);--chart-5:oklch(0.52 0.08 240);--radius:0.5rem}
.dark .northwind-theme{--background:oklch(0.19 0.025 158);--foreground:oklch(0.95 0.015 88);--card:oklch(0.23 0.03 158);--card-foreground:oklch(0.95 0.015 88);--popover:oklch(0.25 0.03 158);--popover-foreground:oklch(0.95 0.015 88);--primary:oklch(0.84 0.09 150);--primary-foreground:oklch(0.2 0.03 158);--secondary:oklch(0.27 0.032 158);--secondary-foreground:oklch(0.95 0.015 88);--muted:oklch(0.26 0.03 158);--muted-foreground:oklch(0.74 0.03 130);--accent:oklch(0.3 0.035 158);--accent-foreground:oklch(0.95 0.015 88);--border:oklch(0.95 0.015 88 / 14%);--input:oklch(0.95 0.015 88 / 18%);--ring:oklch(0.74 0.12 150);--surface:oklch(0.21 0.027 158);--destructive:oklch(0.7 0.18 28);--chart-1:oklch(0.78 0.11 150);--chart-2:oklch(0.76 0.13 50);--chart-3:oklch(0.84 0.12 90);--chart-4:oklch(0.74 0.12 335);--chart-5:oklch(0.76 0.09 240)}
`

const links: { key: NorthwindPage; label: string }[] = [
  { key: "home", label: "Product" },
  { key: "pricing", label: "Pricing" },
  { key: "customers", label: "Customers" },
  { key: "about", label: "About" },
]

function NorthwindMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7", className)} fill="none">
      <circle cx="16" cy="16" r="14" fill="var(--primary)" />
      <path d="M16 6 20.5 16 16 26 11.5 16Z" fill="var(--primary-foreground)" />
      <path d="M16 6v20" stroke="var(--primary)" strokeWidth="1.2" />
    </svg>
  )
}

/** A serif heading. Wrap one word in `<em>` for the italic accent. */
function NorthwindHeading({ as: Tag = "h2", className, ...props }: React.ComponentProps<"h2"> & { as?: "h1" | "h2" | "h3" }) {
  return <Tag className={cn("[font-family:var(--northwind-serif),ui-serif,Georgia,serif] font-medium tracking-[-0.025em] text-balance [&_em]:text-chart-2 [&_em]:font-normal", className)} {...props} />
}

type NorthwindShellProps = React.ComponentProps<"div"> & {
  /** The page being shown, so its nav link is marked current. */
  page: NorthwindPage
  /** Override where pages live (used by previews). */
  hrefs?: Partial<NorthwindHrefs>
}

/** Northwind's frame: cream paper, a serif wordmark header and an editorial footer. Wrap every Northwind page in it. */
function NorthwindShell({ page, hrefs: overrides, className, style, children, ...props }: NorthwindShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [open, setOpen] = React.useState(false)
  return (
    <div
      data-slot="northwind"
      className={cn("northwind-theme bg-background text-foreground relative min-h-dvh overflow-x-clip", northwindSerif.variable, northwindSans.variable, className)}
      style={{ fontFamily: "var(--northwind-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{northwindCss}</style>
      <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href={hrefs.home} className="focus-visible:ring-ring/50 flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px]">
            <NorthwindMark />
            <span className="text-xl font-medium tracking-tight [font-family:var(--northwind-serif),ui-serif,Georgia,serif]">Northwind</span>
          </a>
          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a key={l.key} href={hrefs[l.key]} aria-current={page === l.key ? "page" : undefined} className="text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:underline decoration-chart-2 focus-visible:ring-ring/50 rounded text-[15px] underline-offset-[10px] outline-none transition-colors focus-visible:ring-[3px] aria-[current=page]:decoration-2">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={hrefs.contact} aria-current={page === "contact" ? "page" : undefined} className="text-muted-foreground hover:text-foreground hidden px-2 text-[15px] sm:block">Contact</a>
            <a href={hrefs.contact} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">Book a demo</a>
            <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="northwind-mobile-menu" onClick={() => setOpen((v) => !v)} className="text-muted-foreground focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] md:hidden">
              {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
        {open && (
          <nav id="northwind-mobile-menu" aria-label="Mobile" className="border-t px-4 py-2 md:hidden">
            {[...links, { key: "contact" as const, label: "Contact" }].map((l) => <a key={l.key} href={hrefs[l.key]} className="hover:bg-accent block rounded-md px-3 py-3 text-base">{l.label}</a>)}
          </nav>
        )}
      </header>
      {children}
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
            <div>
              <p className="text-3xl leading-tight font-medium tracking-tight [font-family:var(--northwind-serif),ui-serif,Georgia,serif]">Know where every dollar goes.</p>
              <a href={hrefs.contact} className="bg-primary-foreground text-primary focus-visible:ring-ring mt-6 inline-flex h-11 items-center rounded-full px-6 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">Book a demo</a>
            </div>
            {[
              { title: "Product", items: [["Cards", "home"], ["Approvals", "home"], ["Reporting", "home"], ["Pricing", "pricing"]] },
              { title: "Company", items: [["About", "about"], ["Customers", "customers"], ["Careers", "about"], ["Contact", "contact"]] },
              { title: "Resources", items: [["Guides", "home"], ["Security", "home"], ["Status", "home"], ["Press", "about"]] },
            ].map((c) => (
              <div key={c.title}>
                <h2 className="text-sm font-semibold opacity-80">{c.title}</h2>
                <ul className="mt-4 space-y-3">
                  {c.items.map(([label, key]) => <li key={label}><a href={hrefs[key as NorthwindPage]} className="text-sm opacity-90 hover:underline">{label}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-14 border-t border-current/20 pt-6 text-xs opacity-80">© 2026 Northwind Financial, Inc. Banking services provided by partner banks, Members FDIC.</p>
        </div>
      </footer>
    </div>
  )
}

export { NorthwindHeading, NorthwindMark, NorthwindShell, defaultHrefs as northwindDefaultHrefs, type NorthwindHrefs, type NorthwindPage, type NorthwindShellProps }
