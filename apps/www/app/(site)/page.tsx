import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ballmac/button"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { InstallTabs } from "@/components/site/install-tabs"
import { Eyebrow } from "@/components/site/section-heading"
import { addCommand, getComponents, packageManagers, type PackageManager } from "@/lib/registry"

const pillars = [
  {
    title: "One design language",
    body: "Primitives, motion, product UI and AI interfaces share the same tokens, spacing and motion curves, so pages look designed, not assembled.",
  },
  {
    title: "Installs without collisions",
    body: "Everything lands in components/ballmac with honest dependencies. Your shadcn/ui files are never overwritten.",
  },
  {
    title: "Built for AI agents",
    body: "Rich metadata, examples and llms.txt mean Claude Code, Cursor and VS Code can find, install and compose components through MCP.",
  },
]

export default function Home() {
  const commands = Object.fromEntries(packageManagers.map((pm) => [pm, addCommand(["button"], pm)])) as Record<PackageManager, string>
  const count = getComponents().length
  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div aria-hidden="true" className="bm-grid absolute inset-0" />
        <div className="relative mx-auto grid max-w-[1320px] items-center gap-12 px-4 pt-20 pb-24 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Eyebrow>Ballmac UI · v0.1</Eyebrow>
            <h1 className="mt-6 text-5xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
              Components your AI agent can install.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-pretty">
              Accessible React and Tailwind components, blocks and templates in one coherent design language.
              Add them with the shadcn CLI, or ask your agent through MCP.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" shape="pill">
                <Link href="/components">
                  Browse components <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" shape="pill" variant="outline">
                <Link href="/docs/mcp">Set up MCP</Link>
              </Button>
            </div>
            <InstallTabs commands={commands} className="mt-10 max-w-xl" />
          </div>
          <div className="bg-card/80 relative rounded-2xl border p-8 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.35)] backdrop-blur">
            <p className="text-muted-foreground font-mono text-[11px] tracking-[0.16em] uppercase">Live preview</p>
            <div className="mt-6 flex flex-col items-start gap-8">
              <div>
                <NumberTicker value={12840} className="text-5xl font-semibold" />
                <p className="text-muted-foreground mt-1 text-sm">clips copied this week</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button>Deploy</Button>
                <Button variant="outline">Preview</Button>
                <Button variant="ghost">Cancel</Button>
              </div>
              <Button loading className="w-44">Saving</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6">
        <Eyebrow>Why Ballmac UI</Eyebrow>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {pillars.map((p, i) => (
            <div key={p.title} className="bg-background p-7">
              <p className="text-muted-foreground font-mono text-xs tabular-nums">0{i + 1}</p>
              <h2 className="mt-4 text-lg font-semibold tracking-tight">{p.title}</h2>
              <p className="text-muted-foreground mt-2 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-7">
          <p className="text-lg font-medium">
            {count} components today. Blocks and templates are next.
          </p>
          <Button asChild variant="outline" shape="pill">
            <Link href="/components">
              See what&apos;s available <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
