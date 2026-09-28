import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodePanel } from "@/components/site/code-panel"
import { CopyButton } from "@/components/site/copy-button"
import { InstallTabs } from "@/components/site/install-tabs"
import { PreviewTabs } from "@/components/site/preview-tabs"
import { Eyebrow, SectionHeading } from "@/components/site/section-heading"
import { loadExample } from "@/lib/examples"
import {
  addCommand,
  categoryLabels,
  exportsOf,
  getComponents,
  getItem,
  getRelated,
  installCommand,
  packageManagers,
  readSource,
  SITE_URL,
  type PackageManager,
} from "@/lib/registry"

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

const perPm = (fn: (pm: PackageManager) => string) =>
  Object.fromEntries(packageManagers.map((pm) => [pm, fn(pm)])) as Record<PackageManager, string>

export default async function ComponentPage({ params }: PageProps<"/components/[slug]">) {
  const item = getItem((await params).slug)
  if (!item || item.category === "foundation") notFound()

  const mainSource = readSource(item.files[0].source)
  const names = exportsOf(mainSource)
  const importPath = item.files[0].target.replace(/^@components\//, "@/components/").replace(/\.tsx?$/, "")
  const usage = `import { ${names.join(", ")} } from "${importPath}"`
  const examples = await Promise.all(
    item.examples.map(async (e) => ({ ...e, Component: await loadExample(e.name), code: readSource(e.source) }))
  )
  const [first, ...rest] = examples
  const ballmacDeps = item.registryDependencies.filter((d) => !d.startsWith("shadcn:"))
  const shadcnDeps = item.registryDependencies.filter((d) => d.startsWith("shadcn:")).map((d) => d.slice(7))
  const registryUrl = `${SITE_URL}/r/${item.name}.json`
  const aiPrompt = `Add the Ballmac UI ${item.title} (@ballmac/${item.name}) to this project with the shadcn MCP, then use it where it fits.`
  const related = getRelated(item)

  const sections = [
    ["installation", "Installation"],
    ["usage", "Usage"],
    ...(rest.length ? [["examples", "Examples"]] : []),
    ...(item.ai?.customization?.length ? [["options", "Options"]] : []),
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
          <Eyebrow>
            <Link href="/components" className="hover:text-foreground">Components</Link> / {categoryLabels[item.category]}
          </Eyebrow>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-[-0.03em]">{item.title}</h1>
            <span className="rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide uppercase">
              {item.tier === "pro" ? "Pro" : "Free · MIT"}
            </span>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">{item.description}</p>
          <p className="text-muted-foreground font-mono text-xs">
            v{item.version} · Updated {item.updated}
          </p>
        </header>

        {first?.Component && (
          <PreviewTabs
            preview={<first.Component />}
            code={<CodePanel code={first.code} className="rounded-none border-0" />}
          />
        )}

        <section className="space-y-4">
          <SectionHeading id="installation" index={num("installation")}>Installation</SectionHeading>
          <InstallTabs commands={perPm((pm) => addCommand([item.name], pm))} />
          <details className="group rounded-xl border px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium">Install manually</summary>
            <div className="mt-4 space-y-4">
              {item.dependencies.length > 0 && (
                <>
                  <p className="text-muted-foreground text-sm">Install the dependencies:</p>
                  <InstallTabs commands={perPm((pm) => installCommand(item.dependencies, pm))} />
                </>
              )}
              <p className="text-muted-foreground text-sm">Copy the source into your project:</p>
              {item.files.map((f) => (
                <CodePanel key={f.path} code={readSource(f.source)} title={f.target.replace(/^@components\//, "components/")} />
              ))}
            </div>
          </details>
        </section>

        <section className="space-y-4">
          <SectionHeading id="usage" index={num("usage")}>Usage</SectionHeading>
          <CodePanel code={usage} />
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

        {item.ai?.customization?.length ? (
          <section className="space-y-4">
            <SectionHeading id="options" index={num("options")}>Options</SectionHeading>
            <ul className="divide-y rounded-xl border">
              {item.ai.customization.map((c) => (
                <li key={c} className="px-4 py-3 font-mono text-[13px]">{c}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {item.ai?.a11y?.length ? (
          <section className="space-y-4">
            <SectionHeading id="accessibility" index={num("accessibility")}>Accessibility</SectionHeading>
            <table className="w-full overflow-hidden rounded-xl border text-sm">
              <thead className="bg-card text-left">
                <tr><th className="px-4 py-2.5 font-medium">Key</th><th className="px-4 py-2.5 font-medium">Action</th></tr>
              </thead>
              <tbody className="divide-y">
                {item.ai.a11y.map((a) => (
                  <tr key={a.keys}><td className="px-4 py-2.5 font-mono text-[13px]">{a.keys}</td><td className="text-muted-foreground px-4 py-2.5">{a.action}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        <section className="space-y-4">
          <SectionHeading id="dependencies" index={num("dependencies")}>Dependencies</SectionHeading>
          <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
            <div className="bg-background p-4">
              <dt className="text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase">npm</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {item.dependencies.length ? item.dependencies.map((d) => (
                  <a key={d} href={`https://www.npmjs.com/package/${d.replace(/(?<=.)@.*$/, "")}`} className="bg-muted rounded-md px-2 py-0.5 font-mono text-[12px] hover:underline">{d}</a>
                )) : <span className="text-muted-foreground text-sm">None</span>}
              </dd>
            </div>
            <div className="bg-background p-4">
              <dt className="text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase">Registry</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {ballmacDeps.map((d) => (
                  <Link key={d} href={`/components/${d}`} className="bg-muted rounded-md px-2 py-0.5 font-mono text-[12px] hover:underline">@ballmac/{d}</Link>
                ))}
                {shadcnDeps.map((d) => (
                  <a key={d} href={`https://ui.shadcn.com/docs`} className="bg-muted rounded-md px-2 py-0.5 font-mono text-[12px] hover:underline">shadcn/{d}</a>
                ))}
                {!item.registryDependencies.length && <span className="text-muted-foreground text-sm">None</span>}
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-4">
          <SectionHeading id="ai" index={num("ai")}>Use with AI</SectionHeading>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {item.ai?.summary} With the shadcn MCP server set up (<Link href="/docs/mcp" className="text-foreground underline underline-offset-4">guide</Link>), ask your agent:
          </p>
          <div className="bg-card flex items-start gap-3 rounded-xl border p-4">
            <p className="flex-1 text-sm leading-relaxed">{aiPrompt}</p>
            <CopyButton value={aiPrompt} label="Copy prompt" />
          </div>
          {(item.ai?.whenToUse?.length || item.ai?.whenNotToUse?.length) ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <p className="text-sm font-medium">Use it for</p>
                <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">{item.ai?.whenToUse.map((w) => <li key={w}>{w}</li>)}</ul>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-sm font-medium">Not for</p>
                <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">{item.ai?.whenNotToUse.map((w) => <li key={w}>{w}</li>)}</ul>
              </div>
            </div>
          ) : null}
          <p className="text-muted-foreground text-sm">
            Registry JSON: <a href={registryUrl} className="text-foreground font-mono text-[13px] underline-offset-4 hover:underline">{registryUrl}</a>
          </p>
        </section>

        <section className="space-y-4">
          <SectionHeading id="source" index={num("source")}>Source</SectionHeading>
          {item.files.map((f) => (
            <CodePanel key={f.path} code={readSource(f.source)} title={f.target.replace(/^@components\//, "components/")} />
          ))}
          <p className="text-muted-foreground text-sm">
            {item.source ? (
              <>Based on <a href={item.source.url} className="text-foreground underline underline-offset-4">{item.source.name}</a> ({item.source.license}, {item.source.copyright}), modified by Ballmac. </>
            ) : null}
            Released under the MIT License.
          </p>
        </section>

        {related.length > 0 && (
          <section className="space-y-4">
            <SectionHeading id="related">Related</SectionHeading>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link key={r.name} href={`/components/${r.name}`} className="hover:bg-accent rounded-xl border p-4 transition-colors">
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
