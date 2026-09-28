import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodePanel } from "@/components/site/code-panel"
import { ItemAi, ItemCredits, ItemDependencies, ItemInstall, shownPath } from "@/components/site/item-install"
import { PreviewTabs } from "@/components/site/preview-tabs"
import { PropsTable } from "@/components/site/props-table"
import { ItemJsonLd } from "@/components/site/item-jsonld"
import { Eyebrow, SectionHeading } from "@/components/site/section-heading"
import { loadExample } from "@/lib/examples"
import { categoryLabels, exportsOf, getComponents, getItem, getRelated, itemHref, readSource } from "@/lib/registry"

export function generateStaticParams() {
  return getComponents().map((i) => ({ slug: i.name }))
}
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<"/components/[slug]">): Promise<Metadata> {
  const item = getItem((await params).slug)
  if (!item) return {}
  return {
    title: `${item.title}: React + Tailwind component`,
    description: item.description,
    alternates: { canonical: `/components/${item.name}` },
  }
}

export default async function ComponentPage({ params }: PageProps<"/components/[slug]">) {
  const item = getItem((await params).slug)
  if (!item || !getComponents().includes(item)) notFound()

  const mainSource = readSource(item.files[0].source)
  const importPath = shownPath(item.files[0].target).replace(/^/, "@/").replace(/\.tsx?$/, "")
  const usage = `import { ${exportsOf(mainSource).join(", ")} } from "${importPath}"`
  const examples = await Promise.all(item.examples.map(async (e) => ({ ...e, Component: await loadExample(e.name), code: readSource(e.source) })))
  const [first, ...rest] = examples
  const related = getRelated(item)

  const sections = [
    ["installation", "Installation"],
    ["usage", "Usage"],
    ...(rest.length ? [["examples", "Examples"]] : []),
    ...(item.props.length ? [["api", "API reference"]] : []),
    ...(item.ai?.a11y?.length ? [["accessibility", "Accessibility"]] : []),
    ["dependencies", "Dependencies"],
    ["ai", "Use with AI"],
    ["source", "Source"],
  ] as const
  const num = (id: string) => String(sections.findIndex(([s]) => s === id) + 1).padStart(2, "0")

  return (
    <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_200px]">
      <article className="min-w-0 space-y-12">
        <header className="space-y-4">
          <ItemJsonLd item={item} section={{ name: "Components", path: "/components" }} />
          <Eyebrow>
            <Link href="/components" className="hover:text-foreground">Components</Link> / {categoryLabels[item.category]}
          </Eyebrow>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-[-0.03em]">{item.title}</h1>
            <span className="rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide uppercase">{item.tier === "pro" ? "Pro" : "Free · MIT"}</span>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">{item.description}</p>
          <p className="text-muted-foreground font-mono text-xs">
            v{item.version} · Updated {item.updated}
          </p>
        </header>

        {first?.Component && <PreviewTabs preview={<first.Component />} code={<CodePanel code={first.code} className="rounded-none border-0" />} />}

        <section className="space-y-4">
          <SectionHeading id="installation" index={num("installation")}>Installation</SectionHeading>
          <ItemInstall item={item} />
        </section>

        <section className="space-y-4">
          <SectionHeading id="usage" index={num("usage")}>Usage</SectionHeading>
          <CodePanel code={usage} />
          {first && <CodePanel code={first.code} title={`Example: ${first.file}`} />}
        </section>

        {rest.length > 0 && (
          <section className="space-y-6">
            <SectionHeading id="examples" index={num("examples")}>Examples</SectionHeading>
            {rest.map((e) =>
              e.Component ? (
                <div key={e.name} className="space-y-3">
                  <h3 className="text-sm font-medium">{e.title}</h3>
                  <PreviewTabs minHeight={220} preview={<e.Component />} code={<CodePanel code={e.code} className="rounded-none border-0" />} />
                </div>
              ) : null
            )}
          </section>
        )}

        {item.props.length > 0 && (
          <section className="space-y-4">
            <SectionHeading id="api" index={num("api")}>API reference</SectionHeading>
            <PropsTable docs={item.props} />
          </section>
        )}

        {item.ai?.a11y?.length ? (
          <section className="space-y-4">
            <SectionHeading id="accessibility" index={num("accessibility")}>Accessibility</SectionHeading>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-card text-left">
                  <tr><th className="px-4 py-2.5 font-medium">Key</th><th className="px-4 py-2.5 font-medium">Action</th></tr>
                </thead>
                <tbody className="divide-y">
                  {item.ai.a11y.map((a) => (
                    <tr key={a.keys}><td className="px-4 py-2.5 font-mono text-[13px]">{a.keys}</td><td className="text-muted-foreground px-4 py-2.5">{a.action}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <SectionHeading id="dependencies" index={num("dependencies")}>Dependencies</SectionHeading>
          <ItemDependencies item={item} />
        </section>

        <section className="space-y-4">
          <SectionHeading id="ai" index={num("ai")}>Use with AI</SectionHeading>
          <ItemAi item={item} />
        </section>

        <section className="space-y-4">
          <SectionHeading id="source" index={num("source")}>Source</SectionHeading>
          {item.files.map((f) => (
            <CodePanel key={f.path} code={readSource(f.source)} title={shownPath(f.target)} />
          ))}
          <ItemCredits item={item} />
        </section>

        {related.length > 0 && (
          <section className="space-y-4">
            <SectionHeading id="related">Related</SectionHeading>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link key={r.name} href={itemHref(r)} className="hover:bg-accent rounded-xl border p-4 transition-colors">
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{r.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <aside className="hidden lg:block">
        <nav aria-label="On this page" className="sticky top-24 space-y-2 text-[13px]">
          <p className="text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase">On this page</p>
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="text-muted-foreground hover:text-foreground block">{label}</a>
          ))}
        </nav>
      </aside>
    </div>
  )
}
