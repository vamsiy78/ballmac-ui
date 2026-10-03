import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { changelog, changelogMarkdown } from "../lib/changelog"

describe("changelog", () => {
  it("is newest first, with real dates and at least one item per entry", () => {
    const dates = changelog.map((e) => e.date)
    expect(dates).toEqual([...dates].sort().reverse())
    for (const e of changelog) {
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(e.items.length).toBeGreaterThan(0)
    }
  })
  it("matches CHANGELOG.md in the repository (run `pnpm changelog` after editing)", () => {
    expect(readFileSync(join(__dirname, "../../../CHANGELOG.md"), "utf8")).toBe(changelogMarkdown())
  })
})
