import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodePanel } from "@/components/site/code-panel"
import { FramePreview } from "@/components/site/frame-preview"
import { ItemAi, ItemCredits, ItemDependencies, ItemInstall, shownPath } from "@/components/site/item-install"
import { Eyebrow, SectionHeading } from "@/components/site/section-heading"
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
    <div className="mx-auto max-w-[1320px] space-y-12 px-4 py-10 sm:px-6">
      <header className="space-y-4">
        <Eyebrow>
          <Link href="/templates" className="hover:text-foreground">Templates</Link>
        </Eyebrow>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-[-0.03em]">{item.title}</h1>
          <span className="rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide uppercase">{item.tier === "pro" ? "Pro" : "Free · MIT"}</span>
        </div>
        <p className="text-muted-foreground max-w-3xl text-lg leading-relaxed">{item.description}</p>
      </header>
      {example && (
        <FramePreview
          src={`/preview/${example.name}`}
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
      <div className="grid max-w-4xl gap-12">
        <section className="space-y-4">
          <SectionHeading id="installation" index="01">Installation</SectionHeading>
          <ItemInstall item={item} />
          <p className="text-muted-foreground text-sm">The page is added as a route in your app, with every block it uses.</p>
        </section>
        {uses.length > 0 && (
          <section className="space-y-4">
            <SectionHeading id="uses" index="02">Built with</SectionHeading>
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
          <SectionHeading id="dependencies" index="03">Dependencies</SectionHeading>
          <ItemDependencies item={item} />
        </section>
        <section className="space-y-4">
          <SectionHeading id="ai" index="04">Use with AI</SectionHeading>
          <ItemAi item={item} />
          <ItemCredits item={item} />
        </section>
      </div>
    </div>
  )
}
