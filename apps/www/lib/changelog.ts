/**
 * The changelog: one Markdown file per release or wave in content/changelog/, newest first.
 *
 *   ---
 *   title: Short headline
 *   date: 2026-10-18
 *   seq: 2                 (optional: orders two entries on the same day, higher is newer)
 *   tags: [blocks, MCP]
 *   releases: ["@ballmac/mcp 1.4.0"]   (optional: versions that shipped with it)
 *   summary: One sentence.
 *   shot: /preview/roster-1-demo   (a page to screenshot with `pnpm changelog:shots`, or file:name.html from content/changelog/shots/)
 *   image: /marketing/x.webp       (a picture that already exists in public/, instead of shot)
 *   imageAlt: What the picture shows.
 *   ---
 *   ### New        (Keep a Changelog: Added)        ### Improved (Changed)   ### Fixed
 *   ### Deprecated ### Removed ### Security
 *   - One plain line, with [links](/docs/...) and `code`.
 *
 * Read by the /changelog pages, the RSS and Atom feeds, and `pnpm changelog` (CHANGELOG.md). Nothing here needs a browser or Next.js, so scripts can import it.
 */
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { parse as parseYaml } from "yaml"

import { CHANGELOG_GROUPS, CHANGELOG_TAGS, type ChangelogEntry, type ChangelogGroupKey, type ChangelogTag } from "./changelog-shared"

export * from "./changelog-shared"

const DIR = join(/* turbopackIgnore: true */ process.cwd().endsWith("apps/www") ? process.cwd() : join(process.cwd(), "apps/www"), "content/changelog")
const MAX_PER_GROUP = 6

export function parseEntry(slug: string, source: string): ChangelogEntry {
  const m = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) throw new Error(`${slug}: missing frontmatter`)
  const fm = parseYaml(m[1]!) as Record<string, unknown>
  const fail = (why: string): never => {
    throw new Error(`content/changelog/${slug}.md: ${why}`)
  }
  const str = (k: string) => (typeof fm[k] === "string" && (fm[k] as string).trim() ? (fm[k] as string).trim() : fail(`"${k}" is missing`))
  // YAML reads 2026-10-18 as a date: keep the text.
  const date = fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : String(fm.date ?? "")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) fail(`"date" must be YYYY-MM-DD, got "${date}"`)
  if (!slug.startsWith(date)) fail(`the file name must start with its date (${date})`)
  const tags = (Array.isArray(fm.tags) ? fm.tags : fail('"tags" must be a list')) as string[]
  if (tags.length === 0) fail('"tags" is empty')
  for (const t of tags) if (!(CHANGELOG_TAGS as readonly string[]).includes(t)) fail(`unknown tag "${t}" (use ${CHANGELOG_TAGS.join(", ")})`)
  const summary = str("summary")
  if (!/[.!?]$/.test(summary) || /[.!?] [A-Z]/.test(summary)) fail('"summary" is one sentence ending with a full stop')
  const groups: ChangelogEntry["groups"] = {}
  const order = CHANGELOG_GROUPS.map((g) => g.heading as string)
  let current: ChangelogGroupKey | undefined
  let last = -1
  for (const raw of m[2]!.split("\n")) {
    const line = raw.trimEnd()
    if (!line.trim()) continue
    const h = line.match(/^### (.+)$/)
    if (h) {
      const idx = order.indexOf(h[1]!)
      if (idx < 0) fail(`unknown heading "${h[1]}" (use ${order.join(", ")})`)
      if (idx <= last) fail(`"${h[1]}" is out of order or repeated (order: ${order.join(", ")})`)
      last = idx
      current = CHANGELOG_GROUPS[idx]!.key
      groups[current] = []
      continue
    }
    const b = line.match(/^- (.+)$/)
    if (!b || !current) return fail(`each line is a "- " bullet under a "### " heading, got: ${line.slice(0, 60)}`)
    groups[current]!.push(b[1]!)
  }
  let count = 0
  for (const [k, list] of Object.entries(groups)) {
    if (list.length === 0) fail(`"${k}" has no bullets`)
    if (list.length > MAX_PER_GROUP) fail(`"${k}" has ${list.length} bullets; split the entry or merge lines (at most ${MAX_PER_GROUP})`)
    count += list.length
  }
  if (count === 0) fail("no bullets")
  const shot = typeof fm.shot === "string" ? fm.shot : undefined
  const image = typeof fm.image === "string" ? fm.image : shot ? `/changelog/${slug}.light.webp` : undefined
  const imageDark = typeof fm.imageDark === "string" ? fm.imageDark : shot ? `/changelog/${slug}.dark.webp` : undefined
  if (image && typeof fm.imageAlt !== "string") fail('"imageAlt" is required with a picture')
  return {
    slug,
    title: str("title"),
    date,
    seq: typeof fm.seq === "number" ? fm.seq : 0,
    tags: tags as ChangelogTag[],
    releases: Array.isArray(fm.releases) ? (fm.releases as string[]) : [],
    summary,
    image: image ? { light: image, dark: imageDark, alt: fm.imageAlt as string } : undefined,
    shot,
    shotSelector: typeof fm.shotSelector === "string" ? fm.shotSelector : undefined,
    groups,
  }
}

let cache: ChangelogEntry[] | undefined

/** Every entry, newest first. */
export function getChangelog(): ChangelogEntry[] {
  cache ??= readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parseEntry(f.slice(0, -3), readFileSync(join(DIR, f), "utf8")))
    .sort((a, b) => b.date.localeCompare(a.date) || b.seq - a.seq || b.slug.localeCompare(a.slug))
  return cache
}

export const getEntry = (slug: string) => getChangelog().find((e) => e.slug === slug)

/** CHANGELOG.md in the Keep a Changelog layout, for the repository. */
export function changelogMarkdown(entries: ChangelogEntry[] = getChangelog(), site = "https://ui.ballmac.com"): string {
  const abs = (md: string) => md.replace(/\]\((\/[^)]*)\)/g, `](${site}$1)`)
  const body = entries
    .map((e) => {
      const head = `## [${e.slug}] - ${e.date}\n\n**${e.title}.** ${e.summary}${e.releases.length ? ` Releases: ${e.releases.join(", ")}.` : ""}`
      const groups = CHANGELOG_GROUPS.filter((g) => e.groups[g.key])
        .map((g) => `### ${g.keepAChangelog}\n\n${e.groups[g.key]!.map((b) => `- ${abs(b)}`).join("\n")}`)
        .join("\n\n")
      return `${head}\n\n${groups}`
    })
    .join("\n\n")
  return `# Changelog

All notable changes to Ballmac UI, newest first, in the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) layout. The same list, with pictures and filters, is at ${site}/changelog (feeds: ${site}/changelog/rss.xml and ${site}/changelog/atom.xml).

Ballmac UI ships as a registry, so each heading is a release or wave named by its date and topic rather than a version number. Package releases (\`@ballmac/cli\`, \`@ballmac/mcp\`) are listed on the entries they shipped with and in each package's own CHANGELOG.md.

This file is generated: edit the entries in \`apps/www/content/changelog/\` and run \`pnpm changelog\`. See CONTRIBUTING.md.

${body}
`
}
