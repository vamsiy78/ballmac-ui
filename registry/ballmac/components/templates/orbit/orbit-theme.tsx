// Ballmac UI: Orbit template shell. https://ui.ballmac.com/templates/template-orbit
"use client"

import * as React from "react"
import { ArrowUpRight, Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"

import { orbitMono, orbitSans } from "@/components/ballmac/templates/orbit/orbit-fonts"

type OrbitPage = "home" | "pricing" | "changelog" | "login"

/** Where each page lives. Defaults match the routes the template installs. */
type OrbitHrefs = Record<OrbitPage, string>

const defaultHrefs: OrbitHrefs = { home: "/orbit", pricing: "/orbit/pricing", changelog: "/orbit/changelog", login: "/orbit/login" }

/** Orbit's palette: deep ink with a violet light. Every value is a standard Ballmac token, so blocks inside follow it. */
const orbitVars = {
  "--background": "oklch(0.135 0.026 275)",
  "--foreground": "oklch(0.965 0.01 275)",
  "--card": "oklch(0.172 0.03 275)",
  "--card-foreground": "oklch(0.965 0.01 275)",
  "--popover": "oklch(0.19 0.032 275)",
  "--popover-foreground": "oklch(0.965 0.01 275)",
  "--primary": "oklch(0.965 0.01 275)",
  "--primary-foreground": "oklch(0.18 0.03 275)",
  "--secondary": "oklch(0.24 0.035 275)",
  "--secondary-foreground": "oklch(0.965 0.01 275)",
  "--muted": "oklch(0.22 0.034 275)",
  "--muted-foreground": "oklch(0.73 0.03 275)",
  "--accent": "oklch(0.26 0.04 275)",
  "--accent-foreground": "oklch(0.965 0.01 275)",
  "--border": "oklch(1 0 0 / 9%)",
  "--input": "oklch(1 0 0 / 13%)",
  "--ring": "oklch(0.7 0.19 285)",
  "--surface": "oklch(0.155 0.028 275)",
  "--destructive": "oklch(0.7 0.19 22)",
  "--chart-1": "oklch(0.72 0.19 285)",
  "--chart-2": "oklch(0.82 0.14 185)",
  "--chart-3": "oklch(0.84 0.14 85)",
  "--chart-4": "oklch(0.74 0.19 350)",
  "--chart-5": "oklch(0.72 0.14 245)",
  "--radius": "0.9rem",
} as React.CSSProperties

function OrbitMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("size-7", className)}>
      <circle cx="16" cy="16" r="5" fill="var(--chart-1)" />
      <ellipse cx="16" cy="16" rx="13" ry="6" stroke="currentColor" strokeWidth="1.6" transform="rotate(-28 16 16)" opacity="0.9" />
      <circle cx="26.2" cy="10.3" r="2.2" fill="var(--chart-2)" />
    </svg>
  )
}

const nav: { key: OrbitPage; label: string }[] = [
  { key: "pricing", label: "Pricing" },
  { key: "changelog", label: "Changelog" },
]

type OrbitShellProps = React.ComponentProps<"div"> & {
  /** The page being shown, so its nav link is marked current. */
  page: OrbitPage
  /** Override where pages live (used by previews). */
  hrefs?: Partial<OrbitHrefs>
  /** Hide the header and footer (the sign-in page draws its own frame). */
  bare?: boolean
}

/** Orbit's frame: the dark theme, fonts, floating header and footer. Wrap every Orbit page in it. */
function OrbitShell({ page, hrefs: hrefOverrides, bare, className, children, style, ...props }: OrbitShellProps) {
  const hrefs = { ...defaultHrefs, ...hrefOverrides }
  const [open, setOpen] = React.useState(false)
  return (
    <div
      data-slot="orbit"
      className={cn("dark bg-background text-foreground relative isolate min-h-dvh overflow-x-clip [color-scheme:dark]", orbitSans.variable, orbitMono.variable, className)}
      style={{ ...orbitVars, fontFamily: "var(--orbit-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      {!bare && (
        <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
          <div className="bg-background/70 mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl border pr-2 pl-4 backdrop-blur-xl">
            <a href={hrefs.home} className="focus-visible:ring-ring/50 flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px]">
              <OrbitMark />
              Orbit
            </a>
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {[{ key: "home" as const, label: "Product" }, ...nav].map((l) => (
                <a
                  key={l.key}
                  href={hrefs[l.key]}
                  aria-current={page === l.key ? "page" : undefined}
                  className="text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground focus-visible:ring-ring/50 rounded-lg px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-[3px]"
                >
                  {l.label}
                </a>
              ))}
              <a href="#" className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-[3px]">
                Docs <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </nav>
            <div className="flex items-center gap-1.5">
              <a href={hrefs.login} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 hidden rounded-lg px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-[3px] sm:block">
                Sign in
              </a>
              <a href={hrefs.login} className="bg-foreground text-background focus-visible:ring-ring/50 inline-flex h-9 items-center rounded-xl px-3.5 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">
                Start free
              </a>
              <button
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="orbit-mobile-menu"
                onClick={() => setOpen((v) => !v)}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex size-9 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px] md:hidden"
              >
                {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
          {open && (
            <nav id="orbit-mobile-menu" aria-label="Mobile" className="bg-popover mx-auto mt-2 max-w-6xl rounded-2xl border p-2 md:hidden">
              {[{ key: "home" as const, label: "Product" }, ...nav, { key: "login" as const, label: "Sign in" }].map((l) => (
                <a key={l.key} href={hrefs[l.key]} className="hover:bg-accent block rounded-xl px-3 py-2.5 text-sm">
                  {l.label}
                </a>
              ))}
            </nav>
          )}
        </header>
      )}
      {children}
      {!bare && (
        <footer className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-6">
          <div className="grid gap-10 border-t pt-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div>
              <a href={hrefs.home} className="flex items-center gap-2 font-semibold tracking-tight">
                <OrbitMark /> Orbit
              </a>
              <p className="text-muted-foreground mt-3 max-w-xs text-sm text-pretty">The platform for building, testing and running AI agents in production.</p>
              <p className="text-muted-foreground mt-5 flex items-center gap-2 text-xs" style={{ fontFamily: "var(--orbit-mono)" }}>
                <span className="bg-chart-2 size-1.5 rounded-full" aria-hidden="true" /> All systems operational
              </p>
            </div>
            {[
              { title: "Product", links: ["Agents", "Tools", "Evals", "Traces", "Security"] },
              { title: "Developers", links: ["Documentation", "API reference", "SDKs", "Status", "Changelog"] },
              { title: "Company", links: ["About", "Customers", "Careers", "Contact", "Brand"] },
            ].map((c) => (
              <div key={c.title}>
                <h2 className="text-sm font-medium">{c.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href={l === "Changelog" ? hrefs.changelog : "#"} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-12 text-xs">© 2026 Orbit Labs, Inc. SOC 2 Type II · GDPR · HIPAA-ready</p>
        </footer>
      )}
    </div>
  )
}

export { OrbitMark, OrbitShell, defaultHrefs as orbitDefaultHrefs, type OrbitHrefs, type OrbitPage, type OrbitShellProps }
