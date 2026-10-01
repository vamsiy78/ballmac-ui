// Ballmac UI: Ledger home page. https://ui.ballmac.com/templates/template-ledger
"use client"

import * as React from "react"
import { ArrowDownToLine, Cloud, Laptop, Lock, ShieldCheck, Star, Zap } from "lucide-react"

import { Devices1 } from "@/components/ballmac/blocks/devices-1/devices-1"
import { Features7 } from "@/components/ballmac/blocks/features-7/features-7"
import { Pricing4 } from "@/components/ballmac/blocks/pricing-4/pricing-4"
import { Showcase1 } from "@/components/ballmac/blocks/showcase-1/showcase-1"
import { BlurFade } from "@/components/ballmac/blur-fade"
import { Kbd } from "@/components/ballmac/kbd"
import { AppIcon } from "@/components/ballmac/mac-icons"
import { LedgerHeading, LedgerShell, type LedgerHrefs } from "@/components/ballmac/templates/ledger/ledger-theme"
import { cn } from "@/lib/utils"

const press = [
  { outlet: "Mac App Store", quote: "Editor’s Choice" },
  { outlet: "MacStories", quote: "The calmest way to run a business." },
  { outlet: "Six Colors", quote: "A Mac app that feels like one." },
  { outlet: "Daring Fireball", quote: "Fast, plain and correct." },
]

const reviews = [
  { quote: "I closed the month in an afternoon. The keyboard shortcuts alone paid for the license.", name: "Hannah Okafor", role: "Freelance designer", tone: "bg-chart-1/20" },
  { quote: "It’s the first accounting app that didn’t make me feel like I needed an accountant to use it.", name: "Marcus Lindqvist", role: "Founder, Studio Fjord", tone: "bg-chart-2/20" },
  { quote: "Works offline on the train, syncs when I’m home. Exactly how software should behave.", name: "Priya Raman", role: "Independent consultant", tone: "bg-chart-4/20" },
]

const card = "bg-card rounded-3xl border p-7 shadow-[0_1px_2px_0_rgb(0_0_0/0.04)]"

type LedgerHomeProps = React.ComponentProps<"div"> & { hrefs?: Partial<LedgerHrefs> }

/** The Ledger home page: an interactive Mac desktop, a menu-bar tour, a feature bento, devices, reviews and pricing. */
function LedgerHome({ hrefs, ...props }: LedgerHomeProps) {
  return (
    <LedgerShell page="home" hrefs={hrefs} {...props}>
      <main>
        <section className="px-4 pt-16 text-center sm:px-6 sm:pt-24">
          <BlurFade>
            <p className="text-chart-1 text-sm font-semibold">Ledger 2.4 · Now with approvals</p>
            <LedgerHeading as="h1" className="mx-auto mt-4 max-w-3xl text-5xl leading-[1.02] sm:text-7xl">
              Your books, kept <em>beautifully</em>.
            </LedgerHeading>
            <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg text-pretty sm:text-xl">
              Invoices, expenses and reports in a native Mac app that’s fast, private and a pleasure to open on a Monday.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
              <a href={hrefs?.download ?? "/ledger/download"} className="bg-chart-1 focus-visible:ring-ring/50 inline-flex h-12 items-center gap-2 rounded-full px-6 font-medium text-[var(--ledger-on-accent)] outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">
                <ArrowDownToLine className="size-4" aria-hidden="true" /> Download for Mac
              </a>
              <a href={hrefs?.pricing ?? "/ledger/pricing"} className="text-chart-1 focus-visible:ring-ring/50 rounded-md font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">
                See pricing ›
              </a>
            </div>
            <p className="text-muted-foreground mt-5 text-xs">Free for 14 days · macOS 13 or later · Apple silicon and Intel</p>
          </BlurFade>
          <BlurFade className="mx-auto mt-14 max-w-6xl text-left" delay={0.12}>
            <Showcase1 app="Ledger" height="38rem" className="shadow-[0_40px_100px_-30px_rgb(0_0_0/0.45)]" />
          </BlurFade>
        </section>

        <section aria-label="Press" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <ul className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {press.map((p) => (
              <li key={p.outlet} className="bg-card p-6 text-center">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{p.outlet}</p>
                <p className="mt-2 text-sm font-medium text-pretty [font-family:var(--ledger-serif),ui-serif,Georgia,serif] text-lg italic">“{p.quote}”</p>
              </li>
            ))}
          </ul>
        </section>

        <Features7 title="Always one keystroke away." />

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <LedgerHeading className="text-4xl sm:text-5xl">A real Mac app, <em>all the way down</em>.</LedgerHeading>
            <p className="text-muted-foreground mt-4 text-lg text-pretty">Native, not wrapped. It uses the parts of macOS you already know.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-6">
            <div className={cn(card, "md:col-span-3")}>
              <Zap className="text-chart-3 size-6" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-semibold tracking-tight">Keyboard first</h3>
              <p className="text-muted-foreground mt-2 text-pretty">Everything has a shortcut. Learn four and you rarely touch the mouse.</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {[["New invoice", ["⌘", "N"]], ["Jump to customer", ["⌘", "K"]], ["Mark as paid", ["⌃", "⌘", "P"]], ["Export report", ["⇧", "⌘", "E"]]].map(([label, keys]) => (
                  <li key={label as string} className="flex items-center justify-between">
                    {label as string}
                    <span className="flex gap-1">{(keys as string[]).map((k) => <Kbd key={k}>{k}</Kbd>)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={cn(card, "md:col-span-3")}>
              <Cloud className="text-chart-1 size-6" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-semibold tracking-tight">Local first, iCloud second</h3>
              <p className="text-muted-foreground mt-2 text-pretty">Your data lives on your Mac and works with no connection. Sync across devices with your own iCloud.</p>
              <div className="bg-secondary/60 mt-6 flex items-center justify-between gap-3 rounded-2xl px-5 py-4 text-sm">
                <span className="flex items-center gap-2"><Laptop className="size-4" aria-hidden="true" /> MacBook Pro</span>
                <span className="text-muted-foreground flex-1 border-t border-dashed" aria-hidden="true" />
                <span className="text-chart-2 flex items-center gap-1.5 text-xs font-medium"><span className="bg-chart-2 size-1.5 rounded-full" aria-hidden="true" /> Synced just now</span>
                <span className="text-muted-foreground flex-1 border-t border-dashed" aria-hidden="true" />
                <span className="flex items-center gap-2"><Cloud className="size-4" aria-hidden="true" /> iCloud</span>
              </div>
            </div>
            <div className={cn(card, "md:col-span-2")}>
              <Lock className="text-chart-4 size-6" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-semibold tracking-tight">Private by design</h3>
              <p className="text-muted-foreground mt-2 text-pretty">No account, no analytics, no server that holds your books.</p>
              <p className="mt-6 text-5xl font-semibold tracking-[-0.04em]">0</p>
              <p className="text-muted-foreground text-sm">trackers in the app</p>
            </div>
            <div className={cn(card, "md:col-span-4")}>
              <ShieldCheck className="text-chart-2 size-6" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-semibold tracking-tight">Shortcuts and AppleScript</h3>
              <p className="text-muted-foreground mt-2 max-w-md text-pretty">Create an invoice from a calendar event, or mark paid from a Stripe webhook. Ledger speaks the Mac’s automation language.</p>
              <pre className="bg-secondary/60 mt-6 overflow-x-auto rounded-2xl p-4 font-mono text-[13px] leading-6" tabIndex={0}>{`tell application "Ledger"
  set inv to make new invoice
  set customer of inv to "Northwind"
  mark inv as paid
end tell`}</pre>
            </div>
          </div>
        </section>

        <Devices1 title="Mac first. Everywhere else, too." />

        <section aria-labelledby="ledger-reviews" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 id="ledger-reviews" className="sr-only">Reviews</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {reviews.map((r) => (
              <li key={r.name} className={cn(card, "flex flex-col")}>
                <div className="text-chart-3 flex gap-0.5" role="img" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-4 fill-current" aria-hidden="true" />)}</div>
                <blockquote className="mt-4 flex-1 text-[17px] leading-relaxed text-pretty">“{r.quote}”</blockquote>
                <footer className="mt-6 flex items-center gap-3 text-sm">
                  <span className={cn("flex size-9 items-center justify-center rounded-full text-xs font-semibold", r.tone)} aria-hidden="true">{r.name.split(" ").map((w) => w[0]).join("")}</span>
                  <span><span className="block font-medium">{r.name}</span><span className="text-muted-foreground">{r.role}</span></span>
                </footer>
              </li>
            ))}
          </ul>
        </section>

        <Pricing4 title="Buy it once, or stay current." />

        <section className="px-4 pb-24 text-center sm:px-6">
          <AppIcon size={88} tone="blue" className="mx-auto"><span className="text-4xl font-bold">L</span></AppIcon>
          <LedgerHeading className="mx-auto mt-8 max-w-xl text-4xl sm:text-5xl">Get your Monday <em>back</em>.</LedgerHeading>
          <p className="text-muted-foreground mx-auto mt-4 max-w-md text-lg text-pretty">Download Ledger and try everything free for 14 days.</p>
          <a href={hrefs?.download ?? "/ledger/download"} className="bg-chart-1 focus-visible:ring-ring/50 mt-8 inline-flex h-12 items-center gap-2 rounded-full px-6 font-medium text-[var(--ledger-on-accent)] outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">
            <ArrowDownToLine className="size-4" aria-hidden="true" /> Download for Mac
          </a>
        </section>
      </main>
    </LedgerShell>
  )
}

export { LedgerHome, type LedgerHomeProps }
