/** Types, constants and helpers for the changelog that need neither the file system nor Next.js, so client components can use them. See lib/changelog.ts for the file format. */
export const CHANGELOG_TAGS = ["blocks", "components", "templates", "themes", "pro", "MCP", "CLI", "docs"] as const
export type ChangelogTag = (typeof CHANGELOG_TAGS)[number]

/** Site heading, Keep a Changelog heading, in the order they are shown. */
export const CHANGELOG_GROUPS = [
  { key: "new", heading: "New", keepAChangelog: "Added" },
  { key: "improved", heading: "Improved", keepAChangelog: "Changed" },
  { key: "fixed", heading: "Fixed", keepAChangelog: "Fixed" },
  { key: "deprecated", heading: "Deprecated", keepAChangelog: "Deprecated" },
  { key: "removed", heading: "Removed", keepAChangelog: "Removed" },
  { key: "security", heading: "Security", keepAChangelog: "Security" },
] as const
export type ChangelogGroupKey = (typeof CHANGELOG_GROUPS)[number]["key"]

export type ChangelogImage = { light: string; dark?: string; alt: string }
export type ChangelogEntry = {
  /** The file name without .md: the permalink and anchor. */
  slug: string
  title: string
  /** YYYY-MM-DD */
  date: string
  seq: number
  tags: ChangelogTag[]
  releases: string[]
  summary: string
  image?: ChangelogImage
  /** The page that `pnpm changelog:shots` captures into public/changelog/<slug>.{light,dark}.webp. */
  shot?: string
  /** With `shot`: capture this element (with some margin) instead of the top of the page. */
  shotSelector?: string
  groups: Partial<Record<ChangelogGroupKey, string[]>>
}

/** Months with their entries, newest first, for the archive. */
export function changelogMonths(entries: ChangelogEntry[]) {
  const months = new Map<string, ChangelogEntry[]>()
  for (const e of entries) months.set(e.date.slice(0, 7), [...(months.get(e.date.slice(0, 7)) ?? []), e])
  return [...months].map(([id, list]) => ({ id, label: monthLabel(id), entries: list }))
}

export function monthLabel(id: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${id}-01T00:00:00Z`))
}

export function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))
}

/** A stable publish time for feeds: the day at midnight UTC, plus one minute per sequence number so two entries on a day keep their order. */
export function publishedAt(e: ChangelogEntry) {
  return new Date(Date.parse(`${e.date}T00:00:00Z`) + e.seq * 60_000)
}

export const entryCount = (e: ChangelogEntry) => Object.values(e.groups).reduce((n, l) => n + l.length, 0)

