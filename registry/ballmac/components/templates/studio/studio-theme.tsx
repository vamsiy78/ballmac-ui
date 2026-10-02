// Ballmac UI: Studio template shell. https://ui.ballmac.com/templates/template-studio
"use client"

import * as React from "react"
import { ArrowUpRight, Menu, X } from "lucide-react"

import { studioMono, studioSans } from "@/components/ballmac/templates/studio/studio-fonts"
import { cn } from "@/lib/utils"
import { Media, type MediaSource } from "@/components/ballmac/media"

type StudioPage = "home" | "work" | "project" | "services" | "contact"
type StudioHrefs = Record<StudioPage, string>

const defaultHrefs: StudioHrefs = { home: "/studio", work: "/studio/work", project: "/studio/work/north-coast", services: "/studio/services", contact: "/studio/contact" }

/** Studio's palette: stark white and black with a hot orange, plus electric blue, acid yellow, pink and mint for art. */
const studioCss = `
.studio-theme,body:has(.studio-theme){--background:oklch(0.99 0 0);--foreground:oklch(0.12 0 0);--card:oklch(1 0 0);--card-foreground:oklch(0.12 0 0);--popover:oklch(1 0 0);--popover-foreground:oklch(0.12 0 0);--primary:oklch(0.12 0 0);--primary-foreground:oklch(0.99 0 0);--secondary:oklch(0.955 0 0);--secondary-foreground:oklch(0.12 0 0);--muted:oklch(0.955 0 0);--muted-foreground:oklch(0.44 0 0);--accent:oklch(0.93 0.02 40);--accent-foreground:oklch(0.12 0 0);--border:oklch(0.12 0 0 / 16%);--input:oklch(0.12 0 0 / 28%);--ring:oklch(0.12 0 0);--surface:oklch(0.965 0 0);--destructive:oklch(0.52 0.24 27);--chart-1:oklch(0.68 0.22 40);--chart-2:oklch(0.52 0.24 265);--chart-3:oklch(0.92 0.18 100);--chart-4:oklch(0.72 0.22 350);--chart-5:oklch(0.85 0.13 170);--studio-on-accent:oklch(0.12 0 0);--radius:0.25rem}
.dark .studio-theme,.dark body:has(.studio-theme){--background:oklch(0.12 0 0);--foreground:oklch(0.97 0 0);--card:oklch(0.16 0 0);--card-foreground:oklch(0.97 0 0);--popover:oklch(0.18 0 0);--popover-foreground:oklch(0.97 0 0);--primary:oklch(0.97 0 0);--primary-foreground:oklch(0.12 0 0);--secondary:oklch(0.2 0 0);--secondary-foreground:oklch(0.97 0 0);--muted:oklch(0.2 0 0);--muted-foreground:oklch(0.72 0 0);--accent:oklch(0.24 0.02 40);--accent-foreground:oklch(0.97 0 0);--border:oklch(1 0 0 / 16%);--input:oklch(1 0 0 / 28%);--ring:oklch(0.97 0 0);--surface:oklch(0.15 0 0);--destructive:oklch(0.7 0.2 27);--chart-1:oklch(0.7 0.21 40);--chart-2:oklch(0.52 0.24 265);--chart-3:oklch(0.92 0.18 100);--chart-4:oklch(0.74 0.2 350);--chart-5:oklch(0.85 0.13 170);--studio-on-accent:oklch(0.12 0 0)}
body:has(.studio-theme){font-family:var(--studio-sans),ui-sans-serif,system-ui,sans-serif}
`

/** Wide, heavy headline settings for Archivo. */
const display = "[font-stretch:112%] font-extrabold uppercase tracking-[-0.03em] leading-[0.88]"

/** A painted poster: bold shapes in the accent colours, standing in for project imagery. */
function StudioArt({ variant, className, image, imageAlt }: { variant: number; className?: string; image?: MediaSource; imageAlt?: string }) {
  const v = ((variant % 6) + 6) % 6
  if (image) return <Media media={image} alt={imageAlt} fill className={cn("aspect-[4/3] w-full", className)} />
  return (
    <div aria-hidden="true" className={cn("relative isolate aspect-[4/3] w-full overflow-hidden", className)}>
      {v === 0 && (<><div className="bg-chart-1 absolute inset-0" /><div className="bg-foreground absolute -bottom-[20%] -start-[10%] w-[80%] aspect-square rounded-full" /><div className="bg-chart-3 absolute top-[12%] end-[12%] w-[26%] aspect-square rounded-full" /></>)}
      {v === 1 && (<><div className="bg-chart-2 absolute inset-0" /><div className="bg-chart-3 absolute inset-y-0 start-[18%] w-[22%]" /><div className="bg-chart-4 absolute inset-y-0 start-[48%] w-[12%]" /><div className="bg-primary-foreground absolute top-[18%] end-[10%] h-[64%] w-[16%] rounded-full" /></>)}
      {v === 2 && (<><div className="bg-foreground absolute inset-0" />{[0, 1, 2, 3, 4].map((i) => <div key={i} className="border-primary-foreground absolute inset-x-[10%] rounded-full border-[3px]" style={{ top: `${10 + i * 12}%`, height: `${60 - i * 8}%`, opacity: 1 - i * 0.16 }} />)}<div className="bg-chart-1 absolute end-[14%] bottom-[14%] w-[20%] aspect-square rounded-full" /></>)}
      {v === 3 && (<><div className="bg-chart-4 absolute inset-0" /><div className="absolute inset-[8%] grid grid-cols-4 grid-rows-3 gap-[2%]">{Array.from({ length: 12 }, (_, i) => <div key={i} className={cn("rounded-full", i % 5 === 0 ? "bg-chart-3" : i % 3 === 0 ? "bg-foreground" : "bg-primary-foreground")} />)}</div></>)}
      {v === 4 && (<><div className="bg-chart-3 absolute inset-0" /><div className="bg-foreground absolute top-[16%] start-[22%] h-[68%] w-[56%] rounded-t-[999px]" /><div className="bg-chart-1 absolute bottom-[16%] start-[34%] w-[32%] aspect-square rounded-full" /></>)}
      {v === 5 && (<><div className="bg-chart-5 absolute inset-0" /><div className="bg-foreground absolute inset-x-0 bottom-0 h-[38%]" /><div className="bg-chart-2 absolute bottom-[38%] start-[12%] h-[34%] w-[28%]" /><div className="bg-chart-1 absolute end-[14%] bottom-[38%] h-[52%] w-[22%] rounded-t-full" /></>)}
    </div>
  )
}

const links: { key: StudioPage; label: string }[] = [
  { key: "work", label: "Work" },
  { key: "services", label: "Services" },
  { key: "contact", label: "Contact" },
]

type StudioShellProps = React.ComponentProps<"div"> & {
  /** The page being shown, so its nav link is marked current. */
  page: StudioPage
  /** Override where pages live (used by previews). */
  hrefs?: Partial<StudioHrefs>
}

/** Studio's frame: a heavy wordmark, a plain nav, and a footer that is mostly the studio's name. */
function StudioShell({ page, hrefs: overrides, className, style, children, ...props }: StudioShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const classes = [studioSans.variable, studioMono.variable].filter(Boolean)
    document.body.classList.add(...classes)
    return () => document.body.classList.remove(...classes)
  }, [])
  const active = page === "project" ? "work" : page
  return (
    <div
      data-slot="studio"
      className={cn("studio-theme bg-background text-foreground relative min-h-dvh overflow-x-clip", studioSans.variable, studioMono.variable, className)}
      style={{ fontFamily: "var(--studio-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{studioCss}</style>
      <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-[100rem] items-center justify-between px-4 sm:px-8">
          <a href={hrefs.home} className={cn("focus-visible:ring-ring/50 rounded text-xl outline-none focus-visible:ring-[3px]", display)}>Hollis<span className="text-chart-1">&amp;</span>Vane</a>
          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            {links.map((l) => <a key={l.key} href={hrefs[l.key]} aria-current={active === l.key ? "page" : undefined} className="hover:text-chart-1 aria-[current=page]:underline decoration-chart-1 focus-visible:ring-ring/50 rounded text-sm font-semibold tracking-wide uppercase underline-offset-[10px] outline-none transition-colors aria-[current=page]:decoration-[3px] focus-visible:ring-[3px]">{l.label}</a>)}
          </nav>
          <p className="text-muted-foreground hidden text-xs lg:block" style={{ fontFamily: "var(--studio-mono)" }}>Lisbon · Berlin</p>
          <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="studio-mobile-menu" onClick={() => setOpen((v) => !v)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded outline-none focus-visible:ring-[3px] md:hidden">
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
        {open && (
          <nav id="studio-mobile-menu" aria-label="Mobile" className="border-t px-4 py-3 md:hidden">
            {links.map((l) => <a key={l.key} href={hrefs[l.key]} className={cn("hover:text-chart-1 block py-2.5 text-3xl", display)}>{l.label}</a>)}
          </nav>
        )}
      </header>
      {children}
      <footer className="bg-foreground text-background mt-24">
        <div className="mx-auto max-w-[100rem] px-4 pt-16 pb-8 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <p className="max-w-md text-xl text-pretty opacity-80">New project, new idea, or just a question? We reply to every email within two working days.</p>
            <a href={hrefs.contact} className="bg-chart-1 text-[var(--studio-on-accent)] focus-visible:ring-ring inline-flex h-14 items-center gap-2 rounded-full px-8 text-lg font-bold outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] motion-reduce:transition-none">Start a project <ArrowUpRight className="size-5 rtl:-scale-x-100" aria-hidden="true" /></a>
          </div>
          <p aria-hidden="true" className={cn("mt-14 text-[clamp(3.4rem,17.5vw,19rem)] whitespace-nowrap", display)}>Hollis&amp;Vane</p>
          <div className="mt-8 flex flex-wrap justify-between gap-4 border-t border-current/25 pt-6 text-sm opacity-70">
            <p>© 2026 Hollis &amp; Vane Studio Ltd.</p>
            <ul className="flex gap-6">{["Instagram", "Behance", "LinkedIn", "Newsletter"].map((l) => <li key={l}><a href="#" className="hover:underline">{l}</a></li>)}</ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

export { StudioArt, StudioShell, defaultHrefs as studioDefaultHrefs, display as studioDisplay, type StudioHrefs, type StudioPage, type StudioShellProps }
