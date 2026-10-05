import { ArrowRight, ArrowUpRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "@/components/site/link"

import { buttonVariants } from "@/components/ballmac/button"
import { AgentDiagram } from "@/components/home/agent-diagram"
import { LazyMosaic } from "@/components/home/lazy-mosaic"
import { FoundingBanner } from "@/components/site/founding-banner"
import { founding } from "@/lib/founding"
import { CopyButton } from "@/components/site/copy-button"
import { FitPreview, FitWidth } from "@/components/site/fit-preview"
import { LazyMount } from "@/components/site/lazy-mount"
import { loadThumb } from "@/lib/examples"
import { blockGroups, categoryLabels, getBlocks, getComponents, getTemplates } from "@/lib/registry"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { alternates: { canonical: "/" } }

// The collection as an asymmetric bento: two large anchors (desktop top left, devices bottom right),
// a tall AI tile, a wide motion strip and small tiles filling the gaps. Each shows a real example.
const collections = [
  { category: "macos", example: "mac-window-demo", size: "large", span: "sm:col-span-2 sm:row-span-2", design: [720, 520], blurb: "App windows, docks, menu bars, command search and a live notch." },
  { category: "ai", example: "ai-chat-demo", size: "tall", span: "sm:row-span-2", design: [520, 640], blurb: "Messages, streaming text, tool calls, reasoning and a prompt box." },
  { category: "backgrounds", example: "beams-background-demo", size: "small", span: "", design: [600, 420], blurb: "" },
  { category: "text", example: "gradient-text-shiny", size: "small", span: "", design: [520, 360], blurb: "" },
  { category: "motion", example: "marquee-demo", size: "wide", span: "sm:col-span-2", design: [760, 300], blurb: "Beams, tilt, orbits, marquees and confetti, all spring-tuned." },
  { category: "devices", example: "laptop-frame-demo", size: "large", span: "sm:col-span-2 sm:row-span-2", design: [760, 520], blurb: "MacBook, iPhone and browser frames for product shots." },
  { category: "developer", example: "code-block-demo", size: "small", span: "", design: [600, 420], blurb: "" },
  { category: "primitives", example: "button-variants", size: "small", span: "", design: [480, 320], blurb: "" },
] as const

const install = "npx shadcn@latest add @ballmac/dock"

export default async function Home() {
  const components = getComponents()
  const blocks = getBlocks()
  const templates = getTemplates()
  const tiles = await Promise.all(
    collections.map(async (c) => ({
      ...c,
      label: categoryLabels[c.category] ?? c.category,
      count: components.filter((i) => i.category === c.category).length,
      Preview: await loadThumb(c.example),
    }))
  )
  const templateCards = await Promise.all([...templates].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 2).reverse().map(async (t) => ({ ...t, Preview: t.examples[0] ? await loadThumb(t.examples[0].name) : null })))
  const blockCategoryLinks = blockGroups.map((g) => ({
    id: g.id,
    label: g.label,
    count: blocks.filter((b) => (g.categories as readonly string[]).includes(b.blockCategory ?? "")).length,
  })).filter((g) => g.count > 0)
  const macCount = components.filter((c) => c.category === "macos").length
  const categoryCount = new Set(components.map((c) => c.category)).size

  const offer = founding()
  return (
    <>
      {offer && <FoundingBanner offer={offer} />}
      {/* Hero */}
      <section className="mx-auto max-w-[1440px] px-4 pt-16 pb-12 text-center sm:px-6 md:pt-24 md:pb-16">
        <Link
          href="/components?category=macos"
          className="bg-muted/60 hover:bg-muted focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px] dark:bg-white/[0.06] dark:hover:bg-white/10"
        >
          <span className="bg-chart-1 size-1.5 rounded-full" aria-hidden="true" />
          New: the Desktop collection{macCount ? `, ${macCount} components` : ""}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
          Make your web app feel native
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
          Crafted React components with native-app motion, accessibility built in, and code you own. Install any piece with
          one command, or let your AI agent do it for you.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <Link href="/docs/installation" className={buttonVariants({ shape: "pill" })}>
            Get started
          </Link>
          <Link href="/components" className={buttonVariants({ shape: "pill", variant: "ghost" })}>
            Browse components <ArrowRight />
          </Link>
        </div>
        <div className="text-muted-foreground mx-auto mt-6 inline-flex max-w-full items-center gap-1.5 rounded-lg border py-1 pr-1 pl-3 font-mono text-[13px]">
          <span className="select-none" aria-hidden="true">$</span>
          <span className="text-foreground truncate">{install}</span>
          <CopyButton value={install} label="Copy install command" />
        </div>
      </section>

      {/* Live mosaic */}
      <section aria-labelledby="live-examples" className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <h2 id="live-examples" className="sr-only">
          Live examples
        </h2>
        <LazyMosaic />
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-[1440px] px-4 pt-28 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">Explore the collection</h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed sm:text-lg">
              {components.length} components across {categoryCount} categories, each with live previews, keyboard support and a
              single install command.
            </p>
          </div>
          <Link href="/components" className={buttonVariants({ variant: "outline", shape: "pill", size: "sm" })}>
            All components <ArrowRight />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:auto-rows-[240px] sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => {
            const featured = t.size === "large" || t.size === "tall"
            return (
              <div
                key={t.category}
                className={cn(
                  "group bm-stage relative h-72 overflow-hidden rounded-2xl border transition-[border-color,box-shadow] duration-300 hover:border-foreground/20 hover:shadow-[0_12px_40px_-16px_rgb(0_0_0/0.35)] sm:h-auto",
                  featured && "max-sm:h-96",
                  t.span
                )}
              >
                <div className={cn("absolute inset-x-0 top-0 transition-transform duration-500 ease-[var(--bm-ease-out)] group-hover:scale-[1.02]", featured ? "bottom-24" : "bottom-14")} inert>
                  <LazyMount className="absolute inset-0">
                    <FitPreview width={t.design[0]} height={t.design[1]} inset={0.06}>
                      {t.Preview ? <t.Preview /> : null}
                    </FitPreview>
                  </LazyMount>
                </div>
                <div className="from-surface via-surface/90 pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent px-5 pt-10 pb-4">
                  <div className="flex items-baseline gap-2">
                    <Link
                      href={`/components?category=${t.category}`}
                      className={cn(
                        "pointer-events-auto font-semibold tracking-tight outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50",
                        featured ? "text-xl" : "text-[15px]"
                      )}
                    >
                      {t.label}
                    </Link>
                    <span className="text-muted-foreground text-sm tabular-nums">{t.count}</span>
                  </div>
                  {featured && <p className="text-muted-foreground mt-1 max-w-sm text-sm leading-relaxed">{t.blurb}</p>}
                </div>
                <ArrowUpRight
                  className="text-muted-foreground absolute top-4 right-4 size-4 -translate-x-1 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </div>
            )
          })}
        </div>
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
            <ul className="mt-9 grid grid-cols-1 border-t sm:grid-cols-2 sm:gap-x-8" aria-label="Block categories">
              {blockCategoryLinks.map((g) => (
                <li key={g.id} className="border-b">
                  <Link
                    href={`/blocks#${g.id}`}
                    className="group/row focus-visible:ring-ring/50 flex items-center justify-between gap-3 py-3 text-[15px] outline-none focus-visible:ring-[3px]"
                  >
                    <span className="transition-transform duration-200 group-hover/row:translate-x-1">{g.label}</span>
                    <span className="text-muted-foreground flex items-center gap-1.5 text-sm tabular-nums">
                      {g.count} {g.count === 1 ? "block" : "blocks"}
                      <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover/row:opacity-100" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
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

      {/* Agents */}
      <section className="mx-auto max-w-[1440px] px-4 pt-28 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 overflow-hidden rounded-2xl border p-6 sm:p-10 lg:grid-cols-[1fr_1.15fr] lg:p-14">
          <div className="min-w-0">
            <p className="text-muted-foreground text-sm font-medium">MCP and AI agents</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">Your agent already knows how to use it</h2>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">
              Ballmac UI follows the shadcn registry standard, so the shadcn MCP server can search it, read when to use each
              component, and install it into your project.
            </p>
            <div className="mt-7 space-y-2 font-mono text-[13px]">
              <div className="bg-muted/50 flex items-center gap-2 rounded-lg border py-1 pr-1 pl-3.5">
                <span className="min-w-0 flex-1 truncate">npx shadcn@latest mcp init --client claude</span>
                <CopyButton value="npx shadcn@latest mcp init --client claude" label="Copy MCP setup command" />
              </div>
              <p className="text-muted-foreground rounded-lg border px-3.5 py-2.5">&gt; Add a hero with a globe and a dock from @ballmac</p>
            </div>
            <Link href="/docs/mcp" className={cn(buttonVariants({ variant: "outline", shape: "pill", size: "sm" }), "mt-7")}>
              Set up MCP <ArrowUpRight />
            </Link>
          </div>
          <div tabIndex={0} role="region" aria-label="How agents use Ballmac" className="overflow-x-auto focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]">
            <div className="min-w-[520px]">
              <AgentDiagram />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
