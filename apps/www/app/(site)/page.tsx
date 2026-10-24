import { ArrowRight, ArrowUpRight, Check, ChevronDown } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/site/link"

import { buttonVariants } from "@/components/ballmac/button"
import { ThemeCompare } from "@/components/home/theme-compare"
import { Themed } from "@/components/pro/shots"
import { GithubStars } from "@/components/site/github-stars"
import { FoundingBanner } from "@/components/site/founding-banner"
import { WhatsNewBanner } from "@/components/site/whats-new-banner"
import { ProCallout } from "@/components/site/pro-callout"
import { SiteJsonLd } from "@/components/site/site-jsonld"
import { LeftPhrase } from "@/components/site/founding-text"
import { starsAtBuild } from "@/lib/github-stars-build"
import { thumbFor } from "@/lib/thumbs"
import { getOffer } from "@/lib/offer"
import { CopyButton } from "@/components/site/copy-button"
import { FitWidth } from "@/components/site/fit-preview"
import { LazyMount } from "@/components/site/lazy-mount"
import { loadThumb } from "@/lib/examples"
import { blockGroups, getBlocks, getComponents, getTemplates, isPro } from "@/lib/registry"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { alternates: { canonical: "/" } }


const install = "npx shadcn@latest add @ballmac/dock"

const FAQ = [
  { q: "What is Ballmac UI?", a: "A shadcn-compatible library of React and Tailwind components, blocks and templates. Each item is source you copy into your project and own from then on." },
  { q: "How do I install a block?", a: "Run the shadcn CLI, for example npx shadcn@latest add @ballmac/alerts-1, or copy the source from its page. There is no package to depend on and nothing to keep in sync." },
  { q: "Does it work with Claude Code, Cursor or Codex?", a: "Yes. Ballmac UI follows the shadcn registry standard, so the shadcn MCP server can search it, read when to use each item and install it into your project." },
  { q: "Does it support dark mode, RTL and reduced motion?", a: "Yes, on every item. Colours come from tokens, layouts use logical properties so they flip for right-to-left languages, and motion holds still when a visitor asks for less of it." },
  { q: "What is free and what is Pro?", a: "The components, blocks and templates in the free library are MIT licensed and free for commercial work. Pro adds 150 deeper app blocks, a private registry, Figma tokens and every future update, for one payment." },
  { q: "Can I use it in client projects?", a: "Yes. Free items can be used in personal, client and commercial projects. A Pro licence is for one person, and Team covers up to 10 people at one organisation." },
  { q: "What if Pro does not work as described?", a: "Report it within 14 days of your purchase. If an item does not do what its page says and we cannot fix it, you get a full refund." },
] as const

export default async function Home() {
  const components = getComponents()
  const blocks = getBlocks()
  const templates = getTemplates()
  const templateCards = await Promise.all([...templates].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 2).reverse().map(async (t) => ({ ...t, Preview: t.examples[0] ? await loadThumb(t.examples[0].name) : null })))
  // One real screen per kind of work, with a thumbnail that exists in this build.
  const START = [
    { id: "application", thumb: "billing-1", note: "Dashboards, billing, settings, inbox, boards and AI agent consoles." },
    { id: "ops", thumb: "alerts-1", note: "Alerts, on-call, incidents, deploys, costs and runbooks." },
    { id: "vertical", thumb: "floorplan-1", note: "Restaurant floors, gradebooks, fleets, claims and booking pages." },
    { id: "marketing", thumb: "hero-1", note: "Heroes, features, pricing, proof and calls to action." },
    { id: "shop", thumb: "listing-1", note: "Product pages, carts and checkout." },
    { id: "account", thumb: "login-1", note: "Sign in, sign up, verification and onboarding." },
    { id: "content", thumb: "changelog-1", note: "Blogs, changelogs, careers, help and trust centres." },
    { id: "desktop", thumb: "desktop-1", note: "App windows, menu bars and settings for desktop apps." },
  ] as const
  const startTiles = START.flatMap((t) => {
    const g = blockGroups.find((x) => x.id === t.id)
    const thumb = thumbFor(t.thumb, "free")
    const count = g ? blocks.filter((b) => (g.categories as readonly string[]).includes(b.blockCategory ?? "")).length : 0
    return g && thumb && count > 0 ? [{ id: t.id, label: g.label, note: t.note, thumb, count: `${count} ${count === 1 ? "block" : "blocks"}` }] : []
  })

  const now = new Date()
  const proOffer = await getOffer(now)
  const offer = proOffer.founding
  const proBlockCount = blocks.filter(isPro).length || 150
  const freeBlockCount = blocks.filter((b) => !isPro(b)).length
  const stars = await starsAtBuild()
  const proHref = "/pro?utm_source=ballmac-ui&utm_medium=home-hero&utm_campaign=hero"
  return (
    <>
      <SiteJsonLd />
      {offer && <FoundingBanner offer={offer} at={now.getTime()} />}
      <WhatsNewBanner id="2026-10-batch-3" added={52} examples={["a restaurant floor plan", "a gradebook", "an agent console", "a treemap", "salon booking", "insurance claims"]} />
      {/* Hero: calm and specific. One promise, the numbers, two buttons. */}
      <section className="mx-auto max-w-[1440px] px-4 pt-14 pb-10 text-center sm:px-6 md:pt-20">
        <Link
          href="/blocks"
          className="bg-muted/60 hover:bg-muted focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-[13px] outline-none transition-colors focus-visible:ring-[3px] dark:bg-white/[0.06] dark:hover:bg-white/10"
        >
          <span className="bg-background rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide shadow-xs">FREE</span>
          <span className="text-muted-foreground">{freeBlockCount} blocks, {components.length} components, {templates.length} templates</span>
          <ArrowRight className="text-muted-foreground size-3.5" aria-hidden="true" />
        </Link>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
          Finished screens for shadcn
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
          Real working screens for React and Tailwind: dashboards, billing, agent consoles, on-call rotas and more. Copy the source and make it yours. MIT licensed.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <Link href="/blocks" className={buttonVariants({ shape: "pill", size: "lg" })}>
            Browse blocks
          </Link>
          <Link href={proHref} className={buttonVariants({ shape: "pill", size: "lg", variant: "secondary" })}>
            {proOffer.onSale && proOffer.price ? `Get Pro for $${proOffer.price}` : "See Ballmac UI Pro"}
          </Link>
        </div>
        {offer && (
          <p className="text-muted-foreground mt-3 text-[13px]">
            Founding price: ${offer.price} once{offer.listPrice ? `, then $${offer.listPrice}` : ""}. First {offer.limit} buyers{offer.endsAt ? <>. <LeftPhrase endsAt={offer.endsAt} at={now.getTime()} capitalize /></> : null}.
          </p>
        )}
      </section>

      <section aria-labelledby="same-h" className="mx-auto max-w-[1100px] px-4 pb-24 sm:px-6">
        <h2 id="same-h" className="mx-auto mb-10 max-w-md text-center text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">The same screen, in light and dark</h2>
        <ThemeCompare />
      </section>

      {/* Three small proofs, drawn in HTML so they stay sharp in light and dark */}
      <section aria-labelledby="own-h" className="mx-auto max-w-[1100px] px-4 pb-24 sm:px-6">
        <h2 id="own-h" className="mx-auto max-w-md text-center text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">Copy it, own it, ship it</h2>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          <li className="bg-card flex flex-col overflow-hidden rounded-2xl border">
            <div className="bg-muted/40 grid min-h-52 place-items-center border-b p-5" aria-hidden="true">
              <div className="bg-background w-full max-w-[17rem] overflow-hidden rounded-xl border font-mono text-[11px] shadow-xs">
                <div className="bg-muted/60 text-muted-foreground flex items-center justify-between border-b px-3 py-1.5"><span>Terminal</span><span>zsh</span></div>
                <div className="grid gap-1 p-3 leading-relaxed">
                  <p><span className="text-muted-foreground">$ </span>npx shadcn add @ballmac/alerts-1</p>
                  <p className="text-chart-2">✓ Created 1 file</p>
                  <p className="text-muted-foreground mt-1">components/blocks/alerts-1/</p>
                  <p className="bg-muted/60 rounded px-2 py-1">alerts-1.tsx</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold tracking-tight">One command, one file</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">Install with the shadcn CLI or copy it. It lands as plain source you own and can change.</p>
              <div className="bg-muted/50 mt-4 flex items-center gap-2 rounded-lg border py-1 pr-1 pl-3 font-mono text-xs">
                <span className="min-w-0 flex-1 truncate">{install}</span>
                <CopyButton value={install} label="Copy install command" />
              </div>
            </div>
          </li>
          <li className="bg-card flex flex-col overflow-hidden rounded-2xl border">
            <div className="bg-muted/40 grid min-h-52 place-items-center border-b p-5" aria-hidden="true">
              <div className="grid w-full max-w-[17rem] gap-2 text-xs">
                <p className="bg-foreground text-background ms-auto max-w-[85%] rounded-2xl rounded-br-md px-3 py-2">Add an alert rules screen to the settings page</p>
                <p className="bg-background max-w-[92%] rounded-2xl rounded-bl-md border px-3 py-2 shadow-xs">Searching @ballmac… found <span className="font-mono">alerts-1</span>. Installing it and wiring the loading, empty and error states.</p>
                <p className="text-muted-foreground flex items-center gap-1.5 ps-1"><Check className="size-3" />Installed 1 file</p>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold tracking-tight">Your agent can install it</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">Follows the shadcn registry standard, so Claude Code, Cursor and Codex can search and install it through MCP.</p>
              <Link href="/docs/get-started/connect-your-agent" className="text-foreground focus-visible:ring-ring/50 mt-4 inline-flex items-center gap-1 rounded-sm text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">Set up MCP <ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>
            </div>
          </li>
          <li className="bg-card flex flex-col overflow-hidden rounded-2xl border">
            <div className="bg-muted/40 grid min-h-52 place-items-center border-b p-5" aria-hidden="true">
              <div className="grid w-full max-w-[17rem] gap-3">
                <div className="flex items-center gap-2 text-xs"><kbd className="bg-background rounded border px-1.5 py-0.5 font-mono shadow-xs">Tab</kbd><span className="text-muted-foreground">moves through every control</span></div>
                <div className="flex gap-2">
                  <span className="bg-background h-8 flex-1 rounded-md border" />
                  <span className="bg-foreground ring-ring/50 h-8 w-20 rounded-md ring-[3px] ring-offset-2" />
                </div>
                <div className="flex items-center gap-2 text-xs"><kbd className="bg-background rounded border px-1.5 py-0.5 font-mono shadow-xs">Esc</kbd><span className="text-muted-foreground">closes it and returns focus</span></div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold tracking-tight">Keyboard first, tested in a browser</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">Every item works without a mouse, flips for right-to-left languages and holds still for visitors who ask for reduced motion.</p>
              <Link href="/quality" className="text-foreground focus-visible:ring-ring/50 mt-4 inline-flex items-center gap-1 rounded-sm text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">See how it is measured <ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>
            </div>
          </li>
        </ul>
        <div className="text-muted-foreground mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px]">
          <GithubStars initial={stars} variant="hero" />
          <span>
            Listed in the{" "}
            <a href="https://ui.shadcn.com/docs/directory" target="_blank" rel="noopener noreferrer" className="text-foreground focus-visible:ring-ring/50 rounded-sm underline underline-offset-4 outline-none focus-visible:ring-[3px]">
              official shadcn registry directory
            </a>
            .
          </span>
        </div>
      </section>

      {/* The numbers, from the real catalogue */}
      <section aria-label="The library in numbers" className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-y py-10 text-center md:grid-cols-4">
          {[
            [String(components.length), "components", "With live previews and keyboard support"],
            [String(blocks.length), "blocks", `${freeBlockCount} free, ${proBlockCount} in Pro`],
            [String(templates.length), "templates", "Whole pages you install as routes"],
            ["12", "themes", "Light, dark and right-to-left"],
          ].map(([n, label, note]) => (
            <div key={label}>
              <dt className="text-muted-foreground text-sm font-medium">{label}</dt>
              <dd className="text-4xl font-semibold tracking-[-0.04em] tabular-nums sm:text-5xl">{n}</dd>
              <dd className="text-muted-foreground mt-1 text-[13px] text-pretty">{note}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Start from the screen you need */}
      <section aria-labelledby="start-h" className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 id="start-h" className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">Start from the screen you need</h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed text-pretty sm:text-lg">
              Dashboards, agent consoles, on-call rotas, claims, booking pages. Each is a real working screen, not a slice of one.
            </p>
          </div>
          <Link href="/blocks" className={buttonVariants({ variant: "outline", shape: "pill", size: "sm" })}>
            All blocks <ArrowRight />
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {startTiles.map((t) => (
            <li key={t.id} className="group bg-card relative overflow-hidden rounded-2xl border transition-[border-color,box-shadow] duration-300 hover:border-foreground/20 hover:shadow-[0_12px_40px_-16px_rgb(0_0_0/0.35)]">
              <div className="bg-background relative aspect-[2/1] overflow-hidden border-b">
                <Themed base={t.thumb} alt="" width={800} height={500} className="absolute inset-0 size-full object-cover object-top transition-transform duration-500 ease-[var(--bm-ease-out)] group-hover:scale-[1.03]" />
              </div>
              <div className="flex items-baseline justify-between gap-3 p-4">
                <Link href={`/blocks#${t.id}`} className="font-semibold tracking-tight outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50">
                  {t.label}
                </Link>
                <span className="text-muted-foreground text-sm tabular-nums">{t.count}</span>
              </div>
              <p className="text-muted-foreground -mt-2 px-4 pb-4 text-[13px] leading-relaxed">{t.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Blocks and templates */}
      <section className="mx-auto max-w-[1440px] px-4 pt-32 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">Whole pages, not just parts</h2>
            <p className="text-muted-foreground mt-3 max-w-lg text-base leading-relaxed sm:text-lg">
              {blocks.length} responsive blocks and {templates.length} templates, composed from the same components. Install a section,
              or an entire page as a route.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link href="/blocks" className={buttonVariants({ shape: "pill", size: "sm" })}>
                Browse blocks <ArrowRight />
              </Link>
              <Link href="/templates" className={buttonVariants({ variant: "outline", shape: "pill", size: "sm" })}>
                Templates
              </Link>
            </div>
          </div>
          {/* Templates as overlapping windows: the newest in front. */}
          <div className="relative grid gap-5 lg:block lg:h-[600px]">
            {templateCards.map((t, i) => {
              const front = i === templateCards.length - 1
              return (
                <div
                  key={t.name}
                  className={cn(
                    "group bg-background relative overflow-hidden rounded-xl border shadow-[0_24px_60px_-24px_rgb(0_0_0/0.45)] transition-transform duration-500 ease-[var(--bm-ease-out)] lg:absolute lg:w-[84%]",
                    front ? "lg:bottom-0 lg:left-0 lg:z-10 lg:hover:-translate-y-1.5" : "lg:top-0 lg:right-0 lg:hover:-translate-y-1.5 lg:hover:z-20"
                  )}
                >
                  <div className="bg-muted/60 flex h-9 items-center border-b px-20 backdrop-blur">
                    <span className="absolute top-3.5 left-3 flex gap-1.5" aria-hidden="true">
                      <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                      <span className="size-2.5 rounded-full bg-[#febc2e]" />
                      <span className="size-2.5 rounded-full bg-[#28c840]" />
                    </span>
                    <Link
                      href={`/templates/${t.name}`}
                      className="mx-auto truncate text-xs font-medium outline-none after:absolute after:inset-0 after:z-10 after:rounded-xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
                    >
                      {t.title}
                    </Link>
                  </div>
                  <LazyMount className="relative h-[260px] sm:h-[340px]">
                    <FitWidth>{t.Preview ? <t.Preview /> : null}</FitWidth>
                  </LazyMount>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* What Pro adds */}
      <section aria-labelledby="pro-home-h" className="mx-auto max-w-[1440px] px-4 pt-28 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground text-sm font-medium">Ballmac UI Pro</p>
          <h2 id="pro-home-h" className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
            Free gets you started. Pro gets you to launch.
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">
            Free is {components.length} components, {freeBlockCount} blocks, {templates.length} templates and twelve themes, all MIT licensed. Pro adds {proBlockCount} blocks that go deeper in every area, a private registry for the shadcn CLI, Figma tokens and every future update.
          </p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {/* Every picture sits in the same frame and is cropped to fit, so the three cards line up whatever shape the screenshot is. */}
          <div className="bg-card overflow-hidden rounded-2xl border">
            <div className="bg-background relative aspect-[2/1] overflow-hidden border-b">
              {thumbFor("mail-pro-1", "pro") ? <Themed base={`${thumbFor("mail-pro-1", "pro")}`} alt="A Pro mail inbox block" width={800} height={400} className="absolute inset-0 h-full object-cover object-top" /> : null}
            </div>
            <div className="p-6">
              <h3 className="font-semibold tracking-tight">{proBlockCount} real app screens</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">Dashboards, billing, settings, mail, calendars, shops and sign-in. The screens that take a team its first month.</p>
            </div>
          </div>
          <div className="bg-card overflow-hidden rounded-2xl border">
            <div className="bg-background relative aspect-[2/1] overflow-hidden border-b">
              {thumbFor("settings-pro-1", "pro") ? <Themed base={`${thumbFor("settings-pro-1", "pro")}`} alt="A Pro settings block" width={800} height={400} className="absolute inset-0 size-full object-cover object-top" /> : null}
            </div>
            <div className="p-6">
              <h3 className="font-semibold tracking-tight">A private registry for your CLI</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">Install Pro blocks with the same shadcn CLI and MCP you use for the free ones, with Figma tokens for every theme.</p>
            </div>
          </div>
          <div className="bg-card overflow-hidden rounded-2xl border">
            <div className="bg-background relative aspect-[2/1] overflow-hidden border-b">
              {thumbFor("dashboard-pro-2", "pro") ? <Themed base={`${thumbFor("dashboard-pro-2", "pro")}`} alt="A Pro dashboard block" width={800} height={400} className="absolute inset-0 h-full object-cover object-top" /> : null}
            </div>
            <div className="p-6">
              <h3 className="font-semibold tracking-tight">One licence for the whole team</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">Team is $349 for up to 10 people. Every Pro plan has a 14-day fix-or-refund guarantee, and three starter apps are included.</p>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/pro?utm_source=ballmac-ui&utm_medium=home-section&utm_campaign=what-pro-adds" className={buttonVariants({ shape: "pill", size: "lg" })}>
            See what Pro includes <ArrowRight />
          </Link>
          <Link href="/pricing" className={buttonVariants({ shape: "pill", size: "lg", variant: "ghost" })}>
            Compare Free and Pro
          </Link>
        </div>
      </section>

      {/* Questions, answered */}
      <section aria-labelledby="faq-h" className="mx-auto max-w-3xl px-4 pt-28 sm:px-6">
        <h2 id="faq-h" className="text-center text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">Questions, answered</h2>
        <div className="mt-10 divide-y border-y">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-1">
              <summary className="focus-visible:ring-ring/50 flex cursor-pointer list-none items-center justify-between gap-4 rounded-md py-4 text-[15px] font-medium outline-none focus-visible:ring-[3px] [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
              </summary>
              <p className="text-muted-foreground pb-5 text-[15px] leading-relaxed text-pretty">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pt-20 pb-4 sm:px-6">
        <ProCallout where="home" className="mx-auto max-w-4xl" />
      </section>
    </>
  )
}
