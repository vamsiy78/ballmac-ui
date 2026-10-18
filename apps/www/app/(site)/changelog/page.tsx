import { Rss } from "lucide-react"
import type { Metadata } from "next"
import { Suspense } from "react"

import { ChangelogFeed, FeedView } from "@/components/changelog/feed"
import { getChangelog } from "@/lib/changelog"

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new in Ballmac UI: new components and blocks, CLI and MCP releases, docs and fixes, newest first. Filter by tag, or subscribe by RSS or Atom.",
  alternates: {
    canonical: "/changelog",
    types: { "application/rss+xml": "/changelog/rss.xml", "application/atom+xml": "/changelog/atom.xml" },
  },
}

export default function ChangelogPage() {
  const entries = getChangelog()
  return (
    <>
      <header className="mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">Changelog</p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">What&apos;s new in Ballmac UI</h1>
            <p className="text-muted-foreground max-w-xl text-pretty text-base leading-7">
              New components and blocks, CLI and MCP releases, docs and fixes, newest first. Every entry has its own link.
            </p>
          </div>
          <a
            href="/changelog/rss.xml"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]"
          >
            <Rss className="size-4" aria-hidden="true" />
            Subscribe
          </a>
        </div>
      </header>
      <Suspense fallback={<FeedView entries={entries} tag={null} />}>
        <ChangelogFeed entries={entries} />
      </Suspense>
    </>
  )
}
