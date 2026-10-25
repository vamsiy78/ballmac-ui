import { ArrowRight, ArrowUpRight, Check, ChevronDown, Minus, ShieldCheck } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/site/link"

import { buttonVariants } from "@/components/ballmac/button"
import { LiveScreen } from "@/components/home/live-screen"
import { ShipFlow, type FlowScreen } from "@/components/home/ship-flow"
import { CheckoutLink } from "@/components/pro/checkout-link"
import { Themed } from "@/components/pro/shots"
import { CopyButton } from "@/components/site/copy-button"
import { FoundingBanner } from "@/components/site/founding-banner"
import { LeftPhrase } from "@/components/site/founding-text"
import { GithubStars } from "@/components/site/github-stars"
import { shownPath } from "@/components/site/item-install"
import { SiteJsonLd } from "@/components/site/site-jsonld"
import { WhatsNewBanner } from "@/components/site/whats-new-banner"
import { FOUNDERS_EMAIL } from "@/lib/founders"
import { starsAtBuild } from "@/lib/github-stars-build"
import { getOffer } from "@/lib/offer"
import { PRO_LICENCE_PATH } from "@/lib/pro-licence"
import { REFUND_FIX_DAYS, REFUND_PATH, REFUND_REPORT_DAYS } from "@/lib/pro-refund"
import { TEAM_CHECKOUT, TEAM_PRICE, TEAM_SEATS, teamPerSeat } from "@/lib/pro-team"
import { formatMeasured, measured, overview } from "@/lib/quality"
import { blockCategoryLabels, blockGroups, getBlocks, getComponents, getItem, getTemplates, highlight, isPro, readSource } from "@/lib/registry"
import { thumbFor } from "@/lib/thumbs"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  description: "Finished app screens for shadcn, React and Tailwind: dashboards, billing, settings, inboxes and AI consoles. Install one with the CLI or your AI agent, then change it like your own code. Free and MIT licensed.",
  alternates: { canonical: "/" },
}

/** The four screens the install flow walks through. Each is a real free block, with a request an agent could be given for it. */
const FLOW = [
  { id: "dashboard-1", name: "Dashboard", prompt: "Add a sales overview dashboard to my app.", reply: "Found the dashboard-1 block in the Ballmac registry and installed it. Give its props your own data." },
  { id: "billing-1", name: "Billing", prompt: "I need a billing page with the current plan, usage and invoices.", reply: "Found billing-1, installed it, and its plan and usage props are ready for your data." },
  { id: "agent-12", name: "Agent control", prompt: "Build a screen to watch my team of agents and approve their risky actions.", reply: "Found agent-12 (mission control with an approvals inbox) and installed it." },
  { id: "analytics-1", name: "Analytics", prompt: "Add an analytics page with a funnel and the top pages.", reply: "Found analytics-1 and installed it. Give it your periods and it draws the rest." },
] as const

/** One real screen per kind of work, with a thumbnail that exists in this build. */
const AREAS = [
  { id: "application", thumb: "billing-1", note: "Dashboards, billing, settings, inbox, boards and AI agent consoles." },
  { id: "ops", thumb: "alerts-1", note: "Alerts, on-call, incidents, deploys, costs and runbooks." },
  { id: "vertical", thumb: "floorplan-1", note: "Restaurant floors, gradebooks, fleets, claims and booking pages." },
  { id: "marketing", thumb: "hero-1", note: "Heroes, features, pricing, proof and calls to action." },
  { id: "shop", thumb: "ecommerce-2", note: "Product pages, bags, checkout and order tracking." },
  { id: "account", thumb: "login-1", note: "Sign in, sign up, verification and onboarding." },
] as const

export default async function Home() {
  const components = getComponents()
  const blocks = getBlocks()
  const templates = getTemplates()
  const proBlocks = blocks.filter(isPro)
  const freeBlocks = blocks.filter((b) => !isPro(b))
  const freeComponents = components.filter((c) => !isPro(c))
  const now = new Date()
  const offer = await getOffer(now)
  const founding = offer.founding
  const stars = await starsAtBuild()
  const quality = overview()

  const screens: FlowScreen[] = (
    await Promise.all(
      FLOW.map(async (f): Promise<FlowScreen | null> => {
        const item = getItem(f.id)
        const file = item?.files[0]
        if (!item || !file) return null
        const lines = readSource(file.source).split("\n")
        if (lines.length < 3) return null
        const snippet = `${lines.slice(0, 26).join("\n")}\n// ...`
        const thumb = thumbFor(f.id, "free")
        return {
          id: f.id,
          name: f.name,
          command: `npx shadcn@latest add @ballmac/${f.id}`,
          prompt: f.prompt,
          reply: f.reply,
          path: shownPath(file.target),
          codeHtml: await highlight(snippet),
          poster: thumb ? <Themed base={thumb} alt="" width={800} height={500} priority={f.id === "dashboard-1"} /> : null,
        }
      })
    )
  ).filter((s): s is FlowScreen => s !== null)

  const heroThumb = thumbFor("dashboard-1", "free")
  const heroCommand = "npx shadcn@latest add @ballmac/dashboard-1"
  const areaTiles = AREAS.flatMap((t) => {
    const g = blockGroups.find((x) => x.id === t.id)
    const thumb = thumbFor(t.thumb, "free")
    const count = g ? freeBlocks.filter((b) => (g.categories as readonly string[]).includes(b.blockCategory ?? "")).length : 0
    return g && thumb && count > 0 ? [{ id: t.id, label: g.label, note: t.note, thumb, count }] : []
  })

  // Where Pro goes much deeper than free, by kind of block, from the real catalogue.
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
    .slice(0, 5)

  const proHref = "/pro?utm_source=ballmac-ui&utm_medium=home-hero&utm_campaign=hero"
  const proPrice = offer.onSale && offer.price ? `$${offer.price}` : null
  const teamHref = TEAM_CHECKOUT || `mailto:${FOUNDERS_EMAIL}?subject=${encodeURIComponent("Team licence for Ballmac UI Pro")}`
  const starters = 3

  const OBJECTIONS: { q: string; a: React.ReactNode }[] = [
    { q: "Will it fit my project?", a: "It installs through the shadcn CLI, so it goes wherever shadcn does: Next.js, Vite, Remix and others. Each screen lands as files in your own components folder, and the CLI adds the other Ballmac pieces it uses." },
    { q: "How much can I change?", a: "All of it. The code is yours the moment it is installed, there is no package to depend on and no wrapper to work around. When we ship a fix, the ballmac update command merges it into the file you edited." },
    { q: "What does it depend on?", a: "React and Tailwind, plus small libraries that each item names on its page, such as lucide-react for icons. The page for every item lists exactly what it needs and the CLI installs it." },
    { q: "How do I know the quality is real?", a: <>Every item is loaded in a real browser in light, dark, phone width, reduced motion and right to left, and the results are published, including what failed. <Link href="/quality" className="text-foreground underline underline-offset-4">See the scorecard</Link>.</> },
    { q: "Can I use the free library for client or commercial work?", a: "Yes. Free items are MIT licensed. Use them in personal, client and commercial projects, and change them however you like. Anything released as free stays free." },
    { q: "What is the real difference between Free and Pro?", a: `Free is a complete library you can ship with. Pro adds ${proBlocks.length} more blocks that go deeper in areas like ${gaps.slice(0, 3).map((g) => g.label.toLowerCase()).join(", ")}, ${starters} complete starter apps, a private registry for your CLI and agent, Figma tokens and every future Pro update. It does not unlock anything you have already used for free.` },
    { q: "What can I do with a Pro or Team licence?", a: <>Build any number of apps and sites with the code, for yourself or your clients, and change it. You cannot resell, share or publish the Pro source, or use it to train AI models. Pro is one person; Team is up to {TEAM_SEATS} people at one organisation. Read the <a href={PRO_LICENCE_PATH} className="text-foreground underline underline-offset-4">Pro licence</a> before you buy.</> },
    { q: "What if Pro does not work as described?", a: <>Tell us within {REFUND_REPORT_DAYS} days of buying. If an item does not do what its page says and we cannot fix it within {REFUND_FIX_DAYS} days of your request, you get a full refund. Mistakes on our side are always refunded. <a href={REFUND_PATH} className="text-foreground underline underline-offset-4">Refund policy</a>.</> },
  ]

  return (
    <>
      <SiteJsonLd />
      {founding && <FoundingBanner offer={founding} at={now.getTime()} />}
      <WhatsNewBanner id="2026-10-batch-3" added={52} examples={["a restaurant floor plan", "a gradebook", "an agent console", "a treemap", "salon booking", "insurance claims"]} />

      {/* 1. Hero: the outcome, the mechanism, one next step for each kind of visitor, and the product itself. */}
      <section aria-labelledby="hero-h" className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_0%,black,transparent)]" />
        <div className="mx-auto max-w-[1280px] px-4 pt-14 text-center sm:px-6 md:pt-20">
          <Link href="/blocks" className="bg-muted/60 hover:bg-muted focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-full py-1 pe-3 ps-1 text-[13px] outline-none transition-colors focus-visible:ring-[3px] dark:bg-white/[0.06] dark:hover:bg-white/10">
            <span className="bg-background rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide shadow-xs">FREE</span>
            <span className="text-muted-foreground">
              {freeBlocks.length} screens, {freeComponents.length} components, {templates.length} templates
            </span>
            <ArrowRight className="text-muted-foreground size-3.5 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
          <h1 id="hero-h" className="mx-auto mt-6 max-w-4xl text-4xl leading-[1.04] font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
            The app screens you&rsquo;d rather not build, installed in one command
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
            Ballmac UI is a library of finished React and Tailwind screens for shadcn projects: dashboards, billing, settings, inboxes and AI consoles. Install one with the CLI or your AI agent, then change it like code you wrote.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <Link href="/blocks" className={buttonVariants({ shape: "pill", size: "lg" })}>
              Browse the free screens <ArrowRight className="rtl:-scale-x-100" />
            </Link>
            <Link href={proHref} className={buttonVariants({ shape: "pill", size: "lg", variant: "secondary" })}>
              See what Pro adds
            </Link>
          </div>
          <ul className="text-muted-foreground mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px]">
            <li className="flex items-center gap-1.5"><Check className="size-3.5" aria-hidden="true" />MIT licensed</li>
            <li className="flex items-center gap-1.5">
              <Check className="size-3.5" aria-hidden="true" />
              Listed in the{" "}
              <a href="https://ui.shadcn.com/docs/directory" target="_blank" rel="noopener noreferrer" className="text-foreground rounded-sm underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">official shadcn directory</a>
            </li>
            <li className="flex items-center gap-1.5"><Check className="size-3.5" aria-hidden="true" />Works with Claude Code, Cursor and Codex</li>
            <li><GithubStars initial={stars} variant="hero" /></li>
          </ul>
          {founding && (
            <p className="text-muted-foreground mt-3 text-[13px]">
              Pro founding price: ${founding.price} once{founding.listPrice ? `, then $${founding.listPrice}` : ""}. First {founding.limit} buyers{founding.endsAt ? <>. <LeftPhrase endsAt={founding.endsAt} at={now.getTime()} capitalize /></> : null}.
            </p>
          )}
        </div>

        <div className="mx-auto mt-12 max-w-[1100px] px-4 pb-20 sm:px-6">
          <div className="bg-card relative overflow-hidden rounded-2xl border shadow-[0_40px_100px_-40px_rgb(0_0_0/0.45)]">
            <div className="bg-muted/60 flex h-10 items-center gap-3 border-b px-4" aria-hidden="true">
              <span className="flex w-16 gap-1.5">
                <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                <span className="size-2.5 rounded-full bg-[#febc2e]" />
                <span className="size-2.5 rounded-full bg-[#28c840]" />
              </span>
              <span className="text-muted-foreground bg-background/70 mx-auto w-full max-w-xs truncate rounded-md px-3 py-0.5 text-center text-xs">app.acme.com/dashboard</span>
              <span className="w-16" />
            </div>
            <LiveScreen id="dashboard-1" poster={heroThumb ? <Themed base={heroThumb} alt="" width={1200} height={750} priority /> : null} />
          </div>
          <div className="bg-card relative z-10 mx-auto -mt-7 flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-3 rounded-full border py-2 ps-5 pe-2 shadow-lg">
            <code className="min-w-0 truncate font-mono text-[13px]" dir="ltr"><span className="text-muted-foreground">$ </span>{heroCommand}</code>
            <CopyButton value={heroCommand} label="Copy the install command" className="size-8 shrink-0 rounded-full" />
          </div>
          <p className="text-muted-foreground mt-4 text-center text-[13px]">
            This is the real <span className="font-mono">dashboard-1</span> block, drawn live.{" "}
            <Link href="/blocks/dashboard-1" className="text-foreground rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">Open it and use it</Link>
          </p>
        </div>
      </section>

      {/* 2. The flow, shown with real parts: a screen, the command, its source, your theme. */}
      {screens.length > 0 && (
        <section id="how" aria-labelledby="how-h" className="bg-muted/30 scroll-mt-16 border-y">
          <div className="mx-auto max-w-[1280px] px-4 py-24 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="how-h" className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">From a blank project to a working screen</h2>
              <p className="text-muted-foreground mt-3 text-base leading-relaxed text-pretty sm:text-lg">Four steps, all of them real. The screen is a real block, the command is the real command, and the source is the real file.</p>
            </div>
            <div className="mt-12">
              <ShipFlow screens={screens} />
            </div>
          </div>
        </section>
      )}

      {/* 3. Why it saves time. */}
      <section aria-labelledby="why-h" className="mx-auto max-w-[1280px] px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="why-h" className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">The part of the product everyone rebuilds, already built</h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed text-pretty sm:text-lg">Settings, billing, empty lists and error pages are rarely what makes a product special, and they take as long as the parts that are.</p>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          <li className="bg-card flex flex-col overflow-hidden rounded-2xl border">
            <div aria-hidden="true" className="bg-muted/40 grid min-h-48 place-items-center border-b p-5">
              <div className="grid w-full max-w-[16rem] gap-2">
                {["Dashboard", "Billing", "Settings", "Inbox"].map((t, i) => (
                  <div key={t} className={cn("bg-background flex items-center justify-between rounded-lg border px-3 py-2 text-xs shadow-xs", i === 0 && "ring-foreground/20 ring-2")}>
                    <span className="font-medium">{t}</span>
                    <span className="text-muted-foreground">same tokens</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold tracking-tight">Whole screens that match</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">Not a button here and a card there. Complete screens built from the same components and tokens, so a dashboard, a billing page and a settings page already look like one product.</p>
            </div>
          </li>
          <li className="bg-card flex flex-col overflow-hidden rounded-2xl border">
            <div aria-hidden="true" className="bg-muted/40 grid min-h-48 place-items-center border-b p-5">
              <div dir="ltr" className="bg-background w-full max-w-[17rem] overflow-hidden rounded-xl border font-mono text-[11px] shadow-xs">
                <div className="bg-muted/60 text-muted-foreground border-b px-3 py-1.5">billing-1.tsx</div>
                <div className="grid gap-0.5 p-3 leading-relaxed">
                  <p><span className="font-semibold">export function</span> Billing1()</p>
                  <p className="text-muted-foreground">{"  // yours now. Change anything."}</p>
                  <p className="bg-chart-2/15 rounded px-1">+ &lt;Badge&gt;Annual&lt;/Badge&gt;</p>
                  <p className="text-muted-foreground">$ ballmac update</p>
                  <p className="font-medium">✓ Merged, your edit kept</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold tracking-tight">Source you own, updates that keep your edits</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">Installed as plain files in your project, with nothing to depend on. When a block improves, <span className="font-mono text-[13px]">ballmac update</span> merges the change into your edited copy.</p>
            </div>
          </li>
          <li className="bg-card flex flex-col overflow-hidden rounded-2xl border">
            <div aria-hidden="true" className="bg-muted/40 grid min-h-48 place-items-center border-b p-5">
              <div className="grid w-full max-w-[16rem] grid-cols-3 gap-2 text-center text-[11px] font-medium">
                {[["Loading", "skeletons"], ["Empty", "next step"], ["Error", "try again"]].map(([a, b]) => (
                  <div key={a} className="bg-background rounded-lg border p-2.5 shadow-xs">
                    <div className="bg-muted mx-auto mb-2 h-1.5 w-8 rounded-full" />
                    <div className="bg-muted mx-auto mb-1 h-1.5 w-12 rounded-full" />
                    <p className="mt-2">{a}</p>
                    <p className="text-muted-foreground font-normal">{b}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold tracking-tight">The unhappy paths are done</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">Blocks that show data come with loading, empty and error views, and every item is checked for keyboard use, dark mode, reduced motion and right-to-left layouts.</p>
            </div>
          </li>
        </ul>
      </section>

      {/* 4. The catalogue, by the work you are doing. */}
      <section aria-labelledby="start-h" className="mx-auto max-w-[1280px] px-4 pb-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 id="start-h" className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">Start from the screen you need</h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed text-pretty sm:text-lg">{freeBlocks.length} free screens across the work every product has. Open any one to use it, resize it and copy it.</p>
          </div>
          <Link href="/blocks" className={buttonVariants({ variant: "outline", shape: "pill", size: "sm" })}>
            All screens <ArrowRight className="rtl:-scale-x-100" />
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areaTiles.map((t) => (
            <li key={t.id} className="group bg-card hover:border-foreground/20 relative overflow-hidden rounded-2xl border transition-[border-color,box-shadow] duration-300 hover:shadow-[0_12px_40px_-16px_rgb(0_0_0/0.35)] motion-reduce:transition-none">
              <div className="bg-background relative aspect-[2/1] overflow-hidden border-b">
                <Themed base={t.thumb} alt="" width={800} height={400} className="absolute inset-0 size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
              </div>
              <div className="flex items-baseline justify-between gap-3 p-4">
                <Link href={`/blocks#${t.id}`} className="font-semibold tracking-tight outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50">
                  {t.label}
                </Link>
                <span className="text-muted-foreground text-sm tabular-nums">{t.count} free</span>
              </div>
              <p className="text-muted-foreground -mt-2 px-4 pb-4 text-[13px] leading-relaxed">{t.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Free, Pro or Team: what each lets you do, then the price. */}
      <section id="plans" aria-labelledby="plans-h" className="bg-muted/30 scroll-mt-16 border-y">
        <div className="mx-auto max-w-[1180px] px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="plans-h" className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">Start free. Pay once when you need more.</h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed text-pretty sm:text-lg">Free is a complete library you can ship with. Pro saves the work free does not cover. Team is Pro for a group, on one licence.</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            <div className="bg-card flex flex-col rounded-2xl border p-7">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="text-muted-foreground mt-1 text-sm">Build and launch a real product</p>
              <p className="mt-5 text-4xl font-semibold tracking-[-0.04em]">$0</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {[`${freeBlocks.length} screens and ${templates.length} whole-page templates`, `${freeComponents.length} components with live previews`, "shadcn CLI and MCP installs", "Commercial use, MIT licensed", "Quality scorecards and ballmac update"].map((t) => (
                  <li key={t} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{t}</li>
                ))}
              </ul>
              <Link href="/blocks" className={cn(buttonVariants({ variant: "outline", shape: "pill", size: "lg" }), "mt-8")}>Browse the free screens</Link>
            </div>

            <div className="bg-foreground text-background flex flex-col rounded-2xl p-7">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pro</h3>
                {founding && <span className="rounded-full border border-current/25 px-2.5 py-0.5 text-xs font-medium">Founding price</span>}
              </div>
              <p className="mt-1 text-sm opacity-70">Skip the work free does not cover</p>
              <p className="mt-5 flex flex-wrap items-baseline gap-x-3 text-4xl font-semibold tracking-[-0.04em]">
                {proPrice ?? "Pay once"}
                {founding?.listPrice && <span className="text-xl font-medium tracking-normal line-through opacity-60"><span className="sr-only">Regular price </span>${founding.listPrice}</span>}
                {proPrice && <span className="text-sm font-normal tracking-normal opacity-70">once, tax included</span>}
              </p>
              <p className="mt-6 text-sm font-medium opacity-90">Where Pro goes deeper than free</p>
              <ul className="mt-2.5 space-y-1.5 text-sm">
                {gaps.map((g) => (
                  <li key={g.label} className="flex items-baseline justify-between gap-3">
                    <span>{g.label}</span>
                    <span className="font-mono text-xs tabular-nums opacity-75">{g.free} free · {g.pro} Pro</span>
                  </li>
                ))}
              </ul>
              <ul className="mt-5 flex-1 space-y-3 border-t border-current/15 pt-5 text-sm">
                {[`${proBlocks.length} more blocks, and every future Pro update`, `${starters} complete starter apps: Beacon (SaaS), Quire (AI assistant), Cove (desktop)`, "A private registry for your CLI and AI agent", "Figma design tokens for every theme"].map((t) => (
                  <li key={t} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{t}</li>
                ))}
              </ul>
              {offer.onSale && offer.checkout ? (
                <CheckoutLink href={offer.checkout} plan="pro" className={cn(buttonVariants({ variant: "secondary", shape: "pill", size: "lg" }), "mt-8")}>
                  Get Pro for {proPrice}
                </CheckoutLink>
              ) : (
                <Link href="/pricing?utm_source=ballmac-ui&utm_medium=home-plans&utm_campaign=pro#plans" className={cn(buttonVariants({ variant: "secondary", shape: "pill", size: "lg" }), "mt-8")}>See Pro pricing</Link>
              )}
              <p className="mt-3 text-center text-xs opacity-70">One licence for one person. No subscription.</p>
            </div>

            <div className="bg-card flex flex-col rounded-2xl border p-7">
              <h3 className="text-lg font-semibold">Team</h3>
              <p className="text-muted-foreground mt-1 text-sm">One licence for the people building with it</p>
              <p className="mt-5 flex flex-wrap items-baseline gap-x-3 text-4xl font-semibold tracking-[-0.04em]">
                ${TEAM_PRICE}
                <span className="text-muted-foreground text-sm font-normal tracking-normal">once, up to {TEAM_SEATS} people (${teamPerSeat()} each)</span>
              </p>
              <p className="text-muted-foreground mt-6 text-sm leading-relaxed text-pretty">Everything in Pro, without buying {TEAM_SEATS} licences or passing one key around.</p>
              <ul className="mt-4 flex-1 space-y-3 text-sm">
                {[`Up to ${TEAM_SEATS} named people at one organisation`, "One licence key for the team and your CI", "Your company name and tax ID on the invoice", "Every future update included"].map((t) => (
                  <li key={t} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{t}</li>
                ))}
                <li className="text-muted-foreground flex gap-3"><Minus className="mt-0.5 size-4 shrink-0" aria-hidden="true" />More than {TEAM_SEATS} people: write to us</li>
              </ul>
              {offer.onSale && TEAM_CHECKOUT ? (
                <CheckoutLink href={TEAM_CHECKOUT} plan="team" className={cn(buttonVariants({ variant: "outline", shape: "pill", size: "lg" }), "mt-8")}>
                  Get Team for ${TEAM_PRICE}
                </CheckoutLink>
              ) : (
                <a href={teamHref} className={cn(buttonVariants({ variant: "outline", shape: "pill", size: "lg" }), "mt-8")}>Get Team by email</a>
              )}
            </div>
          </div>
          <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 text-center">
            <p className="flex items-start gap-2 text-sm">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-medium">Works as described, or your money back.</span>{" "}
                <span className="text-muted-foreground">If a Pro item does not do what its page says and we cannot fix it within {REFUND_FIX_DAYS} days of your request, you get a full refund. </span>
                <a href={REFUND_PATH} className="underline underline-offset-4">Refund policy</a>
              </span>
            </p>
            <p className="text-muted-foreground text-[13px]">
              Tax is included and your invoice is sent for you. By buying you agree to the <a href={PRO_LICENCE_PATH} className="text-foreground underline underline-offset-4">Pro licence</a>.{" "}
              <Link href="/pricing" className="text-foreground underline underline-offset-4">Compare every feature</Link>
            </p>
          </div>
        </div>
      </section>

      {/* 6. Proof you can check, and the questions that stop a purchase. */}
      <section aria-labelledby="trust-h" className="mx-auto max-w-[1180px] px-4 py-24 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <h2 id="trust-h" className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">Things you can check yourself</h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed text-pretty">No logos and no borrowed quotes. These are all public.</p>
            <ul className="mt-8 grid gap-3">
              {[
                { t: quality.perfect === quality.items ? `All ${quality.items} items pass every check` : `${quality.perfect} of ${quality.items} items pass every check`, d: `Each is loaded in a real browser in light, dark, phone width, reduced motion and right to left. Anything that fails is listed on the scorecard, not hidden.${measured.generated ? ` Last run: ${formatMeasured(measured.generated)}.` : ""}`, href: "/quality", cta: "Read the scorecard" },
                { t: "MIT licensed, and listed by shadcn", d: "The free library is open source and appears in the official shadcn registry directory.", href: "https://ui.shadcn.com/docs/directory", cta: "See the listing", external: true },
                { t: "Every screen has a public preview", d: "Including every Pro block. Resize it, tab through it and switch themes before you decide.", href: "/blocks", cta: "Open the catalogue" },
              ].map((x) => (
                <li key={x.t} className="bg-card rounded-2xl border p-5">
                  <p className="font-semibold tracking-tight">{x.t}</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed text-pretty">{x.d}</p>
                  <a href={x.href} {...(x.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="text-foreground mt-3 inline-flex items-center gap-1 rounded-sm text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    {x.cta} <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-balance sm:text-3xl">Before you decide</h2>
            <div className="mt-6 divide-y border-y">
              {OBJECTIONS.map((f, i) => (
                <details key={f.q} className="group py-1" open={i === 0}>
                  <summary className="focus-visible:ring-ring/50 flex cursor-pointer list-none items-center justify-between gap-4 rounded-md py-4 text-[15px] font-medium outline-none focus-visible:ring-[3px] [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                  </summary>
                  <div className="text-muted-foreground pb-5 text-[15px] leading-relaxed text-pretty">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Two ways out. */}
      <section aria-labelledby="close-h" className="bg-foreground text-background">
        <div className="mx-auto max-w-[900px] px-4 py-20 text-center sm:px-6">
          <h2 id="close-h" className="text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Start with one screen. Add Pro when you need more.</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed opacity-75 sm:text-lg">Install a free screen today and see how it fits your project. Nothing to sign up for.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/blocks" className={buttonVariants({ variant: "secondary", shape: "pill", size: "lg" })}>
              Browse the free screens <ArrowRight className="rtl:-scale-x-100" />
            </Link>
            <Link href="/pricing?utm_source=ballmac-ui&utm_medium=home&utm_campaign=closing#plans" className="rounded-full px-5 py-2.5 text-sm font-medium underline underline-offset-4 opacity-85 hover:opacity-100">
              Compare Free, Pro and Team
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
