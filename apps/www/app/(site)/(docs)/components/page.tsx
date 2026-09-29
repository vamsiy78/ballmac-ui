import type { Metadata } from "next"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

import { CatalogProvider, CopyInstallButton, QuickLookButton, ViewToggle, type CatalogEntry } from "@/components/site/catalog-context"
import { CatalogDeepLink } from "@/components/site/catalog-deep-link"
import { FitPreview } from "@/components/site/fit-preview"
import { LazyMount } from "@/components/site/lazy-mount"
import { loadExample } from "@/lib/examples"
import { addCommand, categoryLabels, categoryOrder, getComponents, isNew, packageManagers, type PackageManager, type SiteItem } from "@/lib/registry"

export const metadata: Metadata = {
  title: "Components",
  description: "Polished React components for shadcn projects: app windows, docks, globes, beams, text effects, AI chat and more. Free to use.",
  alternates: { canonical: "/components" },
}

// Small controls get a smaller design size so their thumbnails aren't lost in empty space.
const compact = new Set(["primitives", "forms", "feedback"])

type CatalogItem = SiteItem & { Preview: React.ComponentType | null }

function NewBadge() {
  return <span className="bg-chart-1/12 text-foreground rounded-full px-1.5 py-px text-[10px] font-semibold">New</span>
}

/** Gallery card: a live, non-interactive preview with Quick Look and copy on hover, then the name and description. */
function Card({ item }: { item: CatalogItem }) {
  const Preview = item.Preview
  return (
    <div data-ql={item.name} data-kind="card" className="group relative">
      <div className="relative">
        <div
          className="bm-stage relative aspect-[4/3] overflow-hidden rounded-xl border transition-[border-color,box-shadow] duration-200 group-hover:border-foreground/20 group-hover:shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)]"
          inert
        >
          <LazyMount className="absolute inset-0">
            <FitPreview {...(compact.has(item.category) ? { width: 420, height: 315 } : { width: 600, height: 450 })}>{Preview ? <Preview /> : null}</FitPreview>
          </LazyMount>
        </div>
        {/* Above the stretched link; shown on hover and focus, always on touch screens. */}
        <div className="absolute top-2.5 right-2.5 z-10 flex gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
          <QuickLookButton name={item.name} />
          <CopyInstallButton name={item.name} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`/components/${item.name}`}
          className="font-medium outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
        >
          {item.title}
        </Link>
        {isNew(item) && <NewBadge />}
      </div>
      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">{item.description}</p>
    </div>
  )
}

/** List row: name and description, with Quick Look and copy. */
function Row({ item }: { item: CatalogItem }) {
  return (
    <li data-ql={item.name} data-kind="row" className="group hover:bg-accent/50 relative flex items-center gap-4 rounded-lg px-3 py-3 transition-colors">
      <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-4">
        <div className="flex shrink-0 items-center gap-2 sm:w-56">
          <Link
            href={`/components/${item.name}`}
            className="text-[15px] font-medium outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
          >
            {item.title}
          </Link>
          {isNew(item) && <NewBadge />}
        </div>
        <p className="text-muted-foreground mt-0.5 truncate text-sm sm:mt-0">{item.description}</p>
      </div>
      <div className="relative z-10 flex shrink-0 gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
        <QuickLookButton name={item.name} label={false} />
        <CopyInstallButton name={item.name} />
      </div>
    </li>
  )
}

/** Index entry: just the name, like a table of contents. Space on it opens Quick Look. */
function IndexEntry({ item }: { item: CatalogItem }) {
  return (
    <li data-ql={item.name} data-kind="index" className="flex items-center gap-2">
      <Link href={`/components/${item.name}`} className="hover:text-foreground/80 text-[15px] underline-offset-4 outline-none hover:underline focus-visible:underline">
        {item.title}
      </Link>
      {isNew(item) && (
        <span className="bg-chart-1 size-1.5 shrink-0 rounded-full" aria-label="New" role="img" />
      )}
    </li>
  )
}

export default async function ComponentsPage() {
  const items: CatalogItem[] = await Promise.all(
    getComponents().map(async (i) => ({ ...i, Preview: i.examples[0] ? await loadExample(i.examples[0].name) : null }))
  )
  const rank = (c: string) => categoryOrder.indexOf(c) + 1 || 99
  const categories = [...new Set(items.map((i) => i.category))].sort((a, b) => rank(a) - rank(b))
  const inCategory = (cat: string) => items.filter((i) => i.category === cat).sort((a, b) => Number(b.featured) - Number(a.featured))
  const entries: CatalogEntry[] = items.map((i) => ({
    name: i.name,
    title: i.title,
    description: i.description,
    category: i.category,
    categoryLabel: categoryLabels[i.category] ?? i.category,
    isNew: isNew(i),
    commands: Object.fromEntries(packageManagers.map((pm) => [pm, addCommand([i.name], pm)])) as Record<PackageManager, string>,
  }))
  // Live, interactive instances for Quick Look; only the open one is ever mounted.
  const previews = Object.fromEntries(items.map((i) => [i.name, i.Preview ? <i.Preview /> : null]))
  return (
    <CatalogProvider entries={entries} previews={previews}>
      <CatalogDeepLink />
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="max-w-2xl">
          <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Link href="/docs" className="hover:text-foreground">Docs</Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span className="text-foreground" aria-current="page">Components</span>
          </nav>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Components</h1>
          <p className="text-muted-foreground mt-3 text-[1.05rem] leading-7 text-balance sm:text-base">
            Every component in the library. Press Quick Look on any card to try it right here.
          </p>
        </div>
        <ViewToggle />
      </header>
      {categories.map((cat) => (
        <section key={cat} data-category={cat} className="mt-12 group-data-[view=index]/catalog:mt-9">
          <h2 id={`c-${cat}`} className="mb-5 flex items-baseline gap-2 text-lg font-semibold tracking-tight group-data-[view=index]/catalog:mb-4 group-data-[view=index]/catalog:text-base">
            {categoryLabels[cat] ?? cat}
          </h2>
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 group-data-[view=index]/catalog:hidden group-data-[view=list]/catalog:hidden sm:grid-cols-2 xl:grid-cols-3">
            {inCategory(cat).map((i) => (
              <Card key={i.name} item={i} />
            ))}
          </div>
          <ul className="-mx-3 hidden divide-y group-data-[view=list]/catalog:block">
            {inCategory(cat).map((i) => (
              <Row key={i.name} item={i} />
            ))}
          </ul>
          <ul className="hidden grid-cols-2 gap-x-6 gap-y-4 group-data-[view=index]/catalog:grid sm:grid-cols-3">
            {inCategory(cat).map((i) => (
              <IndexEntry key={i.name} item={i} />
            ))}
          </ul>
        </section>
      ))}
    </CatalogProvider>
  )
}
