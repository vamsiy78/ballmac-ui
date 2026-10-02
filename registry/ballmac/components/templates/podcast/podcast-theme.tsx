// Ballmac UI: Podcast template shell. https://ui.ballmac.com/templates/template-podcast
"use client"

import * as React from "react"
import { Menu, Rss, X } from "lucide-react"

import { AudioPlayer } from "@/components/ballmac/audio-player"
import { type Episode } from "@/components/ballmac/templates/podcast/podcast-data"
import { podcastDisplay, podcastSans } from "@/components/ballmac/templates/podcast/podcast-fonts"
import { cn } from "@/lib/utils"
import { Media, type MediaSource } from "@/components/ballmac/media"

type PodcastPage = "home" | "episodes" | "episode" | "hosts" | "subscribe"
type PodcastHrefs = Record<PodcastPage, string>

const defaultHrefs: PodcastHrefs = { home: "/podcast", episodes: "/podcast/episodes", episode: "/podcast/episodes/the-optimised-life", hosts: "/podcast/hosts", subscribe: "/podcast/subscribe" }

/** The Long Table's palette: warm cream and aubergine ink with amber candlelight. Dark mode is the same table after dark. */
const podcastCss = `
.podcast-theme,body:has(.podcast-theme){--background:oklch(0.972 0.02 70);--foreground:oklch(0.24 0.06 340);--card:oklch(0.99 0.012 70);--card-foreground:oklch(0.24 0.06 340);--popover:oklch(0.99 0.012 70);--popover-foreground:oklch(0.24 0.06 340);--primary:oklch(0.3 0.08 340);--primary-foreground:oklch(0.975 0.02 70);--secondary:oklch(0.945 0.03 68);--secondary-foreground:oklch(0.24 0.06 340);--muted:oklch(0.945 0.03 68);--muted-foreground:oklch(0.45 0.05 340);--accent:oklch(0.93 0.04 66);--accent-foreground:oklch(0.24 0.06 340);--border:oklch(0.24 0.06 340 / 14%);--input:oklch(0.24 0.06 340 / 22%);--ring:oklch(0.45 0.16 345);--surface:oklch(0.955 0.025 68);--destructive:oklch(0.52 0.21 27);--chart-1:oklch(0.78 0.16 70);--chart-2:oklch(0.45 0.16 345);--chart-3:oklch(0.55 0.1 160);--chart-4:oklch(0.68 0.15 35);--chart-5:oklch(0.42 0.1 280);--podcast-on-amber:oklch(0.24 0.06 340);--radius:1rem}
.dark .podcast-theme,.dark body:has(.podcast-theme){--background:oklch(0.18 0.04 335);--foreground:oklch(0.95 0.025 70);--card:oklch(0.22 0.045 335);--card-foreground:oklch(0.95 0.025 70);--popover:oklch(0.24 0.047 335);--popover-foreground:oklch(0.95 0.025 70);--primary:oklch(0.95 0.025 70);--primary-foreground:oklch(0.22 0.05 340);--secondary:oklch(0.27 0.05 335);--secondary-foreground:oklch(0.95 0.025 70);--muted:oklch(0.26 0.05 335);--muted-foreground:oklch(0.74 0.04 60);--accent:oklch(0.3 0.055 335);--accent-foreground:oklch(0.95 0.025 70);--border:oklch(1 0 0 / 11%);--input:oklch(1 0 0 / 16%);--ring:oklch(0.78 0.16 70);--surface:oklch(0.2 0.042 335);--destructive:oklch(0.7 0.19 27);--chart-1:oklch(0.8 0.16 72);--chart-2:oklch(0.76 0.13 350);--chart-3:oklch(0.78 0.11 160);--chart-4:oklch(0.74 0.14 38);--chart-5:oklch(0.74 0.1 285)}
body:has(.podcast-theme){font-family:var(--podcast-sans),ui-sans-serif,system-ui,sans-serif}
`

const display = "[font-family:var(--podcast-display),ui-serif,Georgia,serif] font-normal tracking-[-0.01em]"

/** Cover art: a table seen from above, in the show's colours. */
function ShowArt({ variant, className, image, imageAlt }: { variant: number; className?: string; image?: MediaSource; imageAlt?: string }) {
  const v = ((variant % 6) + 6) % 6
  if (image) return <Media media={image} alt={imageAlt} fill className={cn("aspect-square w-full", className)} />
  const bg = ["bg-chart-2", "bg-chart-1", "bg-chart-4", "bg-chart-3", "bg-chart-5", "bg-primary"][v]
  return (
    <div aria-hidden="true" className={cn("@container relative isolate aspect-square w-full overflow-hidden", bg, className)}>
      <div className="bg-card/90 absolute top-1/2 left-1/2 size-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div className="border-foreground/30 absolute top-1/2 left-1/2 size-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2" />
      <div className="bg-chart-1 absolute top-[10%] start-[12%] size-[14%] rounded-full" />
      <div className="bg-foreground/80 absolute end-[10%] bottom-[12%] h-[7%] w-[34%] rounded-full" style={{ transform: `rotate(${-20 + v * 12}deg)` }} />
      <div className="bg-foreground/80 absolute bottom-[12%] start-[10%] h-[30%] w-[3%] rounded-full" />
      <span className={cn("text-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30cqw] leading-none", display)}>{["42", "41", "40", "39", "38", "37"][v]}</span>
    </div>
  )
}

type Ctx = { now: Episode | null; play: (e: Episode) => void }
const PodcastContext = React.createContext<Ctx>({ now: null, play: () => {} })
/** The episode in the mini player and a way to start one. Use it inside a PodcastShell. */
function usePodcast() {
  return React.useContext(PodcastContext)
}

const links: { key: PodcastPage; label: string }[] = [
  { key: "episodes", label: "Episodes" },
  { key: "hosts", label: "Hosts" },
  { key: "subscribe", label: "Subscribe" },
]

type PodcastShellProps = React.ComponentProps<"div"> & {
  /** The page being shown, so its nav link is marked current. */
  page: PodcastPage
  /** Override where pages live (used by previews). */
  hrefs?: Partial<PodcastHrefs>
}

/** The Long Table's frame: a warm header, a footer with platforms and a mini player that appears when you press play on a list. */
function PodcastShell({ page, hrefs: overrides, className, style, children, ...props }: PodcastShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [open, setOpen] = React.useState(false)
  const [now, setNow] = React.useState<Episode | null>(null)
  React.useEffect(() => {
    const classes = [podcastDisplay.variable, podcastSans.variable].filter(Boolean)
    document.body.classList.add(...classes)
    return () => document.body.classList.remove(...classes)
  }, [])
  const active = page === "episode" ? "episodes" : page
  const ctx = React.useMemo<Ctx>(() => ({ now, play: setNow }), [now])
  return (
    <PodcastContext.Provider value={ctx}>
      <div
        data-slot="podcast"
        className={cn("podcast-theme bg-background text-foreground relative min-h-dvh overflow-x-clip", now && "pb-32", podcastDisplay.variable, podcastSans.variable, className)}
        style={{ fontFamily: "var(--podcast-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
        {...props}
      >
        <style>{podcastCss}</style>
        <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <a href={hrefs.home} className="focus-visible:ring-ring/50 flex items-center gap-3 rounded-lg outline-none focus-visible:ring-[3px]">
              <span className="bg-chart-1 flex size-10 items-center justify-center rounded-full" aria-hidden="true"><span className="border-[var(--podcast-on-amber)] size-5 rounded-full border-[3px]" /></span>
              <span className={cn("text-xl", display)}>The Long Table</span>
            </a>
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {links.map((l) => <a key={l.key} href={hrefs[l.key]} aria-current={active === l.key ? "page" : undefined} className="hover:bg-accent aria-[current=page]:bg-accent focus-visible:ring-ring/50 rounded-full px-4 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px]">{l.label}</a>)}
              <a href={hrefs.subscribe} className="bg-chart-1 ms-2 inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-bold text-[var(--podcast-on-amber)] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"><Rss className="size-4" aria-hidden="true" />Follow</a>
            </nav>
            <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="podcast-mobile-menu" onClick={() => setOpen((v) => !v)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] md:hidden">{open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}</button>
          </div>
          {open && <nav id="podcast-mobile-menu" aria-label="Mobile" className="px-4 pb-4 md:hidden">{links.map((l) => <a key={l.key} href={hrefs[l.key]} className="hover:bg-accent block rounded-2xl px-4 py-3 text-lg font-semibold">{l.label}</a>)}</nav>}
        </header>
        {children}
        <footer className="bg-primary text-primary-foreground mt-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
            <div><p className={cn("text-3xl", display)}>The Long Table</p><p className="mt-3 max-w-xs opacity-80 text-pretty">A long dinner and a good conversation, every other Tuesday. Hosted by Nora Vale and Sam Okoye.</p></div>
            <div><h2 className="text-xs font-bold tracking-widest uppercase opacity-70">Listen</h2><ul className="mt-4 space-y-2.5">{["Apple Podcasts", "Spotify", "YouTube", "RSS feed"].map((p) => <li key={p}><a href={hrefs.subscribe} className="opacity-90 hover:underline">{p}</a></li>)}</ul></div>
            <div><h2 className="text-xs font-bold tracking-widest uppercase opacity-70">The show</h2><ul className="mt-4 space-y-2.5">{[["Episodes", hrefs.episodes], ["Hosts", hrefs.hosts], ["Sponsor", hrefs.subscribe], ["Contact", hrefs.hosts]].map(([l, h]) => <li key={l}><a href={h} className="opacity-90 hover:underline">{l}</a></li>)}</ul></div>
          </div>
          <p className="mx-auto max-w-6xl border-t border-current/20 px-4 py-5 text-xs opacity-70 sm:px-6">© 2026 The Long Table. Recorded in a very small kitchen.</p>
        </footer>
        {now && (
          <div role="region" aria-label="Now playing" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl">
            <AudioPlayer key={now.slug} variant="compact" title={`${now.n}. ${now.title}`} duration={now.duration} className="shadow-[0_20px_50px_-12px_rgb(0_0_0/0.4)]" />
            <button type="button" onClick={() => setNow(null)} className="bg-card hover:bg-accent focus-visible:ring-ring/50 absolute -top-3 -end-1 inline-flex size-8 items-center justify-center rounded-full border shadow-sm outline-none focus-visible:ring-[3px]" aria-label="Close the player"><X className="size-4" aria-hidden="true" /></button>
          </div>
        )}
      </div>
    </PodcastContext.Provider>
  )
}

export { PodcastShell, ShowArt, defaultHrefs as podcastDefaultHrefs, display as podcastDisplayClass, usePodcast, type PodcastHrefs, type PodcastPage, type PodcastShellProps }
