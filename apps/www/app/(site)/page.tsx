import { ArrowRight, ArrowUpRight, Check, ChevronDown, Clock, KeyRound, Layers, RefreshCw, ShieldCheck, Sparkles, Users } from "lucide-react"
import * as React from "react"
import { Instrument_Serif } from "next/font/google"
import type { Metadata } from "next"
import Link from "@/components/site/link"

import { AiBento } from "@/components/home/ai-bento"
import { KineticTitle } from "@/components/landing/kinetic-title"
import { ScreenBento, type BentoScreen } from "@/components/landing/screen-bento"
import { Seal } from "@/components/landing/seal"
import { TemplateFan, type FanCard } from "@/components/landing/template-fan"
import { CheckoutLink } from "@/components/pro/checkout-link"
import { MonthlyOption } from "@/components/pro/monthly-option"
import { CopyButton } from "@/components/site/copy-button"
import { LeftPhrase } from "@/components/site/founding-text"
import { SiteJsonLd } from "@/components/site/site-jsonld"
import { FOUNDERS_EMAIL } from "@/lib/founders"
import { regularPrice } from "@/lib/limited-offer"
import { getOffer } from "@/lib/offer"
import { PRO_LICENCE_PATH } from "@/lib/pro-licence"
import { REFUND_FIX_DAYS, REFUND_PATH, REFUND_REPORT_DAYS } from "@/lib/pro-refund"
import { TEAM_CHECKOUT, TEAM_PRICE, TEAM_SEATS } from "@/lib/pro-team"
import { formatMeasured, measured, overview } from "@/lib/quality"
import { getBlocks, getComponents, getItem, getTemplates, isPro } from "@/lib/registry"
import { thumbFor } from "@/lib/thumbs"
import { cn } from "@/lib/utils"

const serif = Instrument_Serif({ weight: "400", subsets: ["latin"] })

export function generateMetadata(): Metadata {
  const blocks = getBlocks()
  const free = blocks.filter((b) => !isPro(b)).length
  return {
    description: `${blocks.length} app screens for shadcn, React and Tailwind, from billing to AI agent consoles. ${free} are free and MIT licensed; install any with one command and own the code.`,
    alternates: { canonical: "/" },
  }
}

/** The bento, in order of the grid's tiles. Big hero captures where we have them (2560 wide), gallery thumbnails otherwise. */
const BENTO: { name: string; title: string; dark?: boolean }[] = [
  { name: "login-1", title: "Sign in with SSO" },
  { name: "dashboard-pro-1", title: "Revenue dashboard", dark: true },
  { name: "agent-16", title: "Cited AI answers" },
  { name: "kanban-pro-1", title: "Swimlane board" },
  { name: "floorplan-1", title: "Restaurant floor", dark: true },
  { name: "mail-pro-1", title: "Triage inbox" },
  { name: "calendar-pro-1", title: "Room timeline", dark: true },
  { name: "billing-pro-1", title: "Plan and usage" },
]
const HERO_SHOTS = new Set(["dashboard-pro-1", "agent-16", "kanban-pro-1", "billing-pro-1", "mail-pro-1", "calendar-pro-1"])
const FAN = ["template-studio", "template-atlas", "template-launch"]

/** Section headings: the large, tightly set title and the grey line under it. */
function Heading({ id, title, sub, className }: { id: string; title: React.ReactNode; sub?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bm-reveal mx-auto mb-12 max-w-2xl text-center", className)}>
      <h2 id={id} className="text-[2.1rem] leading-[1.05] font-semibold tracking-[-0.055em] text-balance sm:text-5xl">{title}</h2>
      {sub && <p className="text-muted-foreground mx-auto mt-3 max-w-md text-[15.5px] leading-snug text-pretty sm:text-[17px]">{sub}</p>}
    </div>
  )
}

/** A thin dashed rule with a small caps label in the middle, as used between the credit rows. */
function Rule({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground/80 my-10 flex items-center gap-4 text-[11px] font-medium tracking-[0.12em] uppercase before:h-px before:flex-1 before:border-t before:border-dashed before:border-current/40 after:h-px after:flex-1 after:border-t after:border-dashed after:border-current/40">
      {children}
    </p>
  )
}

export default async function Home() {
  const components = getComponents()
  const blocks = getBlocks()
  const templates = getTemplates()
  const proBlocks = blocks.filter(isPro)
  const freeBlocks = blocks.filter((b) => !isPro(b))
  const freeComponents = components.filter((c) => !isPro(c)).length
  const freeTemplates = templates.filter((t) => !isPro(t))
  const aiComponents = components.filter((c) => c.category === "ai").length
  const now = new Date()
  const offer = await getOffer(now)
  const founding = offer.founding
  const quality = overview()

  const proPrice = offer.onSale && offer.price ? `$${offer.price}` : null
  const regular = !founding && offer.onSale ? regularPrice(offer.price) : null
  const teamHref = TEAM_CHECKOUT || `mailto:${FOUNDERS_EMAIL}?subject=${encodeURIComponent("Team licence for Ballmac UI Pro")}`
  const command = "npx shadcn@latest add @ballmac/dashboard-1"

  const bento = BENTO.flatMap(({ name, title, dark }): BentoScreen[] => {
    const item = getItem(name)
    if (!item) return []
    const pro = isPro(item)
    const big = HERO_SHOTS.has(name)
    const src = big ? `/home/screens/${name}` : thumbFor(name, pro ? "pro" : "free")
    if (!src) return []
    return [{ name, title, href: `/blocks/${name}`, pro, src, dark, alt: item.description ?? title, width: big ? 2560 : 800, height: big ? 1600 : 400 }]
  })
  const fan = FAN.flatMap((name): FanCard[] => {
    const item = getItem(name)
    const src = item ? thumbFor(name, isPro(item) ? "pro" : "free") : undefined
    return item && src ? [{ name, title: (item.title ?? name).split(":")[0], src, pro: isPro(item) }] : []
  })

  const FAQ: { q: string; a: React.ReactNode; text?: string }[] = [
    { q: "What is Ballmac UI?", a: `A shadcn registry of ${blocks.length} app screens and ${components.length} components for React and Tailwind. ${freeBlocks.length} screens and ${freeComponents} components are free under the MIT licence; Pro adds the rest. You install one with a single command and the code is yours.` },
    { q: "Will it fit my project?", a: "It installs with the shadcn CLI, so it goes wherever shadcn does: Next.js, Vite, Remix." },
    { q: "Can I change it?", a: "All of it. It is plain source in your repo, and ballmac update merges our fixes into your edits." },
    { q: "Is the quality real?", a: <>Every item is loaded in a real browser and the results are public, failures included. <Link href="/quality" className="text-foreground underline underline-offset-4">See them</Link>.</>, text: "Every item is loaded in a real browser in light, dark, phone width, reduced motion and right to left, and the results are public at ui.ballmac.com/quality, failures included." },
    { q: "Free for client work?", a: "Yes. Free items are MIT licensed, for personal, client and commercial projects." },
    { q: "What can I do with Pro or Team?", a: <>Unlimited apps, yours or your clients&rsquo;. No reselling, sharing or AI training. Pro is one person, Team up to {TEAM_SEATS}. <a href={PRO_LICENCE_PATH} className="text-foreground underline underline-offset-4">Read the licence</a>.</>, text: `Unlimited apps, yours or your clients’. No reselling, sharing or AI training. Pro is one person, Team up to ${TEAM_SEATS}.` },
    { q: "What if Pro does not work?", a: <>Tell us within {REFUND_REPORT_DAYS} days. If we cannot fix it within {REFUND_FIX_DAYS} days of your request, you get a full refund. <a href={REFUND_PATH} className="text-foreground underline underline-offset-4">Refund policy</a>.</>, text: `Tell us within ${REFUND_REPORT_DAYS} days. If we cannot fix it within ${REFUND_FIX_DAYS} days of your request, you get a full refund.` },
  ]

  const proFeatures: [React.ComponentType<{ className?: string }>, string][] = [
    [Layers, `All ${proBlocks.length} Pro screens`],
    [Sparkles, "3 starter apps and Figma tokens"],
    [KeyRound, "Private registry for the CLI and your agent"],
    [RefreshCw, "Every future Pro update"],
    [ShieldCheck, `${REFUND_FIX_DAYS}-day fix-or-refund`],
  ]
  const teamFeatures: [React.ComponentType<{ className?: string }>, string][] = [
    [Layers, "Everything in Pro"],
    [Users, `Up to ${TEAM_SEATS} people, one key`],
    [KeyRound, "One key for the team and CI"],
    [Clock, "Company name and tax ID on the invoice"],
  ]

  return (
    <>
      <SiteJsonLd faq={FAQ.map((f) => ({ q: f.q, text: f.text ?? (typeof f.a === "string" ? f.a : "") })).filter((f) => f.text)} libraryDescription={`${freeBlocks.length} finished app screens and ${freeComponents} components for React and Tailwind, free under the MIT licence.`} />

      {/* 1. Hero: the words roll into place, then one command and one button. The offer, when there is one, is a single quiet line above. */}
      <section aria-labelledby="hero-h" className="relative -mt-14 flex min-h-[100svh] flex-col items-center justify-center px-5 pt-24 pb-16 text-center">
        {offer.onSale && proPrice && (
          <Link href="/pricing?utm_source=ballmac-ui&utm_medium=home-hero&utm_campaign=offer#plans" className="bm-hero-rise bg-frame hover:bg-frame/70 focus-visible:ring-ring/50 mb-12 inline-flex items-center gap-2 rounded-full py-1 ps-1 pe-3 text-[12.5px] outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none">
            <span className="bg-background rounded-full px-2 py-0.5 text-[11px] font-medium shadow-[0_1px_2px_rgb(0_0_0/0.06)]">Pro</span>
            <span className="text-muted-foreground">
              {founding ? (
                <>Founding price <span className="text-foreground font-medium">{proPrice}</span> once{founding.endsAt ? <>, <LeftPhrase endsAt={founding.endsAt} at={now.getTime()} /></> : null}</>
              ) : (
                <><span className="text-foreground font-medium">{proPrice} once</span>{regular ? <> <s className="opacity-70"><span className="sr-only">regular price </span>${regular}</s></> : null}, no subscription</>
              )}
            </span>
            <ArrowRight className="text-muted-foreground size-3.5 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        )}
        <p className={cn(serif.className, "bm-hero-rise text-[15px] tracking-[0.14em] uppercase sm:text-[17px]")}>Ballmac UI&rsquo;s</p>
        <h1 id="hero-h" className="mt-3 text-[clamp(3rem,10.5vw,8.25rem)] font-bold tracking-[-0.06em] uppercase">
          <KineticTitle lines={["Real app", "screens"]} />
        </h1>
        <p className={cn(serif.className, "bm-hero-rise mt-4 text-[15px] tracking-[0.14em] uppercase [animation-delay:0.5s] sm:text-[17px]")}>for shadcn/ui</p>

        <div className="bm-hero-rise mt-16 flex w-full max-w-xl flex-col items-stretch gap-2.5 [animation-delay:0.8s] sm:flex-row sm:items-center sm:justify-center">
          <div className="bg-frame flex min-w-0 items-center gap-2 rounded-2xl py-2 ps-4 pe-2">
            <code dir="ltr" className="min-w-0 flex-1 truncate text-start font-mono text-[12px] min-[380px]:text-[13px] sm:text-sm">
              npx shadcn add <span className="text-muted-foreground">@ballmac/</span>dashboard-1
            </code>
            <CopyButton value={command} label="Copy the install command" className="text-muted-foreground hover:text-foreground size-8 shrink-0 rounded-lg" />
          </div>
          <Link href="/docs/get-started/install" className="focus-visible:ring-ring/50 inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-[oklch(0.56_0.22_258)] px-6 text-[15px] font-medium text-white outline-none transition-colors hover:bg-[oklch(0.5_0.22_258)] focus-visible:ring-[3px] motion-reduce:transition-none">
            Quick start
          </Link>
        </div>
        <p className="bm-hero-rise text-muted-foreground mt-5 text-[13px] [animation-delay:0.9s]">
          {freeBlocks.length} screens free under MIT. <Link href="/blocks" className="text-foreground font-medium underline-offset-4 hover:underline">Browse them</Link>
        </p>
      </section>

      {/* 2. The screens: a bento of real ones, each opening its own page. */}
      <section aria-labelledby="screens-h" className="mx-auto max-w-[1180px] px-4 py-24 sm:px-6 sm:py-32">
        <Heading id="screens-h" title={<>{blocks.length}+ finished screens</>} sub="No extra packages, just source in your repo. Install any one with the shadcn CLI you already use." />
        <ScreenBento screens={bento} />
        <p className="mt-10 text-center">
          <Link href="/blocks" className="focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-md text-[15px] font-medium outline-none focus-visible:ring-[3px]">
            Explore all screens <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        </p>
      </section>

      {/* 3. The AI components, our particular strength. */}
      <section aria-labelledby="ai-h" className="mx-auto max-w-[1180px] px-4 py-24 sm:px-6 sm:py-32">
        <Heading id="ai-h" title={<><span aria-hidden="true" className="me-3 inline-block size-[0.62em] rounded-full bg-[conic-gradient(from_200deg,oklch(0.3_0.1_265),oklch(0.62_0.19_255),oklch(0.85_0.12_220),oklch(0.3_0.1_265))] align-[0.02em]" />Built for AI products</>} sub={`${aiComponents} components for agents: tool calls, approvals, citations, evals. Open any one to see it run.`} />
        <div className="bm-reveal">
          <AiBento total={aiComponents} />
        </div>
      </section>

      {/* 4. Proof and credits: the measured quality, what it works with, what it is made from. */}
      <section aria-labelledby="proof-h" className="mx-auto max-w-[860px] px-4 py-24 text-center sm:px-6 sm:py-32">
        <Heading id="proof-h" title="Checked in a real browser" sub={<>Every item is opened in light, dark, phone width, reduced motion and right to left.{measured.generated ? ` Last run ${formatMeasured(measured.generated)}.` : ""}</>} className="mb-0" />
        <Rule>Quality, measured</Rule>
        <Link href="/quality" className="bm-reveal focus-visible:ring-ring/50 group inline-flex items-baseline gap-1 rounded-lg outline-none focus-visible:ring-[3px]">
          <span className="text-6xl font-semibold tracking-[-0.06em] tabular-nums sm:text-7xl">{quality.perfect}</span>
          <span className="text-muted-foreground text-3xl font-semibold tracking-[-0.05em] tabular-nums sm:text-4xl">/{quality.items}</span>
          <ArrowUpRight className="text-muted-foreground size-5 self-start transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
        </Link>
        <p className="text-muted-foreground mt-1 text-sm">items pass every check, results public</p>
        <Rule>Works with</Rule>
        <div className="bm-marquee-track relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
          <ul className="bm-marquee flex w-max gap-12 text-2xl font-semibold tracking-[-0.04em] text-black/30 [--bm-marquee-duration:40s] dark:text-white/30">
            {[0, 1].flatMap((copy) => ["Next.js", "Vite", "Remix", "Claude Code", "Cursor", "v0", "Windsurf", "MCP"].map((t) => (
              <li key={`${copy}-${t}`} aria-hidden={copy === 1 ? "true" : undefined}>{t}</li>
            )))}
          </ul>
        </div>
        <Rule>Made with</Rule>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-lg font-semibold tracking-[-0.03em]">
          {["React", "Tailwind CSS", "shadcn/ui", "Base UI", "Motion"].map((t) => <li key={t}>{t}</li>)}
        </ul>
        <p className="text-muted-foreground mt-12 border-t border-dashed pt-6 text-sm">
          Free tier open source under MIT. <a href="https://github.com/vamsiy78/ballmac-ui" className="text-foreground font-medium underline-offset-4 hover:underline">Star it on GitHub <ArrowRight className="inline size-3.5 rtl:-scale-x-100" aria-hidden="true" /></a>
        </p>
      </section>

      {/* 5. Whole templates, fanned. */}
      {fan.length === 3 && (
        <section aria-labelledby="tpl-h" className="overflow-hidden px-4 py-24 sm:px-6 sm:py-32">
          <Heading id="tpl-h" title="Whole sites, ready to ship" sub={`${templates.length} templates built from the same screens. ${freeTemplates.length} are free.`} />
          <TemplateFan cards={fan as [FanCard, FanCard, FanCard]} />
          <p className="mt-12 text-center">
            <Link href="/templates" className="focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-md text-[15px] font-medium outline-none focus-visible:ring-[3px]">
              See every template <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
          </p>
        </section>
      )}

      {/* 6. Plans: one payment, two cards. Free is a line under them, since everyone starts there. */}
      <section id="plans" aria-labelledby="plans-h" className="scroll-mt-16 px-4 py-24 sm:px-6 sm:py-32">
        <Heading id="plans-h" title={<>Just one payment,<br />no subscription</>} />
        <div className="mx-auto grid max-w-[700px] gap-3 sm:grid-cols-2">
          {[
            { name: "Pro", price: proPrice ?? "Soon", was: regular ? `$${regular}` : founding?.listPrice ? `$${founding.listPrice}` : null, note: "One person", features: proFeatures, cta: offer.onSale && offer.checkout ? <CheckoutLink href={offer.checkout} plan="pro" className="bg-foreground text-background focus-visible:ring-ring/50 flex h-11 w-full items-center justify-center rounded-xl text-[15px] font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">Get instant access</CheckoutLink> : <Link href="/pricing#plans" className="bg-foreground text-background flex h-11 w-full items-center justify-center rounded-xl text-[15px] font-medium">See Pro</Link> },
            { name: "Team", price: `$${TEAM_PRICE}`, was: null, note: `Up to ${TEAM_SEATS} people`, features: teamFeatures, cta: offer.onSale && TEAM_CHECKOUT ? <CheckoutLink href={TEAM_CHECKOUT} plan="team" className="bg-foreground text-background focus-visible:ring-ring/50 flex h-11 w-full items-center justify-center rounded-xl text-[15px] font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">Get Team</CheckoutLink> : <a href={teamHref} className="bg-foreground text-background focus-visible:ring-ring/50 flex h-11 w-full items-center justify-center rounded-xl text-[15px] font-medium outline-none focus-visible:ring-[3px]">Get Team by email</a> },
          ].map((p) => (
            <div key={p.name} className="bm-reveal bg-frame flex flex-col rounded-[1.75rem] p-7">
              <h3 className="text-muted-foreground text-[15px] font-medium">{p.name}</h3>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="text-[2.75rem] leading-none font-semibold tracking-[-0.05em]">{p.price}</span>
                {p.was && <s className="text-muted-foreground text-lg"><span className="sr-only">regular price </span>{p.was}</s>}
              </p>
              <p className="text-muted-foreground mt-1 text-[13px]">{p.note}, once. Tax included.</p>
              <ul className="mt-7 grid gap-3 text-[14.5px]">
                {p.features.map(([Icon, t]) => (
                  <li key={t} className="flex items-center gap-3"><Icon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />{t}</li>
                ))}
              </ul>
              <div className="mt-auto pt-9">{p.cta}</div>
            </div>
          ))}
        </div>
        <div className="text-muted-foreground mx-auto mt-6 flex max-w-[700px] flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px]">
          <span className="inline-flex items-center gap-1.5"><Check className="size-3.5" aria-hidden="true" />Free: {freeBlocks.length} screens, {freeComponents} components, MIT</span>
          <Link href="/pricing" className="text-foreground font-medium underline-offset-4 hover:underline">Compare everything</Link>
        </div>
        {offer.onSale && !founding && <MonthlyOption className="mx-auto mt-6 max-w-[700px]" />}
      </section>

      {/* 7. Short answers. */}
      <section aria-labelledby="faq-h" className="mx-auto max-w-[700px] px-4 py-16 sm:px-6 sm:py-24">
        <Heading id="faq-h" title="Questions" className="mb-8" />
        <div className="divide-y border-y border-dashed">
          {FAQ.map((f) => (
            <details key={f.q} className="group">
              <summary className="focus-visible:ring-ring/50 flex cursor-pointer list-none items-center justify-between gap-4 rounded-md py-4 text-[16px] font-medium tracking-tight outline-none focus-visible:ring-[3px] [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
              </summary>
              <div className="text-muted-foreground pb-5 text-[15px] leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* 8. Close: the seal and one last way in. */}
      <section aria-labelledby="close-h" className="flex flex-col items-center px-4 pt-24 pb-20 text-center sm:px-6 sm:pt-32">
        <p className="bm-reveal bg-frame text-muted-foreground rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.08em] uppercase">Ship today</p>
        <h2 id="close-h" className="bm-reveal mt-4 max-w-xl text-[2.1rem] leading-[1.05] font-semibold tracking-[-0.055em] text-balance sm:text-5xl">Every screen you don&rsquo;t build is a day back</h2>
        <div className="bm-reveal mt-14">
          <Seal />
        </div>
        <div className="bm-reveal mt-12 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/pro?utm_source=ballmac-ui&utm_medium=home&utm_campaign=closing" className="bg-foreground text-background focus-visible:ring-ring/50 inline-flex h-11 items-center gap-2 rounded-xl px-6 text-[15px] font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">
            {proPrice ? <>Get Pro for {proPrice}</> : "Get Pro"} <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
          <Link href="/blocks" className="bg-frame focus-visible:ring-ring/50 inline-flex h-11 items-center rounded-xl px-6 text-[15px] font-medium outline-none transition-colors hover:bg-frame/70 focus-visible:ring-[3px]">
            Browse free screens
          </Link>
        </div>
      </section>
    </>
  )
}
