import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodePanel } from "@/components/site/code-panel"
import { FramePreview } from "@/components/site/frame-preview"
import { ItemAi, ItemCredits, ItemDependencies, ItemInstall, shownPath } from "@/components/site/item-install"
import { ItemJsonLd } from "@/components/site/item-jsonld"
import { SectionHeading } from "@/components/site/section-heading"
import { getItem, getTemplates, itemHref, readSource } from "@/lib/registry"

export function generateStaticParams() {
  return getTemplates().map((t) => ({ slug: t.name }))
}
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<"/templates/[slug]">): Promise<Metadata> {
  const item = getItem((await params).slug)
  if (!item) return {}
  return { title: `${item.title}: React + Tailwind template`, description: item.description, alternates: { canonical: `/templates/${item.name}` } }
}

export default async function TemplatePage({ params }: PageProps<"/templates/[slug]">) {
  const item = getItem((await params).slug)
  if (!item || item.category !== "templates") notFound()
  const example = item.examples[0]
  const uses = item.registryDependencies.filter((d) => !d.startsWith("shadcn:")).map(getItem).filter((i) => !!i)
  return (
    <div className="mx-auto max-w-[1440px] space-y-10 px-4 py-12 sm:px-6">
      <header className="max-w-3xl space-y-3">
        <ItemJsonLd item={item} section={{ name: "Templates", path: "/templates" }} />
        <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Link href="/templates" className="hover:text-foreground">Templates</Link>
          
          
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
          height={900}
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
          <p className="text-muted-foreground text-sm">The page is added as a route in your app, with every block it uses.</p>
        </section>
        {uses.length > 0 && (
          <section className="space-y-4">
            <SectionHeading id="uses">Built with</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {uses.map((u) => (
                <Link key={u!.name} href={itemHref(u!)} className="bg-muted rounded-md px-2.5 py-1 font-mono text-[12px] hover:underline">
                  @ballmac/{u!.name}
                </Link>
              ))}
            </div>
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
      </div>
    </div>
  )
}
