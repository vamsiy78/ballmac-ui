"use client"

import { ShieldCheck } from "lucide-react"
import * as React from "react"

import { EmailForm } from "@/components/site/email-form"
import { CopyButton } from "@/components/site/copy-button"

type Item = { name: string; title?: string; description?: string; dependencies: string[]; registryDependencies: string[]; files: { path: string; code: string; html: string }[] }

/**
 * The free Pro sampler: leave an email, get the source of three Pro blocks right here. The code arrives in the response and is never in the page's HTML,
 * so it is not given away to crawlers. `reminders` says whether the address will also get the two deadline reminders (only while an offer with a deadline runs).
 */
export function Sampler({ reminders }: { reminders: boolean }) {
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
      {items?.map((item) => (
        <section key={item.name} aria-labelledby={`sampler-${item.name}`} className="space-y-3">
          <div>
            <h3 id={`sampler-${item.name}`} className="font-semibold">
              {item.title}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
            <p className="text-muted-foreground mt-2 text-xs">
              Needs: <span className="font-mono">{[...item.dependencies, ...item.registryDependencies.map((d) => `@ballmac/${d}`)].join(", ") || "nothing extra"}</span>
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
      ))}
      {items && items.length > 0 && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Yours to use in any project. The other blocks come with a Pro licence.
        </p>
      )}
    </div>
  )
}
