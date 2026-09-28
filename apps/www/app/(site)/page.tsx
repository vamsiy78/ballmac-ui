import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ballmac/button"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { TextReveal } from "@/components/ballmac/text-reveal"
import { InstallTabs } from "@/components/site/install-tabs"
import { ScaledPreview } from "@/components/site/scaled-preview"
import { Eyebrow } from "@/components/site/section-heading"
import { loadExample } from "@/lib/examples"
import { addCommand, getBlocks, getComponents, getTemplates, packageManagers, type PackageManager } from "@/lib/registry"

const pillars = [
  {
    title: "One design language",
    body: "Primitives, motion, product UI and AI interfaces share the same tokens, spacing, focus states and motion curves, so pages look designed, not assembled.",
  },
  {
    title: "Installs without collisions",
    body: "Everything lands in components/ballmac with honest dependencies. Your shadcn/ui files are never overwritten, and every release is install-tested.",
  },
  {
    title: "Built for AI agents",
    body: "Each item says when to use it, when not to, and what it composes with, so Claude Code, Cursor and VS Code can pick and wire the right component.",
  },
]

// Live previews shown on the home page, by registry example name.
const showcase = [
  { example: "ai-chat-demo", label: "AI chat", href: "/components/ai-chat", span: "lg:col-span-2 lg:row-span-2" },
  { example: "tool-call-card-demo", label: "Tool call card", href: "/components/tool-call-card", span: "" },
  { example: "terminal-demo", label: "Terminal", href: "/components/terminal", span: "" },
  { example: "spotlight-card-demo", label: "Spotlight card", href: "/components/spotlight-card", span: "" },
  { example: "switch-settings", label: "Switch", href: "/components/switch", span: "" },
]

export default async function Home() {
  const commands = Object.fromEntries(packageManagers.map((pm) => [pm, addCommand(["prompt-input"], pm)])) as Record<PackageManager, string>
  const components = getComponents()
  const blocks = getBlocks()
  const templates = getTemplates()
  const previews = await Promise.all(showcase.map(async (s) => ({ ...s, Preview: await loadExample(s.example) })))
  const blockPreviews = await Promise.all(blocks.slice(0, 4).map(async (b) => ({ ...b, Preview: b.examples[0] ? await loadExample(b.examples[0].name) : null })))

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div aria-hidden="true" className="bm-grid absolute inset-0" />
        <div className="relative mx-auto max-w-[1320px] px-4 pt-20 pb-16 sm:px-6 md:pt-28">
          <div className="max-w-3xl">
            <Eyebrow>Ballmac UI · Preview</Eyebrow>
            <TextReveal as="h1" trigger="mount" className="mt-6 text-5xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-7xl">
              Components your AI agent can install.
            </TextReveal>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
              Accessible React and Tailwind components, blocks and templates in one coherent design language. Add them with the
              shadcn CLI, or ask your agent through MCP.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" shape="pill">
                <Link href="/components">
                  Browse components <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" shape="pill" variant="outline">
                <Link href="/docs/mcp">Use with your AI agent</Link>
              </Button>
            </div>
            <InstallTabs commands={commands} className="mt-10 max-w-xl" />
          </div>
          <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-xl border bg-border">
            {[
              ["Components", components.length],
              ["Blocks", blocks.length],
              ["Templates", templates.length],
            ].map(([label, value]) => (
              <div key={label} className="bg-background px-5 py-4">
                <dt className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{label}</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight">
                  <NumberTicker value={Number(value)} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Components</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">From primitives to AI interfaces.</h2>
          </div>
          <Button asChild variant="outline" shape="pill">
            <Link href="/components">
              All {components.length} components <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-2">
          {previews.map((p) => (
            <div key={p.example} className={`group relative overflow-hidden rounded-xl border transition-colors hover:border-foreground/25 ${p.span}`}>
              <div className="bm-stage pointer-events-none flex min-h-64 items-center justify-center p-6 lg:h-full" inert>
                {p.Preview ? <p.Preview /> : null}
              </div>
              <Link href={p.href} className="absolute inset-0 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <span className="absolute bottom-3 left-3 rounded-md border bg-background/90 px-2 py-1 font-mono text-[11px] backdrop-blur">{p.label}</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {blockPreviews.length > 0 && (
        <section className="border-y bg-card/40">
          <div className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow>Blocks and templates</Eyebrow>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Whole sections, one command each.</h2>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" shape="pill">
                  <Link href="/blocks">Blocks</Link>
                </Button>
                <Button asChild variant="outline" shape="pill">
                  <Link href="/templates">Templates</Link>
                </Button>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              {blockPreviews.map((b) => (
                <div key={b.name} className="relative overflow-hidden rounded-xl border bg-background transition-colors hover:border-foreground/25">
                  <ScaledPreview scale={0.47} height={280}>
                    {b.Preview ? <b.Preview /> : null}
                  </ScaledPreview>
                  <div className="flex items-center justify-between gap-4 border-t px-4 py-3">
                    <Link href={`/blocks/${b.name}`} className="text-sm font-medium after:absolute after:inset-0 after:rounded-xl outline-none focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50">
                      {b.title}
                    </Link>
                    <span className="font-mono text-[11px] text-muted-foreground">@ballmac/{b.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6">
        <Eyebrow>Why Ballmac UI</Eyebrow>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {pillars.map((p, i) => (
            <div key={p.title} className="bg-background p-7">
              <p className="font-mono text-xs text-muted-foreground tabular-nums">0{i + 1}</p>
              <h2 className="mt-4 text-lg font-semibold tracking-tight">{p.title}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-8 sm:px-6">
        <div className="grid items-center gap-10 rounded-2xl border p-8 md:p-12 lg:grid-cols-2">
          <div>
            <Eyebrow>MCP</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-balance">Ask your agent for a pricing page. Get Ballmac blocks.</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Ballmac UI works with the official shadcn MCP server in Claude Code, Cursor, VS Code, Codex and more. Every item
              carries descriptions written for agents, so they choose well and wire it up correctly.
            </p>
            <Button asChild className="mt-6" shape="pill">
              <Link href="/docs/mcp">
                Set up MCP <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="space-y-3 font-mono text-[13px]">
            <p className="rounded-lg border bg-card px-4 py-3">npx shadcn@latest mcp init --client claude</p>
            <p className="rounded-lg border bg-card px-4 py-3 text-muted-foreground">
              &gt; Build a SaaS landing page with Ballmac UI blocks: hero, pricing and FAQ.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
