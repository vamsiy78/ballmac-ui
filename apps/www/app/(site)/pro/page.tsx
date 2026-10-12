import type { Metadata } from "next"
import { Suspense } from "react"

import { ProHub } from "@/components/pro/pro-hub"
import { ProSales } from "@/components/pro/pro-sales"
import { PageCard } from "@/components/site/page-card"
import Link from "@/components/site/link"
import { proDownloads } from "@/lib/pro-downloads"
import { PRO_LICENCE_PATH } from "@/lib/pro-licence"
import { getBlocks, isPro, itemHref } from "@/lib/registry"
import { thumbFor } from "@/lib/thumbs"

export const metadata: Metadata = {
  title: "Ballmac UI Pro: 150 app blocks and 3 starter apps for React and shadcn",
  description: "Dashboards, billing, settings, sign-in, mail and more, with loading, empty and error states built in, plus Beacon (SaaS), Quire (AI assistant) and Cove (desktop) starter apps. Pay once.",
  alternates: { canonical: "/pro" },
}

// The sales page counts down to the founding deadline, so the page is rebuilt every few minutes.
export const revalidate = 300

const licenseUrl = process.env.NEXT_PUBLIC_PRO_LICENSE_URL || PRO_LICENCE_PATH

/** One block per category first, so the showcase has range, then the rest in order. */
function showcase(limit: number) {
  const seen = new Set<string>()
  const blocks = getBlocks().filter((b) => isPro(b) && thumbFor(b.name, "pro"))
  const firsts = blocks.filter((b) => (seen.has(b.blockCategory ?? "") ? false : (seen.add(b.blockCategory ?? ""), true)))
  return [...firsts, ...blocks.filter((b) => !firsts.includes(b))].slice(0, limit)
}

export default function ProPage() {
  const downloads = proDownloads()
  const picks = showcase(6)

  return (
    <Suspense fallback={null}>
      <ProHub downloads={downloads} sampleItem={picks[0]?.name ?? "hero-pro-1"} licenseUrl={licenseUrl} sales={<ProSales downloads={downloads} />}>
        {picks.length > 0 && (
          <section className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6" aria-labelledby="inside-h">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="inside-h" className="text-2xl font-semibold tracking-tight">Browse the blocks</h2>
                <p className="text-muted-foreground mt-2 max-w-xl leading-relaxed">Every block is previewed in public. Open one and its code is right there to copy.</p>
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
