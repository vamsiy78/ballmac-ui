import { describe, expect, it } from "vitest"

import { comparisons } from "../lib/compare"

describe("comparisons", () => {
  it("keep a source for every fact about another product, and a recent check date", () => {
    expect(new Set(comparisons.map((c) => c.slug)).size).toBe(comparisons.length)
    for (const c of comparisons) {
      expect(c.facts.length, c.slug).toBeGreaterThan(0)
      for (const f of c.facts) expect(f.source, `${c.slug}: ${f.label}`).toMatch(/^https:\/\//)
      expect(Date.now() - new Date(`${c.checked}T00:00:00Z`).getTime(), `${c.slug} was checked too long ago: reread the sources`).toBeLessThan(120 * 86_400_000)
      expect(c.title.length, c.slug).toBeLessThanOrEqual(70)
      expect(c.description.length, c.slug).toBeLessThanOrEqual(260)
    }
  })
})
