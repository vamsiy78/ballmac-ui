// Ballmac UI: Publication template shell. https://ui.ballmac.com/templates/template-publication
"use client"

import * as React from "react"
import { Menu, Search, X } from "lucide-react"

import { pubBody, pubDisplay, pubSans } from "@/components/ballmac/templates/publication/publication-fonts"
import { sections } from "@/components/ballmac/templates/publication/publication-data"
import { cn } from "@/lib/utils"
import { Media, type MediaSource } from "@/components/ballmac/media"

type PublicationPage = "home" | "article" | "section" | "author" | "issues"
type PublicationHrefs = Record<PublicationPage, string>

const defaultHrefs: PublicationHrefs = { home: "/publication", article: "/publication/essays/the-unfinished-city", section: "/publication/essays", author: "/publication/authors/ines", issues: "/publication/issues" }

/** Publication's palette: newsprint and ink with a deep red. Dark mode is sepia night, for reading after dark. */
const publicationCss = `
.publication-theme,body:not(:has([data-gallery])):has(.publication-theme){--publication-on-accent:oklch(0.18 0.01 60);--background:oklch(0.975 0.014 85);--foreground:oklch(0.18 0.01 60);--card:oklch(0.988 0.01 85);--card-foreground:oklch(0.18 0.01 60);--popover:oklch(0.988 0.01 85);--popover-foreground:oklch(0.18 0.01 60);--primary:oklch(0.18 0.01 60);--primary-foreground:oklch(0.975 0.014 85);--secondary:oklch(0.945 0.02 85);--secondary-foreground:oklch(0.18 0.01 60);--muted:oklch(0.945 0.02 85);--muted-foreground:oklch(0.45 0.02 70);--accent:oklch(0.93 0.025 80);--accent-foreground:oklch(0.18 0.01 60);--border:oklch(0.18 0.01 60 / 18%);--input:oklch(0.18 0.01 60 / 28%);--ring:oklch(0.45 0.17 28);--surface:oklch(0.958 0.016 85);--destructive:oklch(0.5 0.2 27);--chart-1:oklch(0.45 0.17 28);--chart-2:oklch(0.4 0.07 240);--chart-3:oklch(0.78 0.12 85);--chart-4:oklch(0.46 0.1 150);--chart-5:oklch(0.62 0.11 50);--radius:0.125rem}
.dark .publication-theme,.dark body:not(:has([data-gallery])):has(.publication-theme){--publication-on-accent:oklch(0.18 0.01 60);--background:oklch(0.17 0.012 60);--foreground:oklch(0.94 0.02 85);--card:oklch(0.2 0.013 60);--card-foreground:oklch(0.94 0.02 85);--popover:oklch(0.22 0.014 60);--popover-foreground:oklch(0.94 0.02 85);--primary:oklch(0.94 0.02 85);--primary-foreground:oklch(0.18 0.01 60);--secondary:oklch(0.25 0.014 60);--secondary-foreground:oklch(0.94 0.02 85);--muted:oklch(0.24 0.014 60);--muted-foreground:oklch(0.72 0.025 80);--accent:oklch(0.28 0.016 60);--accent-foreground:oklch(0.94 0.02 85);--border:oklch(0.94 0.02 85 / 18%);--input:oklch(0.94 0.02 85 / 28%);--ring:oklch(0.74 0.14 30);--surface:oklch(0.19 0.012 60);--destructive:oklch(0.7 0.18 27);--chart-1:oklch(0.74 0.14 30);--chart-2:oklch(0.72 0.08 240);--chart-3:oklch(0.82 0.11 85);--chart-4:oklch(0.76 0.1 150);--chart-5:oklch(0.76 0.1 55)}
body:not(:has([data-gallery])):has(.publication-theme){font-family:var(--pub-sans),ui-sans-serif,system-ui,sans-serif}
`

const serif = "[font-family:var(--pub-display),ui-serif,Georgia,serif]"
const text = "[font-family:var(--pub-body),ui-serif,Georgia,serif]"

/** A duotone illustration in ink and red, standing in for photography. */
function MagArt({ variant, className, image, imageAlt }: { variant: number; className?: string; image?: MediaSource; imageAlt?: string }) {
  const v = ((variant % 6) + 6) % 6
  if (image) return <Media media={image} alt={imageAlt} fill className={cn("aspect-[4/3] w-full", className)} />
  return (
    <div aria-hidden="true" className={cn("bg-secondary relative isolate aspect-[4/3] w-full overflow-hidden", className)}>
      {v === 0 && (<><div className="bg-chart-3 absolute inset-0" />{[0, 1, 2, 3].map((i) => <div key={i} className="bg-foreground absolute bottom-0" style={{ left: `${12 + i * 20}%`, width: "14%", height: `${28 + i * 10}%` }} />)}<div className="bg-chart-1 absolute top-[14%] end-[14%] w-[14%] aspect-square rounded-full" /></>)}
      {v === 1 && (<><div className="bg-chart-2 absolute inset-0" /><div className="bg-card absolute top-[10%] start-[10%] w-[34%] aspect-square rounded-full" />{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="bg-chart-1 absolute w-[6%] aspect-square rounded-full" style={{ left: `${44 + (i % 3) * 14}%`, top: `${42 + Math.floor(i / 3) * 18}%` }} />)}</>)}
      {v === 2 && (<><div className="bg-card absolute inset-0" /><div className="absolute inset-[10%] grid grid-cols-6 gap-[2%]">{Array.from({ length: 24 }, (_, i) => <div key={i} className={cn("aspect-square", i % 7 === 0 ? "bg-chart-1" : i % 3 === 0 ? "bg-foreground" : "bg-secondary")} />)}</div></>)}
      {v === 3 && (<><div className="bg-chart-5 absolute inset-0" /><div className="bg-card absolute top-1/2 left-1/2 w-[56%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full" /><div className="bg-foreground absolute top-1/2 left-1/2 w-[34%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full" /><div className="bg-chart-1 absolute top-1/2 left-1/2 w-[12%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full" /></>)}
      {v === 4 && (<><div className="bg-foreground absolute inset-0" />{[0, 1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="bg-chart-3 absolute inset-x-[8%] h-[3px]" style={{ top: `${14 + i * 11}%`, opacity: 1 - i * 0.1 }} />)}<div className="bg-chart-1 absolute top-[22%] start-[22%] h-[40%] w-[34%] rotate-6" /></>)}
      {v === 5 && (<><div className="bg-chart-4 absolute inset-0" /><div className="bg-card absolute -end-[10%] -bottom-[30%] w-[90%] aspect-square rounded-full" /><div className="bg-foreground absolute top-[16%] start-[12%] h-[8%] w-[50%]" /><div className="bg-foreground absolute top-[30%] start-[12%] h-[8%] w-[34%]" /></>)}
    </div>
  )
}

const dateline = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date("2026-10-01"))

type PublicationShellProps = React.ComponentProps<"div"> & {
  /** The page being shown. */
  page: PublicationPage
  /** The section to mark current in the nav. */
  section?: string
  /** Override where pages live (used by previews). */
  hrefs?: Partial<PublicationHrefs>
}

/** Publication's frame: a dateline, a centred masthead between double rules, a section nav and a newsletter-first footer. */
function PublicationShell({ page, section, hrefs: overrides, className, style, children, ...props }: PublicationShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const classes = [pubDisplay.variable, pubBody.variable, pubSans.variable].filter(Boolean)
    document.body.classList.add(...classes)
    return () => document.body.classList.remove(...classes)
  }, [])
  const current = section ?? (page === "article" ? "Essays" : undefined)
  return (
    <div
      data-slot="publication"
      className={cn("publication-theme bg-background text-foreground relative min-h-dvh overflow-x-clip", pubDisplay.variable, pubBody.variable, pubSans.variable, className)}
      style={{ fontFamily: "var(--pub-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{publicationCss}</style>
      <header className="bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 text-xs sm:px-6">
          <p className="text-muted-foreground hidden sm:block">{dateline}</p>
          <p className="text-muted-foreground font-medium sm:hidden">Issue 48</p>
          <p className="flex items-center gap-4"><a href={hrefs.issues} className="hover:text-chart-1 font-semibold underline-offset-4 hover:underline">Issue 48 · Autumn 2026</a><a href="#" className="hidden font-semibold underline-offset-4 hover:underline sm:inline">Sign in</a><a href={hrefs.issues} className="bg-chart-1 text-primary-foreground focus-visible:ring-ring/50 rounded-sm px-3 py-1.5 font-bold tracking-wide uppercase outline-none focus-visible:ring-[3px]">Subscribe</a></p>
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="border-foreground border-y-4 border-double py-4 text-center">
            <a href={hrefs.home} className={cn("focus-visible:ring-ring/50 inline-block rounded text-[clamp(2.6rem,9vw,6.5rem)] leading-none tracking-[-0.02em] outline-none focus-visible:ring-[3px]", serif)}>Marginalia</a>
            <p className="text-muted-foreground mt-1 text-xs tracking-[0.2em] uppercase">A magazine of ideas, written slowly</p>
          </div>
          <div className="flex items-center justify-between border-b py-1">
            <nav aria-label="Sections" className="hidden md:block">
              <ul className="flex gap-1">{sections.map((s) => <li key={s}><a href={hrefs.section} aria-current={current === s ? "page" : undefined} className="hover:text-chart-1 aria-[current=page]:text-chart-1 focus-visible:ring-ring/50 block rounded px-3.5 py-2.5 text-sm font-semibold tracking-wide uppercase outline-none transition-colors focus-visible:ring-[3px]">{s}</a></li>)}</ul>
            </nav>
            <button type="button" aria-label={open ? "Close sections" : "Open sections"} aria-expanded={open} aria-controls="pub-mobile-nav" onClick={() => setOpen((v) => !v)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded outline-none focus-visible:ring-[3px] md:hidden">{open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}</button>
            <button type="button" aria-label="Search" className="hover:bg-accent focus-visible:ring-ring/50 ms-auto inline-flex size-10 items-center justify-center rounded outline-none focus-visible:ring-[3px]"><Search className="size-5" aria-hidden="true" /></button>
          </div>
          {open && <nav id="pub-mobile-nav" aria-label="Sections, mobile" className="border-b py-2 md:hidden">{sections.map((s) => <a key={s} href={hrefs.section} className="hover:bg-accent block rounded px-2 py-2.5 text-sm font-semibold tracking-wide uppercase">{s}</a>)}</nav>}
        </div>
      </header>
      {children}
      <footer className="bg-foreground text-background mt-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div><p className={cn("text-3xl", serif)}>Marginalia</p><p className={cn("mt-3 max-w-xs text-sm opacity-75", text)}>Independent since 2014. Funded by readers, not by clicks.</p></div>
          {[["Read", ["Essays", "Culture", "Science", "Technology"]], ["Magazine", ["Issues", "Subscribe", "Gift a year", "Back issues"]], ["About", ["Our writers", "Submissions", "Contact", "Privacy"]]].map(([t, items]) => (
            <div key={t as string}><h2 className="text-xs font-bold tracking-widest uppercase opacity-60">{t as string}</h2><ul className="mt-4 space-y-2.5">{(items as string[]).map((i) => <li key={i}><a href={i === "Issues" || i === "Subscribe" ? hrefs.issues : i === "Our writers" ? hrefs.author : hrefs.section} className="text-sm opacity-90 hover:underline">{i}</a></li>)}</ul></div>
          ))}
        </div>
        <p className="mx-auto max-w-6xl border-t border-current/20 px-4 py-5 text-xs opacity-60 sm:px-6">© 2026 Marginalia Press. All rights reserved.</p>
      </footer>
    </div>
  )
}

export { MagArt, PublicationShell, defaultHrefs as publicationDefaultHrefs, serif as pubSerifClass, text as pubTextClass, type PublicationHrefs, type PublicationPage, type PublicationShellProps }
