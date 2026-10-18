import type { MenuEntry } from "./search-index"

/** Where a visitor most often wants to go, shown before anything is typed. */
export const QUICK_LINKS = ["/docs/get-started/install", "/docs/get-started/connect-your-agent", "/blocks", "/components", "/templates", "/themes", "/pricing", "/changelog"]

const groupRank = (g: string) => (g.startsWith("Docs") ? 0 : g === "Changelog" ? 1 : 2)

/**
 * How well an entry answers a search: every word typed has to appear somewhere, and matches in the title count most, then the name, then the description.
 * 0 means no match. (cmdk's own fuzzy match let "motion" find any page that merely mentions it before the Motion page.)
 */
export function score(entry: Pick<MenuEntry, "title" | "name" | "description">, query: string): number {
  const title = entry.title.toLowerCase()
  const name = entry.name.toLowerCase()
  const description = entry.description.toLowerCase()
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return 0
  let total = 0
  for (const w of words) {
    const hit = title.includes(w) ? (title.split(/\W+/).some((t) => t.startsWith(w)) ? 4 : 3) : name.includes(w) ? 2 : description.includes(w) ? 1 : 0
    if (!hit) return 0
    total += hit
  }
  // A search that is the whole title ("pricing") beats one that only starts it.
  return total / (4 * words.length) + (title === query.toLowerCase().trim() ? 1 : 0)
}

/** The best matches, best first, with docs before the catalogue when two are equal, and at most `limit` of them. */
export function rank(entries: MenuEntry[], query: string, limit = 24): MenuEntry[] {
  return entries
    .map((e) => ({ e, s: score(e, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || groupRank(a.e.group) - groupRank(b.e.group) || a.e.title.localeCompare(b.e.title))
    .slice(0, limit)
    .map((x) => x.e)
}

export function quickLinks(entries: MenuEntry[]): MenuEntry[] {
  return QUICK_LINKS.map((href) => entries.find((e) => e.href === href)).filter((e): e is MenuEntry => Boolean(e))
}
