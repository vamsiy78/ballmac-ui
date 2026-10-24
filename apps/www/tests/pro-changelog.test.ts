import { describe, expect, it } from "vitest"

import { buildProChangelog, dayLabel, summarise, type ItemLike } from "../lib/pro-changelog-core"

const item = (name: string, changelog: ItemLike["changelog"], version = "1.0.0"): ItemLike => ({ name, title: name.toUpperCase(), tier: "pro", version, updated: "2026-10-12", changelog })

describe("buildProChangelog", () => {
  const items = [
    item("a-1", [{ version: "1.1.0", date: "2026-10-12", note: "Adds a state prop." }, { version: "1.0.0", date: "2026-10-02", note: "First release." }], "1.1.0"),
    item("a-2", [{ version: "1.1.0", date: "2026-10-12", note: "Adds a state prop." }, { version: "1.0.0", date: "2026-10-02", note: "First release." }], "1.1.0"),
    item("a-10", [{ version: "1.0.0", date: "2026-10-02", note: "First release." }]),
    item("b-1", [{ version: "1.0.1", date: "2026-10-12", note: "Fixes focus.", breaking: true }, { version: "1.0.0", date: "2026-10-03", note: "First release." }], "1.0.1"),
  ]
  const entries = buildProChangelog(items, [{ date: "2026-10-12", tag: "Starter", title: "Cove", text: "A desktop starter." }])

  it("groups first releases by day and identical notes by day", () => {
    const firstDay = entries.find((e) => e.key === "new:2026-10-02")!
    expect(firstDay.items.map((i) => i.name)).toEqual(["a-1", "a-2", "a-10"]) // natural order, not a-1, a-10, a-2
    const shared = entries.find((e) => e.note === "Adds a state prop.")!
    expect(shared.items.map((i) => i.name)).toEqual(["a-1", "a-2"])
  })
  it("keeps a breaking note apart from a non-breaking one and flags it", () => {
    const e = entries.find((x) => x.note === "Fixes focus.")!
    expect(e.breaking).toBe(true)
  })
  it("is newest first, with news before items on the same day", () => {
    expect(entries.map((e) => e.date)).toEqual([...entries.map((e) => e.date)].sort().reverse())
    const day = entries.filter((e) => e.date === "2026-10-12").map((e) => e.kind)
    expect(day).toEqual(["news", "update", "update"])
  })
  it("summarises from the entries, never from a made-up number", () => {
    const s = summarise(items, entries)
    expect(s).toMatchObject({ items: 4, updatedItems: 3, latest: "2026-10-12", first: "2026-10-02" })
  })
  it("prints dates the same everywhere", () => {
    expect(dayLabel("2026-10-12")).toBe("12 Oct 2026")
  })
})
