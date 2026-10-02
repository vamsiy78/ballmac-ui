// Ballmac UI: Summit template shell. https://ui.ballmac.com/templates/template-summit
"use client"

import * as React from "react"
import { Menu, X } from "lucide-react"

import { EVENT_DATE, type Speaker } from "@/components/ballmac/templates/summit/summit-data"
import { summitDisplay, summitSans } from "@/components/ballmac/templates/summit/summit-fonts"
import { cn } from "@/lib/utils"

type SummitPage = "home" | "schedule" | "speakers" | "tickets" | "venue"
type SummitHrefs = Record<SummitPage, string>

const defaultHrefs: SummitHrefs = { home: "/summit", schedule: "/summit/schedule", speakers: "/summit/speakers", tickets: "/summit/tickets", venue: "/summit/venue" }

/** Northlight's palette: a cream morning page with indigo ink; dark mode is the same mountain at night. The hero sky is the same in both. */
const summitCss = `
.summit-theme,body:has(.summit-theme){--background:oklch(0.975 0.015 80);--foreground:oklch(0.22 0.08 275);--card:oklch(0.99 0.01 80);--card-foreground:oklch(0.22 0.08 275);--popover:oklch(0.99 0.01 80);--popover-foreground:oklch(0.22 0.08 275);--primary:oklch(0.3 0.12 275);--primary-foreground:oklch(0.975 0.015 80);--secondary:oklch(0.94 0.025 80);--secondary-foreground:oklch(0.22 0.08 275);--muted:oklch(0.94 0.025 80);--muted-foreground:oklch(0.44 0.07 275);--accent:oklch(0.92 0.04 75);--accent-foreground:oklch(0.22 0.08 275);--border:oklch(0.22 0.08 275 / 14%);--input:oklch(0.22 0.08 275 / 22%);--ring:oklch(0.5 0.2 285);--surface:oklch(0.955 0.02 80);--destructive:oklch(0.52 0.21 27);--chart-1:oklch(0.7 0.18 38);--chart-2:oklch(0.84 0.15 85);--chart-3:oklch(0.62 0.11 190);--chart-4:oklch(0.52 0.2 295);--chart-5:oklch(0.7 0.16 350);--summit-on-sun:oklch(0.2 0.08 275);--summit-hero-fg:oklch(0.98 0.012 80);--summit-sky-1:oklch(0.2 0.09 280);--summit-sky-2:oklch(0.36 0.15 300);--summit-sky-3:oklch(0.62 0.19 20);--summit-sky-4:oklch(0.82 0.15 75);--summit-ridge-1:oklch(0.3 0.1 290);--summit-ridge-2:oklch(0.23 0.09 282);--summit-ridge-3:oklch(0.17 0.07 278);--radius:1.25rem}
.dark .summit-theme,.dark body:has(.summit-theme){--background:oklch(0.17 0.06 277);--foreground:oklch(0.96 0.015 80);--card:oklch(0.21 0.07 277);--card-foreground:oklch(0.96 0.015 80);--popover:oklch(0.23 0.07 277);--popover-foreground:oklch(0.96 0.015 80);--primary:oklch(0.85 0.14 85);--primary-foreground:oklch(0.2 0.07 277);--secondary:oklch(0.26 0.07 277);--secondary-foreground:oklch(0.96 0.015 80);--muted:oklch(0.25 0.07 277);--muted-foreground:oklch(0.75 0.05 280);--accent:oklch(0.3 0.08 280);--accent-foreground:oklch(0.96 0.015 80);--border:oklch(1 0 0 / 11%);--input:oklch(1 0 0 / 16%);--ring:oklch(0.85 0.14 85);--surface:oklch(0.195 0.065 277);--destructive:oklch(0.7 0.19 27);--chart-1:oklch(0.75 0.17 40);--chart-2:oklch(0.86 0.14 88);--chart-3:oklch(0.76 0.11 190);--chart-4:oklch(0.72 0.17 300);--chart-5:oklch(0.78 0.14 350)}
body:has(.summit-theme){font-family:var(--summit-sans),ui-sans-serif,system-ui,sans-serif}
@keyframes summit-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.summit-float{animation:summit-float 6s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.summit-float{animation:none}}
`

const display = "[font-family:var(--summit-display),ui-sans-serif,system-ui,sans-serif] font-semibold tracking-[-0.03em]"
const onSun = "text-[var(--summit-on-sun)]"
const tones = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

/** A portrait without a photo: a colour field, shoulders and a head. Replace it with an image when you have one. */
function Portrait({ speaker, className }: { speaker: Pick<Speaker, "tone" | "name">; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("relative isolate aspect-[4/5] w-full overflow-hidden", tones[speaker.tone % tones.length], className)}>
      <div className="bg-[var(--summit-ridge-3)] absolute bottom-[-30%] left-1/2 aspect-square w-[88%] -translate-x-1/2 rounded-full" />
      <div className="bg-[var(--summit-hero-fg)] absolute top-[22%] left-1/2 aspect-square w-[34%] -translate-x-1/2 rounded-full" />
    </div>
  )
}

/** The mountain scene: a night-to-sunrise sky, a sun and three ridgelines. Decorative. */
function Ridge({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} style={{ backgroundImage: "linear-gradient(to bottom, var(--summit-sky-1) 0%, var(--summit-sky-2) 38%, var(--summit-sky-3) 74%, var(--summit-sky-4) 100%)" }}>
      <div className="bg-[var(--summit-sky-4)] summit-float absolute end-[12%] bottom-[24%] aspect-square w-[min(22vw,15rem)] rounded-full opacity-95 shadow-[0_0_120px_40px_var(--summit-sky-3)]" />
      <svg viewBox="0 0 1440 420" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[46%] w-full">
        <path className="fill-[var(--summit-ridge-1)]" d="M0 250 L120 190 L210 230 L340 130 L470 210 L560 170 L700 250 L820 150 L930 220 L1060 120 L1190 210 L1300 160 L1440 230 L1440 420 L0 420 Z" />
        <path className="fill-[var(--summit-ridge-2)]" d="M0 310 L90 270 L200 320 L330 240 L450 300 L590 230 L720 310 L860 250 L980 320 L1100 260 L1240 320 L1340 280 L1440 320 L1440 420 L0 420 Z" />
        <path className="fill-[var(--summit-ridge-3)]" d="M0 370 L140 340 L260 375 L400 330 L540 372 L690 335 L820 378 L960 340 L1100 376 L1240 345 L1440 380 L1440 420 L0 420 Z" />
      </svg>
    </div>
  )
}

/** Days, hours, minutes and seconds to the opening keynote. Computed after mount so server and client markup match. */
function useCountdown(target: string) {
  const [left, setLeft] = React.useState<number | null>(null)
  React.useEffect(() => {
    const tick = () => setLeft(Math.max(0, Math.floor((new Date(target).getTime() - Date.now()) / 1000)))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [target])
  if (left === null) return null
  return { days: Math.floor(left / 86400), hours: Math.floor((left % 86400) / 3600), minutes: Math.floor((left % 3600) / 60), seconds: left % 60 }
}

const links: { key: SummitPage; label: string }[] = [
  { key: "schedule", label: "Schedule" },
  { key: "speakers", label: "Speakers" },
  { key: "venue", label: "Venue" },
]

type SummitShellProps = React.ComponentProps<"div"> & {
  /** The page being shown, so its nav link is marked current. */
  page: SummitPage
  /** Override where pages live (used by previews). */
  hrefs?: Partial<SummitHrefs>
}

/** Northlight's frame: a transparent header that settles on scroll, a ticket button that is always in reach and a mountain footer. */
function SummitShell({ page, hrefs: overrides, className, style, children, ...props }: SummitShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const classes = [summitDisplay.variable, summitSans.variable].filter(Boolean)
    document.body.classList.add(...classes)
    return () => document.body.classList.remove(...classes)
  }, [])
  return (
    <div
      data-slot="summit"
      className={cn("summit-theme bg-background text-foreground relative min-h-dvh overflow-x-clip", summitDisplay.variable, summitSans.variable, className)}
      style={{ fontFamily: "var(--summit-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{summitCss}</style>
      <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href={hrefs.home} className="focus-visible:ring-ring/50 flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-[3px]">
            <span aria-hidden="true" className="bg-chart-1 relative size-8 overflow-hidden rounded-full"><span className="bg-[var(--summit-ridge-2)] absolute -bottom-3 left-1/2 aspect-square w-[130%] -translate-x-1/2 rounded-[40%]" /></span>
            <span className={cn("text-base", display)}>Northlight <span className="text-muted-foreground">’27</span></span>
          </a>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links.map((l) => <a key={l.key} href={hrefs[l.key]} aria-current={page === l.key ? "page" : undefined} className="hover:bg-accent aria-[current=page]:bg-accent focus-visible:ring-ring/50 rounded-full px-4 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none">{l.label}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <a href={hrefs.tickets} aria-current={page === "tickets" ? "page" : undefined} className={cn("bg-chart-1 focus-visible:ring-ring/50 inline-flex h-10 items-center rounded-full px-5 text-sm font-bold outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] motion-reduce:transition-none motion-reduce:hover:translate-y-0", onSun)}>Get tickets</a>
            <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="summit-mobile-menu" onClick={() => setOpen((v) => !v)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] md:hidden">{open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}</button>
          </div>
        </div>
        {open && <nav id="summit-mobile-menu" aria-label="Mobile" className="px-4 pb-4 md:hidden">{links.map((l) => <a key={l.key} href={hrefs[l.key]} className="hover:bg-accent block rounded-2xl px-4 py-3 text-lg font-semibold">{l.label}</a>)}</nav>}
      </header>
      {children}
      <footer className="relative isolate mt-24 overflow-hidden text-[var(--summit-hero-fg)]">
        <Ridge />
        <div aria-hidden="true" className="bg-[var(--summit-ridge-3)]/75 absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-24 pb-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
          <div><p className={cn("text-[clamp(2rem,5vw,3.5rem)] leading-none", display)}>See you in the mountains.</p><p className="mt-4 max-w-sm text-pretty">14 and 15 May 2027 · Harpa, Reykjavik. Two days of talks about design, engineering and the long view.</p></div>
          <div><h2 className="text-xs font-bold tracking-[0.14em] uppercase">The event</h2><ul className="mt-4 grid gap-2.5">{[["Schedule", hrefs.schedule], ["Speakers", hrefs.speakers], ["Venue and travel", hrefs.venue], ["Tickets", hrefs.tickets]].map(([l, h]) => <li key={l}><a href={h} className="hover:underline">{l}</a></li>)}</ul></div>
          <div><h2 className="text-xs font-bold tracking-[0.14em] uppercase">Contact</h2><ul className="mt-4 grid gap-2.5"><li>hello@northlight.example</li><li>Press and partnerships</li><li>Code of conduct</li></ul></div>
        </div>
        <p className="mx-auto max-w-7xl px-4 pb-6 text-xs sm:px-6">© 2027 Northlight Summit. Printed on a very small number of trees.</p>
      </footer>
    </div>
  )
}

export { Portrait, Ridge, SummitShell, defaultHrefs as summitDefaultHrefs, display as summitDisplayClass, onSun as summitOnSun, tones as summitTones, useCountdown, type SummitHrefs, type SummitPage, type SummitShellProps }
