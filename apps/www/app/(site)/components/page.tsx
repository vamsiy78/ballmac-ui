import type { Metadata } from "next"
import Link from "next/link"

import { CatalogFilter } from "@/components/site/catalog-filter"
import { FitPreview } from "@/components/site/fit-preview"
import { loadExample } from "@/lib/examples"
import { categoryLabels, categoryOrder, getComponents, isNew, type SiteItem } from "@/lib/registry"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Components",
  description: "macOS-grade React components for shadcn projects: docks, windows, globes, beams, text effects, AI chat and more. Free and MIT licensed.",
  alternates: { canonical: "/components" },
}

type CatalogItem = SiteItem & { Preview: React.ComponentType | null }

const searchText = (i: SiteItem) => [i.name, i.title, i.description, categoryLabels[i.category] ?? "", ...i.tags].join(" ").toLowerCase()

/** One catalog card: a live, non-interactive preview with a stretched title link. */
function Card({ item, large }: { item: CatalogItem; large?: boolean }) {
  const Preview = item.Preview
  return (
    <div
      data-search={searchText(item)}
      className="group bg-card hover:border-foreground/20 relative overflow-hidden rounded-2xl border transition-[border-color,box-shadow] duration-200 hover:shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)]"
    >
      <div
        className={cn("bm-stage bg-background pointer-events-none relative flex items-center justify-center overflow-hidden border-b", large ? "h-80 sm:h-96" : "h-60")}
        inert
      >
        <FitPreview width={large ? 760 : 600} height={large ? 440 : 400}>{Preview ? <Preview /> : null}</FitPreview>
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <Link
            href={`/components/${item.name}`}
            className="font-medium outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
          >
            {item.title}
          </Link>
          <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">{item.description}</p>
        </div>
        {isNew(item) && <span className="bg-primary/10 text-primary mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold">New</span>}
      </div>
    </div>
  )
}

export default async function ComponentsPage() {
  const items: CatalogItem[] = await Promise.all(
    getComponents().map(async (i) => ({ ...i, Preview: i.examples[0] ? await loadExample(i.examples[0].name) : null }))
  )
  const rank = (c: string) => categoryOrder.indexOf(c) + 1 || 99
  const categories = [...new Set(items.map((i) => i.category))].sort((a, b) => rank(a) - rank(b))
  const featured = items.filter((i) => i.featured)
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6">
      <header className="max-w-3xl space-y-4">
        <p className="text-muted-foreground text-sm font-medium">{items.length} components · free and open source</p>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl">Components that make a page feel crafted.</h1>
        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed text-pretty">
          macOS-grade interface pieces, living backgrounds, text effects and AI surfaces. Each one installs into{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">components/ballmac</code> with a single command.
        </p>
      </header>
      <CatalogFilter options={categories.map((c) => ({ value: c, label: categoryLabels[c] ?? c, count: items.filter((i) => i.category === c).length }))}>
        {featured.length > 0 && (
          <section data-category="featured" className="mt-10">
            <h2 className="mb-5 text-lg font-semibold tracking-tight">Featured</h2>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {featured.map((i) => (
                <Card key={i.name} item={i} large />
              ))}
            </div>
          </section>
        )}
        {categories.map((cat) => (
          <section key={cat} data-category={cat} className="mt-14">
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight">{categoryLabels[cat] ?? cat}</h2>
              <span className="text-muted-foreground font-mono text-xs tabular-nums">{items.filter((i) => i.category === cat).length}</span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items
                .filter((i) => i.category === cat)
                .sort((a, b) => Number(b.featured) - Number(a.featured))
                .map((i) => (
                  <Card key={i.name} item={i} />
                ))}
            </div>
          </section>
        ))}
      </CatalogFilter>
    </div>
  )
}
