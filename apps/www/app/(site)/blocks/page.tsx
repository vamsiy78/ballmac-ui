import type { Metadata } from "next"
import Link from "next/link"

import { PageCard } from "@/components/site/page-card"
import { loadExample } from "@/lib/examples"
import { blockCategoryLabels, getBlocks } from "@/lib/registry"

export const metadata: Metadata = {
  title: "Blocks",
  description: "Responsive page sections for React and Tailwind: heroes, features, pricing, FAQ, footers, auth and AI chat. Install any block with one command.",
  alternates: { canonical: "/blocks" },
}

// Sections in the order they appear on a page.
const blockOrder = ["header", "hero", "features", "logo-cloud", "testimonials", "pricing", "faq", "cta", "footer", "auth", "ai-chat", "dashboard", "settings", "billing"]
const byPageOrder = (a: string, b: string) => (blockOrder.indexOf(a) + 1 || 99) - (blockOrder.indexOf(b) + 1 || 99)

export default async function BlocksPage() {
  const blocks = await Promise.all(getBlocks().map(async (b) => ({ ...b, Preview: b.examples[0] ? await loadExample(b.examples[0].name) : null })))
  const groups = [...new Set(blocks.map((b) => b.blockCategory ?? "other"))].sort(byPageOrder)
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Blocks for real pages</h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">
          {blocks.length} responsive sections built from Ballmac components. Preview them at any width, then install one into{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">components/ballmac/blocks</code>.
        </p>
      </header>
      <nav aria-label="Block categories" className="bg-background/85 sticky top-14 z-20 -mx-4 mt-10 border-b px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <ul className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] md:justify-center">
          {groups.map((g) => (
            <li key={g} className="shrink-0">
              <a
                href={`#${g}`}
                className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]"
              >
                {blockCategoryLabels[g] ?? g}
                <span className="text-[11px] tabular-nums">{blocks.filter((b) => (b.blockCategory ?? "other") === g).length}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {blocks.length === 0 && <p className="text-muted-foreground mt-12">Blocks are on the way.</p>}
      {groups.map((g) => (
        <section key={g} id={g} className="mt-14 scroll-mt-32">
          <h2 className="mb-5 flex items-baseline gap-2 text-lg font-semibold tracking-tight">
            {blockCategoryLabels[g] ?? g}
            <span className="text-muted-foreground text-sm font-normal tabular-nums">{blocks.filter((b) => (b.blockCategory ?? "other") === g).length}</span>
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
            {blocks
              .filter((b) => (b.blockCategory ?? "other") === g)
              .map((b) => (
                <PageCard key={b.name} href={`/blocks/${b.name}`} title={b.title} description={b.description} name={b.name} Preview={b.Preview} />
              ))}
          </div>
        </section>
      ))}
      <p className="text-muted-foreground mt-20 text-center text-sm">
        Want the whole page? Start from a{" "}
        <Link href="/templates" className="text-foreground underline underline-offset-4">
          template
        </Link>
        .
      </p>
    </div>
  )
}
