"use client"

import { ShieldCheck } from "lucide-react"
import * as React from "react"

import { EmailForm } from "@/components/site/email-form"
import { CopyButton } from "@/components/site/copy-button"

type Item = { name: string; title?: string; description?: string; dependencies: string[]; registryDependencies: string[]; files: { path: string; code: string; html: string }[] }

/** Registry dependencies arrive as full registry URLs; show them as the `@ballmac/name` the shadcn CLI takes. */
const registryName = (d: string) => `@ballmac/${d.replace(/^https?:\/\/[^?#]*\//, "").replace(/\.json$/, "")}`

/**
 * The free Pro sampler: leave an email, get the source of three Pro blocks right here. The code arrives in the response and is never in the page's HTML,
 * so it is not given away to crawlers. `reminders` says whether the address will also get the two deadline reminders (only while an offer with a deadline runs).
 */
export function Sampler({ reminders, compact = false }: { reminders: boolean; compact?: boolean }) {
  const [items, setItems] = React.useState<Item[] | null>(null)
  return (
    <div className="space-y-6">
      {!items && (
        <EmailForm<{ items: Item[] }>
          endpoint="/api/sampler"
          label="Email address for the free sampler"
          button="Send me the 3 blocks"
          doneMessage="Here they are, below."
          onDone={(d) => setItems(d.items)}
          consent={
            reminders
              ? "You get the code on this page now, plus two reminder emails before the founding price ends. Nothing else, and one click to unsubscribe."
              : "You get the code on this page now. We keep your address only to tell you about Ballmac UI Pro, and you can unsubscribe in one click."
          }
        />
      )}
      {items && items.length === 0 && <p className="text-muted-foreground text-sm">The sampler is not available right now.</p>}
      {items?.map((item) => {
        const wrap = (body: React.ReactNode) => (compact ? <Disclosure key={item.name} title={item.title ?? item.name}>{body}</Disclosure> : <React.Fragment key={item.name}>{body}</React.Fragment>)
        return wrap(
        <section aria-labelledby={`sampler-${item.name}`} className="space-y-3">
          <div>
            <h3 id={`sampler-${item.name}`} className={compact ? "sr-only" : "font-semibold"}>
              {item.title}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
            <p className="text-muted-foreground mt-2 text-xs">
              Needs: <span className="font-mono">{[...item.dependencies, ...item.registryDependencies.map(registryName)].join(", ") || "nothing extra"}</span>
            </p>
          </div>
          {item.files.map((f) => (
            <div key={f.path} className="bg-card overflow-hidden rounded-xl border">
              <div className="flex h-10 items-center justify-between border-b px-4">
                <span className="text-muted-foreground font-mono text-xs">{f.path}</span>
                <CopyButton value={f.code} label={`Copy ${f.path}`} />
              </div>
              <div className="max-h-[420px] overflow-auto px-4 py-3.5 [&_pre]:outline-none" dangerouslySetInnerHTML={{ __html: f.html }} />
            </div>
          ))}
        </section>
        )
      })}
      {items && items.length > 0 && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Yours to use in any project. The other blocks come with a Pro licence.
        </p>
      )}
    </div>
  )
}

/** One block of the sampler, closed until opened, so three of them do not stretch a page that has other things to say. */
function Disclosure({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group bg-background rounded-xl border">
      <summary className="focus-visible:ring-ring/50 flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium outline-none focus-visible:ring-[3px] [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden="true" className="text-muted-foreground text-xs group-open:hidden">Show code</span>
        <span aria-hidden="true" className="text-muted-foreground hidden text-xs group-open:inline">Hide</span>
      </summary>
      <div className="space-y-3 border-t p-4">{children}</div>
    </details>
  )
}
