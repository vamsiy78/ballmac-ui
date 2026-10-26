export type BrowserItem = { name: string; pro: boolean; isNew: boolean; motion: boolean; text: string }
export type BrowserGroup = { id: string; label: string; description: string; sections: { id: string; label: string; items: string[] }[] }
export type Access = "all" | "free" | "pro"
export type Filters = { q: string; access: Access; onlyNew: boolean; motion: boolean }

/** Blocks drawn by a shader, a canvas or CSS 3D: the "3D and motion" collection. */
export const MOTION_TAGS = ["3d", "webgl", "canvas"] as const
export const isMotionBlock = (tags: readonly string[] | undefined) => (tags ?? []).some((t) => (MOTION_TAGS as readonly string[]).includes(t))

/** True when a block passes the filters: every word typed appears in its text, and it is free, Pro or new as asked. */
export function blockMatches(item: BrowserItem, { q, access, onlyNew, motion }: Filters): boolean {
  if (access === "free" && item.pro) return false
  if (access === "pro" && !item.pro) return false
  if (onlyNew && !item.isNew) return false
  if (motion && !item.motion) return false
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => item.text.includes(w))
}

/** The groups with only the blocks that pass; sections and groups left empty are dropped. */
export function filterGroups(groups: BrowserGroup[], items: BrowserItem[], filters: Filters): BrowserGroup[] {
  const byName = new Map(items.map((i) => [i.name, i]))
  return groups
    .map((g) => ({ ...g, sections: g.sections.map((s) => ({ ...s, items: s.items.filter((n) => byName.has(n) && blockMatches(byName.get(n)!, filters)) })).filter((s) => s.items.length > 0) }))
    .filter((g) => g.sections.length > 0)
}

/** The filters as the address query (?q=chat&access=free&new=1) and back. */
export function filtersToQuery({ q, access, onlyNew, motion }: Filters): string {
  const p = new URLSearchParams()
  if (q.trim()) p.set("q", q.trim())
  if (access !== "all") p.set("access", access)
  if (onlyNew) p.set("new", "1")
  if (motion) p.set("motion", "1")
  return p.toString()
}
export function filtersFromQuery(search: string): Filters {
  const p = new URLSearchParams(search)
  const access = p.get("access")
  return { q: p.get("q") ?? "", access: access === "free" || access === "pro" ? access : "all", onlyNew: p.get("new") === "1", motion: p.get("motion") === "1" }
}
