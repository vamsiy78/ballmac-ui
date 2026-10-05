import type { Metadata } from "next"
import { Suspense } from "react"

import { ProHub, type HubStat } from "@/components/pro/pro-hub"
import { PageCard } from "@/components/site/page-card"
import Link from "@/components/site/link"
import { proDownloads } from "@/lib/pro-downloads"
import { getBlocks, isPro, itemHref } from "@/lib/registry"
import { thumbFor } from "@/lib/thumbs"

export const metadata: Metadata = {
  title: "Log in to Ballmac UI Pro",
  description: "Paste your licence key to open your Ballmac UI Pro library: read and copy every Pro block, download the starter apps and get install commands with your key filled in.",
  alternates: { canonical: "/pro" },
  // A login page: useful to buyers, not something to rank.
  robots: { index: false, follow: true },
}

const portalUrl = process.env.NEXT_PUBLIC_PRO_PORTAL_URL || undefined
const licenseUrl = process.env.NEXT_PUBLIC_PRO_LICENSE_URL || undefined

/** One block per category first, so the showcase has range, then the rest in order. */
function showcase(limit: number) {
  const seen = new Set<string>()
  const blocks = getBlocks().filter((b) => isPro(b) && thumbFor(b.name, "pro"))
  const firsts = blocks.filter((b) => (seen.has(b.blockCategory ?? "") ? false : (seen.add(b.blockCategory ?? ""), true)))
  return [...firsts, ...blocks.filter((b) => !firsts.includes(b))].slice(0, limit)
}

export default function ProPage() {
  const proBlocks = getBlocks().filter(isPro)
  const downloads = proDownloads()
  const categories = new Set(proBlocks.map((b) => b.blockCategory)).size
  const stats: HubStat[] = [
    proBlocks.length > 0 && { value: String(proBlocks.length), label: "Pro blocks" },
    categories > 0 && { value: String(categories), label: "Block categories" },
    downloads.starters.length > 0 && { value: String(downloads.starters.length), label: "Starter apps" },
    { value: "12", label: "Themes, light and dark" },
  ].filter(Boolean) as HubStat[]
  const picks = showcase(6)

  return (
    <Suspense fallback={null}>
      <ProHub stats={proBlocks.length ? stats : []} downloads={downloads} sampleItem={picks[0]?.name ?? "hero-pro-1"} portalUrl={portalUrl} licenseUrl={licenseUrl}>
        {picks.length > 0 && (
          <section className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6" aria-labelledby="inside-h">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="inside-h" className="text-2xl font-semibold tracking-tight">Browse the blocks</h2>
                <p className="text-muted-foreground mt-2 max-w-xl leading-relaxed">Every block is previewed in public. Open one and, when you are logged in, its code is right there to copy.</p>
              </div>
              <Link href="/blocks" className="text-sm font-medium underline underline-offset-4">All blocks</Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
              {picks.map((b, i) => (
                <PageCard key={b.name} href={itemHref(b)} title={b.title} description={b.description} name={b.name} Preview={null} thumb={thumbFor(b.name, "pro")} pro priority={i < 3} />
              ))}
            </div>
          </section>
        )}
      </ProHub>
    </Suspense>
  )
}
