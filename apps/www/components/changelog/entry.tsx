import { Link2 } from "lucide-react"

import { Inline } from "@/components/changelog/inline"
import Link from "@/components/site/link"
import { CHANGELOG_GROUPS, dateLabel, type ChangelogEntry } from "@/lib/changelog-shared"
import { cn } from "@/lib/utils"

const dot: Record<string, string> = {
  new: "bg-chart-2",
  improved: "bg-chart-1",
  fixed: "bg-chart-4",
  deprecated: "bg-chart-5",
  removed: "bg-chart-3",
  security: "bg-destructive",
}

/** The picture for an entry: light and dark variants, shown by theme, sized so nothing shifts while it loads. */
export function EntryMedia({ entry, priority }: { entry: ChangelogEntry; priority?: boolean }) {
  const image = entry.image
  if (!image) return null
  const common = { width: 1280, height: 800, decoding: "async" as const, loading: priority ? ("eager" as const) : ("lazy" as const) }
  return (
    <figure className="bg-muted overflow-hidden rounded-xl border">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, pictures are already sized */}
      <img {...common} alt={image.alt} src={image.light} className={cn("aspect-[8/5] w-full object-cover object-top", image.dark && "dark:hidden")} />
      {image.dark && (
        // eslint-disable-next-line @next/next/no-img-element -- static export, pictures are already sized
        <img {...common} alt="" aria-hidden="true" src={image.dark} className="hidden aspect-[8/5] w-full object-cover object-top dark:block" />
      )}
    </figure>
  )
}

export function EntryGroups({ entry }: { entry: ChangelogEntry }) {
  return (
    <div className="space-y-5">
      {CHANGELOG_GROUPS.filter((g) => entry.groups[g.key]).map((g) => (
        <section key={g.key} aria-labelledby={`${entry.slug}-${g.key}`}>
          <h4 id={`${entry.slug}-${g.key}`} className="text-foreground mb-2 flex items-center gap-2 text-sm font-semibold">
            <span aria-hidden="true" className={cn("size-2 rounded-full", dot[g.key])} />
            {g.heading}
          </h4>
          <ul className="text-muted-foreground space-y-2 text-[15px] leading-relaxed">
            {entry.groups[g.key]!.map((b) => (
              <li key={b} className="ps-4 -indent-4 before:text-muted-foreground/70 before:me-2 before:content-['–'] [&_a]:text-foreground [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 [&_a:hover]:decoration-foreground [&_code]:bg-muted [&_code]:text-foreground [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]">
                <Inline text={b} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function Releases({ releases }: { releases: string[] }) {
  if (releases.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Releases">
      {releases.map((r) => (
        <li key={r} className="text-foreground bg-muted rounded-md px-1.5 py-0.5 font-mono text-[11px]">
          {r}
        </li>
      ))}
    </ul>
  )
}

export function TagChips({ tags }: { tags: ChangelogEntry["tags"] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
      {tags.map((t) => (
        <li key={t}>
          <Link
            href={`/changelog?tag=${encodeURIComponent(t)}`}
            className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex rounded-full border px-2 py-0.5 text-xs outline-none transition-colors focus-visible:ring-[3px]"
          >
            {t}
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** One entry as it appears in the list: date column, headline, summary, picture, grouped bullets. */
export function EntryCard({ entry, priority, headingLevel = 3 }: { entry: ChangelogEntry; priority?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as "h2" | "h3"
  return (
    <article id={entry.slug} data-entry={entry.slug} aria-labelledby={`${entry.slug}-title`} className="scroll-mt-24 sm:grid sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-8">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 sm:sticky sm:top-20 sm:mb-0 sm:block sm:self-start sm:space-y-2">
        <time dateTime={entry.date} className="text-muted-foreground font-mono text-xs">
          {dateLabel(entry.date)}
        </time>
        <Releases releases={entry.releases} />
      </div>
      <div className="min-w-0 space-y-5">
        <header className="space-y-2">
          <Heading id={`${entry.slug}-title`} className="group/title text-xl font-semibold tracking-tight text-balance sm:text-2xl">
            <Link href={`/changelog/${entry.slug}`} className="hover:underline hover:decoration-border hover:underline-offset-4 focus-visible:ring-ring/50 rounded outline-none focus-visible:ring-[3px]">
              {entry.title}
            </Link>
            <a
              href={`#${entry.slug}`}
              aria-label={`Link to ${entry.title} on this page`}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 ms-2 inline-flex rounded align-middle opacity-0 outline-none transition-opacity group-hover/title:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] max-sm:opacity-100"
            >
              <Link2 className="size-4" aria-hidden="true" />
            </a>
          </Heading>
          <p className="text-muted-foreground text-pretty text-[15px] leading-relaxed">{entry.summary}</p>
        </header>
        <EntryMedia entry={entry} priority={priority} />
        <EntryGroups entry={entry} />
        <footer>
          <TagChips tags={entry.tags} />
        </footer>
      </div>
    </article>
  )
}
