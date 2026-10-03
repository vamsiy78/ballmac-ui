// Ballmac UI: Pocket template shell. https://ui.ballmac.com/templates/template-pocket
"use client"

import * as React from "react"
import { Apple, Bell, CreditCard, Home as HomeIcon, Menu, PiggyBank, Play, QrCode, Send, X } from "lucide-react"

import { PhoneFrame } from "@/components/ballmac/phone-frame"
import { Switch } from "@/components/ballmac/switch"
import { money, transactions } from "@/components/ballmac/templates/pocket/pocket-data"
import { pocketSans } from "@/components/ballmac/templates/pocket/pocket-fonts"
import { cn } from "@/lib/utils"

type PocketPage = "home" | "features" | "pricing" | "security" | "download"
type PocketHrefs = Record<PocketPage, string>

const defaultHrefs: PocketHrefs = { home: "/pocket", features: "/pocket/features", pricing: "/pocket/pricing", security: "/pocket/security", download: "/pocket/download" }

/** Pocket's palette: mint paper, navy ink, cobalt and one loud lime. Dark mode is midnight with the lime turned up. */
const pocketCss = `
.pocket-theme,body:not(:has([data-gallery])):has(.pocket-theme){--background:oklch(0.985 0.012 165);--foreground:oklch(0.2 0.06 265);--card:oklch(1 0 0);--card-foreground:oklch(0.2 0.06 265);--popover:oklch(1 0 0);--popover-foreground:oklch(0.2 0.06 265);--primary:oklch(0.47 0.22 267);--primary-foreground:oklch(0.99 0.005 165);--secondary:oklch(0.95 0.025 165);--secondary-foreground:oklch(0.2 0.06 265);--muted:oklch(0.95 0.02 165);--muted-foreground:oklch(0.45 0.05 265);--accent:oklch(0.93 0.04 150);--accent-foreground:oklch(0.2 0.06 265);--border:oklch(0.2 0.06 265 / 12%);--input:oklch(0.2 0.06 265 / 20%);--ring:oklch(0.55 0.22 267);--surface:oklch(0.965 0.02 165);--destructive:oklch(0.52 0.21 27);--chart-1:oklch(0.9 0.2 125);--chart-2:oklch(0.72 0.17 30);--chart-3:oklch(0.62 0.2 300);--chart-4:oklch(0.78 0.13 200);--chart-5:oklch(0.85 0.14 85);--pocket-ink:oklch(0.2 0.06 265);--pocket-on-lime:oklch(0.2 0.06 265);--pocket-navy:oklch(0.2 0.07 265);--pocket-on-navy:oklch(0.98 0.01 165);--radius:1.5rem}
.dark .pocket-theme,.dark body:not(:has([data-gallery])):has(.pocket-theme){--background:oklch(0.16 0.045 265);--foreground:oklch(0.96 0.015 165);--card:oklch(0.21 0.05 265);--card-foreground:oklch(0.96 0.015 165);--popover:oklch(0.23 0.05 265);--popover-foreground:oklch(0.96 0.015 165);--primary:oklch(0.9 0.2 125);--primary-foreground:oklch(0.2 0.06 265);--secondary:oklch(0.26 0.05 265);--secondary-foreground:oklch(0.96 0.015 165);--muted:oklch(0.25 0.05 265);--muted-foreground:oklch(0.76 0.04 250);--accent:oklch(0.3 0.06 265);--accent-foreground:oklch(0.96 0.015 165);--border:oklch(1 0 0 / 11%);--input:oklch(1 0 0 / 16%);--ring:oklch(0.9 0.2 125);--surface:oklch(0.19 0.047 265);--destructive:oklch(0.7 0.19 27);--chart-1:oklch(0.9 0.2 125);--chart-2:oklch(0.76 0.15 30);--chart-3:oklch(0.74 0.17 300);--chart-4:oklch(0.8 0.12 200);--chart-5:oklch(0.86 0.13 85);--pocket-navy:oklch(0.12 0.045 265)}
body:not(:has([data-gallery])):has(.pocket-theme){font-family:var(--pocket-sans),ui-sans-serif,system-ui,sans-serif}
@keyframes pocket-bob{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-8px) rotate(var(--r,0deg))}}
.pocket-bob{animation:pocket-bob 5s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.pocket-bob{animation:none}}
`

const display = "font-black tracking-[-0.035em]"
const onLime = "text-[var(--pocket-on-lime)]"
const txTone = ["bg-chart-1", "bg-chart-5", "bg-chart-4", "bg-chart-2", "bg-chart-3"]

/** The Pocket app inside a phone: balance, quick actions and three tabs (Home, Card, Save). Tap around. */
function PocketApp({ className, defaultTab = "home" }: { className?: string; defaultTab?: "home" | "card" | "save" }) {
  const [tab, setTab] = React.useState<"home" | "card" | "save">(defaultTab)
  const [frozen, setFrozen] = React.useState(false)
  const id = React.useId()
  const tabs = [["home", "Home", HomeIcon], ["card", "Card", CreditCard], ["save", "Save", PiggyBank]] as const
  return (
    <PhoneFrame screenWidth={390} className={cn("w-[min(100%,290px)]", className)} screenClassName="pocket-theme bg-background text-foreground">
      <div className="flex h-full flex-col text-[15px]" style={{ fontFamily: "var(--pocket-sans), ui-sans-serif, system-ui, sans-serif" }}>
        <div className="flex items-center justify-between px-5 pt-2">
          <div className="flex items-center gap-3"><span aria-hidden="true" className="bg-chart-3 flex size-10 items-center justify-center rounded-full font-black text-white">M</span><div><p className="text-muted-foreground text-xs">Good morning</p><p className="font-extrabold">Maya</p></div></div>
          <span aria-hidden="true" className="bg-secondary flex size-10 items-center justify-center rounded-full"><Bell className="size-5" /></span>
        </div>
        <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${tab}`} className="min-h-0 flex-1 overflow-hidden px-5 pt-4">
          {tab === "home" && (
            <>
              <div className="bg-primary text-primary-foreground rounded-3xl p-5">
                <p className="text-sm font-semibold">Total balance</p>
                <p className={cn("mt-1 text-[40px] leading-none tabular-nums", display)}>$12,480<span className="text-2xl opacity-100">.62</span></p>
                <p className="bg-card text-card-foreground mt-3 inline-block rounded-full px-3 py-1 text-xs font-extrabold">+$212.40 this week</p>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs font-bold">{[["Send", Send], ["Request", Apple], ["Top up", QrCode], ["More", Play]].map(([l, Icon]) => { const I = Icon as typeof Send; return <div key={l as string}><span aria-hidden="true" className="bg-secondary mx-auto flex size-12 items-center justify-center rounded-2xl"><I className="size-5" /></span><span className="mt-1 block">{l as string}</span></div> })}</div>
              <p className="mt-4 text-sm font-extrabold">Recent</p>
              <ul className="mt-2 grid gap-2.5">{transactions.slice(0, 4).map((t) => <li key={t.name} className="flex items-center gap-3"><span aria-hidden="true" className={cn("flex size-10 items-center justify-center rounded-full text-base text-[var(--pocket-on-lime)]", txTone[t.tone])}>{t.emoji}</span><span className="min-w-0 flex-1"><span className="block truncate font-bold">{t.name}</span><span className="text-muted-foreground block text-xs">{t.detail}</span></span><span className={cn("font-extrabold tabular-nums", t.amount > 0 && "text-primary")}>{t.amount > 0 ? "+" : ""}{money(t.amount)}</span></li>)}</ul>
            </>
          )}
          {tab === "card" && (
            <>
              <div className={cn("relative aspect-[1.6] overflow-hidden rounded-3xl p-5 text-[var(--pocket-on-navy)] transition-opacity motion-reduce:transition-none", "bg-[var(--pocket-navy)]", frozen && "opacity-50")}>
                <div aria-hidden="true" className="bg-chart-1 absolute -end-10 -bottom-10 aspect-square w-40 rounded-full" /><div aria-hidden="true" className="bg-chart-3 absolute -end-2 -bottom-16 aspect-square w-32 rounded-full" />
                <p className={cn("relative text-xl", display)}>pocket</p><p className="relative mt-8 text-lg font-bold tracking-widest tabular-nums">•••• 4821</p><p className="relative mt-1 text-xs">MAYA OKAFOR · 09/29</p>
                {frozen && <span className="bg-chart-4 absolute top-4 end-4 rounded-full px-3 py-1 text-xs font-extrabold text-[var(--pocket-on-lime)]">Frozen</span>}
              </div>
              <div className="bg-secondary mt-4 flex items-center justify-between rounded-2xl p-4"><span><span className="block font-extrabold">Freeze card</span><span className="text-muted-foreground text-xs">Stops every payment instantly</span></span><Switch checked={frozen} onCheckedChange={setFrozen} aria-label="Freeze card" /></div>
              <dl className="mt-3 grid gap-2 text-sm">{[["Daily limit", "$2,000"], ["Online payments", "On"], ["Contactless", "On"]].map(([k, v]) => <div key={k} className="bg-card flex justify-between rounded-xl border px-4 py-3"><dt className="text-muted-foreground">{k}</dt><dd className="font-extrabold">{v}</dd></div>)}</dl>
            </>
          )}
          {tab === "save" && (
            <>
              <div className="bg-chart-1 rounded-3xl p-5 text-[var(--pocket-on-lime)]"><p className="text-sm font-bold">Holiday fund</p><p className={cn("mt-1 text-4xl tabular-nums", display)}>$1,240</p><div className="mt-3 h-3 overflow-hidden rounded-full bg-black/15" role="progressbar" aria-label="Holiday fund progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={62}><div className="h-full w-[62%] rounded-full bg-[var(--pocket-ink)]" /></div><p className="mt-2 text-xs font-bold">62% of $2,000 · Lisbon, June</p></div>
              <p className="mt-4 text-sm font-extrabold">Round-ups this month</p>
              <p className={cn("text-3xl tabular-nums", display)}>$37.20</p>
              <ul className="mt-3 grid gap-2">{[["Corner Café", "+$0.20"], ["City Transit", "+$0.25"], ["Market Hall", "+$0.88"]].map(([n, a]) => <li key={n} className="bg-card flex justify-between rounded-xl border px-4 py-3"><span className="font-bold">{n}</span><span className="text-primary font-extrabold tabular-nums">{a}</span></li>)}</ul>
            </>
          )}
        </div>
        <div role="tablist" aria-label="App sections" className="bg-card mx-4 mb-7 mt-2 grid grid-cols-3 rounded-full border p-1">
          {tabs.map(([k, label, Icon]) => <button key={k} type="button" role="tab" id={`${id}-${k}`} aria-selected={tab === k} aria-controls={`${id}-panel`} onClick={() => setTab(k)} className="aria-selected:bg-primary aria-selected:text-primary-foreground focus-visible:ring-ring/50 flex h-10 items-center justify-center gap-1.5 rounded-full text-sm font-extrabold outline-none focus-visible:ring-2"><Icon className="size-4" aria-hidden="true" />{label}</button>)}
        </div>
      </div>
    </PhoneFrame>
  )
}

/** App Store and Google Play buttons that go to the download page. */
function StoreButtons({ href, className }: { href: string; className?: string }) {
  const b = "bg-[var(--pocket-navy)] text-[var(--pocket-on-navy)] focus-visible:ring-ring inline-flex h-14 items-center gap-3 rounded-2xl px-5 outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <a href={href} className={b}><Apple className="size-7" aria-hidden="true" /><span className="text-start leading-tight"><span className="block text-[11px] font-medium">Download on the</span><span className="block text-lg font-extrabold">App Store</span></span></a>
      <a href={href} className={b}><Play className="size-7" aria-hidden="true" /><span className="text-start leading-tight"><span className="block text-[11px] font-medium">Get it on</span><span className="block text-lg font-extrabold">Google Play</span></span></a>
    </div>
  )
}

const links: { key: PocketPage; label: string }[] = [{ key: "features", label: "Features" }, { key: "pricing", label: "Pricing" }, { key: "security", label: "Security" }]

type PocketShellProps = React.ComponentProps<"div"> & {
  /** The page being shown, so its nav link is marked current. */
  page: PocketPage
  /** Override where pages live (used by previews). */
  hrefs?: Partial<PocketHrefs>
}

/** Pocket's frame: a floating pill header, and a navy footer with a giant wordmark. */
function PocketShell({ page, hrefs: overrides, className, style, children, ...props }: PocketShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const classes = [pocketSans.variable].filter(Boolean)
    document.body.classList.add(...classes)
    return () => document.body.classList.remove(...classes)
  }, [])
  return (
    <div
      data-slot="pocket"
      className={cn("pocket-theme bg-background text-foreground relative min-h-dvh overflow-x-clip", pocketSans.variable, className)}
      style={{ fontFamily: "var(--pocket-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{pocketCss}</style>
      <header className="sticky top-3 z-40 px-3 sm:px-6">
        <div className="bg-card/90 mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border pe-2 ps-5 shadow-sm backdrop-blur-xl">
          <a href={hrefs.home} className={cn("focus-visible:ring-ring/50 flex items-center gap-2 rounded-full text-2xl outline-none focus-visible:ring-[3px]", display)}><span aria-hidden="true" className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-xl text-lg">p</span>pocket</a>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">{links.map((l) => <a key={l.key} href={hrefs[l.key]} aria-current={page === l.key ? "page" : undefined} className="hover:bg-accent aria-[current=page]:bg-accent focus-visible:ring-ring/50 rounded-full px-4 py-2 text-sm font-extrabold outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none">{l.label}</a>)}</nav>
          <div className="flex items-center gap-1">
            <a href={hrefs.download} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex h-11 items-center rounded-full px-5 text-sm font-extrabold outline-none transition-transform hover:scale-[1.03] focus-visible:ring-[3px] motion-reduce:transition-none motion-reduce:hover:scale-100">Get the app</a>
            <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="pocket-mobile-menu" onClick={() => setOpen((v) => !v)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] md:hidden">{open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}</button>
          </div>
        </div>
        {open && <nav id="pocket-mobile-menu" aria-label="Mobile" className="bg-card mx-auto mt-2 max-w-6xl rounded-3xl border p-2 md:hidden">{links.map((l) => <a key={l.key} href={hrefs[l.key]} className="hover:bg-accent block rounded-2xl px-4 py-3 text-lg font-extrabold">{l.label}</a>)}</nav>}
      </header>
      {children}
      <footer className="mt-24 overflow-hidden bg-[var(--pocket-navy)] text-[var(--pocket-on-navy)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-16 pb-6 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div><p className="max-w-xs text-xl font-bold text-pretty">Money that keeps up with you.</p><StoreButtons href={hrefs.download} className="mt-6 [&>a]:bg-white/10" /></div>
          {[["Product", [["Features", hrefs.features], ["Pricing", hrefs.pricing], ["Download", hrefs.download]]], ["Trust", [["Security", hrefs.security], ["Status", hrefs.security], ["Bug bounty", hrefs.security]]], ["Company", [["About", hrefs.home], ["Careers", hrefs.home], ["Press", hrefs.home]]]].map(([t, items]) => <div key={t as string}><h2 className="text-xs font-extrabold tracking-[0.14em] uppercase">{t as string}</h2><ul className="mt-4 grid gap-2.5">{(items as string[][]).map(([l, h]) => <li key={l}><a href={h} className="hover:underline">{l}</a></li>)}</ul></div>)}
        </div>
        <p aria-hidden="true" className={cn("text-chart-1 -mb-[0.18em] select-none text-center text-[clamp(6rem,26vw,22rem)] leading-none", display)}>pocket</p>
        <p className="mx-auto max-w-6xl px-4 pb-6 text-xs sm:px-6">Pocket is a financial technology company, not a bank. Banking services by Harbor Bank, N.A., Member FDIC. © 2026 Pocket Labs.</p>
      </footer>
    </div>
  )
}

export { PocketApp, PocketShell, StoreButtons, defaultHrefs as pocketDefaultHrefs, display as pocketDisplayClass, onLime as pocketOnLime, type PocketHrefs, type PocketPage, type PocketShellProps }
