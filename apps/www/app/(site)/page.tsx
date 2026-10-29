import { ArrowRight, ArrowUpRight, Check, ChevronDown, ShieldCheck } from "lucide-react"
import * as React from "react"
import { Instrument_Serif } from "next/font/google"
import type { Metadata } from "next"
import Link from "@/components/site/link"

import { buttonVariants } from "@/components/ballmac/button"
import { AiBento } from "@/components/home/ai-bento"
import { HeroStage } from "@/components/home/hero-stage"
import { InstallDemo } from "@/components/home/install-demo"
import { CountUp, Spotlight } from "@/components/home/motion-bits"
import { ScreenWall, type WallItem } from "@/components/home/screen-wall"
import { ValueAnchor } from "@/components/home/value-anchor"
import { Manifesto } from "@/components/home/manifesto"
import { ShippingLog } from "@/components/home/shipping-log"
import { BuyDock } from "@/components/pro/buy-dock"
import { shownPath } from "@/components/site/item-install"
import { CheckoutLink } from "@/components/pro/checkout-link"
import { PriceDisplay, PriceText } from "@/components/pro/price"
import { LimitedOfferBanner } from "@/components/site/limited-offer-banner"
import { regularPrice } from "@/lib/limited-offer"
import { MonthlyOption } from "@/components/pro/monthly-option"
import { CopyButton } from "@/components/site/copy-button"
import { FoundingBanner } from "@/components/site/founding-banner"
import { LeftPhrase } from "@/components/site/founding-text"
import { GithubStars } from "@/components/site/github-stars"
import { REPO_URL } from "@/lib/github-stars"
import { SiteJsonLd } from "@/components/site/site-jsonld"
import { WhatsNewBanner } from "@/components/site/whats-new-banner"
import { FOUNDERS_EMAIL } from "@/lib/founders"
import { starsAtBuild } from "@/lib/github-stars-build"
import { getOffer } from "@/lib/offer"
import { PRO_LICENCE_PATH } from "@/lib/pro-licence"
import { REFUND_FIX_DAYS, REFUND_PATH, REFUND_REPORT_DAYS } from "@/lib/pro-refund"
import { TEAM_CHECKOUT, TEAM_PRICE, TEAM_SEATS } from "@/lib/pro-team"
import { formatMeasured, measured, overview } from "@/lib/quality"
import { blockCategoryLabels, blockGroups, getBlocks, getComponents, getItem, getTemplates, highlight, isPro, readSource } from "@/lib/registry"
import { thumbFor } from "@/lib/thumbs"
import { cn } from "@/lib/utils"

const serif = Instrument_Serif({ weight: "400", style: "italic", subsets: ["latin"] })

export function generateMetadata(): Metadata {
  const blocks = getBlocks()
  const free = blocks.filter((b) => !isPro(b)).length
  return {
    description: `${blocks.length} app screens for shadcn, React and Tailwind, from billing to AI agent consoles. ${free} are free and MIT licensed; install any with one command and own the code.`,
    alternates: { canonical: "/" },
  }
}

const AREAS = [
  { id: "application", thumb: "agent-16" },
  { id: "ops", thumb: "alerts-1" },
  { id: "vertical", thumb: "floorplan-1" },
  { id: "shop", thumb: "ecommerce-2" },
  { id: "marketing", thumb: "hero-8" },
  { id: "account", thumb: "login-1" },
] as const

export default async function Home() {
  const components = getComponents()
  const blocks = getBlocks()
  const templates = getTemplates()
  const proBlocks = blocks.filter(isPro)
  const freeTemplates = templates.filter((t) => !isPro(t))
  const freeBlocks = blocks.filter((b) => !isPro(b))
  const freeComponents = components.filter((c) => !isPro(c)).length
  const aiComponents = components.filter((c) => c.category === "ai").length
  const now = new Date()
  const offer = await getOffer(now)
  const founding = offer.founding
  const stars = await starsAtBuild()
  const quality = overview()

  // The start of a real file, to show that what you install is ordinary source.
  const source = getItem("dashboard-1")
  const sourceLines = source?.files[0] ? readSource(source.files[0].source).split("\n").slice(0, 24).join("\n") : ""
  const sourceHtml = sourceLines ? await highlight(`${sourceLines}\n// ...`) : ""
  const sourceFiles = source?.files.map((f) => shownPath(f.target)) ?? ["components/blocks/dashboard-1.tsx"]

  // The moving wall: blocks with a captured thumbnail, Pro and free woven together so both tiers show, in two rows.
  const withThumb = (list: typeof blocks) => list.flatMap((b): WallItem[] => {
    const thumb = thumbFor(b.name, isPro(b) ? "pro" : "free")
    return thumb ? [{ name: b.name, title: b.title ?? b.name, thumb, pro: isPro(b) }] : []
  })
  const seenCategory = new Set<string>()
  const firstOf = (list: WallItem[]) => list.filter((w) => {
    const c = blocks.find((b) => b.name === w.name)?.blockCategory ?? w.name
    return seenCategory.has(c) ? false : (seenCategory.add(c), true)
  })
  const proWall = firstOf(withThumb(proBlocks))
  const freeWall = firstOf(withThumb(freeBlocks))
  const woven = proWall.flatMap((p, i) => (freeWall[i] ? [p, freeWall[i]] : [p])).slice(0, 28)
  const half = Math.ceil(woven.length / 2)
  const wallRows = [woven.slice(0, half), woven.slice(half)]

  const areaTiles = AREAS.flatMap((t) => {
    const g = blockGroups.find((x) => x.id === t.id)
    const owner = getItem(t.thumb)
    const thumb = thumbFor(t.thumb, owner && isPro(owner) ? "pro" : "free")
    const inArea = g ? blocks.filter((b) => (g.categories as readonly string[]).includes(b.blockCategory ?? "")) : []
    const count = inArea.length
    const free = inArea.filter((b) => !isPro(b)).length
    return g && thumb && count > 0 ? [{ id: t.id, label: g.label, thumb, count, free }] : []
  })

  const byCategory = new Map<string, { free: number; pro: number }>()
  for (const b of blocks) {
    const c = b.blockCategory ?? ""
    const row = byCategory.get(c) ?? { free: 0, pro: 0 }
    row[isPro(b) ? "pro" : "free"]++
    byCategory.set(c, row)
  }
  const gaps = [...byCategory.entries()]
    .map(([c, v]) => ({ label: blockCategoryLabels[c] ?? c, ...v }))
    .filter((r) => r.pro >= r.free * 2 && r.pro - r.free >= 5)
    .sort((a, b) => b.pro - b.free - (a.pro - a.free))
    .slice(0, 4)

  const proPrice = offer.onSale && offer.price ? `$${offer.price}` : null
  const regular = !founding && offer.onSale ? regularPrice(offer.price) : null
  const teamHref = TEAM_CHECKOUT || `mailto:${FOUNDERS_EMAIL}?subject=${encodeURIComponent("Team licence for Ballmac UI Pro")}`
  const command = "npx shadcn@latest add @ballmac/dashboard-1"

  const FAQ: { q: string; a: React.ReactNode; text?: string }[] = [
    { q: "What is Ballmac UI?", a: `A shadcn registry of ${blocks.length} app screens and ${components.length} components for React and Tailwind. ${freeBlocks.length} screens and ${freeComponents} components are free under the MIT licence; Pro adds the rest. You install one with a single command and the code is yours.` },
    { q: "Will it fit my project?", a: "It installs with the shadcn CLI, so it goes wherever shadcn does: Next.js, Vite, Remix." },
    { q: "Can I change it?", a: "All of it. It is plain source in your repo, and ballmac update merges our fixes into your edits." },
    { q: "What does it depend on?", a: "React, Tailwind and a few small libraries each page names. The CLI installs them." },
    { q: "Is the quality real?", a: <>Every item is loaded in a real browser and the results are public, failures included. <Link href="/quality" className="text-foreground underline underline-offset-4">See them</Link>.</>, text: "Every item is loaded in a real browser in light, dark, phone width, reduced motion and right to left, and the results are public at ui.ballmac.com/quality, failures included." },
    { q: "Free for client work?", a: "Yes. Free items are MIT licensed, for personal, client and commercial projects." },
    { q: "Free or Pro?", a: `Free ships a product. Pro adds ${proBlocks.length} more screens, ${components.filter(isPro).length} more components, ${templates.filter(isPro).length} more templates, 3 starter apps, a private registry, Figma tokens and every future Pro update.` },
    { q: "What can I do with Pro or Team?", a: <>Unlimited apps, yours or your clients&rsquo;. No reselling, sharing or AI training. Pro is one person, Team up to {TEAM_SEATS}. <a href={PRO_LICENCE_PATH} className="text-foreground underline underline-offset-4">Read the licence</a>.</>, text: `Unlimited apps, yours or your clients’. No reselling, sharing or AI training. Pro is one person, Team up to ${TEAM_SEATS}.` },
    { q: "What if Pro does not work?", a: <>Tell us within {REFUND_REPORT_DAYS} days. If we cannot fix it within {REFUND_FIX_DAYS} days of your request, you get a full refund. <a href={REFUND_PATH} className="text-foreground underline underline-offset-4">Refund policy</a>.</>, text: `Tell us within ${REFUND_REPORT_DAYS} days. If we cannot fix it within ${REFUND_FIX_DAYS} days of your request, you get a full refund.` },
  ]

  return (
    <>
      <SiteJsonLd faq={FAQ.map((f) => ({ q: f.q, text: f.text ?? (typeof f.a === "string" ? f.a : "") })).filter((f) => f.text)} libraryDescription={`${freeBlocks.length} finished app screens and ${freeComponents} components for React and Tailwind, free under the MIT licence.`} />
      {founding && <FoundingBanner offer={founding} at={now.getTime()} />}
      {offer.onSale && offer.checkout && offer.price && <BuyDock href={offer.checkout} price={offer.price} />}
      {regular && offer.price && <LimitedOfferBanner price={offer.price} regular={regular} />}
      {/* One banner at a time above the hero: while there is an offer, it wins. */}
      {!regular && !founding && <WhatsNewBanner id="2026-10-batch-3" added={52} examples={["a restaurant floor plan", "a gradebook", "an agent console", "a treemap", "salon booking", "insurance claims"]} />}

      {/* 1. Hero: an aurora over a faint grid, the message, and a stage of real screens that flattens as you scroll. */}
      <section aria-labelledby="hero-h" className="bm-grain dark relative isolate overflow-hidden bg-[oklch(0.135_0.006_265)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {/* Key light from above, two soft rays, a warm light behind the product and a cool rim at the sides. */}
          <div className="absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(ellipse_55%_60%_at_50%_-8%,oklch(1_0_0/0.17),transparent_70%)]" />
          <div className="bm-aurora-a absolute -top-[10%] left-[22%] h-[85%] w-[16%] rotate-[18deg] bg-[linear-gradient(in_oklch_180deg,oklch(1_0_0/0.09),transparent)] blur-2xl" />
          <div className="bm-aurora-b absolute -top-[10%] right-[24%] h-[80%] w-[12%] -rotate-[16deg] bg-[linear-gradient(in_oklch_180deg,oklch(1_0_0/0.07),transparent)] blur-2xl" />
          <div className="absolute top-[52%] left-1/2 h-[55%] w-[80%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,oklch(0.8_0.09_70/0.28),oklch(0.7_0.06_50/0.1)_55%,transparent)] blur-3xl" />
          <div className="absolute top-[40%] -left-[10%] h-[60%] w-[35%] rounded-full bg-[oklch(0.72_0.06_240/0.1)] blur-[110px]" />
          <div className="absolute top-[40%] -right-[10%] h-[60%] w-[35%] rounded-full bg-[oklch(0.72_0.06_240/0.1)] blur-[110px]" />
          <div className="absolute inset-0 [background-image:linear-gradient(oklch(1_0_0/0.04)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/0.04)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_70%_45%_at_50%_0%,black,transparent_80%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[oklch(0.135_0.006_265)]" />
        </div>
        <div className="mx-auto max-w-[1440px] px-5 pt-14 pb-20 sm:px-6 lg:pt-16 lg:pb-28">
          <div className="mx-auto flex max-w-[62rem] flex-col items-center text-center">
            <Link href="/blocks" className="bm-hero-rise group inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] py-1.5 ps-1.5 pe-3.5 text-[12.5px] text-white/80 outline-none backdrop-blur-md transition-colors hover:border-white/25 hover:text-white focus-visible:ring-[3px] focus-visible:ring-white/50 motion-reduce:transition-none">
              <span className="rounded-full bg-[oklch(0.83_0.15_78)] px-2 py-0.5 text-[11px] font-semibold text-[oklch(0.25_0.05_70)]">New</span>
              Agent control, evals and a review desk
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
            <h1 id="hero-h" className="mt-6 text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-[5.25rem] 2xl:text-[6rem]">
              {["Real", "app", "screens,"].map((w, i) => (
                <React.Fragment key={w}>
                  <span className={cn("bm-word", i > 0 && serif.className, i > 0 && "bm-silver font-normal italic tracking-[-0.03em]")} style={{ animationDelay: `${0.1 + i * 0.09}s` }}>{w}</span>{" "}
                </React.Fragment>
              ))}
              <br className="hidden sm:block" />
              {["one", "command", "away."].map((w, i) => (
                <React.Fragment key={w}>
                  <span className="bm-word" style={{ animationDelay: `${0.38 + i * 0.09}s` }}>{w}</span>{" "}
                </React.Fragment>
              ))}
            </h1>
            <p className="bm-hero-rise mt-5 max-w-[34rem] text-[16px] leading-relaxed tracking-[-0.01em] text-white/65 [animation-delay:0.75s] sm:text-lg">
              {Math.floor(blocks.length / 10) * 10}+ finished screens for React and Tailwind, with every state, dark mode and keyboard support done. Start with {freeBlocks.length} free and own the code.
            </p>
            <div className="bm-hero-rise mt-8 flex w-full flex-col items-center justify-center gap-3 [animation-delay:0.9s] sm:w-auto sm:flex-row">
              <Link href="/pro?utm_source=ballmac-ui&utm_medium=home-hero&utm_campaign=hero" className="bm-sheen relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-7 text-[14.5px] font-semibold text-black shadow-[0_0_0_1px_rgb(255_255_255/0.4),0_10px_40px_-8px_oklch(0.82_0.12_75/0.55)] outline-none transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_#fff,0_16px_50px_-8px_oklch(0.84_0.13_75/0.8)] focus-visible:ring-[3px] focus-visible:ring-white/60 motion-reduce:transition-none sm:w-auto">
                {proPrice ? <>Get Pro for {proPrice}</> : "Get Pro"} <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              </Link>
              <Link href="/blocks" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-7 text-[14.5px] font-medium text-white outline-none backdrop-blur-md transition-colors hover:border-white/40 hover:bg-white/[0.08] focus-visible:ring-[3px] focus-visible:ring-white/50 motion-reduce:transition-none sm:w-auto">
                Browse {freeBlocks.length} free screens
              </Link>
            </div>
            {!founding && proPrice && (
              <p className="bm-hero-rise mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] text-white/60 [animation-delay:1s]">
                <span><span className="font-medium text-white">{proPrice} once</span>{regular ? <> <s><span className="sr-only">regular price </span>${regular}</s> <span className="bm-amber ms-1 rounded-full border border-[oklch(0.83_0.15_78/0.35)] bg-[oklch(0.83_0.15_78/0.1)] px-2 py-0.5 text-[11.5px] font-semibold">Save ${Number(regular) - Number(offer.price)}</span></> : null} · tax included</span>
                <span aria-hidden="true" className="text-white/25">•</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" aria-hidden="true" />Money back if it does not work</span>
              </p>
            )}
            {/* Proof next to the buttons, all of it checkable: the public scorecard, the open repo, and the studio's own shipped apps. */}
            <ul className="bm-hero-rise mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-white/55 [animation-delay:1.1s]" aria-label="Why trust it">
              <li><Link href="/quality" className="inline-flex items-center gap-1.5 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/50"><Check className="size-3.5 text-emerald-400" aria-hidden="true" />{quality.perfect}/{quality.items} items pass a real-browser check</Link></li>
              <li><a href={REPO_URL} className="inline-flex items-center gap-1.5 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/50"><Check className="size-3.5 text-emerald-400" aria-hidden="true" />Free tier open source, MIT</a></li>
              <li><a href="https://ballmac.com" className="inline-flex items-center gap-1.5 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/50"><Check className="size-3.5 text-emerald-400" aria-hidden="true" />From the studio behind Notchware and Binzide</a></li>
            </ul>
            {founding && (
              <p className="mt-5 text-[13px] text-white/75">
                Pro: ${founding.price} once{founding.listPrice ? `, then $${founding.listPrice}` : ""}.{founding.endsAt ? <> <LeftPhrase endsAt={founding.endsAt} at={now.getTime()} capitalize /></> : null}
              </p>
            )}
          </div>

          <div className="bm-hero-rise mt-14 [animation-delay:1.05s] lg:mt-14">
            <HeroStage />
          </div>

          <ul className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-y-8 text-center lg:grid-cols-4">
            {[
              [blocks.length, "app screens"],
              [components.length, "components"],
              [freeBlocks.length, "screens free, MIT"],
              [quality.perfect, "items pass every browser check"],
            ].map(([n, label]) => (
              <li key={label as string}>
                <p className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl"><CountUp value={n as number} /></p>
                <p className="mt-1 text-[13px] text-white/50">{label as string}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2. Where it goes. */}
      <section aria-label="Works with" className="border-b">
        <ul className="text-muted-foreground mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-7 text-sm font-medium sm:px-6">
          <li className="text-foreground/70 text-xs tracking-[0.18em] uppercase">Works with</li>
          {["Next.js", "Vite", "Remix", "Tailwind CSS", "shadcn CLI", "MCP", "Claude Code", "Cursor", "v0"].map((t) => (
            <li key={t}>{t}</li>
          ))}
          <li><GithubStars initial={stars} /></li>
        </ul>
      </section>

      {/* 3. The catalogue, moving. */}
      <section aria-labelledby="cat-h" className="overflow-hidden py-16 sm:py-24">
        <div className="bm-reveal mx-auto mb-12 flex max-w-[1440px] flex-wrap items-end justify-between gap-6 px-4 sm:px-6">
          <div>
            <h2 id="cat-h" className="text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
              <CountUp value={blocks.length} /> screens. <span className="text-muted-foreground"><CountUp value={freeBlocks.length} /> free.</span>
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Areas">
              {areaTiles.map((t) => (
                <li key={t.id}>
                  <Link href={`/blocks#${t.id}`} className="hover:bg-muted focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none">
                    {t.label} <span className="text-muted-foreground font-mono text-xs tabular-nums">{t.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/blocks" className={buttonVariants({ variant: "outline", shape: "pill" })}>
            See them all <ArrowRight className="rtl:-scale-x-100" />
          </Link>
        </div>
        <ScreenWall rows={wallRows} />
      </section>

      {/* 3a. The pitch, scrubbed word by word as the page scrolls. */}
      <Manifesto
        href="/pro?utm_source=ballmac-ui&utm_medium=home&utm_campaign=pitch"
        cta={proPrice ? `Get Pro for ${proPrice}` : "See Pro"}
        parts={[
          { text: "Every screen you don't build is a day back on your product." },
          { text: `${proBlocks.length} are already finished, with loading, empty and error states, dark mode, keyboard support and motion.` },
          ...(proPrice ? [{ text: "All of them," }, { text: `${proPrice} once.`, accent: true }] : []),
        ]}
      />

      {/* 3b. The price next to what it replaces. Only while there is a standing price, not during a founding offer. */}
      {!founding && offer.onSale && offer.price && <div className="bg-muted/30 border-y"><ValueAnchor price={Number(offer.price)} checkout={offer.checkout} proCount={proBlocks.length} /></div>}

      {/* 4. The AI components: pictures here, each one runs on its own page. */}
      <section aria-labelledby="ai-h" className="mx-auto max-w-[1440px] px-4 py-16 sm:py-24 sm:px-6">
        <div className="bm-reveal mb-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <h2 id="ai-h" className="max-w-xl text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">Built for AI products.</h2>
          <p className="text-muted-foreground text-sm sm:text-end">Open any one<br />to see it run.</p>
        </div>
        <div className="bm-reveal">
          <AiBento total={aiComponents} />
        </div>
      </section>

      {/* 5. The install, played out. */}
      <section aria-labelledby="src-h" className="bg-muted/30 border-y">
        <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-4 py-16 sm:py-24 sm:px-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20">
          <div className="bm-reveal">
            <InstallDemo command={command} files={sourceFiles} sourceHtml={sourceHtml} />
          </div>
          <div className="bm-reveal">
            <h2 id="src-h" className="text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">One command. Then it&rsquo;s your code.</h2>
            <ol className="mt-10 grid gap-7">
              {[
                ["Plain React and Tailwind.", "No package to depend on."],
                ["Edit anything.", "ballmac update merges our fixes into your copy."],
                ["Dark, RTL, keyboard.", "On every item, and checked."],
                ["Your agent can do it too.", "Claude Code and Cursor install through MCP."],
              ].map(([a, b], i) => (
                <li key={a} className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline">
                  <span className="text-muted-foreground font-mono text-sm tabular-nums">0{i + 1}</span>
                  <p className="text-xl font-medium tracking-tight">{a} <span className="text-muted-foreground font-normal">{b}</span></p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 5b. Proof it is alive: the latest releases, dated, from the changelog. */}
      <ShippingLog />

      {/* 6. Plans: Pro is the big one. */}
      <section id="plans" aria-labelledby="plans-h" className="scroll-mt-16">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:py-24 sm:px-6">
          <h2 id="plans-h" className="bm-reveal mb-12 max-w-2xl text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">Start free. Pay once for more.</h2>
          <div className="grid gap-4 lg:grid-cols-12">
            <Spotlight id="buy" color="oklch(0.9 0.08 80 / 0.22)" className="bm-reveal bg-foreground text-background flex flex-col overflow-hidden rounded-3xl p-8 sm:p-10 lg:col-span-7 lg:row-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pro</h3>
                {founding && <span className="rounded-full border border-current/25 px-2.5 py-0.5 text-xs font-medium">Founding price</span>}
                {!founding && regular && offer.price && <span className="rounded-full bg-[oklch(0.83_0.15_78)] px-3 py-1 text-xs font-semibold text-[oklch(0.25_0.05_70)]">Limited-time · Save ${Number(regular) - Number(offer.price)}</span>}
              </div>
              <p className={cn("mt-8 flex flex-wrap items-baseline gap-x-4 font-semibold tracking-[-0.06em]", proPrice ? "text-7xl sm:text-8xl" : "text-5xl sm:text-6xl")}>
                {proPrice ? (founding ? proPrice : <PriceDisplay price={Number(offer.price)} was={regular} />) : "One payment"}
                {founding?.listPrice && <span className="text-3xl font-medium tracking-normal line-through opacity-50"><span className="sr-only">Regular price </span>${founding.listPrice}</span>}
              </p>
              <p className="mt-1 text-sm opacity-65">{proPrice ? "One payment, tax included. One person." : "One payment. One person."}</p>
              <ul className="mt-9 grid gap-x-8 gap-y-3 text-[15px] sm:grid-cols-2">
                {[`${proBlocks.length} more screens`, "3 starter apps", "Private registry for CLI and agent", "Figma tokens", "Every future Pro update", `${REFUND_FIX_DAYS}-day fix-or-refund`].map((t) => (
                  <li key={t} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{t}</li>
                ))}
              </ul>
              <ul aria-label="Where Pro goes deeper" className="mt-9 flex flex-wrap gap-2 border-t border-current/15 pt-7">
                {gaps.map((g) => (
                  <li key={g.label} className="rounded-full border border-current/20 px-3.5 py-1.5 text-sm">
                    {g.label} <span className="font-mono text-xs opacity-65">{g.free} → {g.pro}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-10">
                {offer.onSale && offer.checkout ? (
                  <CheckoutLink href={offer.checkout} plan="pro" className={cn(buttonVariants({ variant: "secondary", shape: "pill", size: "lg" }), "bm-sheen relative h-13 w-full overflow-hidden text-base sm:w-auto sm:px-10")}>
                    Get Pro for {founding ? proPrice : <PriceText price={Number(offer.price)} />}
                  </CheckoutLink>
                ) : (
                  <Link href="/pricing?utm_source=ballmac-ui&utm_medium=home-plans&utm_campaign=pro#plans" className={cn(buttonVariants({ variant: "secondary", shape: "pill", size: "lg" }), "h-13 w-full text-base sm:w-auto sm:px-10")}>
                    See Pro pricing
                  </Link>
                )}
                {offer.onSale && !founding && <MonthlyOption className="mt-6 max-w-sm" />}
              </div>
            </Spotlight>

            <div className="bm-reveal bg-card flex flex-col rounded-3xl border p-8 lg:col-span-5">
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold">Free</h3>
                <p className="text-4xl font-semibold tracking-[-0.05em]">$0</p>
              </div>
              <ul className="mt-5 grid gap-2.5 text-sm">
                {[`${freeBlocks.length} screens, ${freeComponents} components, ${freeTemplates.length} templates`, "CLI and MCP installs", "MIT, commercial use"].map((t) => (
                  <li key={t} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{t}</li>
                ))}
              </ul>
              <Link href="/blocks" className={cn(buttonVariants({ variant: "outline", shape: "pill", size: "lg" }), "mt-6")}>Browse screens</Link>
            </div>

            <div className="bm-reveal bg-card flex flex-col rounded-3xl border p-8 lg:col-span-5">
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold">Team</h3>
                <p className="text-4xl font-semibold tracking-[-0.05em]">${TEAM_PRICE}</p>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">Pro for up to {TEAM_SEATS} people, one licence.</p>
              <ul className="mt-5 grid gap-2.5 text-sm">
                {["One key for the team and CI", "Company name and tax ID on the invoice"].map((t) => (
                  <li key={t} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{t}</li>
                ))}
              </ul>
              {offer.onSale && TEAM_CHECKOUT ? (
                <CheckoutLink href={TEAM_CHECKOUT} plan="team" className={cn(buttonVariants({ variant: "outline", shape: "pill", size: "lg" }), "mt-6")}>Get Team for ${TEAM_PRICE}</CheckoutLink>
              ) : (
                <a href={teamHref} className={cn(buttonVariants({ variant: "outline", shape: "pill", size: "lg" }), "mt-6")}>Get Team by email</a>
              )}
            </div>
          </div>
          <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="flex items-center gap-2 font-medium"><ShieldCheck className="size-4" aria-hidden="true" />Works as described, or your money back.</span>
            <span className="text-muted-foreground">Tax invoice sent for you · Licence key by email after paying</span>
            <a href={REFUND_PATH} className="text-muted-foreground underline underline-offset-4">Refund policy</a>
            <Link href="/pricing" className="text-muted-foreground underline underline-offset-4">Compare everything</Link>
          </p>
        </div>
      </section>

      {/* 7. Proof and the short answers. */}
      <section aria-labelledby="proof-h" className="mx-auto max-w-[1440px] px-4 py-16 sm:py-24 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
          <div>
            <p className="text-7xl font-semibold tracking-[-0.06em] tabular-nums sm:text-8xl"><CountUp value={quality.perfect} /><span className="text-muted-foreground">/{quality.items}</span></p>
            <h2 id="proof-h" className="mt-3 text-2xl font-medium tracking-tight text-balance">items pass every check in a real browser.</h2>
            <p className="text-muted-foreground mt-3 text-sm">Light, dark, phone, reduced motion, right to left.{measured.generated ? ` Last run ${formatMeasured(measured.generated)}.` : ""}</p>
            <Link href="/quality" className="mt-5 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4">The full scorecard <ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>
          </div>
          <div className="divide-y border-y">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-1">
                <summary className="focus-visible:ring-ring/50 flex cursor-pointer list-none items-center justify-between gap-4 rounded-md py-4 text-lg font-medium tracking-tight outline-none focus-visible:ring-[3px] [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="text-muted-foreground size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                </summary>
                <div className="text-muted-foreground pb-5 text-[15px] leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Close: the aurora again, the one command, and both ways in. */}
      <section aria-labelledby="close-h" className="bm-dark-end bm-grain dark relative isolate overflow-hidden bg-[oklch(0.135_0.006_265)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -bottom-[35%] left-1/2 h-[90%] w-[75%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,oklch(0.8_0.09_70/0.3),oklch(0.7_0.06_50/0.1)_55%,transparent)] blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-[60%] bg-[radial-gradient(ellipse_50%_70%_at_50%_-10%,oklch(1_0_0/0.1),transparent_70%)]" />
          <div className="absolute inset-0 [background-image:linear-gradient(oklch(1_0_0/0.04)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/0.04)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_100%,black,transparent_80%)]" />
        </div>
        <div className="bm-reveal mx-auto flex max-w-[1440px] flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-36">
          <h2 id="close-h" className="max-w-4xl text-5xl font-semibold tracking-[-0.055em] text-balance sm:text-7xl lg:text-8xl">
            Ship the screens. <span className={cn(serif.className, "bm-silver font-normal italic tracking-[-0.03em]")}>Today.</span>
          </h2>
          <div className="mt-10 flex w-fit max-w-full items-center gap-3 rounded-full border border-white/15 bg-white/[0.05] py-2 ps-5 pe-2 backdrop-blur-md">
            <code dir="ltr" className="min-w-0 truncate font-mono text-sm"><span className="text-white/40">$ </span>{command}</code>
            <CopyButton value={command} label="Copy the install command" className="size-8 shrink-0 rounded-full text-white/60 hover:bg-white/10 hover:text-white" />
          </div>
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/pro?utm_source=ballmac-ui&utm_medium=home&utm_campaign=closing" className="bm-sheen relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-7 text-[15px] font-semibold text-black shadow-[0_10px_40px_-8px_oklch(0.82_0.12_75/0.55)] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-white/60 motion-reduce:transition-none sm:w-auto">
              {proPrice ? <>Get Pro for {proPrice}</> : "Get Pro"} <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
            <Link href="/blocks" className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/20 bg-white/[0.04] px-7 text-[15px] font-medium text-white outline-none hover:border-white/40 focus-visible:ring-[3px] focus-visible:ring-white/50 sm:w-auto">
              Browse free screens
            </Link>
          </div>
          <p className="mt-6 text-[13px] text-white/50">Team of up to {TEAM_SEATS}? <Link href="/pricing?utm_source=ballmac-ui&utm_medium=home&utm_campaign=closing#plans" className="text-white/80 underline underline-offset-4 hover:text-white">Team is ${TEAM_PRICE}</Link>.</p>
        </div>
      </section>
    </>
  )
}
