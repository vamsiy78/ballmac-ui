// Ballmac UI: Portfolio template shell. https://ui.ballmac.com/templates/template-portfolio
"use client"

import * as React from "react"
import { ArrowUpRight, Menu, X } from "lucide-react"

import { CopyButton } from "@/components/ballmac/copy-button"
import { portfolioMono, portfolioSans } from "@/components/ballmac/templates/portfolio/portfolio-fonts"
import { cn } from "@/lib/utils"

type PortfolioPage = "home" | "work" | "case" | "writing" | "uses"
type PortfolioHrefs = Record<PortfolioPage, string>

const defaultHrefs: PortfolioHrefs = { home: "/portfolio", work: "/portfolio/work", case: "/portfolio/work/fernhill", writing: "/portfolio/writing", uses: "/portfolio/uses" }

/** Portfolio's palette: gallery white and ink with one acid lime. In dark mode the lime becomes the light on a black wall. */
const portfolioCss = `
.portfolio-theme,body:has(.portfolio-theme){--background:oklch(0.988 0.003 100);--foreground:oklch(0.16 0.01 100);--card:oklch(1 0 0);--card-foreground:oklch(0.16 0.01 100);--popover:oklch(1 0 0);--popover-foreground:oklch(0.16 0.01 100);--primary:oklch(0.16 0.01 100);--primary-foreground:oklch(0.988 0.003 100);--secondary:oklch(0.958 0.008 100);--secondary-foreground:oklch(0.16 0.01 100);--muted:oklch(0.958 0.008 100);--muted-foreground:oklch(0.46 0.012 100);--accent:oklch(0.94 0.014 110);--accent-foreground:oklch(0.16 0.01 100);--border:oklch(0.16 0.01 100 / 14%);--input:oklch(0.16 0.01 100 / 20%);--ring:oklch(0.16 0.01 100);--surface:oklch(0.968 0.006 100);--destructive:oklch(0.54 0.22 28);--chart-1:oklch(0.9 0.19 125);--chart-2:oklch(0.72 0.17 38);--chart-3:oklch(0.78 0.12 235);--chart-4:oklch(0.76 0.13 300);--chart-5:oklch(0.86 0.09 75);--portfolio-on-accent:oklch(0.16 0.01 100);--radius:1rem}
.dark .portfolio-theme,.dark body:has(.portfolio-theme){--background:oklch(0.14 0.004 100);--foreground:oklch(0.96 0.006 100);--card:oklch(0.18 0.005 100);--card-foreground:oklch(0.96 0.006 100);--popover:oklch(0.2 0.006 100);--popover-foreground:oklch(0.96 0.006 100);--primary:oklch(0.96 0.006 100);--primary-foreground:oklch(0.16 0.01 100);--secondary:oklch(0.23 0.006 100);--secondary-foreground:oklch(0.96 0.006 100);--muted:oklch(0.22 0.006 100);--muted-foreground:oklch(0.72 0.012 100);--accent:oklch(0.26 0.01 110);--accent-foreground:oklch(0.96 0.006 100);--border:oklch(1 0 0 / 12%);--input:oklch(1 0 0 / 16%);--ring:oklch(0.9 0.19 125);--surface:oklch(0.165 0.005 100);--destructive:oklch(0.7 0.19 28);--chart-1:oklch(0.9 0.19 125);--chart-2:oklch(0.72 0.17 38);--chart-3:oklch(0.76 0.12 235);--chart-4:oklch(0.74 0.13 300);--chart-5:oklch(0.84 0.09 75);--portfolio-on-accent:oklch(0.16 0.01 100)}
body:has(.portfolio-theme){font-family:var(--portfolio-sans),ui-sans-serif,system-ui,sans-serif}
`

/** A painted cover: abstract shapes in the chart colours standing in for a screenshot. */
function Cover({ variant, className }: { variant: number; className?: string }) {
  const v = ((variant % 6) + 6) % 6
  return (
    <div aria-hidden="true" className={cn("relative isolate aspect-[4/3] w-full overflow-hidden", className)}>
      {v === 0 && (<><div className="bg-chart-5 absolute inset-0" /><div className="bg-card absolute inset-x-[12%] top-[14%] bottom-0 rounded-t-2xl shadow-xl"><div className="bg-chart-1 m-[7%] h-[14%] w-[40%] rounded-md" /><div className="bg-muted mx-[7%] h-[8%] w-[70%] rounded" /><div className="bg-muted mx-[7%] mt-[3%] h-[8%] w-[54%] rounded" /><div className="mx-[7%] mt-[7%] grid grid-cols-3 gap-[3%]">{[0, 1, 2].map((i) => <div key={i} className="bg-secondary aspect-square rounded-lg" />)}</div></div></>)}
      {v === 1 && (<><div className="bg-foreground absolute inset-0" /><div className="absolute inset-[10%] grid grid-cols-4 gap-[4%]">{[chart(1), chart(2), chart(3), chart(4), chart(5), chart(1), chart(3), chart(2)].map((c, i) => <div key={i} className={cn("rounded-xl", c)} />)}</div></>)}
      {v === 2 && (<><div className="bg-chart-2 absolute inset-0" /><div className="absolute top-1/2 left-1/2 aspect-square w-[46%] -translate-x-1/2 -translate-y-1/2"><div className="bg-primary-foreground size-full rounded-full" /><div className="bg-foreground absolute inset-y-0 left-0 w-1/2 rounded-l-full" /></div></>)}
      {v === 3 && (<><div className="bg-chart-3 absolute inset-0" /><div className="bg-foreground absolute top-[10%] bottom-[-8%] left-1/2 w-[38%] -translate-x-1/2 rounded-[2rem] p-[3%]"><div className="bg-card h-full rounded-[1.4rem] p-[8%]"><div className="bg-chart-1 h-[10%] w-[60%] rounded" /><div className="mt-[10%] flex h-[34%] items-end gap-[6%]">{[40, 70, 55, 90, 65].map((h, i) => <div key={i} className="bg-foreground flex-1 rounded-t" style={{ height: `${h}%` }} />)}</div></div></div></>)}
      {v === 4 && (<><div className="bg-chart-4 absolute inset-0" /><div className="absolute inset-[12%] grid grid-cols-3 gap-[4%]">{[0, 1, 2].map((i) => <div key={i} className={cn("bg-card rounded-2xl p-[10%]", i === 1 && "bg-foreground -translate-y-[6%]")}><div className={cn("h-[10%] w-[60%] rounded", i === 1 ? "bg-chart-1" : "bg-muted")} /><div className={cn("mt-[18%] h-[22%] w-[50%] rounded", i === 1 ? "bg-primary-foreground" : "bg-secondary")} /></div>)}</div></>)}
      {v === 5 && (<><div className="bg-secondary absolute inset-0" />{[0, 1, 2, 3, 4].map((i) => <div key={i} className={cn("absolute w-[34%] aspect-square rounded-full mix-blend-multiply", chart((i % 5) + 1))} style={{ left: `${8 + i * 14}%`, top: `${i % 2 ? 40 : 16}%` }} />)}</>)}
    </div>
  )
}
function chart(n: number) {
  return ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"][(n - 1) % 5]
}

const links: { key: PortfolioPage; label: string }[] = [
  { key: "work", label: "Work" },
  { key: "writing", label: "Writing" },
  { key: "uses", label: "Uses" },
]

type PortfolioShellProps = React.ComponentProps<"div"> & {
  /** The page being shown, so its nav link is marked current. */
  page: PortfolioPage
  /** Override where pages live (used by previews). */
  hrefs?: Partial<PortfolioHrefs>
}

/** Portfolio's frame: a wordmark with an availability chip, a quiet nav and a huge email in the footer. */
function PortfolioShell({ page, hrefs: overrides, className, style, children, ...props }: PortfolioShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const classes = [portfolioSans.variable, portfolioMono.variable].filter(Boolean)
    document.body.classList.add(...classes)
    return () => document.body.classList.remove(...classes)
  }, [])
  const active = page === "case" ? "work" : page
  return (
    <div
      data-slot="portfolio"
      className={cn("portfolio-theme bg-background text-foreground relative min-h-dvh overflow-x-clip", portfolioSans.variable, portfolioMono.variable, className)}
      style={{ fontFamily: "var(--portfolio-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{portfolioCss}</style>
      <header className="bg-background/80 sticky top-0 z-40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <a href={hrefs.home} className="focus-visible:ring-ring/50 flex items-center gap-3 rounded-lg outline-none focus-visible:ring-[3px]">
            <span className="bg-chart-1 text-[var(--portfolio-on-accent)] flex size-9 items-center justify-center rounded-full text-sm font-bold tracking-tight" aria-hidden="true">IC</span>
            <span className="font-semibold tracking-tight">Ines Calder</span>
          </a>
          <span className="text-muted-foreground hidden items-center gap-2 text-xs lg:flex" style={{ fontFamily: "var(--portfolio-mono)" }}>
            <span className="relative flex size-2"><span className="bg-chart-2 absolute inset-0 rounded-full" /><span className="bg-chart-2 absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping" /></span>
            Booking Q1 2027 · Lisbon
          </span>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a key={l.key} href={hrefs[l.key]} aria-current={active === l.key ? "page" : undefined} className="text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:bg-accent focus-visible:ring-ring/50 rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]">
                {l.label}
              </a>
            ))}
            <a href="#contact" className="bg-foreground text-background focus-visible:ring-ring/50 ml-2 inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-sm font-semibold outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">Say hello <ArrowUpRight className="size-4" aria-hidden="true" /></a>
          </nav>
          <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="portfolio-mobile-menu" onClick={() => setOpen((v) => !v)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] md:hidden">
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
        {open && (
          <nav id="portfolio-mobile-menu" aria-label="Mobile" className="px-4 pb-4 md:hidden">
            {[{ key: "home" as const, label: "Home" }, ...links].map((l) => <a key={l.key} href={hrefs[l.key]} className="hover:bg-accent block rounded-2xl px-4 py-3 text-lg font-medium">{l.label}</a>)}
          </nav>
        )}
      </header>
      {children}
      <footer id="contact" className="mt-24 border-t">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-8">
          <p className="text-muted-foreground text-sm" style={{ fontFamily: "var(--portfolio-mono)" }}>Have a product that needs care?</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a href="mailto:hello@inescalder.example" className="focus-visible:ring-ring/50 rounded-xl text-[clamp(2rem,7.4vw,6.5rem)] leading-none font-semibold tracking-[-0.045em] break-all outline-none hover:underline hover:decoration-[0.08em] hover:underline-offset-[0.12em] focus-visible:ring-[3px]">hello@inescalder.example</a>
            <CopyButton value="hello@inescalder.example" ariaLabel="Copy email address" className="size-11" />
          </div>
          <div className="text-muted-foreground mt-14 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-sm">
            <p>© 2026 Ines Calder. Designed and built in Lisbon.</p>
            <ul className="flex gap-5">{["LinkedIn", "Read.cv", "Are.na", "RSS"].map((l) => <li key={l}><a href="#" className="hover:text-foreground transition-colors">{l}</a></li>)}</ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

export { Cover, PortfolioShell, defaultHrefs as portfolioDefaultHrefs, type PortfolioHrefs, type PortfolioPage, type PortfolioShellProps }
