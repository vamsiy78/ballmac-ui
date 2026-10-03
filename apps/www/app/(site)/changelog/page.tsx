import type { Metadata } from "next"

import { DocsPage } from "@/components/site/docs-page"
import { DocsShell } from "@/components/site/docs-shell"
import { changelog as entries } from "@/lib/changelog"

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new in Ballmac UI: new components, blocks and templates, and changes to existing items.",
  alternates: { canonical: "/changelog" },
}

export default function ChangelogPage() {
  return (
    <DocsShell>
      <DocsPage eyebrow="Project" title="Changelog" lead="New components, blocks and changes, newest first.">
        {entries.map((e) => (
          <section key={e.date} className="grid gap-2 border-b pb-8 sm:grid-cols-[140px_1fr]">
            <time dateTime={e.date} className="text-muted-foreground font-mono text-xs">
              {e.date}
            </time>
            <div>
              <h2 className="!mt-0">{e.title}</h2>
              <ul className="mt-3">
                {e.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </DocsPage>
    </DocsShell>
  )
}
