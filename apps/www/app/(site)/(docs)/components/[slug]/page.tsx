import type { Metadata } from "next"
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react"
import Link from "@/components/site/link"
import { notFound } from "next/navigation"

import { CodePanel } from "@/components/site/code-panel"
import { ProBadge, ProNotice } from "@/components/site/pro-notice"
import { CopyPageButton } from "@/components/site/copy-page-button"
import { ItemAi, ItemCredits, ItemDependencies, ItemInstall, shownPath } from "@/components/site/item-install"
import { PreviewTabs } from "@/components/site/preview-tabs"
import { PropsTable } from "@/components/site/props-table"
import { ItemJsonLd } from "@/components/site/item-jsonld"
import { SectionHeading } from "@/components/site/section-heading"
import { Toc } from "@/components/site/toc"
import { loadExample } from "@/lib/examples"
import { seoDescription, seoTitle } from "@/lib/seo"
import { addCommand, categoryLabels, componentNeighbors, getComponents, getItem, getRelated, isNew, itemHref, isPro, readSource } from "@/lib/registry"
import rtlFixed from "@/lib/generated/rtl-exceptions.json"

export function generateStaticParams() {
  return getComponents().map((i) => ({ slug: i.name }))
}
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<"/components/[slug]">): Promise<Metadata> {
  const item = getItem((await params).slug)
  if (!item) return {}
  return {
    title: seoTitle(item.title, `${item.title}: React + Tailwind component`),
    description: seoDescription(item.description),
    alternates: { canonical: `/components/${item.name}` },
  }
}

export default async function ComponentPage({ params }: PageProps<"/components/[slug]">) {
  const item = getItem((await params).slug)
  if (!item || !getComponents().includes(item)) notFound()

  const pro = isPro(item)
  const fixedInRtl = (rtlFixed as { name: string; reason: string }[]).find((f) => f.name === item.name)
  const importPath = shownPath(item.files[0].target).replace(/^/, "@/").replace(/\.tsx?$/, "")
  const usage = `import { ${item.exports.join(", ")} } from "${importPath}"`
  const examples = await Promise.all(item.examples.map(async (e) => ({ ...e, Component: await loadExample(e.name), code: pro ? "" : readSource(e.source) })))
  const [first, ...rest] = examples
  const related = getRelated(item)

  const sections = [
    ["installation", "Installation"],
    ["usage", "Usage"],
    ...(rest.length ? [["examples", "Examples"] as const] : []),
    ...(item.props.length ? [["api", "API reference"] as const] : []),
    ...(item.ai?.a11y?.length ? [["accessibility", "Accessibility"] as const] : []),
    ["ai", "Use with AI"],
    ["credits", "Credits"],
  ] as const
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
  const pager = "bg-background hover:bg-accent focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px]"

  return (
    <div className="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_200px]">
      <article className="min-w-0 max-w-[820px] space-y-12">
        <header className="space-y-3">
          <ItemJsonLd item={item} section={{ name: "Components", path: "/components" }} />
          <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Link href="/components" className="hover:text-foreground">Components</Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <Link href={`/components?category=${item.category}`} className="hover:text-foreground">{categoryLabels[item.category]}</Link>
          </nav>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight sm:text-4xl">{item.title}{pro && <ProBadge />}</h1>
              {isNew(item) && <span className="bg-chart-1/12 rounded-full px-2 py-0.5 text-xs font-semibold">New</span>}
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
          <p className="text-muted-foreground max-w-2xl text-[1.05rem] leading-7 text-balance sm:text-base">{item.description}</p>
          {fixedInRtl && (
            <p className="text-muted-foreground max-w-2xl text-sm">
              <Link href="/docs/rtl" className="text-foreground underline underline-offset-4">Right-to-left</Link>: {fixedInRtl.reason}
            </p>
          )}
        </header>

        {first?.Component && (
          <PreviewTabs name={item.name} example={first.name} v0={!pro} preview={<first.Component />} code={pro ? <ProNotice className="m-4" /> : <CodePanel code={first.code} className="rounded-none border-0" />} />
        )}

        <section className="space-y-5">
          <SectionHeading id="installation">Installation</SectionHeading>
          <ItemInstall item={item} />
        </section>

        <section className="space-y-5">
          <SectionHeading id="usage">Usage</SectionHeading>
          <CodePanel code={usage} />
          {first && (
            <p className="text-muted-foreground text-sm">
              The full example is in the <span className="text-foreground font-medium">Code</span> tab above.
            </p>
          )}
        </section>

        {rest.length > 0 && (
          <section className="space-y-8">
            <SectionHeading id="examples">Examples</SectionHeading>
            {rest.map((e) =>
              e.Component ? (
                <div key={e.name} className="space-y-4">
                  <h3 id={e.name} className="scroll-mt-24 font-semibold tracking-tight">{e.title}</h3>
                  {e.description && <p className="text-muted-foreground -mt-2 text-sm">{e.description}</p>}
                  <PreviewTabs minHeight={340} example={e.name} v0={!pro} preview={<e.Component />} code={pro ? <ProNotice className="m-4" /> : <CodePanel code={e.code} className="rounded-none border-0" />} />
                </div>
              ) : null
            )}
          </section>
        )}

        {item.props.length > 0 && (
          <section className="space-y-5">
            <SectionHeading id="api">API reference</SectionHeading>
            <PropsTable docs={item.props} />
          </section>
        )}

        {item.ai?.a11y?.length ? (
          <section className="space-y-5">
            <SectionHeading id="accessibility">Accessibility</SectionHeading>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr><th className="px-4 py-2.5 font-medium">Key</th><th className="px-4 py-2.5 font-medium">Action</th></tr>
                </thead>
                <tbody className="divide-y">
                  {item.ai.a11y.map((a, index) => (
                    <tr key={`${a.keys}-${index}`}><td className="px-4 py-2.5 font-mono text-[13px]">{a.keys}</td><td className="text-muted-foreground px-4 py-2.5">{a.action}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="space-y-5">
          <SectionHeading id="ai">Use with AI</SectionHeading>
          <ItemAi item={item} />
        </section>

        <section className="space-y-4">
          <SectionHeading id="credits">Credits</SectionHeading>
          <ItemCredits item={item} />
          <ItemDependencies item={item} />
        </section>

        {related.length > 0 && (
          <section className="space-y-4">
            <SectionHeading id="related">Pairs well with</SectionHeading>
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
          <nav aria-label="Previous and next component" className="flex items-center justify-between gap-3 pt-4">
            {prev ? (
              <Link href={prev.href} className={pager}>
                <ArrowLeft className="size-3.5" aria-hidden="true" /> {prev.label}
              </Link>
            ) : <span />}
            {next && (
              <Link href={next.href} className={pager}>
                {next.label} <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            )}
          </nav>
        )}
      </article>

      <aside className="hidden xl:block">
        <div className="sticky top-24 space-y-8">
          <Toc sections={sections} />
          <div className="space-y-2 border-t pt-6 text-[13px]">
            <p className="text-foreground text-xs font-medium">Resources</p>
            {!pro && <a href={`/r/${item.name}.json`} className="text-muted-foreground hover:text-foreground block">Registry JSON</a>}
            {first && <a href={`/preview/${first.name}`} className="text-muted-foreground hover:text-foreground block">Full-screen preview</a>}
            <Link href="/docs/mcp" className="text-muted-foreground hover:text-foreground block">Install with an agent</Link>
          </div>
        </div>
      </aside>
    </div>
  )
}
