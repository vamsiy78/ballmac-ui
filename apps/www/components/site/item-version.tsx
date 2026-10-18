import { Check, History } from "lucide-react"
import type * as React from "react"

import Link from "@/components/site/link"
import type { SiteItem } from "@/lib/registry"

const date = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })

/**
 * One quiet row under the title: the quality chip (passed in), version, date, whether a test ships, and what changed in each version, so people who
 * customised the file know what an update brings. "What changed" opens a list below the row.
 */
export function ItemVersion({ item, children }: { item: Pick<SiteItem, "name" | "version" | "updated" | "changelog" | "tests">; children?: React.ReactNode }) {
  return (
    <div className="text-muted-foreground max-w-2xl space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {children}
        <span className="text-foreground font-mono text-xs font-medium">v{item.version}</span>
        <span aria-hidden="true" className="bg-border h-3.5 w-px" />
        <span>Updated {date(item.updated)}</span>
        {item.tests && (
          <>
            <span aria-hidden="true" className="bg-border h-3.5 w-px" />
            <Link href="/docs/guides/tests" className="hover:text-foreground inline-flex items-center gap-1 underline-offset-4 hover:underline">
              <Check className="size-3.5" aria-hidden="true" />
              Ships with a test
            </Link>
          </>
        )}
        <span aria-hidden="true" className="bg-border h-3.5 w-px" />
        <details className="group relative">
          <summary className="hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 select-none">
            <History className="size-3.5" aria-hidden="true" />
            What changed
          </summary>
          <div className="bg-card absolute z-10 mt-2 max-w-[min(32rem,calc(100vw-2rem))] rounded-xl border p-4 shadow-lg">
            {item.changelog.length > 0 && (
              <ol className="space-y-2">
                {item.changelog.map((e) => (
                  <li key={e.version}>
                    <span className="text-foreground font-mono text-xs font-medium">{e.version}</span> <span className="text-xs">{date(e.date)}</span>
                    {e.breaking && <span className="bg-destructive/10 text-destructive ms-2 rounded-full px-1.5 py-0.5 text-[11px] font-semibold">Breaking</span>}
                    <span className="block">{e.note}</span>
                  </li>
                ))}
              </ol>
            )}
            <p className={item.changelog.length > 0 ? "mt-3 border-t pt-3" : ""}>
              <Link href="/docs/guides/update-components" className="text-foreground underline underline-offset-4">
                Update without losing your edits
              </Link>
            </p>
          </div>
        </details>
      </div>
    </div>
  )
}
