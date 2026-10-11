import { describe, expect, it } from "vitest"

import { feelProblems } from "../../../scripts/check-feel"

describe("feel guard", () => {
  it("accepts the standard focus ring, in any of its forms", () => {
    expect(feelProblems({ "a.tsx": "focus-visible:ring-[3px] focus-visible:ring-ring/50", "b.tsx": "focus-within:ring-[3px]", "c.tsx": "focus-visible:ring-inset focus-visible:ring-0" }, {})).toEqual([])
  })
  it("rejects a custom ring width that is not listed", () => {
    expect(feelProblems({ "a.tsx": "focus-visible:ring-2" }, {})[0]).toContain("own focus ring")
    expect(feelProblems({ "a.tsx": "focus:ring-4" }, {})).toHaveLength(1)
  })
  it("accepts a listed one, and keeps the list honest", () => {
    expect(feelProblems({ "a.tsx": "focus-visible:ring-2" }, { "a.tsx": "own ring" })).toEqual([])
    expect(feelProblems({ "a.tsx": "focus-visible:ring-[3px]" }, { "a.tsx": "own ring" })[0]).toContain("no longer")
    expect(feelProblems({}, { "gone.tsx": "x" })[0]).toContain("does not exist")
  })
})
