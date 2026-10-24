import { ArrowRight, Bot, Check, Clock, FileCode2, KeyRound, Layers, MonitorSmartphone, PackageOpen, ShieldCheck, Users } from "lucide-react"
import Image from "next/image"

import { buttonVariants } from "@/components/ballmac/button"
import { NativeHook } from "@/components/feels/native-hook"
import { BuildCost } from "@/components/pro/build-cost"
import { ProofWall } from "@/components/pro/proof-wall"
import { BuyDock } from "@/components/pro/buy-dock"
import { CheckoutLink } from "@/components/pro/checkout-link"
import { Frame, Themed } from "@/components/pro/shots"
import { StateSwitcher } from "@/components/pro/state-switcher"
import { FoundingBanner } from "@/components/site/founding-banner"
import { FoundingCountdown } from "@/components/site/founding-countdown"
import Link from "@/components/site/link"
import { PageCard } from "@/components/site/page-card"
import { Sampler } from "@/components/site/sampler"
import { StayCurrent } from "@/components/site/stay-current"
import { LeftPhrase } from "@/components/site/founding-text"
import { REFUND_FIX_DAYS, REFUND_PATH } from "@/lib/pro-refund"
import { TEAM_PRICE, TEAM_SEATS } from "@/lib/pro-team"
import { endsLabel } from "@/lib/founding"
import { FOUNDERS_EMAIL } from "@/lib/founders"
import { PRO_LICENCE_PATH } from "@/lib/pro-licence"
import { getOffer } from "@/lib/offer"
import { getBlocks, getItem, isPro, itemHref } from "@/lib/registry"
import { SAMPLER_BLOCKS } from "@/lib/sampler"
import { thumbFor } from "@/lib/thumbs"
import { cn } from "@/lib/utils"

const utm = (where: string) => `/pricing?utm_source=ballmac-ui&utm_medium=pro-page&utm_campaign=${where}#plans`

function Heading({ id, eyebrow, title, children, center = false }: { id: string; eyebrow?: string; title: string; children?: React.ReactNode; center?: boolean }) {
  return (
    <header className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <p className="text-muted-foreground text-sm font-medium">{eyebrow}</p>}
      <h2 id={id} className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
        {title}
      </h2>
      {children && <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">{children}</p>}
    </header>
  )
}

const rise = "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:fill-mode-both"

/** Block categories worth naming, in the order a product team needs them, with what each one holds. Counts come from the real catalogue. */
const AREAS: { category: string | string[]; label: string; what: string }[] = [
  { category: "dashboard", label: "Dashboards", what: "Revenue, analytics, operations and admin screens" },
  { category: "app-shell", label: "App shells", what: "Sidebars, icon rails and top bars that collapse on phones" },
  { category: "settings", label: "Settings", what: "Profile, notifications and preferences with save bars" },
  { category: "billing", label: "Billing", what: "Plans, usage meters and downloadable invoices" },
  { category: "auth", label: "Sign in and sign up", what: "Providers, reset, verification and field errors that take focus" },
  { category: "onboarding", label: "Onboarding", what: "Checklists, guided tours and setup wizards" },
  { category: "mail", label: "Mail", what: "An inbox with threads and a reading pane" },
  { category: "calendar", label: "Calendar", what: "A resource timeline you can drive from the keyboard" },
  { category: "ai-chat", label: "AI chat", what: "Sources, tool-call chips and documents in a side panel" },
  { category: "ecommerce", label: "Ecommerce", what: "Listings, product pages, carts, checkout and orders" },
  { category: "kanban", label: "Kanban", what: "Boards with columns and cards" },
  { category: ["hero", "features", "pricing", "testimonials", "cta", "faq", "logo-cloud", "stats"], label: "Marketing pages", what: "Heroes, features, pricing, proof and calls to action" },
]

/** One block per category first, so the gallery has range, then the rest in order. */
function showcase(limit: number) {
  const seen = new Set<string>()
  const blocks = getBlocks().filter((b) => isPro(b) && thumbFor(b.name, "pro"))
  const firsts = blocks.filter((b) => (seen.has(b.blockCategory ?? "") ? false : (seen.add(b.blockCategory ?? ""), true)))
  return [...firsts, ...blocks.filter((b) => !firsts.includes(b))].slice(0, limit)
}

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "What exactly do I get?",
    a: "Every Pro block, the three starter apps (Beacon, Quire and Cove), a private registry for the shadcn CLI and the MCP server, twelve themes with Figma design tokens, and every future Pro update for your licence key.",
  },
  { q: "Is it a subscription?", a: "No. You pay once. Future updates to Ballmac UI Pro are included for your licence key." },
  { q: "Do I need an account?", a: "No. The licence key in your purchase email is your login. Paste it on the Pro log in page to read and copy any block, download the starter apps and get install commands with your key already in them." },
  { q: "Will it work with my stack?", a: "Blocks are React and Tailwind and install through the shadcn CLI, so they go wherever shadcn does: Next.js, Vite, Remix and others. Beacon and Quire are Next.js apps. Cove is a Tauri app with a Vite front end." },
  { q: "Can my AI agent use it?", a: "Yes. Pro installs through the same shadcn CLI and MCP server as the free library. Add your key once and Claude Code, Cursor, Codex or VS Code can search and install Pro blocks for you." },
  {
    q: "What can I do with the code?",
    a: (
      <>
        Build any number of apps and sites with it, for yourself or your clients, and change it however you like. You cannot resell, share or publish the Pro source, share your key, build a competing library or starter from it, or use it to train AI models. One licence is one person (a Team licence covers up to 10 people). Read the full{" "}
        <a href={PRO_LICENCE_PATH} className="text-foreground underline underline-offset-4">Pro licence agreement</a> before you buy. For a team or an agency, write to{" "}
        <a href={`mailto:${FOUNDERS_EMAIL}`} className="text-foreground underline underline-offset-4">{FOUNDERS_EMAIL}</a>.
      </>
    ),
  },
  { q: "Who handles tax and invoices?", a: "The price already includes tax. Our payment provider is the merchant of record: it handles the sales tax or VAT and sends you an invoice. Add a business name or tax ID at checkout if you need one on it." },
  {
    q: "What if it does not work?",
    a: (
      <>
        Write to <a href={`mailto:${FOUNDERS_EMAIL}`} className="text-foreground underline underline-offset-4">{FOUNDERS_EMAIL}</a> with what you tried. If a Pro item does not do what its page says, we fix it or give you a working alternative within {REFUND_FIX_DAYS} days of your request. If we cannot, you get a full refund. Mistakes on our side are always refunded. Read the{" "}
        <a href={REFUND_PATH} className="text-foreground underline underline-offset-4">Refund Policy</a>.
      </>
    ),
  },
  { q: "Can my team share one licence?", a: `Yes. A Team licence covers up to ${TEAM_SEATS} people at one organisation for $${TEAM_PRICE} once. Pro itself is one licence for one person. See the plans on the pricing page.` },
]

/**
 * The page a visitor without a licence sees at /pro: what Pro is, who it is for, what is in it, what it costs. It is built from the real catalogue, so the numbers
 * and previews are always the ones in this build. The countdown and "ends in" phrases follow the visitor's clock between builds.
 */
export async function ProSales({ downloads }: { downloads: { starters: { slug: string }[] } }) {
  const now = new Date()
  const offer = await getOffer(now)
  const f = offer.founding
  const proBlocks = getBlocks().filter(isPro)
  const total = proBlocks.length || 150
  const starters = downloads.starters.length || 3
  const countOf = (category: string | string[]) => proBlocks.filter((b) => (Array.isArray(category) ? category.includes(b.blockCategory ?? "") : b.blockCategory === category)).length
  const areas = AREAS.map((a) => ({ ...a, count: countOf(a.category) })).filter((a) => a.count > 0)
  const categories = new Set(proBlocks.map((b) => b.blockCategory)).size
  const picks = showcase(6)
  const hero = (["dashboard-pro-1", "billing-pro-1", "settings-pro-1"] as const).map((n) => ({ name: n, thumb: thumbFor(n, "pro") }))
  const sampler = SAMPLER_BLOCKS.some((n) => {
    const i = getItem(n)
    return Boolean(i && isPro(i))
  })
  const deadline = f?.endsAt ? endsLabel(f.endsAt) : null
  const buyLabel = offer.onSale && offer.price ? `Get Pro for $${offer.price}` : "See pricing"
  const buy = (where: string, className?: string) =>
    offer.onSale && offer.checkout ? (
      <CheckoutLink href={offer.checkout} className={cn(buttonVariants({ size: "lg", shape: "pill" }), className)}>
        {buyLabel}
        <ArrowRight aria-hidden="true" />
      </CheckoutLink>
    ) : (
      <Link href={utm(where)} className={cn(buttonVariants({ size: "lg", shape: "pill" }), className)}>
        {buyLabel}
        <ArrowRight aria-hidden="true" />
      </Link>
    )

  return (
    <>
      {offer.onSale && offer.checkout && offer.price && <BuyDock href={offer.checkout} price={offer.price} />}
      {f && <FoundingBanner offer={f} at={now.getTime()} href="#buy" />}

      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b" aria-labelledby="pro-h">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_75%_at_75%_25%,black,transparent)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-0 -z-10 size-[38rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--foreground)_9%,transparent),transparent)]" />
        <div className="mx-auto grid max-w-[1200px] gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12 lg:py-24">
          <div className={rise}>
            <p className="bg-muted/60 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-medium dark:bg-white/[0.06]">
              <span className="bg-chart-1 size-1.5 rounded-full" aria-hidden="true" />
              Ballmac UI Pro{f?.endsAt ? <span className="text-muted-foreground">· founding price <LeftPhrase endsAt={f.endsAt} at={now.getTime()} /></span> : null}
            </p>
            <h1 id="pro-h" className="mt-6 text-5xl leading-[1.02] font-semibold tracking-[-0.05em] text-balance sm:text-6xl">
              The screens your app needs, finished, and feeling native.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-pretty">
              {total} finished, production-ready blocks for React, Tailwind and shadcn: dashboards, billing, settings, sign-in, mail and more. They take the feel of macOS, Windows or iOS with one setting, and come with loading, empty and error states already handled.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {buy("hero")}
              <a href="#feel" className={buttonVariants({ size: "lg", shape: "pill", variant: "outline" })}>
                Feel it first
              </a>
            </div>
            <p className="text-muted-foreground mt-4 text-sm">
              {f ? (
                <>
                  <span className="text-foreground font-medium">${f.price} once</span>
                  {f.listPrice ? `, then $${f.listPrice}` : ""}. Founding price for the first {f.limit} buyers.
                </>
              ) : offer.onSale && offer.price ? (
                <>
                  <span className="text-foreground font-medium">${offer.price} once</span>, tax included. No subscription.
                </>
              ) : (
                "One payment. No subscription."
              )}
            </p>
            <p className="text-muted-foreground mt-2 text-[13px]">
              By buying you agree to the{" "}
              <a href={PRO_LICENCE_PATH} className="text-foreground underline underline-offset-4">Pro licence</a>.
            </p>
            <ul className="mt-8 grid max-w-xl gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {["One payment, no subscription", "Every future update included", "Works with the shadcn CLI and your AI agent", "Works as described, or your money back"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="bg-foreground/[0.07] flex size-5 shrink-0 items-center justify-center rounded-full" aria-hidden="true">
                    <Check className="size-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* A stack of real blocks from the catalogue */}
          <div className={cn(rise, "motion-safe:delay-150")} aria-hidden="true">
            <div className="relative mx-auto aspect-[5/4] w-full max-w-[600px] lg:max-w-none">
              {hero[0]?.thumb && (
                <Frame className="absolute top-0 left-0 w-[82%]">
                  <Themed base={hero[0].thumb} alt="" width={800} height={400} priority />
                </Frame>
              )}
              {hero[1]?.thumb && (
                <Frame className="absolute top-[30%] right-0 z-10 w-[60%]">
                  <Themed base={hero[1].thumb} alt="" width={800} height={400} priority />
                </Frame>
              )}
              {hero[2]?.thumb && (
                <Frame className="absolute bottom-0 left-[6%] z-20 w-[56%]">
                  <Themed base={hero[2].thumb} alt="" width={800} height={400} priority />
                </Frame>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* The proof: the same app as a web app and as a native one, in the visitor's own platform */}
      <section id="feel" aria-labelledby="feel-h" className="mx-auto max-w-[1200px] scroll-mt-16 px-4 py-20 sm:px-6">
        <Heading id="feel-h" eyebrow="Try it before you read any further" title="Which one feels native?" center>
          Same app, same code. One is a typical web app, the other has one setting changed. Use them both.
        </Heading>
        <NativeHook where="pro-page" className="mt-12" />
      </section>

      {/* Numbers */}
      <section aria-label="What is in Pro" className="border-b">
        <dl className="mx-auto grid max-w-[1200px] grid-cols-2 divide-x sm:grid-cols-4">
          {[
            [String(total), "Pro blocks"],
            [String(categories), "Block categories"],
            [String(starters), "Starter apps"],
            ["12", "Themes, light and dark"],
          ].map(([v, l]) => (
            <div key={l} className="flex flex-col px-4 py-8 text-center sm:px-6">
              <dt className="text-muted-foreground order-2 text-sm">{l}</dt>
              <dd className="order-1 text-4xl font-semibold tracking-[-0.035em] tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* The screens */}
      <section aria-labelledby="areas-h" className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
        <Heading id="areas-h" eyebrow="What is inside" title="Everything between the landing page and the dashboard">
          The screens that take a team its first month are the ones your landing page never needed: settings, billing, onboarding, empty lists, error pages. They are done, and they match.
        </Heading>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((a) => (
            <li key={a.label} className="bg-background p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold tracking-tight">{a.label}</h3>
                {a.count >= 3 && <span className="text-muted-foreground font-mono text-xs tabular-nums">{a.count}</span>}
              </div>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{a.what}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* The blocks */}
      {picks.length > 0 && (
        <section id="blocks" aria-labelledby="blocks-h" className="bg-muted/30 scroll-mt-16 border-y">
          <div className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Heading id="blocks-h" title="Open one and look around">
                Every Pro block has a public preview. Resize it, tab through it, switch themes. Buy when you are sure.
              </Heading>
              <Link href="/blocks" className={buttonVariants({ variant: "outline", shape: "pill" })}>
                All {total} blocks <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {picks.map((b, i) => (
                <PageCard key={b.name} href={itemHref(b)} title={b.title} description={b.description} name={b.name} Preview={null} thumb={thumbFor(b.name, "pro")} pro priority={i < 3} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What it costs to build yourself */}
      <section aria-labelledby="cost-h" className="mx-auto max-w-[1100px] px-4 pb-24 sm:px-6">
        <Heading id="cost-h" eyebrow="Do the sum" title="What would it cost to build these yourself?" center>
          Polished states, dark mode, keyboard support and motion take time. Put in your own numbers.
        </Heading>
        <BuildCost
          className="mt-12"
          price={Number(offer.price) || 99}
          action={
            offer.onSale && offer.checkout ? (
              <CheckoutLink href={offer.checkout} className={buttonVariants({ size: "lg", shape: "pill" })}>
                {buyLabel}
                <ArrowRight aria-hidden="true" />
              </CheckoutLink>
            ) : null
          }
        />
      </section>

      <ProofWall className="mx-auto max-w-[1100px] px-4 pb-24 sm:px-6" />

      {/* States */}
      <section aria-labelledby="states-h" className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
        <Heading id="states-h" eyebrow="The part demos leave out" title="Real apps are loading, empty or broken half the time">
          Blocks that show data come with all three, built in. Skeletons shaped like the content so nothing jumps, an empty state that tells people what to do next, and an error with a way to try again. One <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">state</code> prop switches between them.
        </Heading>
        <div className="mt-12">
          <StateSwitcher
            block="DashboardPro1"
            states={[
              { key: "loading", label: "Loading", text: "Skeletons in the shape of the content, so nothing jumps when the data lands.", alt: "The Dashboard Pro 1 block while loading: grey skeletons in the shape of the cards and chart" },
              { key: "empty", label: "Empty", text: "A clear message and the next step, not a blank box.", alt: "The Dashboard Pro 1 block with no data yet: a message saying there is no revenue yet" },
              { key: "error", label: "Error", text: "What went wrong, in plain words, with a Try again button.", alt: "The Dashboard Pro 1 block after a failed request: an error message and a Try again button" },
            ]}
          />
        </div>
      </section>

      {/* Updates and measured quality */}
      <section aria-labelledby="current-h" className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6">
        <Heading id="current-h" eyebrow="After the first install" title="Still good in six months">
          A block you copy should not rot. Updates merge into your edits, and every claim about quality is measured and public.
        </Heading>
        <StayCurrent className="mt-12" />
        <p className="mt-8 text-center text-sm">
          <Link href="/pro/changelog" className="text-foreground font-medium underline underline-offset-4">See everything that has changed in Pro, with dates</Link>
        </p>
      </section>

      {/* Starter apps */}
      <section id="starters" aria-labelledby="apps-h" className="bg-muted/30 scroll-mt-16 border-y">
        <div className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
          <Heading id="apps-h" eyebrow="Starter apps" title="Three complete apps you can run today" center>
            Not demos. Each one is a whole project with sign-in, settings and tests, built from the same blocks. Rename it, change the colours and keep going.
          </Heading>

          <div className="mt-16 space-y-20">
            {/* Beacon */}
            <article className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
              <div>
                <p className="text-muted-foreground inline-flex items-center gap-2 text-sm font-medium">
                  <Layers className="size-4" aria-hidden="true" /> Beacon · SaaS
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-balance sm:text-3xl">Launch the SaaS without building the SaaS part</h3>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  A complete product shell: sign-in, workspaces with teams and invitations, Stripe billing, a dashboard, settings and API keys. Next.js with a database that runs on your laptop with no setup.
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {["Teams, roles and invitations", "Stripe billing with plans and usage", "Dashboard, settings, activity and API keys", "Marketing site with pricing and changelog"].map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <Frame>
                  <Image src="/marketing/beacon-dashboard.webp" alt="Beacon's dashboard: usage cards, a signals chart and a getting-started checklist" width={1500} height={938} unoptimized loading="lazy" className="h-auto w-full" />
                </Frame>
                <Frame className="absolute -right-3 -bottom-8 hidden w-[52%] sm:block">
                  <Image src="/marketing/beacon-landing.webp" alt="Beacon's marketing site" width={1500} height={938} unoptimized loading="lazy" className="h-auto w-full" />
                </Frame>
              </div>
            </article>

            {/* Quire */}
            <article className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-14">
              <div className="order-2 pb-8 lg:order-1">
                <QuireVisual />
              </div>
              <div className="order-1 lg:order-2">
                <p className="text-muted-foreground inline-flex items-center gap-2 text-sm font-medium">
                  <Bot className="size-4" aria-hidden="true" /> Quire · AI assistant
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-balance sm:text-3xl">An AI assistant that shows its sources</h3>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  Answers from your own documents, with citations you can click, plus sign-in, billing and a document library. It runs with no AI key, using a built-in demo model, so you can try everything before you connect a provider.
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {["Cited answers from your documents", "Claude and OpenAI through the Vercel AI SDK", "Library, usage and assistant settings", "Sign-in, teams and billing"].map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            {/* Cove */}
            <article className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
              <div>
                <p className="text-muted-foreground inline-flex items-center gap-2 text-sm font-medium">
                  <MonitorSmartphone className="size-4" aria-hidden="true" /> Cove · Desktop app
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-balance sm:text-3xl">One codebase, a desktop app that looks native on Mac and Windows</h3>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  A Tauri 2 notes app with real window controls, the system blur on macOS, native menus, a command palette and Markdown. The look follows the operating system, and every part of it is code you own.
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {["Mac: traffic lights, translucent sidebar, native menu", "Windows: title bar with menu and caption buttons", "A release build of about 8 MB", "Unit and browser tests included"].map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative pb-8">
                <Frame>
                  <Image src="/marketing/cove-macos.webp" alt="Cove running as a Mac app" width={1500} height={966} unoptimized loading="lazy" className="h-auto w-full" />
                </Frame>
                <Frame className="absolute -right-3 -bottom-2 hidden w-[54%] sm:block">
                  <Image src="/marketing/cove-windows.webp" alt="Cove running as a Windows app" width={1500} height={966} unoptimized loading="lazy" className="h-auto w-full" />
                </Frame>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Who it is for */}
      <section aria-labelledby="for-h" className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
        <Heading id="for-h" eyebrow="Who it is for" title="For people who would rather build the product" center />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: PackageOpen, title: "Founders and indie makers", text: "Have the app shell, billing and settings by Friday, and spend the week on the part only you can build." },
            { icon: Users, title: "Freelancers and small teams", text: "Start each project from the same polished, accessible base, in your own colours, instead of rebuilding it every time." },
            { icon: Bot, title: "People building with AI agents", text: "Your agent installs Pro blocks through the same shadcn CLI and MCP server it already uses. Real components in place of invented ones." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-card rounded-2xl border p-7">
              <span className="bg-foreground text-background flex size-10 items-center justify-center rounded-xl" aria-hidden="true">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-h" className="bg-muted/30 border-y">
        <div className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
          <Heading id="how-h" eyebrow="How it works" title="From checkout to your first block in minutes" center />
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Buy once", text: "Pay once. Our payment provider handles tax and sends the invoice with your licence key." },
              { icon: KeyRound, title: "Paste your key", text: "There is no account to create. The key opens your library, with your install commands already filled in." },
              { icon: FileCode2, title: "Install or copy", text: "Run one shadcn command, ask your agent, or copy the code from your library. The files are yours." },
            ].map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="bg-background relative rounded-2xl border p-7">
                <span className="text-muted-foreground absolute top-6 right-6 font-mono text-xs tabular-nums">0{i + 1}</span>
                <Icon className="size-6" aria-hidden="true" />
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Built by */}
      <section aria-labelledby="by-h" className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <p className="text-muted-foreground text-sm font-medium">Built by Ballmac</p>
            <h2 id="by-h" className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
              A small studio that ships native Mac apps
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">
              We build Mac apps people use every day. That is why the details here are held to the same bar as our apps: focus rings that work, keyboard paths for everything, motion that respects reduced-motion settings, and states for the moments when things go wrong.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Write to{" "}
              <a href={`mailto:${FOUNDERS_EMAIL}`} className="text-foreground font-medium underline underline-offset-4">
                {FOUNDERS_EMAIL}
              </a>{" "}
              and it reaches a person. Founding members can also vote on the next blocks.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { href: "https://ballmac.com/binzide", name: "Binzide", what: "A private Mac cleaner and app uninstaller" },
              { href: "https://ballmac.com/notchware", name: "Notchware", what: "Makes the MacBook notch useful: music and AI agent alerts" },
              { href: "https://ballmac.com/sideme", name: "Sideme", what: "A clipboard manager with history one shortcut away" },
            ].map((a) => (
              <li key={a.name}>
                <a href={a.href} className="bg-card hover:border-foreground/25 flex h-full items-center justify-between gap-4 rounded-2xl border p-5 transition-colors">
                  <span>
                    <span className="block font-semibold tracking-tight">{a.name}</span>
                    <span className="text-muted-foreground mt-0.5 block text-sm leading-relaxed">{a.what}</span>
                  </span>
                  <ArrowRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Buy */}
      <section id="buy" aria-labelledby="buy-h" className="bg-foreground text-background scroll-mt-16">
        <div className="mx-auto max-w-[1000px] px-4 py-24 text-center sm:px-6">
          <h2 id="buy-h" className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
            Spend your week on the product
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed opacity-75">
            {total} blocks, {starters} starter apps and every future update{offer.onSale && offer.price ? `, for $${offer.price}` : ""}. One payment.
          </p>
          {f?.endsAt && (
            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="flex items-center gap-2 text-sm font-medium opacity-80">
                <Clock className="size-4" aria-hidden="true" /> Founding price ends {deadline}
              </p>
              <FoundingCountdown endsAt={f.endsAt} renderedAt={now.getTime()} />
              <p className="text-sm opacity-70">
                ${f.price} now{f.listPrice ? `, then $${f.listPrice}` : ""}. Or earlier, if all {f.limit} founding licences are taken.
              </p>
            </div>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {offer.onSale && offer.checkout ? (
              <CheckoutLink href={offer.checkout} className={cn(buttonVariants({ size: "lg", shape: "pill", variant: "secondary" }))}>
                {buyLabel}
                <ArrowRight aria-hidden="true" />
              </CheckoutLink>
            ) : (
              <Link href={utm("closing")} className={buttonVariants({ size: "lg", shape: "pill", variant: "secondary" })}>
                {buyLabel}
                <ArrowRight aria-hidden="true" />
              </Link>
            )}
            <Link href="/pricing#plans" className="rounded-full px-5 py-2.5 text-sm font-medium underline underline-offset-4 opacity-80 hover:opacity-100">
              Compare plans, or get Team for ${TEAM_PRICE} (up to {TEAM_SEATS} people)
            </Link>
          </div>
          <p className="mx-auto mt-6 flex items-center justify-center gap-2 text-xs opacity-70">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
            Tax is included in the price, and your invoice is sent for you.
          </p>
          <p className="mx-auto mt-2 text-center text-xs opacity-70">
            Works as described, or your money back: if it does not and we cannot fix it within {REFUND_FIX_DAYS} days of your request, you get a full refund. <a href={REFUND_PATH} className="underline underline-offset-2">Refund policy</a>. By buying you agree to the <a href={PRO_LICENCE_PATH} className="underline underline-offset-2">Pro licence</a>.
          </p>
        </div>
      </section>

      {/* Not ready */}
      {sampler && (
        <section aria-labelledby="try-h" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
          <div className="text-center">
            <h2 id="try-h" className="text-3xl font-semibold tracking-[-0.03em] text-balance">
              Not sure yet? Try three Pro blocks free
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">Real Pro blocks, yours to use in any project. Leave your email and they appear right here, ready to copy.</p>
          </div>
          <div className="bg-card mt-8 rounded-2xl border p-5 sm:p-8">
            <Sampler reminders={Boolean(f?.endsAt)} />
          </div>
        </section>
      )}

      {/* FAQ */}
      <section aria-labelledby="faq-h" className={cn("mx-auto max-w-3xl px-4 pb-28 sm:px-6", !sampler && "pt-24")}>
        <h2 id="faq-h" className="text-center text-3xl font-semibold tracking-[-0.03em] text-balance">
          Questions
        </h2>
        <div className="mt-10 divide-y rounded-2xl border">
          {FAQ.map((item) => (
            <details key={item.q} className="group p-6">
              <summary className="focus-visible:ring-ring/50 flex cursor-pointer list-none items-center justify-between gap-4 rounded-md font-medium outline-none focus-visible:ring-[3px] [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="text-muted-foreground text-xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="text-muted-foreground mt-3 text-[15px] leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
        <p className="text-muted-foreground mt-8 text-center text-sm">
          Already have a licence?{" "}
          <Link href="/pro/login" className="text-foreground font-medium underline underline-offset-4">
            Log in to your Pro library
          </Link>
        </p>
      </section>
    </>
  )
}

/** Quire's cited answer, with its chat screen in front. */
function QuireVisual() {
  return (
    <div className="relative">
      <Frame>
        <Image src="/marketing/quire-landing.webp" alt="Quire's landing page: a question answered from your documents, with numbered sources and the passages behind them" width={1500} height={938} unoptimized loading="lazy" className="h-auto w-full" />
      </Frame>
      <Frame className="absolute -bottom-8 -left-3 hidden w-[52%] sm:block">
        <Image src="/marketing/quire-app.webp" alt="Quire's chat screen with suggested questions and a library" width={1500} height={938} unoptimized loading="lazy" className="h-auto w-full" />
      </Frame>
    </div>
  )
}
