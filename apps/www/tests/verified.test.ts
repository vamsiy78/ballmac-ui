import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import own from "../content/verified/ballmac.json"
import { invalidScorecard, rank, toRow, type Scorecard } from "../lib/verified-core"

const dir = join(import.meta.dirname, "../content/verified/submissions")
const card = own as unknown as Scorecard

describe("Ballmac's own scorecard", () => {
  it("is a valid scorecard, and its score follows from its checks", () => {
    expect(invalidScorecard(card)).toBeUndefined()
  })
})

describe("submitted scorecards", () => {
  it("can all be listed", () => {
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"))
    for (const file of files) expect(invalidScorecard(JSON.parse(readFileSync(join(dir, file), "utf8"))), file).toBeUndefined()
  })
})

describe("invalidScorecard", () => {
  it("rejects an edited score, a bad grade, a private source and a missing registry", () => {
    expect(invalidScorecard({ ...card, score: 100 })).toMatch(/does not match|does not follow/)
    expect(invalidScorecard({ ...card, grade: "F" })).toMatch(/grade/)
    expect(invalidScorecard({ ...card, registry: { ...card.registry, source: "http://localhost:3000/r/registry.json" } })).toMatch(/https/)
    expect(invalidScorecard({ ...card, registry: { name: "", source: card.registry.source } })).toMatch(/name/)
    expect(invalidScorecard(null)).toBeDefined()
    expect(invalidScorecard({ ...card, schema: 2 })).toMatch(/schema/)
  })
})

describe("rank", () => {
  it("puts the highest score first, then the larger registry, then the name", () => {
    const row = (name: string, score: number, scored: number) => ({ ...toRow(card), name, score, scored })
    expect(rank([row("b", 80, 10), row("a", 80, 10), row("c", 95, 3), row("d", 80, 50)]).map((r) => r.name)).toEqual(["c", "d", "a", "b"])
  })
})
