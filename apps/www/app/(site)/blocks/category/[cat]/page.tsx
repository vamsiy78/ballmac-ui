import { ArrowRight, ChevronRight } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { InstallTabs } from "@/components/site/install-tabs"
import { JsonLd } from "@/components/site/json-ld"
import Link from "@/components/site/link"
import { PageCard } from "@/components/site/page-card"
import { ProBuyBar } from "@/components/site/pro-buy"
import { blockCategoryPages, getBlockCategoryPage } from "@/lib/block-categories"
import { loadThumb } from "@/lib/examples"
import { addCommand, isPro, packageManagers, type PackageManager } from "@/lib/registry"
import { breadcrumbs, collection } from "@/lib/schema"
import { thumbFor } from "@/lib/thumbs"
import { useCases } from "@/lib/use-cases"

export const dynamicParams = false

export function generateStaticParams() {
  return blockCategoryPages().map((p) => ({ cat: p.slug }))
}

const title = (noun: string) => `shadcn ${noun} blocks for React`
const heading = (noun: string) => `shadcn ${noun} blocks for React and Tailwind`

function description(p: NonNullable<ReturnType<typeof getBlockCategoryPage>>) {
  const free = p.blocks.filter((b) => !isPro(b)).length
  const split = free === p.blocks.length ? "all free" : free ? `${free} free, ${p.blocks.length - free} in Pro` : "in Ballmac UI Pro"
  return `${p.blocks.length} ${p.noun} blocks for shadcn/ui (${split}). Preview each at any width, then install it with one shadcn command and own the code.`
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }): Promise<Metadata> {
  const p = getBlockCategoryPage((await params).cat)
  if (!p) return {}
  return { title: title(p.noun), description: description(p), alternates: { canonical: `/blocks/category/${p.slug}` } }
}

const per = (fn: (pm: PackageManager) => string) => Object.fromEntries(packageManagers.map((pm) => [pm, fn(pm)])) as Record<PackageManager, string>

export default async function BlockCategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const p = getBlockCategoryPage((await params).cat)
  if (!p) notFound()
  const cards = await Promise.all(
    p.blocks.map(async (b) => {
      const thumb = thumbFor(b.name, b.tier)
      const example = b.examples[0]?.name
      // Pro previews without a thumbnail go in lazy iframes, as in the gallery, so their markup is not part of this page.
      return { item: b, thumb, Preview: !thumb && example && !isPro(b) ? await loadThumb(example) : null, frame: !thumb && example && isPro(b) ? `/preview/${example}` : undefined }
    })
  )
  const free = p.blocks.filter((b) => !isPro(b))
  const pro = p.blocks.length - free.length
  const first = free[0]?.name
  const others = blockCategoryPages().filter((o) => o.group.id === p.group.id && o.slug !== p.slug)
  const guides = useCases.filter((u) => u.query === p.slug || u.blocks.some((n) => p.blocks.some((b) => b.name === n))).slice(0, 3)
  const path = `/blocks/category/${p.slug}`
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 md:py-20">
      <JsonLd
        graph={[
          ...collection({ name: title(p.noun), description: description(p), path, items: p.blocks.map((b) => ({ name: b.title, path: `/blocks/${b.name}` })) }),
          breadcrumbs([{ name: "Blocks", path: "/blocks" }, { name: p.label, path }]),
        ]}
      />
      <header className="mx-auto max-w-3xl text-center">
        <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm">
          <Link href="/blocks" className="hover:text-foreground">Blocks</Link>
          <ChevronRight className="size-3.5 rtl:-scale-x-100" aria-hidden="true" />
          <span>{p.group.label}</span>
        </nav>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">{heading(p.noun)}</h1>
        <p className="text-muted-foreground mt-5 text-base leading-relaxed text-pretty sm:text-lg">{p.intro}</p>
        <p className="mt-4 text-sm">
          <span className="font-medium">{p.blocks.length} blocks</span>
          <span className="text-muted-foreground">
            {" "}
            · {free.length} free under MIT{pro ? ` · ${pro} in Pro` : ""}
          </span>
        </p>
        {first && (
          <div className="mx-auto mt-8 max-w-xl text-start">
            <InstallTabs commands={per((pm) => addCommand([first], pm))} />
          </div>
        )}
      </header>

      <section aria-labelledby="blocks-h" className="mt-16">
        <h2 id="blocks-h" className="sr-only">
          All {p.label.toLowerCase()} blocks
        </h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ item, thumb, Preview, frame }, i) => (
            <PageCard key={item.name} href={`/blocks/${item.name}`} title={item.title} description={item.description} name={item.name} Preview={Preview} thumb={thumb} frame={frame} pro={isPro(item)} short={p.slug === "header"} priority={i < 3} />
          ))}
        </div>
        {pro > 0 && <ProBuyBar where={`category-${p.slug}`} lead={`${pro === p.blocks.length ? "These blocks are" : `${pro} of these blocks are`} in Ballmac UI Pro.`} className="mt-10" />}
      </section>

      {guides.length > 0 && (
        <section aria-labelledby="guides-h" className="mt-20 max-w-2xl">
          <h2 id="guides-h" className="text-2xl font-semibold tracking-[-0.03em]">
            Build with them
          </h2>
          <ul className="mt-4 divide-y rounded-2xl border">
            {guides.map((u) => (
              <li key={u.slug}>
                <Link href={`/use-cases/${u.slug}`} className="hover:bg-accent focus-visible:ring-ring/50 flex items-center justify-between gap-4 px-5 py-3.5 text-[15px] outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none">
                  {u.title}
                  <ArrowRight className="text-muted-foreground size-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {others.length > 0 && (
        <nav aria-labelledby="more-h" className="mt-20">
          <h2 id="more-h" className="text-2xl font-semibold tracking-[-0.03em]">
            More {p.group.label.toLowerCase()} blocks
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/blocks/category/${o.slug}`} className="bg-frame hover:bg-accent inline-flex rounded-full px-3.5 py-1.5 text-sm transition-colors motion-reduce:transition-none">
                  {o.label} <span className="text-muted-foreground ms-1.5 tabular-nums">{o.blocks.length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
