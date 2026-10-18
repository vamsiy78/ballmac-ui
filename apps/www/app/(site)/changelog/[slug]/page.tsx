import { ArrowLeft, ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { EntryGroups, EntryMedia, Releases, TagChips } from "@/components/changelog/entry"
import Link from "@/components/site/link"
import { dateLabel, getChangelog, getEntry } from "@/lib/changelog"
import { SITE_URL } from "@/lib/site-url"

export const dynamicParams = false

export function generateStaticParams() {
  return getChangelog().map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = getEntry((await params).slug)
  if (!entry) return {}
  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: `/changelog/${entry.slug}` },
    openGraph: { type: "article", publishedTime: entry.date, title: entry.title, description: entry.summary, url: `${SITE_URL}/changelog/${entry.slug}`, ...(entry.image ? { images: [{ url: entry.image.light, alt: entry.image.alt }] } : {}) },
  }
}

export default async function ChangelogEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entries = getChangelog()
  const i = entries.findIndex((e) => e.slug === slug)
  if (i < 0) notFound()
  const entry = entries[i]!
  const newer = entries[i - 1]
  const older = entries[i + 1]
  return (
    <article className="mx-auto max-w-3xl px-4 pt-12 pb-24 sm:px-6 sm:pt-16">
      <Link href="/changelog" className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded text-sm outline-none focus-visible:ring-[3px]">
        <ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
        Changelog
      </Link>
      <header className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <time dateTime={entry.date} className="text-muted-foreground font-mono text-xs">
            {dateLabel(entry.date)}
          </time>
          <Releases releases={entry.releases} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{entry.title}</h1>
        <p className="text-muted-foreground text-pretty text-base leading-7">{entry.summary}</p>
      </header>
      <div className="mt-8 space-y-8">
        <EntryMedia entry={entry} priority />
        <EntryGroups entry={entry} />
        <TagChips tags={entry.tags} />
      </div>
      <nav aria-label="More updates" className="mt-16 grid gap-3 border-t pt-8 sm:grid-cols-2">
        {newer ? (
          <Link href={`/changelog/${newer.slug}`} className="hover:bg-accent focus-visible:ring-ring/50 rounded-xl border p-4 outline-none transition-colors focus-visible:ring-[3px]">
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <ArrowLeft className="size-3 rtl:rotate-180" aria-hidden="true" /> Newer
            </span>
            <span className="mt-1 block text-sm font-medium text-balance">{newer.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {older && (
          <Link href={`/changelog/${older.slug}`} className="hover:bg-accent focus-visible:ring-ring/50 rounded-xl border p-4 text-end outline-none transition-colors focus-visible:ring-[3px] sm:col-start-2">
            <span className="text-muted-foreground flex items-center justify-end gap-1.5 text-xs">
              Older <ArrowRight className="size-3 rtl:rotate-180" aria-hidden="true" />
            </span>
            <span className="mt-1 block text-sm font-medium text-balance">{older.title}</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
