import { Check, History } from "lucide-react"

import Link from "@/components/site/link"
import type { SiteItem } from "@/lib/registry"

const date = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })

/** Version, date, whether a test ships, and what changed in each version, so people who customised the file know what an update brings. */
export function ItemVersion({ item }: { item: Pick<SiteItem, "name" | "version" | "updated" | "changelog" | "tests"> }) {
  return (
    <div className="text-muted-foreground max-w-2xl space-y-3 text-sm">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="text-foreground font-mono text-xs font-medium">v{item.version}</span>
        <span>Updated {date(item.updated)}</span>
        {item.tests && (
          <Link href="/docs/guides/tests" className="hover:text-foreground inline-flex items-center gap-1 underline-offset-4 hover:underline">
            <Check className="size-3.5" aria-hidden="true" />
            Ships with a test
          </Link>
        )}
        <Link href="/docs/guides/update-components" className="hover:text-foreground underline-offset-4 hover:underline">
          Update without losing your edits
        </Link>
      </p>
      {item.changelog.length > 0 && (
        <details className="group">
          <summary className="hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 select-none">
            <History className="size-3.5" aria-hidden="true" />
            What changed
          </summary>
          <ol className="mt-3 space-y-2 border-s ps-4">
            {item.changelog.map((e) => (
              <li key={e.version}>
                <span className="text-foreground font-mono text-xs font-medium">{e.version}</span> <span className="text-xs">{date(e.date)}</span>
                {e.breaking && <span className="bg-destructive/10 text-destructive ms-2 rounded-full px-1.5 py-0.5 text-[11px] font-semibold">Breaking</span>}
                <span className="block">{e.note}</span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  )
}
