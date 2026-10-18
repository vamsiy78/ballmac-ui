import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { useCases } from "../lib/use-cases"

const index = JSON.parse(readFileSync(join(__dirname, "../lib/generated/index.json"), "utf8")) as { name: string; tier: string; category: string }[]
const docsDir = join(__dirname, "../content/docs")

describe("use cases", () => {
  it("have unique slugs and a description that fits a search result", () => {
    expect(new Set(useCases.map((u) => u.slug)).size).toBe(useCases.length)
    for (const u of useCases) {
      expect(u.description.length, u.slug).toBeLessThanOrEqual(260)
      expect(u.title.length, u.slug).toBeLessThanOrEqual(70)
    }
  })

  it("name only free blocks and templates that exist", () => {
    for (const u of useCases) {
      for (const n of u.blocks) expect(index.find((i) => i.name === n && i.tier !== "pro" && i.category === "blocks"), `${u.slug}: block ${n}`).toBeTruthy()
      for (const n of u.templates) expect(index.find((i) => i.name === n && i.tier !== "pro" && i.category === "templates"), `${u.slug}: template ${n}`).toBeTruthy()
    }
  })

  it("link to guides that exist", () => {
    for (const u of useCases)
      for (const d of u.docs) {
        const rel = d.href.replace(/^\/docs\//, "")
        expect(existsSync(join(docsDir, `${rel}.mdx`)), `${u.slug}: ${d.href}`).toBe(true)
      }
  })
})
