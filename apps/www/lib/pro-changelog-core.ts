/**
 * The Pro changelog: what changed in Ballmac UI Pro and when, built from the version notes every Pro item already carries plus a short list of changes that are not
 * an item (starters, sign-in, the licence). Pure functions, no framework imports, so they can be tested on their own.
 */
export type ItemLike = { name: string; title: string; href?: string; tier?: string; version: string; updated: string; changelog?: { version: string; date: string; note: string; breaking?: boolean }[] }
export type News = { date: string; title: string; text: string; tag: "Starter" | "Platform" | "Licence" | "Kit" }

export type Entry = {
  key: string
  date: string
  kind: "new" | "update" | "news"
  /** The note shared by the items, or the news text. */
  note: string
  /** Heading for news entries. */
  title?: string
  tag?: News["tag"]
  breaking: boolean
  items: { name: string; title: string; href?: string; version: string }[]
}

const FIRST = /^first release\.?$/i

/** Newest first. Items that share a day and a note are one entry; first releases of a day are one "new" entry. */
export function buildProChangelog(items: ItemLike[], news: News[] = []): Entry[] {
  const groups = new Map<string, Entry>()
  for (const item of items) {
    for (const c of item.changelog ?? []) {
      const first = FIRST.test(c.note.trim())
      const key = first ? `new:${c.date}` : `update:${c.date}:${c.note}:${Boolean(c.breaking)}`
      let g = groups.get(key)
      if (!g) groups.set(key, (g = { key, date: c.date, kind: first ? "new" : "update", note: first ? "" : c.note, breaking: Boolean(c.breaking), items: [] }))
      g.items.push({ name: item.name, title: item.title, href: item.href, version: c.version })
    }
  }
  const entries: Entry[] = [...groups.values()]
  for (const n of news) entries.push({ key: `news:${n.date}:${n.title}`, date: n.date, kind: "news", note: n.text, title: n.title, tag: n.tag, breaking: false, items: [] })
  for (const e of entries) e.items.sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }))
  // Same day: news first, then new items, then updates, so the story of a day reads in a stable order.
  const order = { news: 0, new: 1, update: 2 } as const
  return entries.sort((a, b) => b.date.localeCompare(a.date) || order[a.kind] - order[b.kind] || a.key.localeCompare(b.key))
}

export function summarise(items: ItemLike[], entries: Entry[]) {
  const updated = new Set(entries.filter((e) => e.kind === "update").flatMap((e) => e.items.map((i) => i.name)))
  const dates = entries.map((e) => e.date).sort()
  return { items: items.length, updatedItems: updated.size, entries: entries.length, latest: dates.at(-1) ?? null, first: dates[0] ?? null }
}

/** "12 Oct 2026". Fixed locale and UTC, so the server and the browser print the same. */
export function dayLabel(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
}
