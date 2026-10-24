import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"

import { buttonVariants } from "@/components/ballmac/button"
import { ProChangelogList } from "@/components/pro/pro-changelog-list"
import Link from "@/components/site/link"
import { Eyebrow } from "@/components/site/section-heading"
import { buildProChangelog, dayLabel, summarise } from "@/lib/pro-changelog-core"
import { PRO_NEWS } from "@/lib/pro-news"
import { getAllItems, isPro, itemHref } from "@/lib/registry"

export const metadata: Metadata = {
  title: "Ballmac UI Pro changelog",
  description: "Everything that has changed in Ballmac UI Pro: new blocks, updates to existing ones, starter apps and the platform around them, with dates and version numbers.",
  alternates: { canonical: "/pro/changelog" },
}

export default function ProChangelogPage() {
  // Only items that are in this build: the public build has none of the Pro items, and then the page shows the news alone.
  const items = getAllItems().filter(isPro).map((i) => ({ ...i, href: itemHref(i) }))
  const entries = buildProChangelog(items, PRO_NEWS)
  const s = summarise(items, entries)
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-16 sm:px-6">
      <header className="max-w-2xl space-y-4">
        <Eyebrow>Ballmac UI Pro</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">What has changed in Pro</h1>
        <p className="text-muted-foreground text-lg leading-relaxed text-pretty">Every new block, every update and every starter, with its date and version. Each item&apos;s own page says what a change means for a file you have edited.</p>
        {s.items > 0 && (
          <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
            {[
              [String(s.items), "Pro items"],
              [String(s.updatedItems), "updated since release"],
              ...(s.latest ? [[dayLabel(s.latest), "latest entry"]] : []),
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-muted-foreground order-2 text-xs">{l}</dt>
                <dd className="text-xl font-semibold tracking-tight tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/pro" className={buttonVariants({ shape: "pill" })}>
            What is in Pro <ArrowRight aria-hidden="true" />
          </Link>
          <Link href="/changelog" className={buttonVariants({ shape: "pill", variant: "outline" })}>
            Site changelog
          </Link>
        </div>
      </header>
      <div className="mt-14">
        <ProChangelogList entries={entries} />
      </div>
    </div>
  )
}
