import { ArrowRight, ArrowUpRight, Keyboard, MousePointerClick, PackageCheck, Sparkles } from "lucide-react"
import Link from "next/link"

import { AuroraBackground } from "@/components/ballmac/aurora-background"
import { BeamsBackground } from "@/components/ballmac/beams-background"
import { buttonVariants } from "@/components/ballmac/button"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { AgentDiagram } from "@/components/home/agent-diagram"
import { DesktopShowcase } from "@/components/home/desktop-showcase"
import { FitPreview } from "@/components/site/fit-preview"
import { InstallTabs } from "@/components/site/install-tabs"
import { ScaledPreview } from "@/components/site/scaled-preview"
import { loadExample } from "@/lib/examples"
import { addCommand, getAllItems, getBlocks, getComponents, getTemplates, packageManagers, type PackageManager } from "@/lib/registry"
import { cn } from "@/lib/utils"

// Tiles in the showcase wall, by registry example. Missing examples are skipped. `live` tiles stay
// interactive; the rest are scaled-down pictures (inert), so tiny scaled buttons never become tap targets.
const wall = [
  { example: "globe-demo", item: "globe", span: "lg:col-span-2 lg:row-span-2", size: [760, 520], live: true },
  { example: "tilt-card-demo", item: "tilt-card", span: "", size: [520, 400], live: true },
  { example: "animated-beam-demo", item: "animated-beam", span: "", size: [640, 440], live: true },
  { example: "mac-window-demo", item: "mac-window", span: "lg:col-span-2", size: [720, 440] },
  { example: "beams-background-demo", item: "beams-background", span: "", size: [700, 440] },
  { example: "dynamic-island-demo", item: "dynamic-island", span: "", size: [660, 440] },
  { example: "laptop-frame-demo", item: "laptop-frame", span: "", size: [760, 520] },
  { example: "aurora-background-demo", item: "aurora-background", span: "", size: [700, 440] },
] as const

const principles = [
  { icon: Keyboard, title: "Keyboard first", body: "Every interactive piece works with the keyboard and screen readers, with visible focus and real ARIA." },
  { icon: MousePointerClick, title: "Motion with manners", body: "Springs tuned like macOS, paused off-screen, and calm when someone asks for reduced motion." },
  { icon: PackageCheck, title: "Code you own", body: "One command copies the source into components/ballmac. Honest dependencies, never your shadcn files." },
  { icon: Sparkles, title: "Agent ready", body: "Written descriptions tell Claude Code, Cursor and VS Code when to use each piece and what it pairs with." },
]

export default async function Home() {
  const commands = Object.fromEntries(packageManagers.map((pm) => [pm, addCommand(["dock"], pm)])) as Record<PackageManager, string>
  const components = getComponents()
  const blocks = getBlocks()
  const templates = getTemplates()
  const names = new Set(getAllItems().flatMap((i) => i.examples.map((e) => e.name)))
  const tiles = await Promise.all(
    wall.filter((w) => names.has(w.example)).map(async (w) => ({ ...w, Preview: await loadExample(w.example), title: components.find((c) => c.name === w.item)?.title ?? w.item }))
  )
  const blockPreviews = await Promise.all(
    blocks.slice(0, 4).map(async (b) => ({ ...b, Preview: b.examples[0] ? await loadExample(b.examples[0].name) : null }))
  )
  const newCount = components.filter((c) => ["macos", "backgrounds", "text", "devices"].includes(c.category)).length

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <AuroraBackground className="absolute inset-x-0 top-0 -z-10 h-[720px]" intensity={0.55} radialMask />
        <div className="mx-auto max-w-[1440px] px-4 pt-16 sm:px-6 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <Link
              href="/components?category=macos"
              className="bg-background/60 hover:bg-background/90 inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[13px] font-medium backdrop-blur transition-colors"
            >
              <span className="bg-foreground text-background rounded-full px-2 py-0.5 text-[11px] font-semibold">New</span>
              <span>The macOS collection<span className="max-sm:hidden">{newCount > 0 ? ` · ${newCount} new components` : ""}</span></span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <h1 className="mt-7 text-5xl leading-[1.02] font-semibold tracking-[-0.05em] text-balance sm:text-7xl">
              Mac-grade components for the web.
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty sm:text-xl">
              Docks, windows, globes, living backgrounds and AI interfaces with the polish of a native Mac app. Free, accessible,
              and one command away, for you or your AI agent.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/components" className={buttonVariants({ size: "lg", shape: "pill" })}>
                Browse components <ArrowRight />
              </Link>
              <Link href="/docs/mcp" className={cn(buttonVariants({ size: "lg", shape: "pill", variant: "outline" }), "bg-background/60 backdrop-blur")}>
                Use with your AI agent
              </Link>
            </div>
            <InstallTabs commands={commands} className="mx-auto mt-8 max-w-md text-left" />
          </div>
          <div className="mx-auto mt-14 max-w-[1180px] md:mt-20">
            <DesktopShowcase />
            <p className="text-muted-foreground mt-4 text-center text-xs">
              Live, not a screenshot: a <Link href="/components/mac-window" className="text-foreground underline underline-offset-4">window</Link>,{" "}
              <Link href="/components/dynamic-island" className="text-foreground underline underline-offset-4">Dynamic Island</Link>,{" "}
              <Link href="/components/dock" className="text-foreground underline underline-offset-4">dock</Link> and{" "}
              <Link href="/components/tool-call-card" className="text-foreground underline underline-offset-4">AI components</Link>, all Ballmac UI. Hover the dock.
            </p>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="mx-auto max-w-[1440px] px-4 pt-20 sm:px-6">
        <dl className="bg-border mx-auto grid max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-2xl border">
          {[
            ["Components", components.length],
            ["Blocks", blocks.length],
            ["Templates", templates.length],
          ].map(([label, value]) => (
            <div key={label} className="bg-background flex flex-col-reverse px-5 py-5 text-center">
              <dt className="text-muted-foreground mt-1 text-sm">{label}</dt>
              <dd className="text-3xl font-semibold tracking-tight sm:text-4xl">
                <NumberTicker value={Number(value)} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Showcase wall */}
      {tiles.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-primary text-sm font-medium">Components</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Things people stop scrolling for.</h2>
              <p className="text-muted-foreground mt-4 text-lg text-pretty">Every tile is the real component. Drag the globe, tilt the card, hover the dock.</p>
            </div>
            <Link href="/components" className={buttonVariants({ variant: "outline", shape: "pill" })}>
              All {components.length} components <ArrowRight />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[340px] lg:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.example} className={cn("group bg-card relative min-h-[300px] overflow-hidden rounded-2xl border", t.span)}>
                <div className="bm-stage bg-background absolute inset-0" inert={!("live" in t && t.live)}>
                  <FitPreview width={t.size[0]} height={t.size[1]}>{t.Preview ? <t.Preview /> : null}</FitPreview>
                </div>
                <Link
                  href={`/components/${t.item}`}
                  className="bg-background/85 hover:bg-background absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur transition-colors"
                >
                  {t.title} <ArrowUpRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Agents */}
      <section className="bg-card/40 border-y">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-primary text-sm font-medium">MCP</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Ask for a landing page. Get Ballmac.</h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed text-pretty">
              Ballmac UI speaks the shadcn registry and MCP standard. Your agent searches the catalog, reads when to use each
              component, installs it and wires it in.
            </p>
            <div className="mt-8 space-y-2 font-mono text-[13px]">
              <p className="bg-background overflow-x-auto rounded-lg border px-4 py-3 whitespace-nowrap">npx shadcn@latest mcp init --client claude</p>
              <p className="bg-background text-muted-foreground rounded-lg border px-4 py-3">&gt; Add a hero with a globe and a dock using Ballmac UI</p>
            </div>
            <Link href="/docs/mcp" className={cn(buttonVariants({ shape: "pill" }), "mt-8")}>
              Set up MCP <ArrowRight />
            </Link>
          </div>
          <div className="bg-background overflow-x-auto rounded-3xl border p-6 sm:p-10">
            <div className="min-w-[520px]">
              <AgentDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-primary text-sm font-medium">Why Ballmac UI</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Built by people who ship Mac apps.</h2>
        </div>
        <div className="bg-border mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <div key={p.title} className="bg-background p-7">
              <p.icon className="size-5" aria-hidden="true" />
              <h3 className="mt-5 font-semibold tracking-tight">{p.title}</h3>
              <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Blocks */}
      {blockPreviews.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-primary text-sm font-medium">Blocks and templates</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Whole sections, one command each.</h2>
            </div>
            <div className="flex gap-2">
              <Link href="/blocks" className={buttonVariants({ variant: "outline", shape: "pill" })}>
                Blocks
              </Link>
              <Link href="/templates" className={buttonVariants({ variant: "outline", shape: "pill" })}>
                Templates
              </Link>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {blockPreviews.map((b) => (
              <div key={b.name} className="bg-background hover:border-foreground/25 relative overflow-hidden rounded-2xl border transition-colors">
                <ScaledPreview scale={0.5} height={300}>
                  {b.Preview ? <b.Preview /> : null}
                </ScaledPreview>
                <div className="flex items-center justify-between gap-4 border-t px-4 py-3">
                  <Link
                    href={`/blocks/${b.name}`}
                    className="text-sm font-medium outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
                  >
                    {b.title}
                  </Link>
                  <span className="text-muted-foreground font-mono text-[11px]">@ballmac/{b.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Closing */}
      <section className="mx-auto max-w-[1440px] px-4 pb-10 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-3xl border px-6 py-24 text-center sm:py-32">
          <BeamsBackground className="-z-10" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_45%_45%_at_50%_50%,var(--background)_25%,transparent)]" />
          <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl">Make your next launch feel native.</h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-lg text-lg">Free and MIT licensed. Install one component or build a whole page.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/components" className={buttonVariants({ size: "lg", shape: "pill" })}>
              Browse components <ArrowRight />
            </Link>
            <Link href="/docs/installation" className={cn(buttonVariants({ size: "lg", shape: "pill", variant: "outline" }), "bg-background/70")}>
              Installation
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
