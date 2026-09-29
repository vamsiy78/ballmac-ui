import type { Metadata } from "next"
import Link from "next/link"

import { ScaledPreview } from "@/components/site/scaled-preview"
import { Eyebrow } from "@/components/site/section-heading"
import { loadExample } from "@/lib/examples"
import { blockCategoryLabels, getBlocks } from "@/lib/registry"

export const metadata: Metadata = {
  title: "Blocks",
  description: "Responsive page sections for React and Tailwind: heroes, features, pricing, FAQ, footers, auth and AI chat. Install any block with one command.",
  alternates: { canonical: "/blocks" },
}

export default async function BlocksPage() {
  const blocks = await Promise.all(getBlocks().map(async (b) => ({ ...b, Preview: b.examples[0] ? await loadExample(b.examples[0].name) : null })))
  const groups = [...new Set(blocks.map((b) => b.blockCategory ?? "other"))]
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6">
      <header className="max-w-2xl space-y-4">
        <Eyebrow>{blocks.length} blocks</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Blocks</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Complete, responsive page sections built from Ballmac components. Each installs into{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">components/ballmac/blocks</code> with the
          components it needs.
        </p>
      </header>
      {blocks.length === 0 && <p className="text-muted-foreground mt-12">Blocks are on the way.</p>}
      {groups.map((g) => (
        <section key={g} className="mt-14">
          <h2 className="text-muted-foreground mb-5 font-mono text-[11px] tracking-[0.16em] uppercase">{blockCategoryLabels[g] ?? g}</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {blocks
              .filter((b) => (b.blockCategory ?? "other") === g)
              .map((b) => (
                <div key={b.name} className="group relative overflow-hidden rounded-xl border transition-colors hover:border-foreground/25">
                  <div className="border-b">
                    <ScaledPreview scale={0.47} height={300} width={1280}>
                      {b.Preview ? <b.Preview /> : null}
                    </ScaledPreview>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 p-4">
                    <div>
                      <Link href={`/blocks/${b.name}`} className="font-medium after:absolute after:inset-0 after:rounded-xl outline-none focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50">
                        {b.title}
                      </Link>
                      <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">{b.description}</p>
                    </div>
                    <span className="text-muted-foreground shrink-0 font-mono text-[11px]">@ballmac/{b.name}</span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
