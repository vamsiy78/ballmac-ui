import { ArrowUpRight } from "lucide-react"

import Link from "@/components/site/link"
import { getChangelog } from "@/lib/changelog"

const day = (iso: string) => {
  const [y, m, d] = iso.split("-")
  return `${d}.${m}.${y}`
}

/**
 * Proof that the library is alive, in the manner of a studio work log: the latest releases as dated rows, from the real changelog, and how many shipped
 * in the 30 days up to the newest one. Each row opens its changelog entry.
 */
export function ShippingLog({ limit = 6 }: { limit?: number }) {
  const all = getChangelog()
  if (all.length === 0) return null
  const newest = all[0].date
  const since = new Date(Date.parse(newest) - 30 * 864e5).toISOString().slice(0, 10)
  const month = all.filter((e) => e.date > since).length
  const rows = all.slice(0, limit)
  return (
    <section aria-labelledby="log-h" className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6">
      <div className="bm-reveal flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Shipping log
          </p>
          <h2 id="log-h" className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
            {month} releases in 30 days.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg text-lg leading-relaxed">Pro is paid once and keeps growing. Every release below is included for your key.</p>
        </div>
        <Link href="/changelog" className="text-sm font-medium underline underline-offset-4">The full changelog</Link>
      </div>
      <ol className="mt-12 grid gap-2.5">
        {rows.map((e) => (
          <li key={e.slug} className="bm-reveal">
            <Link
              href={`/changelog/${e.slug}`}
              className="group hover:bg-muted/60 focus-visible:ring-ring/50 grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border px-4 py-3.5 outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:gap-5 sm:px-5"
            >
              <span className="bg-muted rounded-full px-3 py-1 text-center font-mono text-xs tabular-nums">{day(e.date)}</span>
              <span className="min-w-0">
                <span className="block truncate font-medium tracking-tight">{e.title}</span>
                <span className="text-muted-foreground hidden truncate text-sm sm:block">{e.summary}</span>
              </span>
              <span className="flex items-center gap-2">
                {e.tags.includes("pro") && <span className="bg-foreground text-background rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide">PRO</span>}
                <ArrowUpRight className="text-muted-foreground group-hover:text-foreground size-4 transition-colors motion-reduce:transition-none" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
