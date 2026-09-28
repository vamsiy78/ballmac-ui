import type { Metadata } from "next"
import Link from "next/link"

import { Suspense } from "react"

import { CatalogFilter } from "@/components/site/catalog-filter"
import { Eyebrow } from "@/components/site/section-heading"
import { loadExample } from "@/lib/examples"
import { categoryLabels, getComponents } from "@/lib/registry"

export const metadata: Metadata = {
  title: "Components",
  description: "Accessible React and Tailwind components for shadcn projects: primitives, motion, AI and developer interfaces. Free and MIT licensed.",
  alternates: { canonical: "/components" },
}

export default async function ComponentsPage() {
  const items = await Promise.all(
    getComponents().map(async (i) => ({ ...i, Preview: i.examples[0] ? await loadExample(i.examples[0].name) : null }))
  )
  const categories = [...new Set(items.map((i) => i.category))]
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6">
      <header className="max-w-2xl space-y-4">
        <Eyebrow>{items.length} components</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Components</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Every component installs into <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">components/ballmac</code>,
          so it never overwrites your shadcn/ui files.
        </p>
      </header>
      <Suspense>
        <CatalogFilter options={categories.map((c) => ({ value: c, label: categoryLabels[c] ?? c, count: items.filter((i) => i.category === c).length }))}>
      {categories.map((cat) => (
        <section key={cat} data-category={cat} className="mt-12">
          <h2 className="text-muted-foreground mb-5 font-mono text-[11px] tracking-[0.16em] uppercase">{categoryLabels[cat] ?? cat}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items
              .filter((i) => i.category === cat)
              .map((i) => (
                <Link key={i.name} href={`/components/${i.name}`} className="group overflow-hidden rounded-xl border transition-colors hover:border-foreground/25">
                  <div className="bm-stage pointer-events-none flex h-48 items-center justify-center overflow-hidden border-b" inert>
                    {/* Demos are sized for the full preview stage; scale them to fit the card. */}
                    <div className="flex w-[125%] shrink-0 scale-[0.8] items-center justify-center">{i.Preview ? <i.Preview /> : null}</div>
                  </div>
                  <div className="p-4">
                    <p className="font-medium">{i.title}</p>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{i.description}</p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ))}
        </CatalogFilter>
      </Suspense>
    </div>
  )
}
