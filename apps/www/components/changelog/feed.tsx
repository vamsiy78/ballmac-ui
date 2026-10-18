"use client"

import { Rss } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

import { EntryCard } from "@/components/changelog/entry"
import { changelogMonths, CHANGELOG_TAGS, type ChangelogEntry } from "@/lib/changelog-shared"
import { cn } from "@/lib/utils"

function Feeds({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <h2 className="text-sm font-semibold">Feeds</h2>
      <p className="text-muted-foreground text-[13px] leading-relaxed">New entries in your feed reader, with the full text.</p>
      <ul className="flex flex-wrap gap-2 text-[13px]">
        {[
          ["/changelog/rss.xml", "RSS"],
          ["/changelog/atom.xml", "Atom"],
        ].map(([href, label]) => (
          <li key={href}>
            <a
              href={href}
              className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 font-medium outline-none transition-colors focus-visible:ring-[3px]"
            >
              <Rss className="size-3.5" aria-hidden="true" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Archive({ months }: { months: ReturnType<typeof changelogMonths> }) {
  return (
    <ul className="text-[13px]">
      {months.map((m) => (
        <li key={m.id}>
          <a href={`#month-${m.id}`} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex justify-between rounded-md py-1.5 outline-none transition-colors focus-visible:ring-[3px]">
            {m.label}
            <span className="tabular-nums">{m.entries.length}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

/** The list, filtered by ?tag=. Without JavaScript (and while the page loads) every entry shows. */
export function ChangelogFeed({ entries }: { entries: ChangelogEntry[] }) {
  const params = useSearchParams()
  const router = useRouter()
  const raw = params.get("tag")
  const tag = (CHANGELOG_TAGS as readonly string[]).includes(raw ?? "") ? raw : null
  return <FeedView entries={entries} tag={tag} onTag={(t) => router.replace(t ? `/changelog?tag=${encodeURIComponent(t)}` : "/changelog", { scroll: false })} />
}

export function FeedView({ entries, tag, onTag }: { entries: ChangelogEntry[]; tag: string | null; onTag?: (tag: string | null) => void }) {
  const shown = tag ? entries.filter((e) => (e.tags as string[]).includes(tag)) : entries
  const months = changelogMonths(shown)
  const all = changelogMonths(entries)
  const counts = Object.fromEntries(CHANGELOG_TAGS.map((t) => [t, entries.filter((e) => e.tags.includes(t)).length]))
  const first = shown[0]?.slug
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
      <div className="min-w-0">
        <div role="group" aria-label="Filter by tag" className="mb-6 flex flex-wrap gap-2 lg:mb-10">
          {[null, ...CHANGELOG_TAGS].map((t) => {
            const active = (t ?? null) === tag
            return (
              <button
                key={t ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => onTag?.(t)}
                className={cn(
                  "focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] outline-none transition-colors focus-visible:ring-[3px]",
                  active ? "bg-foreground text-background border-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {t ?? "All"}
                <span className="text-[11px] tabular-nums">{t ? counts[t] : entries.length}</span>
              </button>
            )
          })}
        </div>
        <nav aria-label="Archive" className="mb-8 lg:hidden">
          <details className="bg-card rounded-xl border px-4 py-2.5">
            <summary className="focus-visible:ring-ring/50 cursor-pointer rounded text-sm font-medium outline-none focus-visible:ring-[3px]">Archive by month</summary>
            <div className="pt-2">
              <Archive months={all} />
            </div>
          </details>
        </nav>
        <p role="status" className="sr-only">
          {tag ? `Showing ${shown.length} of ${entries.length} updates tagged ${tag}` : `Showing all ${entries.length} updates`}
        </p>
        {months.length === 0 && <p className="text-muted-foreground">Nothing is tagged {tag} yet.</p>}
        <div className="space-y-16">
          {months.map((m) => (
            <section key={m.id} aria-labelledby={`month-${m.id}`} className="space-y-12">
              <h2 id={`month-${m.id}`} className="scroll-mt-24 border-b pb-3 text-sm font-semibold">
                {m.label}
                <span className="text-muted-foreground ms-2 font-normal">
                  {m.entries.length} {m.entries.length === 1 ? "update" : "updates"}
                </span>
              </h2>
              {m.entries.map((e) => (
                <EntryCard key={e.slug} entry={e} priority={e.slug === first} />
              ))}
            </section>
          ))}
        </div>
      </div>
      <aside className="max-lg:hidden">
        <div className="space-y-8 lg:sticky lg:top-20">
          <Feeds />
          <nav aria-label="Archive">
            <h2 className="mb-2 text-sm font-semibold">Archive</h2>
            <Archive months={all} />
          </nav>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            Package releases are also in the{" "}
            <a href="https://github.com/vamsiy78/ballmac-ui/blob/main/CHANGELOG.md" className="text-foreground underline underline-offset-4">
              CHANGELOG.md
            </a>{" "}
            in the repository.
          </p>
        </div>
      </aside>
    </div>
  )
}
