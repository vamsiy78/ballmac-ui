import type { Metadata } from "next"
import Link from "@/components/site/link"

import { PageCard } from "@/components/site/page-card"
import { loadThumb } from "@/lib/examples"
import { blockCategoryLabels, blockGroups, getBlocks } from "@/lib/registry"

export const metadata: Metadata = {
  title: "Blocks",
  description: "Responsive page sections for React and Tailwind: heroes, features, pricing, FAQ, footers, auth and AI chat. Install any block with one command.",
  alternates: { canonical: "/blocks" },
}

export default async function BlocksPage() {
  const blocks = await Promise.all(
    getBlocks().map(async (b) => {
      const example = b.examples[0]?.name
      // Pro previews render on the server; in a gallery they go in lazy iframes so their markup is not part of this page.
      return { ...b, Preview: example && b.tier !== "pro" ? await loadThumb(example) : null, frame: example && b.tier === "pro" ? `/preview/${example}` : undefined }
    })
  )
  const groups = blockGroups
    .map((g) => ({
      ...g,
      sections: g.categories
        .map((c) => ({ id: c, label: blockCategoryLabels[c] ?? c, items: blocks.filter((b) => b.blockCategory === c) }))
        .filter((s) => s.items.length > 0),
    }))
    .filter((g) => g.sections.length > 0)
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Blocks for real pages</h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">
          {blocks.length} responsive sections and screens built from Ballmac components. Preview them at any width, then install one into{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">components/ballmac/blocks</code>.
        </p>
      </header>
      <nav aria-label="Block groups" className="bg-background/85 sticky top-14 z-20 -mx-4 mt-10 border-b px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <ul className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] md:justify-center">
          {groups.map((g) => (
            <li key={g.id} className="shrink-0">
              <a
                href={`#${g.id}`}
                className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]"
              >
                {g.label}
                <span className="text-[11px] tabular-nums">{g.sections.reduce((n, s) => n + s.items.length, 0)}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {blocks.length === 0 && <p className="text-muted-foreground mt-12">Blocks are on the way.</p>}
      {groups.map((g) => (
        <section key={g.id} id={g.id} className="mt-20 scroll-mt-32 first-of-type:mt-14">
          <header className="mb-2 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">{g.label}</h2>
            <p className="text-muted-foreground mt-1.5 text-[15px] leading-relaxed text-pretty">{g.description}</p>
          </header>
          {g.sections.map((s) => (
            <div key={s.id} id={s.id} className="mt-10 scroll-mt-32">
              <h3 className="mb-5 flex items-baseline gap-2 border-b pb-3 text-[15px] font-semibold tracking-tight">
                {s.label}
                <span className="text-muted-foreground text-sm font-normal tabular-nums">{s.items.length}</span>
              </h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
                {s.items.map((b) => (
                  <PageCard key={b.name} href={`/blocks/${b.name}`} title={b.title} description={b.description} name={b.name} pro={b.tier === "pro"} Preview={b.Preview} frame={b.frame} />
                ))}
              </div>
            </div>
          ))}
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
