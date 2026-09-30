import Link from "next/link"

import { CodePanel } from "@/components/site/code-panel"
import { CopyButton } from "@/components/site/copy-button"
import { InstallSwitcher } from "@/components/site/install-switcher"
import { InstallTabs } from "@/components/site/install-tabs"
import { addCommand, getItem, installCommand, itemHref, packageManagers, readSource, SITE_URL, type PackageManager, type SiteItem } from "@/lib/registry"

const perPm = (fn: (pm: PackageManager) => string) =>
  Object.fromEntries(packageManagers.map((pm) => [pm, fn(pm)])) as Record<PackageManager, string>
export const shownPath = (target: string) => target.replace(/^@(components|hooks|lib)\//, "$1/")

/** Numbered steps with a guide line, for manual installation. */
export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="[counter-reset:step] space-y-8 border-l pl-7 ml-3.5">{children}</ol>
}

export function Step({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <li className="relative space-y-3 [counter-increment:step] before:absolute before:top-0 before:-left-[42px] before:flex before:size-7 before:items-center before:justify-center before:rounded-full before:border before:bg-background before:text-xs before:font-medium before:tabular-nums before:content-[counter(step)]">
      <p className="pt-0.5 text-sm font-medium">{title}</p>
      {children}
    </li>
  )
}

/** CLI and Manual installation. Manual lists the npm packages, the other items it needs, and the source. */
export function ItemInstall({ item }: { item: SiteItem }) {
  const ballmac = item.registryDependencies.filter((d) => !d.startsWith("shadcn:"))
  return (
    <InstallSwitcher
      cli={<InstallTabs commands={perPm((pm) => addCommand([item.name], pm))} />}
      manual={
        <Steps>
          {item.dependencies.length > 0 && (
            <Step title="Install the dependencies.">
              <InstallTabs commands={perPm((pm) => installCommand(item.dependencies, pm))} />
            </Step>
          )}
          {ballmac.length > 0 && (
            <Step title="Add the Ballmac items it builds on.">
              <InstallTabs commands={perPm((pm) => addCommand(ballmac, pm))} />
            </Step>
          )}
          <Step title="Copy the source into your project.">
            {item.files.map((f) => (
              <CodePanel key={f.path} code={readSource(f.source)} title={shownPath(f.target)} />
            ))}
          </Step>
          <Step title="Update the import paths to match your project setup." />
        </Steps>
      }
    />
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
        <dt className="text-muted-foreground text-xs font-medium">npm</dt>
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
        <dt className="text-muted-foreground text-xs font-medium">Registry</dt>
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
      <p className="text-muted-foreground text-sm leading-relaxed [overflow-wrap:anywhere]">
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
          </a>
          , adapted by Ballmac.{" "}
        </>
      ) : null}
      {item.tier === "pro" ? "Covered by the Ballmac UI Pro license." : "Free to use in personal and commercial projects."}
    </p>
  )
}
