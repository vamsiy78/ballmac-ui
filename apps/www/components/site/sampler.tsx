"use client"

import { ArrowUpRight, Check, Copy, ShieldCheck } from "lucide-react"
import * as React from "react"

import { Button, buttonVariants } from "@/components/ballmac/button"
import { CopyButton } from "@/components/site/copy-button"
import { EmailForm } from "@/components/site/email-form"
import Link from "@/components/site/link"

type Item = { name: string; title?: string; description?: string; dependencies: string[]; registryDependencies: string[]; files: { path: string; code: string; html: string }[] }

/** Registry dependencies arrive as full registry URLs; show them as the `@ballmac/name` the shadcn CLI takes. */
const registryName = (d: string) => `@ballmac/${d.replace(/^https?:\/\/[^?#]*\//, "").replace(/\.json$/, "")}`

/** What to run before the block will compile: npm packages, then the Ballmac pieces it is built from. `utils` ships with shadcn, so it is not asked for. */
function installCommands(item: Item): string {
  const registry = item.registryDependencies.map(registryName).filter((n) => n !== "@ballmac/utils")
  return [item.dependencies.length ? `npm install ${item.dependencies.join(" ")}` : "", registry.length ? `npx shadcn@latest add ${registry.join(" ")}` : ""].filter(Boolean).join("\n")
}

function CopyCode({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <Button
      type="button"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1800)
        } catch {
          // Clipboard unavailable: the code is under "View the code" and can be selected there.
        }
      }}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Copied" : "Copy code"}</span>
    </Button>
  )
}

/** One sampler block: what it is, one click to copy it, the path to save it at, what to install first, and the source itself behind a disclosure. */
function SamplerItem({ item }: { item: Item }) {
  const id = `sampler-${item.name}`
  const install = installCommands(item)
  const all = item.files.length === 1 ? item.files[0]!.code : item.files.map((f) => `// ${f.path}\n${f.code}`).join("\n\n")
  return (
    <section aria-labelledby={id} className="bg-background space-y-4 rounded-xl border p-4 sm:p-5">
      <div>
        <h3 id={id} className="font-semibold">
          {item.title}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{item.description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CopyCode value={all} />
        <Link href={`/blocks/${item.name}`} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Live preview <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs font-medium">Save it as</dt>
          <dd className="mt-1 font-mono text-xs break-all">{item.files.map((f) => f.path).join("  ·  ")}</dd>
        </div>
        {install && (
          <div>
            <dt className="text-muted-foreground text-xs font-medium">Install what it needs first</dt>
            <dd className="bg-muted/50 mt-1 flex items-start gap-2 rounded-lg border py-1.5 pr-1.5 pl-3">
              <pre className="min-w-0 flex-1 py-0.5 font-mono text-xs leading-5 break-words whitespace-pre-wrap">{install}</pre>
              <CopyButton value={install} label={`Copy the install commands for ${item.title ?? item.name}`} />
            </dd>
          </div>
        )}
      </dl>
      <details className="group">
        <summary className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 w-fit cursor-pointer rounded-sm text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">
          <span className="group-open:hidden">View the code</span>
          <span className="hidden group-open:inline">Hide the code</span>
        </summary>
        <div className="mt-3 space-y-3">
          {item.files.map((f) => (
            <div key={f.path} className="bg-card overflow-hidden rounded-xl border">
              <div className="flex h-10 items-center justify-between border-b px-4">
                <span className="text-muted-foreground font-mono text-xs">{f.path}</span>
                <CopyButton value={f.code} label={`Copy ${f.path}`} />
              </div>
              <div className="max-h-[360px] overflow-auto px-4 py-3.5 [&_pre]:outline-none" dangerouslySetInnerHTML={{ __html: f.html }} />
            </div>
          ))}
        </div>
      </details>
    </section>
  )
}

/**
 * The free Pro sampler: leave an email, get three Pro blocks right here. The code arrives in the response and is never in the page's HTML, so it is not
 * given away to crawlers. It is offered as something to use, not to read: copy it in one click, see it running, and run one command for what it needs. The
 * source stays behind a disclosure for anyone who wants to read first. `reminders` says whether the address will also get the two deadline reminders
 * (only while an offer with a deadline runs).
 */
export function Sampler({ reminders }: { reminders: boolean }) {
  const [items, setItems] = React.useState<Item[] | null>(null)
  return (
    <div className="space-y-5">
      {!items && (
        <EmailForm<{ items: Item[] }>
          endpoint="/api/sampler"
          label="Email address for the free sampler"
          button="Send me the 3 blocks"
          doneMessage="Done. Your three blocks are below."
          onDone={(d) => setItems(d.items)}
          consent={
            reminders
              ? "You get the blocks on this page now, plus one short personal note from us and two reminder emails before the founding price ends. Nothing else, and one click to unsubscribe."
              : "You get the blocks on this page now, plus one short personal note from us. We keep your address only to tell you about Ballmac UI Pro, and you can unsubscribe in one click."
          }
        />
      )}
      {items && items.length === 0 && <p className="text-muted-foreground text-sm">The sampler is not available right now.</p>}
      {items?.map((item) => <SamplerItem key={item.name} item={item} />)}
      {items && items.length > 0 && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
          Yours to use in any project. The other blocks come with a Pro licence.
        </p>
      )}
    </div>
  )
}
