import Link from "next/link"

import { CodePanel } from "@/components/site/code-panel"
import { CopyButton } from "@/components/site/copy-button"
import { InstallTabs } from "@/components/site/install-tabs"
import { addCommand, getItem, installCommand, itemHref, packageManagers, readSource, SITE_URL, type PackageManager, type SiteItem } from "@/lib/registry"

const perPm = (fn: (pm: PackageManager) => string) =>
  Object.fromEntries(packageManagers.map((pm) => [pm, fn(pm)])) as Record<PackageManager, string>
export const shownPath = (target: string) => target.replace(/^@(components|hooks|lib)\//, "$1/")

/** CLI tabs plus a collapsible manual install (npm deps and the source files). */
export function ItemInstall({ item }: { item: SiteItem }) {
  return (
    <div className="space-y-4">
      <InstallTabs commands={perPm((pm) => addCommand([item.name], pm))} />
      <details className="rounded-xl border px-4 py-3">
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
            <CodePanel key={f.path} code={readSource(f.source)} title={shownPath(f.target)} />
          ))}
        </div>
      </details>
    </div>
  )
}

/** npm and registry dependencies, linked. */
export function ItemDependencies({ item }: { item: SiteItem }) {
  const ballmac = item.registryDependencies.filter((d) => !d.startsWith("shadcn:"))
  const shadcn = item.registryDependencies.filter((d) => d.startsWith("shadcn:")).map((d) => d.slice(7))
  const chip = "bg-muted rounded-md px-2 py-0.5 font-mono text-[12px] hover:underline"
  return (
    <dl className="bg-border grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2">
      <div className="bg-background p-4">
        <dt className="text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase">npm</dt>
        <dd className="mt-2 flex flex-wrap gap-2">
          {item.dependencies.length ? (
            item.dependencies.map((d) => (
              <a key={d} href={`https://www.npmjs.com/package/${d.replace(/(?<=.)@.*$/, "")}`} className={chip}>
                {d}
              </a>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">None</span>
          )}
        </dd>
      </div>
      <div className="bg-background p-4">
        <dt className="text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase">Registry</dt>
        <dd className="mt-2 flex flex-wrap gap-2">
          {ballmac.map((d) => (
            <Link key={d} href={getItem(d) ? itemHref(getItem(d)!) : `/components/${d}`} className={chip}>
              @ballmac/{d}
            </Link>
          ))}
          {shadcn.map((d) => (
            <a key={d} href="https://ui.shadcn.com/docs" className={chip}>
              shadcn/{d}
            </a>
          ))}
          {!item.registryDependencies.length && <span className="text-muted-foreground text-sm">None</span>}
        </dd>
      </div>
    </dl>
  )
}

/** "Use with AI": summary, a copyable prompt, when to use and not, and the registry URL. */
export function ItemAi({ item }: { item: SiteItem }) {
  const prompt = `Add the Ballmac UI ${item.title} (@ballmac/${item.name}) to this project with the shadcn MCP, then use it where it fits.`
  const url = `${SITE_URL}/r/${item.name}.json`
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm leading-relaxed">
        {item.ai?.summary} With the shadcn MCP server set up (
        <Link href="/docs/mcp" className="text-foreground underline underline-offset-4">
          guide
        </Link>
        ), ask your agent:
      </p>
      <div className="bg-card flex items-start gap-3 rounded-xl border p-4">
        <p className="flex-1 text-sm leading-relaxed">{prompt}</p>
        <CopyButton value={prompt} label="Copy prompt" />
      </div>
      {item.ai?.whenToUse?.length || item.ai?.whenNotToUse?.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <p className="text-sm font-medium">Use it for</p>
            <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
              {item.ai?.whenToUse.map((w) => <li key={w}>{w}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm font-medium">Not for</p>
            <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
              {item.ai?.whenNotToUse.map((w) => <li key={w}>{w}</li>)}
            </ul>
          </div>
        </div>
      ) : null}
      <p className="text-muted-foreground text-sm">
        Registry JSON:{" "}
        <a href={url} className="text-foreground font-mono text-[13px] underline underline-offset-4">
          {url}
        </a>
      </p>
    </div>
  )
}

export function ItemCredits({ item }: { item: SiteItem }) {
  return (
    <p className="text-muted-foreground text-sm">
      {item.source ? (
        <>
          Based on{" "}
          <a href={item.source.url} className="text-foreground underline underline-offset-4">
            {item.source.name}
          </a>{" "}
          ({item.source.license}, {item.source.copyright}), modified by Ballmac.{" "}
        </>
      ) : null}
      {item.tier === "pro" ? "Covered by the Ballmac UI Pro license." : "Released under the MIT License."}
    </p>
  )
}
