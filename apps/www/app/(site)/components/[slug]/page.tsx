import type { Metadata } from "next"
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodePanel } from "@/components/site/code-panel"
import { CopyPageButton } from "@/components/site/copy-page-button"
import { ItemAi, ItemCredits, ItemDependencies, ItemInstall, shownPath } from "@/components/site/item-install"
import { PreviewTabs } from "@/components/site/preview-tabs"
import { PropsTable } from "@/components/site/props-table"
import { ItemJsonLd } from "@/components/site/item-jsonld"
import { SectionHeading } from "@/components/site/section-heading"
import { Toc } from "@/components/site/toc"
import { loadExample } from "@/lib/examples"
import { addCommand, categoryLabels, componentNeighbors, exportsOf, getComponents, getItem, getRelated, isNew, itemHref, readSource } from "@/lib/registry"

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
    ...(rest.length ? [["examples", "Examples"] as const] : []),
    ...(item.props.length ? [["api", "API reference"] as const] : []),
    ...(item.ai?.a11y?.length ? [["accessibility", "Accessibility"] as const] : []),
    ["dependencies", "Dependencies"],
    ["ai", "Use with AI"],
    ["source", "Source"],
  ] as const
  const num = (id: string) => String(sections.findIndex(([s]) => s === id) + 1).padStart(2, "0")
  const { prev, next } = componentNeighbors(item.name)
  const markdown = [
    `# ${item.title}`,
    item.description,
    `## Installation\n\n\`\`\`bash\n${addCommand([item.name], "npm")}\n\`\`\``,
    `## Usage\n\n\`\`\`tsx\n${usage}\n\`\`\``,
    first ? `## Example\n\n\`\`\`tsx\n${first.code.trimEnd()}\n\`\`\`` : "",
    item.ai?.whenToUse?.length ? `## When to use\n\n${item.ai.whenToUse.map((w) => `- ${w}`).join("\n")}` : "",
    `Docs: https://ui.ballmac.com/components/${item.name}`,
  ].filter(Boolean).join("\n\n")

  return (
    <div className="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="min-w-0 space-y-12">
        <header className="space-y-4">
          <ItemJsonLd item={item} section={{ name: "Components", path: "/components" }} />
          <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center gap-1.5 text-[13px]">
            <Link href="/components" className="hover:text-foreground">Components</Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <Link href={`/components?category=${item.category}`} className="hover:text-foreground">{categoryLabels[item.category]}</Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span className="text-foreground" aria-current="page">{item.title}</span>
          </nav>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-[2.75rem]">{item.title}</h1>
              {isNew(item) && (
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">New</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <CopyPageButton markdown={markdown} />
              {prev && (
                <Link href={prev.href} aria-label={`Previous: ${prev.label}`} title={prev.label} className="bg-background hover:bg-accent inline-flex size-8 items-center justify-center rounded-md border transition-colors">
                  <ArrowLeft className="size-3.5" />
                </Link>
              )}
              {next && (
                <Link href={next.href} aria-label={`Next: ${next.label}`} title={next.label} className="bg-background hover:bg-accent inline-flex size-8 items-center justify-center rounded-md border transition-colors">
                  <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed text-pretty">{item.description}</p>
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md border px-2 py-0.5 font-medium">{item.tier === "pro" ? "Pro" : "Free · MIT"}</span>
            {item.tags.slice(0, 4).map((t) => (
              <span key={t} className="bg-muted rounded-md px-2 py-0.5">{t}</span>
            ))}
            <span className="font-mono">v{item.version}</span>
          </div>
        </header>

        {first?.Component && (
          <PreviewTabs name={item.name} example={first.name} preview={<first.Component />} code={<CodePanel code={first.code} className="rounded-none border-0" />} />
        )}

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
                  <PreviewTabs minHeight={320} example={e.name} preview={<e.Component />} code={<CodePanel code={e.code} className="rounded-none border-0" />} />
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
        {(prev || next) && (
          <nav aria-label="Previous and next component" className="grid grid-cols-1 gap-3 border-t pt-8 sm:grid-cols-2">
            {prev ? (
              <Link href={prev.href} className="hover:bg-accent group rounded-xl border p-4 transition-colors">
                <span className="text-muted-foreground flex items-center gap-1 text-xs"><ArrowLeft className="size-3" aria-hidden="true" /> Previous</span>
                <span className="mt-1 block font-medium">{prev.label}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link href={next.href} className="hover:bg-accent group rounded-xl border p-4 text-right transition-colors">
                <span className="text-muted-foreground flex items-center justify-end gap-1 text-xs">Next <ArrowRight className="size-3" aria-hidden="true" /></span>
                <span className="mt-1 block font-medium">{next.label}</span>
              </Link>
            )}
          </nav>
        )}
      </article>

      <aside className="hidden xl:block">
        <Toc sections={sections} />
      </aside>
    </div>
  )
}
