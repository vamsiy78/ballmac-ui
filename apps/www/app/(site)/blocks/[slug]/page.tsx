import type { Metadata } from "next"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodePanel } from "@/components/site/code-panel"
import { FramePreview } from "@/components/site/frame-preview"
import { ItemAi, ItemCredits, ItemDependencies, ItemInstall, shownPath } from "@/components/site/item-install"
import { ItemJsonLd } from "@/components/site/item-jsonld"
import { SectionHeading } from "@/components/site/section-heading"
import { blockCategoryLabels, getBlocks, getItem, readSource } from "@/lib/registry"

export function generateStaticParams() {
  return getBlocks().map((b) => ({ slug: b.name }))
}
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<"/blocks/[slug]">): Promise<Metadata> {
  const item = getItem((await params).slug)
  if (!item) return {}
  return { title: `${item.title}: React + Tailwind block`, description: item.description, alternates: { canonical: `/blocks/${item.name}` } }
}

export default async function BlockPage({ params }: PageProps<"/blocks/[slug]">) {
  const item = getItem((await params).slug)
  if (!item || item.category !== "blocks") notFound()
  const example = item.examples[0]
  const related = getBlocks().filter((b) => b.name !== item.name && b.blockCategory === item.blockCategory).slice(0, 4)
  return (
    <div className="mx-auto max-w-[1440px] space-y-10 px-4 py-12 sm:px-6">
      <header className="max-w-3xl space-y-3">
        <ItemJsonLd item={item} section={{ name: "Blocks", path: "/blocks" }} />
        <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Link href="/blocks" className="hover:text-foreground">Blocks</Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <Link href={`/blocks#${item.blockCategory}`} className="hover:text-foreground">{blockCategoryLabels[item.blockCategory ?? ""] ?? "Block"}</Link>
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{item.title}</h1>
        <p className="text-muted-foreground max-w-2xl text-[1.05rem] leading-7 text-balance sm:text-base">{item.description}</p>
      </header>
      {example && (
        <FramePreview
          src={`/preview/${example.name}`}
          name={item.name}
          example={example.name}
          title={`${item.title} preview`}
          code={
            <div className="space-y-4 p-4">
              {item.files.map((f) => (
                <CodePanel key={f.path} code={readSource(f.source)} title={shownPath(f.target)} />
              ))}
            </div>
          }
        />
      )}
      <div className="grid max-w-[820px] grid-cols-1 gap-12">
        <section className="space-y-4">
          <SectionHeading id="installation">Installation</SectionHeading>
          <ItemInstall item={item} />
        </section>
        {example && (
          <section className="space-y-4">
            <SectionHeading id="usage">Usage</SectionHeading>
            <CodePanel code={readSource(example.source)} title={`Example: ${example.file}`} />
          </section>
        )}
        <section className="space-y-4">
          <SectionHeading id="dependencies">Dependencies</SectionHeading>
          <ItemDependencies item={item} />
        </section>
        <section className="space-y-4">
          <SectionHeading id="ai">Use with AI</SectionHeading>
          <ItemAi item={item} />
          <ItemCredits item={item} />
        </section>
        {related.length > 0 && (
          <section className="space-y-4">
            <SectionHeading id="related">More {blockCategoryLabels[item.blockCategory ?? ""]?.toLowerCase()} blocks</SectionHeading>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link key={r.name} href={`/blocks/${r.name}`} className="hover:bg-accent rounded-xl border p-4 transition-colors">
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{r.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
