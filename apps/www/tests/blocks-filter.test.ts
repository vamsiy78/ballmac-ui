import { describe, expect, it } from "vitest"

import { filterGroups, filtersFromQuery, filtersToQuery, type BrowserGroup, type BrowserItem } from "../lib/blocks-filter"

const items: BrowserItem[] = [
  { name: "chat-1", pro: false, isNew: true, text: "chat 1: team chat with threads application chat" },
  { name: "chat-pro-1", pro: true, isNew: false, text: "chat pro 1: support inbox application chat" },
  { name: "hero-1", pro: false, isNew: false, text: "hero 1: split with product visual marketing hero" },
]
const groups: BrowserGroup[] = [
  { id: "application", label: "Application", description: "", sections: [{ id: "chat", label: "Chat", items: ["chat-1", "chat-pro-1"] }] },
  { id: "marketing", label: "Marketing", description: "", sections: [{ id: "hero", label: "Hero", items: ["hero-1"] }] },
]
const names = (f: Parameters<typeof filterGroups>[2]) => filterGroups(groups, items, f).flatMap((g) => g.sections.flatMap((s) => s.items))

describe("blocks filter", () => {
  it("keeps everything when nothing is set", () => {
    expect(names({ q: "", access: "all", onlyNew: false })).toEqual(["chat-1", "chat-pro-1", "hero-1"])
  })
  it("needs every word, in any order, ignoring case", () => {
    expect(names({ q: "Chat THREADS", access: "all", onlyNew: false })).toEqual(["chat-1"])
    expect(names({ q: "chat zzz", access: "all", onlyNew: false })).toEqual([])
  })
  it("splits free from Pro and picks out the new", () => {
    expect(names({ q: "chat", access: "free", onlyNew: false })).toEqual(["chat-1"])
    expect(names({ q: "", access: "pro", onlyNew: false })).toEqual(["chat-pro-1"])
    expect(names({ q: "", access: "all", onlyNew: true })).toEqual(["chat-1"])
  })
  it("drops sections and groups that end up empty", () => {
    const out = filterGroups(groups, items, { q: "hero", access: "all", onlyNew: false })
    expect(out.map((g) => g.id)).toEqual(["marketing"])
  })
  it("round-trips through the address", () => {
    const f = { q: "pricing table", access: "free" as const, onlyNew: true }
    expect(filtersFromQuery(filtersToQuery(f))).toEqual(f)
    expect(filtersToQuery({ q: "", access: "all", onlyNew: false })).toBe("")
    expect(filtersFromQuery("?access=bogus")).toEqual({ q: "", access: "all", onlyNew: false })
  })
})
