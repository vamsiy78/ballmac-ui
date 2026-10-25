import { ArrowRight, ArrowUpRight, Check, ChevronDown, Download, Layers, ShieldCheck, Sparkles } from "lucide-react"
import { Instrument_Serif } from "next/font/google"
import type { Metadata } from "next"
import Link from "@/components/site/link"

import { buttonVariants } from "@/components/ballmac/button"
import { AiBento } from "@/components/home/ai-bento"
import { CheckoutLink } from "@/components/pro/checkout-link"
import { Themed } from "@/components/pro/shots"
import { CopyButton } from "@/components/site/copy-button"
import { FooterVideo } from "@/components/site/footer-video"
import { FoundingBanner } from "@/components/site/founding-banner"
import { LeftPhrase } from "@/components/site/founding-text"
import { GithubStars } from "@/components/site/github-stars"
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
      <WhatsNewBanner id="2026-10-batch-3" added={52} examples={["a restaurant floor plan", "a gradebook", "an agent console", "a treemap", "salon booking", "insurance claims"]} />

      {/* 1. Hero: black, a looping video behind, a short message at the bottom, three facts underneath. */}
      <section aria-labelledby="hero-h" className="dark relative isolate flex min-h-[max(34rem,calc(100svh-7.5rem))] flex-col overflow-hidden bg-black text-white">
        <FooterVideo src="/hero/hero.mp4" poster="/hero/hero.jpg" className="absolute inset-0 -z-20 size-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/45 to-black/85 lg:from-black/45 lg:via-black/10 lg:to-black/70" />
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-end justify-center px-5 pt-16 pb-10 sm:px-6 lg:pb-16">
          <div className="flex max-w-[56rem] flex-col items-center text-center">
            <Link href="/blocks" className="bm-hero-rise focus-visible:ring-ring/70 group inline-flex items-center gap-2 rounded-[5px] bg-gradient-to-r from-[#7d7d7d] via-[#2a2a2a] to-[#0a0a0a] px-3.5 py-2 text-[12.5px] text-[#f2f2f2] outline-none focus-visible:ring-[3px]">
              <Sparkles className="size-4" aria-hidden="true" />
              Agent control, evals and a review desk
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
            <h1 id="hero-h" className="mt-5 text-[2.25rem] leading-[1.12] font-medium tracking-[-0.045em] text-balance sm:text-5xl lg:text-[3.5rem] 2xl:text-[4.5rem]">
              <span className="bm-hero-rise block [animation-delay:0.15s]">
                Real <em className={cn(serif.className, "text-[#c2c2c2] lg:text-[#9a9a9a]")}>app screens</em>,
              </span>
              <span className="bm-hero-rise block [animation-delay:0.3s]">one command away.</span>
            </h1>
            <p className="bm-hero-rise mt-5 max-w-[30rem] text-[15.5px] leading-relaxed tracking-[-0.015em] text-[#cfcfcf] lg:text-[#9a9a9a] [animation-delay:0.5s] 2xl:text-lg">
              {Math.floor(blocks.length / 10) * 10}+ finished screens for React and Tailwind teams. Start with {freeBlocks.length} free, install one with a single command, and own the code.
            </p>
            <div className="bm-hero-rise mt-7 flex w-full flex-col items-center justify-center gap-2.5 [animation-delay:0.65s] sm:w-auto sm:flex-row">
              <Link href="/blocks" className="focus-visible:ring-ring/70 inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-md border border-white bg-gradient-to-b from-white via-[#e7e7e7] to-[#cfcfcf] px-5 text-[13.5px] font-medium text-[#111] shadow-[inset_0_1px_0_rgb(255_255_255/0.95)] outline-none transition-[box-shadow,filter] hover:shadow-[inset_0_1px_0_#fff,0_0_26px_rgb(186_208_255/0.4)] focus-visible:ring-[3px] sm:w-auto">
                Browse screens <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              </Link>
              <Link href="/pro?utm_source=ballmac-ui&utm_medium=home-hero&utm_campaign=hero" className="focus-visible:ring-ring/70 inline-flex h-[42px] w-full items-center justify-center rounded-md border border-[#c6c6c6]/55 bg-gradient-to-br from-white/12 via-black/50 to-[#96aac8]/10 px-5 text-[13.5px] font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] backdrop-blur-lg outline-none transition-[box-shadow,border-color] hover:border-[#dce6ff]/80 hover:shadow-[0_0_24px_rgb(170_200_255/0.28)] focus-visible:ring-[3px] sm:w-auto">
                Get Pro
              </Link>
            </div>
            {founding && (
              <p className="mt-4 text-[13px] text-white/75">
                Pro: ${founding.price} once{founding.listPrice ? `, then $${founding.listPrice}` : ""}.{founding.endsAt ? <> <LeftPhrase endsAt={founding.endsAt} at={now.getTime()} capitalize /></> : null}
              </p>
            )}
          </div>
        </div>
        <ul className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-4 px-5 pb-8 text-[13.5px] tracking-[-0.015em] text-[#d8d8d8] sm:px-10 lg:flex-row lg:px-[72px]">
          <li className="bm-hero-rise flex items-center gap-3.5 [animation-delay:1.1s]"><Layers className="size-5 text-[#e8e8e8]" aria-hidden="true" />{blocks.length} screens and {components.length} components</li>
          <li className="bm-hero-rise flex items-center gap-3.5 [animation-delay:1.25s]"><span className="grid size-5 place-items-center rounded-md bg-white text-[#111]"><Download className="size-3" aria-hidden="true" /></span>{freeBlocks.length} screens free, MIT licensed</li>
          <li className="bm-hero-rise flex items-center gap-3.5 [animation-delay:1.4s]"><GithubStars initial={stars} variant="hero" /></li>
        </ul>
      </section>

      {/* 3. The AI components: pictures here, each one runs on its own page. */}
      <section aria-labelledby="ai-h" className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <h2 id="ai-h" className="max-w-xl text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">Built for AI products.</h2>
          <p className="text-muted-foreground text-sm sm:text-end">Open any one<br />to see it run.</p>
        </div>
        <AiBento total={aiComponents} />
      </section>

      {/* 4. Plain source, shown. */}
      <section aria-labelledby="src-h" className="bg-muted/30 border-y">
        <div className="mx-auto grid max-w-[1440px] items-start gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20">
          <div className="relative overflow-hidden rounded-3xl border bg-[#0d1117] shadow-[0_40px_90px_-40px_rgb(0_0_0/0.6)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-xs text-white/50">
              <span dir="ltr">{command}</span>
              <CopyButton value={command} label="Copy the install command" className="text-white/60 hover:bg-white/10 hover:text-white" />
            </div>
            <div dir="ltr" tabIndex={0} aria-label="The start of dashboard-1.tsx" className="dark max-h-[25rem] overflow-auto px-5 py-4 text-[13px] outline-none focus-visible:ring-[3px] focus-visible:ring-white/40 focus-visible:ring-inset [&_pre]:bg-transparent!" dangerouslySetInnerHTML={{ __html: sourceHtml }} />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0d1117] to-transparent" />
          </div>
          <div className="lg:pt-16">
            <h2 id="src-h" className="text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">It&rsquo;s your code now.</h2>
            <ol className="mt-10 grid gap-7">
              {[
                ["Plain React and Tailwind.", "No package to depend on."],
                ["Edit anything.", "ballmac update merges our fixes into your copy."],
                ["Dark, RTL, keyboard.", "On every item, and checked."],
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

      {/* 5. The catalogue, staggered. */}
      <section aria-labelledby="cat-h" className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 id="cat-h" className="text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
            <span className="tabular-nums">{blocks.length}</span> screens, <span className="tabular-nums">{freeBlocks.length}</span> free.
          </h2>
          <Link href="/blocks" className={buttonVariants({ variant: "outline", shape: "pill" })}>
            See them all <ArrowRight className="rtl:-scale-x-100" />
          </Link>
        </div>
        <ul className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:[&>li:nth-child(3n+2)]:translate-y-12">
          {areaTiles.map((t) => (
            <li key={t.id} className="group relative">
              <div className="bg-card group-hover:border-foreground/25 relative aspect-[2/1] overflow-hidden rounded-3xl border transition-[box-shadow,border-color] duration-300 group-hover:shadow-[0_24px_60px_-24px_rgb(0_0_0/0.4)] motion-reduce:transition-none">
                <Themed base={t.thumb} alt="" width={900} height={620} className="absolute inset-0 size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-3 px-1">
                <Link href={`/blocks#${t.id}`} className="text-lg font-semibold tracking-tight outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50">
                  {t.label}
                </Link>
                <span className="text-muted-foreground text-sm tabular-nums">{t.count}{t.free > 0 ? ` · ${t.free} free` : ""}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 6. Plans: Pro is the big one. */}
      <section id="plans" aria-labelledby="plans-h" className="bg-muted/30 scroll-mt-16 border-y">
        <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6">
          <h2 id="plans-h" className="mb-12 max-w-2xl text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">Start free. Pay once for more.</h2>
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="bg-foreground text-background flex flex-col rounded-3xl p-8 sm:p-10 lg:col-span-7 lg:row-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pro</h3>
                {founding && <span className="rounded-full border border-current/25 px-2.5 py-0.5 text-xs font-medium">Founding price</span>}
              </div>
              <p className={cn("mt-8 flex flex-wrap items-baseline gap-x-4 font-semibold tracking-[-0.06em]", proPrice ? "text-7xl sm:text-8xl" : "text-5xl sm:text-6xl")}>
                {proPrice ?? "One payment"}
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
                  <CheckoutLink href={offer.checkout} plan="pro" className={cn(buttonVariants({ variant: "secondary", shape: "pill", size: "lg" }), "h-13 w-full text-base sm:w-auto sm:px-10")}>
                    Get Pro for {proPrice}
                  </CheckoutLink>
                ) : (
                  <Link href="/pricing?utm_source=ballmac-ui&utm_medium=home-plans&utm_campaign=pro#plans" className={cn(buttonVariants({ variant: "secondary", shape: "pill", size: "lg" }), "h-13 w-full text-base sm:w-auto sm:px-10")}>
                    See Pro pricing
                  </Link>
                )}
              </div>
            </div>

            <div className="bg-card flex flex-col rounded-3xl border p-8 lg:col-span-5">
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

            <div className="bg-card flex flex-col rounded-3xl border p-8 lg:col-span-5">
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
            <a href={REFUND_PATH} className="text-muted-foreground underline underline-offset-4">Refund policy</a>
            <Link href="/pricing" className="text-muted-foreground underline underline-offset-4">Compare everything</Link>
          </p>
        </div>
      </section>

      {/* 7. Proof and the short answers. */}
      <section aria-labelledby="proof-h" className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
          <div>
            <p className="text-7xl font-semibold tracking-[-0.06em] tabular-nums sm:text-8xl">{quality.perfect}<span className="text-muted-foreground">/{quality.items}</span></p>
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

      {/* 8. Close. */}
      <section aria-labelledby="close-h" className="dark bg-[#09090d] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-x-12 gap-y-8 px-4 py-24 sm:px-6">
          <div className="max-w-full min-w-0">
            <h2 id="close-h" className="max-w-3xl text-5xl font-semibold tracking-[-0.055em] text-balance sm:text-7xl">Install your first screen.</h2>
            <div className="mt-8 flex w-fit max-w-full items-center gap-3 rounded-full border border-white/15 bg-white/[0.05] py-2 ps-5 pe-2">
              <code dir="ltr" className="min-w-0 truncate font-mono text-sm"><span className="text-white/40">$ </span>{command}</code>
              <CopyButton value={command} label="Copy the install command" className="size-8 shrink-0 rounded-full text-white/60 hover:bg-white/10 hover:text-white" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/blocks" className="focus-visible:ring-ring/60 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-black outline-none hover:bg-white/90 focus-visible:ring-[3px]">
              Browse screens <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
            <Link href="/pricing?utm_source=ballmac-ui&utm_medium=home&utm_campaign=closing#plans" className="px-3 text-sm font-medium text-white/80 underline underline-offset-4 hover:text-white">Pro and Team</Link>
          </div>
        </div>
      </section>
    </>
  )
}
