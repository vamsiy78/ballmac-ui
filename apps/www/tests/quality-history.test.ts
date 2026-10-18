import { describe, expect, it } from "vitest"

import { record, summarize } from "../../../scripts/quality-history"

describe("quality history", () => {
  it("counts items that were measured, their examples and the failing checks", () => {
    const run = summarize(
      {
        a: { checks: [{ status: "pass" }, { status: "fail" }, { status: "na" }], ex: { x: 1, y: 2 } },
        b: { checks: [{ status: "pass" }], ex: { z: 1 } },
        c: { checks: [] },
      },
      "2026-10-18"
    )
    expect(run).toEqual({ date: "2026-10-18", items: 2, examples: 3, failingChecks: 1 })
  })

  it("keeps one line per day, oldest first", () => {
    const first = { date: "2026-10-12", items: 1, examples: 1, failingChecks: 5 }
    const day = { date: "2026-10-18", items: 2, examples: 2, failingChecks: 1 }
    const again = { ...day, failingChecks: 0 }
    expect(record([day, first], again)).toEqual([first, again])
  })
})
