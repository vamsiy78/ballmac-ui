// Ballmac UI: Pocket home page. https://ui.ballmac.com/templates/template-pocket
"use client"

import * as React from "react"
import { ArrowRight, Globe2, PiggyBank, ShieldCheck, Snowflake, Users } from "lucide-react"

import { PocketApp, PocketShell, StoreButtons, pocketDisplayClass, type PocketHrefs } from "@/components/ballmac/templates/pocket/pocket-theme"
import { cn } from "@/lib/utils"

const cards = [
  { icon: PiggyBank, title: "Round-ups that add up", body: "Every purchase rounds up to the next dollar and the change lands in a pot. Most people save $40 a month without noticing.", tone: "bg-chart-1" },
  { icon: Snowflake, title: "Freeze it in one tap", body: "Lost your card? Tap once and every payment stops. Tap again and you are back.", tone: "bg-chart-4" },
  { icon: Globe2, title: "Spend anywhere", body: "Pay in 40 currencies at the real exchange rate with no fee. The rate you see is the rate you get.", tone: "bg-chart-5" },
  { icon: Users, title: "Split without the awkward", body: "Send a request for your share of dinner, with a gentle reminder so you do not have to be the one who asks.", tone: "bg-chart-2" },
]
const reviews = [
  ["It’s the first money app I open on purpose.", "Priya N.", "App Store"],
  ["Round-ups paid for our entire holiday. I did nothing.", "Tom & Lucia", "Google Play"],
  ["Froze my card from a taxi in Lisbon. Unfroze it at the hotel.", "Dev R.", "App Store"],
]

type PocketHomeProps = React.ComponentProps<"div"> & { hrefs?: Partial<PocketHrefs> }

/** The Pocket home page: a hero with a working app in a phone, four feature blocks, proof and the download buttons. */
function PocketHome({ hrefs, ...props }: PocketHomeProps) {
  const link = { features: "/pocket/features", pricing: "/pocket/pricing", download: "/pocket/download", security: "/pocket/security", ...hrefs }
  return (
    <PocketShell page="home" hrefs={hrefs} {...props}>
      <main>
        <section aria-labelledby="ph-title" className="relative isolate mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
          <div aria-hidden="true" className="bg-chart-1/50 absolute top-10 right-0 -z-10 aspect-square w-[min(80vw,34rem)] rounded-full blur-3xl" />
          <div>
            <p className="bg-card inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-extrabold"><span className="bg-chart-1 size-2.5 rounded-full" aria-hidden="true" />2.4 million pockets and counting</p>
            <h1 id="ph-title" className={cn("mt-6 text-[clamp(3.4rem,10vw,8rem)] leading-[0.88] text-balance", pocketDisplayClass)}>Money that <span className="bg-chart-1 inline-block -rotate-2 rounded-2xl px-3 text-[var(--pocket-on-lime)]">keeps up.</span></h1>
            <p className="text-muted-foreground mt-6 max-w-lg text-xl font-medium text-pretty">One app for spending, saving and splitting. No fees to open, no fees to leave, and a card you can freeze from the back of a taxi.</p>
            <StoreButtons href={link.download} className="mt-8" />
            <p className="text-muted-foreground mt-4 flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4" aria-hidden="true" />FDIC insured up to $250,000 · Rated 4.8 by 61,000 people</p>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <PocketApp className="mx-auto w-[min(100%,300px)]" />
            <p aria-hidden="true" className="bg-chart-1 pocket-bob absolute top-16 -left-2 rounded-2xl px-4 py-2 text-sm font-extrabold text-[var(--pocket-on-lime)] shadow-lg [--r:-6deg] sm:-left-10" style={{ transform: "rotate(-6deg)" }}>+$0.20 saved</p>
            <p aria-hidden="true" className="bg-card pocket-bob absolute right-0 bottom-28 flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-extrabold shadow-lg [--r:5deg] sm:-right-8" style={{ transform: "rotate(5deg)", animationDelay: "1.2s" }}><Snowflake className="text-primary size-4" />Card frozen</p>
          </div>
        </section>

        <section aria-label="Featured in" className="border-y">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-3 px-4 py-6 sm:px-6"><span className="text-muted-foreground text-xs font-extrabold tracking-[0.14em] uppercase">As seen in</span>{["The Daily Ledger", "Fast Money", "Wired Weekly", "Product Hunt"].map((n) => <span key={n} className={cn("text-muted-foreground text-xl", pocketDisplayClass)}>{n}</span>)}</div>
        </section>

        <section aria-labelledby="ph-feat" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 id="ph-feat" className={cn("max-w-2xl text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] text-balance", pocketDisplayClass)}>Everything your money app should have done years ago.</h2>
          <ul className="mt-12 grid gap-4 md:grid-cols-2">{cards.map((c) => <li key={c.title} className={cn("rounded-[2rem] p-8 text-[var(--pocket-on-lime)] sm:p-10", c.tone)}><c.icon className="size-9" aria-hidden="true" /><h3 className={cn("mt-10 text-3xl", pocketDisplayClass)}>{c.title}</h3><p className="mt-3 max-w-md text-lg font-medium text-pretty">{c.body}</p></li>)}</ul>
          <a href={link.features} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 mt-8 inline-flex h-14 items-center gap-2 rounded-full px-8 text-lg font-extrabold outline-none focus-visible:ring-[3px]">See every feature <ArrowRight className="size-5" aria-hidden="true" /></a>
        </section>

        <section aria-label="Pocket in numbers" className="bg-[var(--pocket-navy)] text-[var(--pocket-on-navy)]">
          <ul className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6">{[["$0", "to open, hold or close an account"], ["40", "currencies at the real rate"], ["11 min", "average wait for a human reply"]].map(([n, l]) => <li key={l}><span className={cn("text-chart-1 block text-[clamp(3.5rem,8vw,6rem)] leading-none", pocketDisplayClass)}>{n}</span><span className="mt-2 block text-lg font-medium">{l}</span></li>)}</ul>
        </section>

        <section aria-labelledby="ph-rev" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 id="ph-rev" className={cn("text-[clamp(2.4rem,6vw,4rem)] leading-none", pocketDisplayClass)}>People say nice things</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">{reviews.map(([q, n, s], i) => <li key={n} className={cn("bg-card rounded-[2rem] border p-8", i === 1 && "md:translate-y-6")}><p className="text-2xl leading-snug font-extrabold text-balance">“{q}”</p><p className="text-muted-foreground mt-6 text-sm font-bold">{n} · {s}</p></li>)}</ul>
        </section>

        <section aria-labelledby="ph-cta" className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <div className="bg-primary text-primary-foreground rounded-[2.5rem] px-6 py-16 text-center sm:px-14">
            <h2 id="ph-cta" className={cn("mx-auto max-w-2xl text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] text-balance", pocketDisplayClass)}>Open an account in about four minutes.</h2>
            <p className="mx-auto mt-4 max-w-md text-lg font-medium text-pretty">All you need is your phone and a photo ID. We will do the rest.</p>
            <div className="mt-8 flex justify-center"><a href={link.download} className="bg-[var(--pocket-navy)] text-[var(--pocket-on-navy)] focus-visible:ring-ring inline-flex h-14 items-center gap-2 rounded-full px-8 text-lg font-extrabold outline-none focus-visible:ring-[3px]">Get Pocket <ArrowRight className="size-5" aria-hidden="true" /></a></div>
          </div>
        </section>
      </main>
    </PocketShell>
  )
}

export { PocketHome, type PocketHomeProps }
