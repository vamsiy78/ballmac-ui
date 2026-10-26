import { describe, expect, it } from "vitest"

import { filterGroups, filtersFromQuery, filtersToQuery, isMotionBlock, type BrowserGroup, type BrowserItem } from "../lib/blocks-filter"

const items: BrowserItem[] = [
  { name: "chat-1", pro: false, isNew: true, motion: false, text: "chat 1: team chat with threads application chat" },
  { name: "chat-pro-1", pro: true, isNew: false, motion: false, text: "chat pro 1: support inbox application chat" },
  { name: "hero-1", pro: false, isNew: false, motion: false, text: "hero 1: split with product visual marketing hero" },
]
const groups: BrowserGroup[] = [
  { id: "application", label: "Application", description: "", sections: [{ id: "chat", label: "Chat", items: ["chat-1", "chat-pro-1"] }] },
  { id: "marketing", label: "Marketing", description: "", sections: [{ id: "hero", label: "Hero", items: ["hero-1"] }] },
]
const names = (f: Parameters<typeof filterGroups>[2]) => filterGroups(groups, items, f).flatMap((g) => g.sections.flatMap((s) => s.items))

describe("blocks filter", () => {
  it("keeps everything when nothing is set", () => {
    expect(names({ q: "", access: "all", onlyNew: false, motion: false })).toEqual(["chat-1", "chat-pro-1", "hero-1"])
  })
  it("needs every word, in any order, ignoring case", () => {
    expect(names({ q: "Chat THREADS", access: "all", onlyNew: false, motion: false })).toEqual(["chat-1"])
    expect(names({ q: "chat zzz", access: "all", onlyNew: false, motion: false })).toEqual([])
  })
  it("splits free from Pro and picks out the new", () => {
    expect(names({ q: "chat", access: "free", onlyNew: false, motion: false })).toEqual(["chat-1"])
    expect(names({ q: "", access: "pro", onlyNew: false, motion: false })).toEqual(["chat-pro-1"])
    expect(names({ q: "", access: "all", onlyNew: true, motion: false })).toEqual(["chat-1"])
  })
  it("drops sections and groups that end up empty", () => {
    const out = filterGroups(groups, items, { q: "hero", access: "all", onlyNew: false, motion: false })
    expect(out.map((g) => g.id)).toEqual(["marketing"])
  })
  it("narrows to the 3D and motion collection", () => {
    const withMotion = [...items, { name: "hero-pro-22", pro: true, isNew: true, motion: true, text: "hero pro 22: particles marketing hero 3d" }]
    const g: BrowserGroup[] = [...groups, { id: "scenes", label: "Scenes", description: "", sections: [{ id: "hero", label: "Hero", items: ["hero-pro-22"] }] }]
    const out = filterGroups(g, withMotion, { q: "", access: "all", onlyNew: false, motion: true }).flatMap((x) => x.sections.flatMap((s) => s.items))
    expect(out).toEqual(["hero-pro-22"])
    expect(filtersFromQuery("?motion=1").motion).toBe(true)
    expect(filtersToQuery({ q: "", access: "all", onlyNew: false, motion: true })).toBe("motion=1")
    expect(isMotionBlock(["hero", "webgl"])).toBe(true)
    expect(isMotionBlock(["hero", "dark"])).toBe(false)
    expect(isMotionBlock(undefined)).toBe(false)
  })
  it("round-trips through the address", () => {
    const f = { q: "pricing table", access: "free" as const, onlyNew: true, motion: false }
    expect(filtersFromQuery(filtersToQuery(f))).toEqual(f)
    expect(filtersToQuery({ q: "", access: "all", onlyNew: false, motion: false })).toBe("")
    expect(filtersFromQuery("?access=bogus")).toEqual({ q: "", access: "all", onlyNew: false, motion: false })
  })
})
