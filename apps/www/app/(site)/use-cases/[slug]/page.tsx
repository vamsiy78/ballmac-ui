import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/site/json-ld"
import { article, breadcrumbs } from "@/lib/schema"
import { InstallTabs } from "@/components/site/install-tabs"
import Link from "@/components/site/link"
import { PageCard } from "@/components/site/page-card"
import { loadThumb } from "@/lib/examples"
import { addCommand, getItem, packageManagers, type PackageManager } from "@/lib/registry"
import { thumbFor } from "@/lib/thumbs"
import { getUseCase, useCases } from "@/lib/use-cases"

export const dynamicParams = false

export function generateStaticParams() {
  return useCases.map((u) => ({ slug: u.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const u = getUseCase((await params).slug)
  if (!u) return {}
  return { title: u.title, description: u.description, alternates: { canonical: `/use-cases/${u.slug}` } }
}

const per = (fn: (pm: PackageManager) => string) => Object.fromEntries(packageManagers.map((pm) => [pm, fn(pm)])) as Record<PackageManager, string>

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const u = getUseCase((await params).slug)
  if (!u) notFound()
  const cards = await Promise.all(
    [...u.blocks.map((n) => ({ n, kind: "blocks" as const })), ...u.templates.map((n) => ({ n, kind: "templates" as const }))].map(async ({ n, kind }) => {
      const item = getItem(n)
      if (!item) return null
      const thumb = thumbFor(item.name, item.tier)
      const example = item.examples[0]?.name
      return { item, kind, thumb, Preview: !thumb && example ? await loadThumb(example) : null }
    })
  )
  const found = cards.filter((c): c is NonNullable<typeof c> => c !== null)
  const blocks = found.filter((c) => c.kind === "blocks")
  const templates = found.filter((c) => c.kind === "templates")
  const first = blocks[0]?.item.name
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 md:py-20">
      <JsonLd graph={[article({ headline: u.title, description: u.description, path: `/use-cases/${u.slug}`, section: "Use cases" }), breadcrumbs([{ name: "Use cases", path: "/use-cases" }, { name: u.name, path: `/use-cases/${u.slug}` }])]} />
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-muted-foreground text-sm">
          <Link href="/use-cases" className="hover:text-foreground">
            What you can build
          </Link>
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">{u.title}</h1>
        <p className="text-muted-foreground mt-5 text-base leading-relaxed text-pretty sm:text-lg">{u.intro}</p>
        {first && (
          <div className="mx-auto mt-8 max-w-xl text-start">
            <InstallTabs commands={per((pm) => addCommand([first], pm))} />
          </div>
        )}
      </header>

      <section aria-labelledby="blocks-h" className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="blocks-h" className="text-2xl font-semibold tracking-[-0.03em]">
            Blocks
          </h2>
          <Link href={`/blocks?q=${encodeURIComponent(u.query)}`} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium">
            More blocks like these <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {blocks.map(({ item, thumb, Preview }, i) => (
            <PageCard key={item.name} href={`/blocks/${item.name}`} title={item.title} description={item.description} name={item.name} Preview={Preview} thumb={thumb} priority={i < 3} />
          ))}
        </div>
      </section>

      {templates.length > 0 && (
        <section aria-labelledby="templates-h" className="mt-20">
          <h2 id="templates-h" className="text-2xl font-semibold tracking-[-0.03em]">
            Whole sites and apps
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
            {templates.map(({ item, thumb, Preview }) => (
              <PageCard key={item.name} href={`/templates/${item.name}`} title={item.title} description={item.description} name={item.name} Preview={Preview} thumb={thumb} tall />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="guides-h" className="mt-20 max-w-2xl">
        <h2 id="guides-h" className="text-2xl font-semibold tracking-[-0.03em]">
          Guides
        </h2>
        <ul className="mt-4 divide-y rounded-2xl border">
          {u.docs.map((d) => (
            <li key={d.href}>
              <Link href={d.href} className="hover:bg-accent focus-visible:ring-ring/50 flex items-center justify-between gap-4 px-5 py-3.5 text-[15px] outline-none transition-colors focus-visible:ring-[3px]">
                {d.label}
                <ArrowRight className="text-muted-foreground size-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
