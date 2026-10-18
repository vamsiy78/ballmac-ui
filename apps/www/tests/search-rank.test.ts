import { describe, expect, it } from "vitest"

import { quickLinks, rank, score } from "../lib/search-rank"

const e = (title: string, description = "", group = "Docs", href = `/${title}`) => ({ name: title.toLowerCase().replace(/\W+/g, "-"), title, description, group, href })
const entries = [
  e("How motion works", "A theme is color, shape and movement.", "Docs · Concepts", "/docs/concepts/motion"),
  e("What makes it different", "Motion, states and quality in one design language.", "Docs", "/docs"),
  e("Motion", "Animated components.", "Components", "/components?category=motion"),
  e("Pricing", "Free and Pro.", "Docs", "/pricing"),
  e("Pricing 2: three tiers", "A pricing section.", "Blocks · Marketing", "/blocks/pricing-2"),
]

describe("search ranking", () => {
  it("puts a title match before a mention in a description", () => {
    expect(rank(entries, "motion").map((x) => x.title)).toEqual(["Motion", "How motion works", "What makes it different"])
  })
  it("needs every word, and ranks an exact title first", () => {
    expect(score(entries[3]!, "pricing free")).toBeGreaterThan(0)
    expect(score(entries[3]!, "pricing zzz")).toBe(0)
    expect(rank(entries, "pricing")[0]!.title).toBe("Pricing")
  })
  it("puts docs first when two matches are equally good", () => {
    const a = e("Install", "", "Components", "/c/install")
    const b = e("Install", "", "Docs", "/docs/install")
    expect(rank([a, b], "install")[0]).toBe(b)
  })
  it("limits the list and lists quick links for an empty search", () => {
    const many = Array.from({ length: 50 }, (_, i) => e(`Chat ${i}`, "", "Blocks", `/blocks/chat-${i}`))
    expect(rank(many, "chat")).toHaveLength(24)
    expect(rank(many, "   ")).toEqual([])
    expect(quickLinks([e("Blocks", "", "Docs", "/blocks"), e("Other")]).map((x) => x.href)).toEqual(["/blocks"])
  })
})
